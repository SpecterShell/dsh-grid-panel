import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import test from 'node:test'
import * as registration from '@spectershell/dsh-grid-panel'

const root = new URL('../', import.meta.url)

test('package registers a settings-serving host entry and web-only locale-injected bundle', async () => {
  const manifest = JSON.parse(await readFile(new URL('package.json', root), 'utf8'))
  assert.equal(manifest.dsh.bundle.patch, './cordis.patch.yml')
  assert.deepEqual(manifest.dsh.client, {
    platform: 'web',
    inject: ['@deepseek-ai/dsh-client-locale', '@deepseek-ai/dsh-client-ui-settings', '@deepseek-ai/dsh-client-ui-plugin-manager'],
  })
  assert.equal(manifest.exports['./client'], './lib/client.js')
  assert.equal(manifest.exports['.'].default, './lib/index.js')
  const patch = await readFile(new URL('cordis.patch.yml', root), 'utf8')
  assert.match(patch, /id: dsh-grid-panel\s+name: '@spectershell\/dsh-grid-panel'/)
  assert.deepEqual(Object.keys(registration).sort(), ['Config', 'apply'])
  // A profile whose webServer never activates never runs the injection callback.
  assert.equal(registration.apply({ inject: () => {} }), undefined)
})

test('host Config materializes defaults and rejects out-of-range sizes', () => {
  const read = value => Object.fromEntries(Object.entries(value).map(([key, field]) => [key, field.get()]))
  assert.deepEqual(read(registration.Config({})), {
    minTileSize: 76,
    compactTileSize: 68,
    gap: 4,
    labelAlign: 'middle',
  })
  assert.deepEqual(read(registration.Config({ minTileSize: 90, gap: 8, labelAlign: 'top' })), {
    minTileSize: 90,
    compactTileSize: 68,
    gap: 8,
    labelAlign: 'top',
  })
  assert.throws(() => registration.Config({ minTileSize: 47 }))
  assert.throws(() => registration.Config({ compactTileSize: 161 }))
  assert.throws(() => registration.Config({ compactTileSize: '68' }))
  assert.throws(() => registration.Config({ gap: 17 }))
  assert.throws(() => registration.Config({ labelAlign: 'left' }))
})

test('host entry serves the live config over the exact route', () => {
  const routes = []
  const webServer = { register: route => (routes.push(route), () => routes.splice(routes.indexOf(route), 1)) }
  const effects = []
  const injected = { webServer, effect: (setup, label) => effects.push([setup, label]) }
  const ctx = { inject: (deps, callback) => (assert.deepEqual(deps, ['webServer']), callback(injected)) }
  // Volatile fields arrive as get() wrappers, and edits apply without a restart.
  const live = { minTileSize: 88, compactTileSize: 68, gap: 4, labelAlign: 'middle' }
  const config = Object.fromEntries(Object.entries(live).map(([key, value]) => [key, { get: () => live[key] }]))
  registration.apply(ctx, config)
  assert.equal(effects.length, 1)
  const dispose = effects[0][0]()
  assert.equal(routes.length, 1)
  assert.equal(routes[0].kind, 'exact')
  assert.equal(routes[0].path, '/grid-panel/config.json')
  const serve = () => {
    const headers = new Map()
    let body = null
    routes[0].handler({}, { setHeader: (name, value) => headers.set(name, value), end: value => { body = value } })
    assert.equal(headers.get('content-type'), 'application/json; charset=utf-8')
    return JSON.parse(body)
  }
  assert.deepEqual(serve(), live)
  live.minTileSize = 100
  assert.deepEqual(serve(), live)
  dispose()
  assert.equal(routes.length, 0)
})

test('browser artifacts contain no server imports or host machinery, and fetch only the config route', async () => {
  const source = await readFile(new URL('lib/client.js', root), 'utf8')
  assert.doesNotMatch(source, /node:|api\/bootstrap|webServer|createRouteHandler|GridPanelService/)
  for (const match of source.matchAll(/fetch\(\s*['"`]([^'"`]+)['"`]/g)) {
    assert.equal(match[1], '/grid-panel/config.json')
  }
  const entries = await readdir(new URL('src/', root), { withFileTypes: true })
  assert.ok(entries.every(entry => entry.isFile()))
  assert.ok(!entries.some(entry => entry.name === 'routes.ts'))
})

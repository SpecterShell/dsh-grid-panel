import assert from 'node:assert/strict'
import test from 'node:test'
import { button, nav, environment, loadClient } from './helpers.mjs'

const marker = 'data-dsh-grid-panel'
const overlay = 'data-dsh-grid-panel-overlay'

function overlayFixture() {
  const row = button()
  const attributes = new Map()
  const control = {
    setAttribute: (name, value) => attributes.set(name, value),
    removeAttribute: name => attributes.delete(name),
    getBoundingClientRect: () => ({ left: 0, top: 0, width: attributes.size ? 24 : 100, height: attributes.size ? 24 : 60 }),
  }
  const cell = {
    querySelector: () => row,
    querySelectorAll: () => [row, control],
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 60 }),
  }
  const candidate = nav([cell])
  row.parentElement = cell
  candidate.contains = element => element === control
  return { candidate, attributes, control }
}

test('factory exposes the browser plugin and reusable API', async t => {
  const client = await loadClient(t)
  assert.deepEqual(Array.from(client.inject), ['locale', 'slots', 'configForms'])
  for (const key of ['apply', 'resolveConfig', 'buildCss', 'findPanelNavigation', 'findOverlayControls', 'observeNavigation', 'runtimeLocales']) {
    assert.equal(typeof client[key], 'function', key)
  }
  assert.equal(client.GridPanelService, undefined)
  assert.equal(client.createRouteHandler, undefined)
})

test('applies synchronously with options and leaves host attributes alone', async t => {
  const candidate = nav([button()])
  candidate.setAttribute('aria-description', 'Existing')
  const env = environment(candidate)
  const client = await loadClient(t, { ...env.globals, fetch: () => assert.fail('Client must not fetch') })
  assert.equal(client.apply(env.ctx, { minTileSize: 90 }), undefined)
  await Promise.resolve()
  assert.equal(candidate.getAttribute(marker), 'wide')
  assert.match(env.styles[0].textContent, /min-tile: 90px/)
  const dictionaries = env.registrations.get('dsh-grid-panel')
  assert.equal(dictionaries.en.meta, undefined)
  assert.equal(dictionaries.zh.meta, undefined)
  env.dispose()
  assert.equal(candidate.getAttribute(marker), null)
  // The plugin never touches the host's own aria attributes.
  assert.equal(candidate.getAttribute('aria-description'), 'Existing')
  assert.ok(env.styles[0].removed)
  assert.ok(env.observers.every(observer => observer.disconnected))
  assert.equal(env.registrations.size, 0)
})

test('reapply after disposal installs fresh owned effects', async t => {
  const candidate = nav([button()])
  const env = environment(candidate)
  const client = await loadClient(t, env.globals)
  for (let index = 0; index < 2; index++) {
    await client.apply(env.ctx)
    assert.equal(candidate.getAttribute(marker), 'wide')
    env.dispose()
    assert.equal(candidate.getAttribute(marker), null)
  }
  assert.equal(env.styles.length, 2)
  assert.ok(env.styles.every(style => style.removed))
  assert.ok(env.observers.every(observer => observer.disconnected))
})

test('installed client reads profile settings from the host route', async t => {
  const candidate = nav([button()])
  const env = environment(candidate)
  const fetch = async path => {
    assert.equal(path, '/grid-panel/config.json')
    return { ok: true, json: async () => ({ minTileSize: 90 }) }
  }
  const client = await loadClient(t, { ...env.globals, fetch })
  await client.apply(env.ctx)
  assert.match(env.styles[0].textContent, /min-tile: 90px/)
  assert.equal(candidate.getAttribute(marker), 'wide')
  env.dispose()
})

test('an unavailable config route falls back to the bundled defaults', async t => {
  const candidate = nav([button()])
  const env = environment(candidate)
  const fetch = async () => ({ ok: false })
  const client = await loadClient(t, { ...env.globals, fetch })
  await client.apply(env.ctx)
  assert.match(env.styles[0].textContent, /min-tile: 72px/)
  assert.equal(candidate.getAttribute(marker), 'wide')
  env.dispose()
})

test('disposed marker ignores queued mutation passes', async t => {
  const candidate = nav([button()])
  const env = environment(candidate)
  const queued = []
  const client = await loadClient(t, { ...env.globals, queueMicrotask: callback => queued.push(callback) })
  await client.apply(env.ctx)
  env.dispose()
  for (const callback of queued) callback()
  assert.equal(candidate.getAttribute(marker), null)
})

test('invalid caller config cannot inject CSS', async t => {
  const env = environment(nav([button()]))
  const client = await loadClient(t, env.globals)
  client.apply(env.ctx, { minTileSize: '1px; color:red', compactTileSize: Infinity })
  assert.match(env.styles[0].textContent, /min-tile: 72px/)
  assert.match(env.styles[0].textContent, /min-tile: 68px/)
  assert.ok(!env.styles[0].textContent.includes('color:red'))
  env.dispose()
})

test('navigation replacement moves markers and disconnects the old resize observer', async t => {
  const first = nav([button()])
  first.setAttribute('aria-description', 'First')
  const second = nav([button()])
  const env = environment(first)
  const client = await loadClient(t, env.globals)
  await client.apply(env.ctx)
  const firstResize = env.observers[1]
  env.setCandidate(second)
  env.observers[0].callback()
  await Promise.resolve()
  assert.equal(first.getAttribute(marker), null)
  assert.equal(first.getAttribute('aria-description'), 'First')
  assert.ok(firstResize.disconnected)
  assert.equal(second.getAttribute(marker), 'wide')
  env.setCandidate(null)
  env.observers[0].callback()
  await Promise.resolve()
  assert.equal(second.getAttribute(marker), null)
  env.dispose()
})

test('overlay markers persist after containment, clear in rail mode, and restore on expansion', async t => {
  const { candidate, attributes } = overlayFixture()
  const env = environment(candidate)
  const client = await loadClient(t, { ...env.globals, getComputedStyle: () => ({ position: 'absolute' }) })
  await client.apply(env.ctx)
  assert.equal(attributes.get(overlay), 'corner')
  env.observers[0].callback()
  await Promise.resolve()
  assert.equal(attributes.get(overlay), 'corner')
  candidate.getBoundingClientRect = () => ({ left: 12, top: 180, width: 56 })
  env.observers[1].callback()
  await Promise.resolve()
  assert.equal(candidate.getAttribute(marker), 'rail')
  assert.equal(attributes.size, 0)
  candidate.getBoundingClientRect = () => ({ left: 12, top: 180, width: 240 })
  env.observers[1].callback()
  await Promise.resolve()
  assert.equal(attributes.get(overlay), 'corner')
  env.dispose()
  assert.equal(attributes.size, 0)
})

test('detached overlay controls lose their markers', async t => {
  const { candidate, attributes } = overlayFixture()
  const env = environment(candidate)
  const client = await loadClient(t, { ...env.globals, getComputedStyle: () => ({ position: 'absolute' }) })
  await client.apply(env.ctx)
  assert.equal(attributes.get(overlay), 'corner')
  candidate.contains = () => false
  candidate.children[0].querySelectorAll = () => []
  env.observers[0].callback()
  await Promise.resolve()
  assert.equal(attributes.size, 0)
  env.dispose()
})

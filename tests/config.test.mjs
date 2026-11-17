import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { defaults, resolveConfig } from '../src/config.ts'
import { locales, runtimeLocales } from '../src/locales.ts'

test('resolves defaults, boundaries, booleans and discards unknown options', () => {
  assert.deepEqual(resolveConfig(), defaults)
  assert.deepEqual(resolveConfig(null), defaults)
  assert.deepEqual(resolveConfig({ minTileSize: 48, compactTileSize: 160, labelAlign: 'top', unknown: 3 }), {
    minTileSize: 48, compactTileSize: 160, labelAlign: 'top',
  })
  assert.equal(resolveConfig({ labelAlign: 'middle' }).labelAlign, 'middle')
  assert.equal(resolveConfig({ labelAlign: 'left' }).labelAlign, 'middle')
  assert.equal(resolveConfig({ labelAlign: 0 }).labelAlign, 'middle')
  assert.equal(resolveConfig({ minTileSize: 72.5 }).minTileSize, 72.5)
  for (const value of [NaN, Infinity, -Infinity, 47, 161, '72', null, true]) {
    assert.equal(resolveConfig({ minTileSize: value }).minTileSize, 72)
    assert.equal(resolveConfig({ compactTileSize: value }).compactTileSize, 68)
  }
})

test('runtime dictionaries exclude metadata and support additional languages', () => {
  assert.deepEqual(Object.keys(locales).sort(), ['en', 'zh'])
  assert.deepEqual(Object.keys(locales.en), Object.keys(locales.zh))
  assert.deepEqual(runtimeLocales({ fr: { meta: { title: 'Grille' }, 'settings.title': 'Grille', invalid: 1 } }), {
    fr: { 'settings.title': 'Grille' },
  })
})

test('locale files keep key parity and matching metadata', async () => {
  const en = JSON.parse(await readFile(new URL('../locale/en.json', import.meta.url)))
  const zh = JSON.parse(await readFile(new URL('../locale/zh.json', import.meta.url)))
  assert.deepEqual(Object.keys(en).sort(), Object.keys(zh).sort())
  assert.ok(Object.keys(en).some(key => key.startsWith('settings.')))
  assert.deepEqual(Object.keys(en.meta).sort(), Object.keys(zh.meta).sort())
  assert.equal(en.meta.title, 'Grid Panel')
  assert.equal(zh.meta.title, '网格面板')
})

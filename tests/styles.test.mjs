import assert from 'node:assert/strict'
import test from 'node:test'
import { buildCss } from '../src/styles.ts'

test('centers labels in middle alignment and top-aligns them otherwise', () => {
  assert.match(buildCss(), /margin-block: auto/)
  assert.ok(!buildCss({ labelAlign: 'top' }).includes('margin-block'))
})

test('uses responsive defaults and resolved configuration overrides', () => {
  const css = buildCss()
  assert.match(css, /--dsh-grid-panel-min-tile: 72px/)
  assert.match(css, /--dsh-grid-panel-min-tile: 68px/)
  assert.ok(css.includes('repeat(auto-fit, minmax(var(--dsh-grid-panel-min-tile, 72px), 1fr))'))
  assert.match(css, /max-width: 720px/)
  assert.match(css, /prefers-reduced-motion/)
  assert.match(buildCss({ minTileSize: 88, compactTileSize: 80 }), /min-tile: 88px/)
  assert.match(buildCss({ minTileSize: 88, compactTileSize: 80 }), /min-tile: 80px/)
})

test('scopes wrapped tile styles and keeps extra controls in the corner', () => {
  const css = buildCss()
  assert.ok(css.includes('> * > button:first-child {'))
  assert.ok(!css.includes('> * > button {'))
  assert.ok(css.includes('> * > button:first-child > span:first-child'))
  // Top-aligned content keeps every icon on one line when a label wraps.
  assert.ok(css.includes('justify-content: flex-start'))
  assert.ok(css.includes('[data-slot="sidebar.panellist"] > :not(:first-child)'))
  assert.ok(css.includes('> * > button:not(:first-child),'))
  assert.ok(css.includes('[data-dsh-grid-panel-overlay="corner"]'))
  assert.match(css, /width: 24px !important/)
  assert.match(css, /height: 24px !important/)
  assert.ok(!css.includes('opacity:'))
  assert.ok(!css.includes('pointer-events:'))
  for (const selector of css.matchAll(/nav\[[^\]]+\]/g)) {
    assert.equal(selector[0], 'nav[data-dsh-grid-panel="wide"]')
  }
})

import assert from 'node:assert/strict'
import test from 'node:test'
import { launcherButtons, navigationMode, panelNavigationScore, findPanelNavigation } from '../src/detect.ts'
import { button, nav } from './helpers.mjs'

test('recognizes expanded launcher navigation and collapsed rail', () => {
  const wide = nav([button(), button({ active: true })])
  assert.ok(panelNavigationScore(wide) >= 8)
  assert.equal(navigationMode(wide), 'wide')
  assert.equal(navigationMode(nav([button({ titled: false })], 56)), 'rail')
  assert.equal(navigationMode(nav([button({ titled: true })], 56)), 'rail')
  assert.equal(navigationMode(nav([button()], 0)), 'rail')
  assert.equal(navigationMode(nav([button({ titled: false })], 240)), 'wide')
  assert.equal(panelNavigationScore(nav([])), -1)
  assert.equal(panelNavigationScore(null), -1)
  assert.equal(panelNavigationScore(nav([button({ active: true })], 240, 100, 600)), -1)
  assert.equal(panelNavigationScore(nav([button({ active: true })], 800)), -1)
  assert.equal(panelNavigationScore(nav([button()], 240, 700)), -1)
})

test('wrapper cells yield the active launcher or first button, never the pin', () => {
  const row = button({ active: true })
  const pin = button({ titled: false })
  const cell = { querySelector: selector => selector.includes('[aria-current]') ? row : pin }
  assert.deepEqual(launcherButtons(nav([cell])), [row])
  cell.querySelector = selector => selector.includes('[aria-current]') ? null : row
  assert.deepEqual(launcherButtons(nav([cell])), [row])
  assert.deepEqual(launcherButtons(null), [])
})

test('finds the best nav and breaks ties by vertical position', () => {
  const lower = nav([button()], 240, 200)
  const upper = nav([button()], 240, 100)
  assert.equal(findPanelNavigation({ querySelectorAll: () => [lower, upper] }), upper)
  assert.equal(findPanelNavigation({ querySelectorAll: () => [nav([])] }), null)
})

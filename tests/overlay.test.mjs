import assert from 'node:assert/strict'
import test from 'node:test'
import { findOverlayControls } from '../src/overlay.ts'

test('finds absolute and fixed overlapping controls above the area threshold', () => {
  const rect = { left: 0, top: 0, width: 100, height: 60 }
  const tile = { rect, position: 'absolute' }
  const overlay = { rect, position: 'absolute' }
  const fixed = { rect: { ...rect, width: 60 }, position: 'fixed' }
  const small = { rect: { ...rect, width: 24, height: 24 }, position: 'absolute' }
  const outside = { rect: { ...rect, left: 200 }, position: 'absolute' }
  const normal = { rect, position: 'relative' }
  const cell = { rect, querySelectorAll: () => [tile, overlay, fixed, small, outside, normal] }
  const deps = { getComputedStyle: element => element, getBoundingClientRect: element => element.rect }
  assert.deepEqual(findOverlayControls(cell, tile, deps), [overlay, fixed])
  cell.rect = { ...rect, width: 0 }
  assert.deepEqual(findOverlayControls(cell, tile, deps), [])
})

test('excludes controls with area exactly 400 square pixels', () => {
  const overlay = { rect: { left: 0, top: 0, width: 20, height: 20 }, position: 'fixed' }
  const cell = { rect: overlay.rect, querySelectorAll: () => [overlay] }
  assert.deepEqual(findOverlayControls(cell, {}, { getComputedStyle: e => e, getBoundingClientRect: e => e.rect }), [])
})

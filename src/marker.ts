/**
 * Navigation and overlay markers.
 *
 * A MutationObserver and a ResizeObserver keep `data-dsh-grid-panel` on the
 * best navigation candidate through host rerenders. The overlay guard always
 * runs in expanded mode. Disposal removes every attribute the markers added.
 */
import { findPanelNavigation, launcherButtons, navigationMode } from './detect.ts'
import { findOverlayControls } from './overlay.ts'

const ATTRIBUTE = 'data-dsh-grid-panel'
const OVERLAY = 'data-dsh-grid-panel-overlay'

/** Keep the best navigation marked and restore all owned changes on disposal. */
export function observeNavigation() {
  let current: Element | null = null
  let resizeObserver: ResizeObserver | null = null
  let scheduled = false
  let disposed = false
  const overlays = new Set<Element>()

  const clearOverlays = () => {
    for (const control of overlays) control.removeAttribute(OVERLAY)
    overlays.clear()
  }
  const unmark = () => {
    clearOverlays()
    resizeObserver?.disconnect()
    resizeObserver = null
    if (!current) return
    current.removeAttribute(ATTRIBUTE)
    current = null
  }
  const mark = () => {
    scheduled = false
    // A queued microtask can outlive effect disposal.
    if (disposed) return
    const candidate = findPanelNavigation()
    if (candidate !== current) {
      unmark()
      current = candidate
      if (current) {
        resizeObserver = new ResizeObserver(schedule)
        resizeObserver.observe(current)
      }
    }
    if (!current) return
    const mode = navigationMode(current)
    current.setAttribute(ATTRIBUTE, mode)
    if (mode !== 'wide') {
      clearOverlays()
      return
    }
    // Keep existing corner markers across passes, since their corrected boxes no longer qualify.
    for (const control of overlays) {
      if (!current.contains(control)) {
        control.removeAttribute(OVERLAY)
        overlays.delete(control)
      }
    }
    for (const tile of launcherButtons(current)) {
      const cell = tile.parentElement === current ? tile : tile.parentElement
      if (!cell) continue
      for (const control of findOverlayControls(cell, tile, {
        getComputedStyle: element => getComputedStyle(element),
        getBoundingClientRect: element => element.getBoundingClientRect(),
      })) {
        control.setAttribute(OVERLAY, 'corner')
        overlays.add(control)
      }
    }
  }
  const schedule = () => {
    // Host rerenders arrive as mutation bursts, so marking runs once per
    // microtask instead of once per mutation.
    if (scheduled || disposed) return
    scheduled = true
    queueMicrotask(mark)
  }
  const observer = new MutationObserver(schedule)
  observer.observe(document.body, { childList: true, subtree: true })
  schedule()
  return () => {
    disposed = true
    observer.disconnect()
    unmark()
  }
}

/**
 * Overlay detection for the pin guard.
 *
 * A positioned host control can grow over a tile and swallow the launcher
 * click. This module finds those controls so the marker pass can confine
 * them to the corner hit area. Geometry goes through `deps` so tests can
 * run without a browser layout engine.
 */
export interface OverlayDependencies {
  getComputedStyle: (element: Element) => Pick<CSSStyleDeclaration, 'position'>
  getBoundingClientRect: (element: Element) => Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>
}

/** Find oversized overlapping controls without depending on host class names. */
export function findOverlayControls(cell: Element, tileButton: Element, deps: OverlayDependencies): Element[] {
  const cellBox = deps.getBoundingClientRect(cell)
  const cellArea = cellBox.width * cellBox.height
  if (cellArea <= 0) return []
  return Array.from(cell.querySelectorAll('button, [role="button"], a')).filter(control => {
    if (control === tileButton) return false
    // Only positioned controls can escape the tile's layout flow.
    const { position } = deps.getComputedStyle(control)
    if (position !== 'absolute' && position !== 'fixed') return false
    const box = deps.getBoundingClientRect(control)
    // Overlap of the control box with the cell box, per axis.
    const width = Math.max(0, Math.min(cellBox.left + cellBox.width, box.left + box.width) - Math.max(cellBox.left, box.left))
    const height = Math.max(0, Math.min(cellBox.top + cellBox.height, box.top + box.height) - Math.max(cellBox.top, box.top))
    // 400 px² rules out ordinary icon buttons. At 60% coverage the tile
    // center is no longer a reliable launcher target.
    return box.width * box.height > 400 && width * height >= cellArea * 0.6
  })
}

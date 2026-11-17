/**
 * Browser layout options and their validation.
 *
 * Values come from the profile settings served by the host entry, or from
 * explicit options passed by a direct `apply(ctx, options)` caller. Both
 * paths resolve through `resolveConfig`, which clamps invalid values back
 * to `defaults`.
 */

/** How the label sits in the space below the icon. */
export type LabelAlign = 'top' | 'middle'

/** User-supplied grid layout options. Every field falls back to `defaults`. */
export interface GridPanelConfig {
  /** Minimum tile width in pixels for viewports wider than 720 px. */
  minTileSize?: number
  /** Minimum tile width in pixels at or below the 720 px compact breakpoint. */
  compactTileSize?: number
  /** Space between tiles in pixels. */
  gap?: number
  /** Label placement: top-aligned first lines, or centered to align text middles. */
  labelAlign?: LabelAlign
}

/** Validated browser layout options. */
export interface ResolvedGridPanelConfig {
  minTileSize: number
  compactTileSize: number
  gap: number
  labelAlign: LabelAlign
}

export const defaults: Readonly<ResolvedGridPanelConfig> = Object.freeze({
  minTileSize: 76,
  compactTileSize: 68,
  gap: 4,
  labelAlign: 'middle',
})

/** Resolve invalid values to their defaults and discard unknown options. */
export function resolveConfig(config: GridPanelConfig = {}): ResolvedGridPanelConfig {
  const source = config ?? {}
  // Tile sizes outside 48..160 px would break the sidebar layout, so they
  // resolve to the defaults instead of reaching the CSS.
  const size = (value: unknown, fallback: number) =>
    typeof value === 'number' && Number.isFinite(value) && value >= 48 && value <= 160 ? value : fallback
  return {
    minTileSize: size(source.minTileSize, defaults.minTileSize),
    compactTileSize: size(source.compactTileSize, defaults.compactTileSize),
    gap: typeof source.gap === 'number' && Number.isFinite(source.gap) && source.gap >= 0 && source.gap <= 16
      ? source.gap
      : defaults.gap,
    labelAlign: source.labelAlign === 'top' || source.labelAlign === 'middle' ? source.labelAlign : defaults.labelAlign,
  }
}

/**
 * Scoped grid styles.
 *
 * Every selector hangs off `nav[data-dsh-grid-panel="wide"]`, so the
 * collapsed rail and all other host navigations keep their own layout.
 * Declarations use `!important` to win over the host's generated-class and
 * inline launcher styles without raising selector specificity.
 */
import { resolveConfig } from './config.ts'
import type { GridPanelConfig } from './config.ts'

/** Render validated tile sizes as expanded-only styles. */
export function buildCss(options: GridPanelConfig = {}) {
  const config = resolveConfig(options)
  return `nav[data-dsh-grid-panel="wide"] {
  --dsh-grid-panel-min-tile: ${config.minTileSize}px;
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(var(--dsh-grid-panel-min-tile, 72px), 1fr));
  /* Tiles share one row height; labels use the alignment option to decide
     how they sit inside it. */
  align-items: stretch;
  gap: 6px !important;
}
nav[data-dsh-grid-panel="wide"] > * {
  position: relative;
  min-width: 0;
}
nav[data-dsh-grid-panel="wide"] > button,
nav[data-dsh-grid-panel="wide"] > * > button:first-child {
  width: 100% !important;
  min-width: 0 !important;
  height: auto !important;
  padding: 7px 6px !important;
  flex-direction: column !important;
  /* Top-align content so icons share one line even when a label wraps to
     two lines. Vertical centering would lift the icon of a long label. */
  justify-content: flex-start !important;
  gap: 5px !important;
  text-align: center;
  line-height: 1.2;
}
nav[data-dsh-grid-panel="wide"] > button > span:first-child,
nav[data-dsh-grid-panel="wide"] > * > button:first-child > span:first-child {
  position: relative;
  flex: 0 0 auto;
  overflow: visible;
}
/* Re-anchor extra slot children to the glyph. Nested SVG paths and
   single-root icons retain their host layout. */
nav[data-dsh-grid-panel="wide"] > button > span:first-child > [data-slot="sidebar.panellist"] > :not(:first-child),
nav[data-dsh-grid-panel="wide"] > * > button:first-child > span:first-child > [data-slot="sidebar.panellist"] > :not(:first-child) {
  position: absolute !important;
  top: -7px !important;
  right: auto !important;
  left: 12px !important;
  z-index: 1;
  margin: 0 !important;
  transform: none !important;
}
/* Labels wrap to two lines and break anywhere, so long panel names cannot
   stretch the column. In middle alignment the label centers in the space
   below the icon, keeping text middles on one line. */
nav[data-dsh-grid-panel="wide"] > button > span:not(:first-child),
nav[data-dsh-grid-panel="wide"] > * > button:first-child > span:not(:first-child) {
  display: -webkit-box !important;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  font-size: 11px;
  line-height: 1.25;
  white-space: normal !important;
  overflow-wrap: anywhere;
}${config.labelAlign === 'middle' ? `
nav[data-dsh-grid-panel="wide"] > button > span:not(:first-child),
nav[data-dsh-grid-panel="wide"] > * > button:first-child > span:not(:first-child) {
  margin-block: auto;
}` : ''}
@media (max-width: 720px) {
  nav[data-dsh-grid-panel="wide"] {
    --dsh-grid-panel-min-tile: ${config.compactTileSize}px;
  }
}
@media (prefers-reduced-motion: reduce) {
  nav[data-dsh-grid-panel="wide"] > button,
  nav[data-dsh-grid-panel="wide"] > * > button:first-child {
    transition: none !important;
  }
}
/* Extra row buttons and guarded overlays share the same 24 x 24 px corner
   box, pinned top-left so it never collides with the badge at the top
   right of the glyph. The tile center stays a launcher target. */
nav[data-dsh-grid-panel="wide"] > * > button:not(:first-child),
nav[data-dsh-grid-panel="wide"] [data-dsh-grid-panel-overlay="corner"] {
  position: absolute !important;
  top: 2px !important;
  right: auto !important;
  left: 2px !important;
  width: 24px !important;
  height: 24px !important;
  min-width: 0 !important;
  min-height: 0 !important;
  padding: 0 !important;
  z-index: 2;
}
`
}

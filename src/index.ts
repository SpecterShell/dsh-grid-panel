/**
 * Browser entry for the sidebar grid.
 *
 * DSH discovers this module through the host entry at the package root and
 * loads it through ModuleLoader. All layout code runs in the browser; the
 * host entry only declares the settings schema and serves the resolved
 * configuration.
 */
import { resolveConfig } from './config.ts'
import type { GridPanelConfig, ResolvedGridPanelConfig } from './config.ts'
import { locales } from './locales.ts'
import { buildCss } from './styles.ts'
import { observeNavigation } from './marker.ts'

export * from './config.ts'
export * from './locales.ts'
export * from './detect.ts'
export * from './overlay.ts'
export { buildCss, observeNavigation }
export type Config = GridPanelConfig

/**
 * The subset of the DSH client context this plugin uses. `effect` scopes
 * setup and cleanup to the plugin lifecycle. `locale` registers
 * dictionaries, binds a translator and reports language changes.
 */
export interface ClientContext {
  effect: (setup: () => (() => void) | void, label: string) => unknown
  locale: {
    register: (namespace: string, dictionaries: Record<string, Record<string, string>>) => () => void
    bind: (namespace: string) => (key: string) => string
    subscribe: (listener: () => void) => () => void
  }
}

/**
 * Read the profile settings the host entry serves. The route is missing
 * when the host entry is disabled or the profile has no web server, and the
 * bundled defaults are the designed fallback for both cases.
 */
async function fetchProfileConfig(): Promise<GridPanelConfig> {
  try {
    const response = await fetch('/grid-panel/config.json')
    return response.ok ? await response.json() : {}
  } catch {
    return {}
  }
}

/**
 * Install the layout effects. With an options object the call is
 * synchronous and uses exactly those values. The installed client calls
 * `apply(ctx)` without options, which returns a promise that reads the
 * profile settings first.
 */
export function apply(ctx: ClientContext, options?: GridPanelConfig) {
  if (options) return install(ctx, resolveConfig(options))
  return fetchProfileConfig().then(config => void install(ctx, resolveConfig(config)))
}

function install(ctx: ClientContext, config: ResolvedGridPanelConfig) {
  // Registration is its own effect so plugin disposal also unregisters the dictionaries.
  ctx.effect(() => ctx.locale.register('dsh-grid-panel', locales), 'dsh-grid-panel: locales')
  ctx.effect(() => {
    // A single owned style element keeps cleanup to one remove() call.
    const style = document.createElement('style')
    style.id = 'dsh-grid-panel-styles'
    style.textContent = buildCss(config)
    document.head.appendChild(style)
    return () => style.remove()
  }, 'dsh-grid-panel: styles')
  // The observer lives inside an effect so disposal disconnects it.
  ctx.effect(() => observeNavigation(), 'dsh-grid-panel: navigation')
}

export const inject = ['locale']

/**
 * Host entry for the grid panel.
 *
 * Declares the Schemastery Config that the Settings UI renders as the
 * plugin's settings form, and serves the live values to the browser client
 * over one exact route. Everything else runs in the client.
 */
import z from '@deepseek-ai/schemastery'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { defaults } from './config.ts'
import type { ResolvedGridPanelConfig } from './config.ts'

/** The minimal slice of the DSH webServer service this plugin uses. */
interface WebServerLike {
  register(route: {
    kind: 'exact'
    path: string
    handler: (req: IncomingMessage, res: ServerResponse) => void
  }): () => void
}

/** A live config field as Cordis hands it to `apply`, read through get(). */
interface Volatile<T> {
  get(): T
}

/** The volatile config shape Cordis passes to `apply`. */
export interface GridPanelVolatileConfig {
  minTileSize: Volatile<number>
  compactTileSize: Volatile<number>
  labelAlign: Volatile<string>
}

/** The minimal slice of the Cordis host context this plugin uses. */
export interface HostContext {
  inject(
    deps: ['webServer'],
    callback: (ctx: {
      webServer: WebServerLike
      effect: (setup: () => (() => void) | void, label: string) => unknown
    }) => void,
  ): unknown
}

/**
 * Settings form schema. Bounds mirror the client-side clamp in
 * `resolveConfig`, so the form and the runtime reject the same values.
 * Fields are volatile: the Settings UI only renders forms for volatile
 * fields, and edits apply without a plugin restart.
 */
export const Config = z.object({
  minTileSize: z.number().min(48).max(160).default(defaults.minTileSize)
    .description('Minimum tile width in pixels.')
    .volatile(),
  compactTileSize: z.number().min(48).max(160).default(defaults.compactTileSize)
    .description('Minimum tile width in pixels at viewport widths of 720 px or less.')
    .volatile(),
  labelAlign: z.union(['top', 'middle']).default(defaults.labelAlign)
    .description('Vertical alignment of the tile label.')
    .volatile(),
})

/** Serve the resolved config; the client falls back to defaults without it. */
export function apply(ctx: HostContext, config: GridPanelVolatileConfig) {
  // webServer can activate after this plugin. Deferred injection registers
  // the route when the service appears and never runs on profiles without
  // one, where no browser client loads either.
  ctx.inject(['webServer'], injected => {
    injected.effect(() => injected.webServer.register({
      kind: 'exact',
      path: '/grid-panel/config.json',
      handler(req, res) {
        // Volatile fields can change without a restart, so read them per request.
        const current: ResolvedGridPanelConfig = {
          minTileSize: config.minTileSize.get(),
          compactTileSize: config.compactTileSize.get(),
          labelAlign: config.labelAlign.get() === 'top' ? 'top' : 'middle',
        }
        res.setHeader('content-type', 'application/json; charset=utf-8')
        res.setHeader('cache-control', 'no-store')
        res.end(JSON.stringify(current))
      },
    }), 'dsh-grid-panel: config route')
  })
}

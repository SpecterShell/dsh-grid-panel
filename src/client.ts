/**
 * Installed client entry: the sidebar grid plus the Plugins page settings
 * card. lib/client.js bundles this module; the `api` subpath stays
 * layout-only and free of React imports so direct browser callers can load
 * it outside the module system.
 */
import { apply as applyLayout } from './index.ts'
import type { ClientContext } from './index.ts'
import { mountSettingsCard } from './settings.ts'
import type { SettingsContext } from './settings.ts'
import type { GridPanelConfig } from './config.ts'

export * from './index.ts'
export { mountSettingsCard }

export function apply(ctx: ClientContext & SettingsContext, options?: GridPanelConfig) {
  // The card needs no settings values; it stages edits over the shared form.
  mountSettingsCard(ctx, ctx.locale.bind('dsh-grid-panel'))
  return applyLayout(ctx, options)
}

export const inject = ['locale', 'slots', 'configForms']

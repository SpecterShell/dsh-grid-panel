/**
 * Plugins page settings section.
 *
 * The section renders on this plugin's own detail page through the
 * `plugins.bundle.config` slot, keyed by package name. The `plugins.item`
 * slot is reserved for the shipped settings cards, so a bundle that
 * registers there would also appear among the built-in plugins. The section
 * mounts only while the host serves this plugin's settings namespace, so
 * disabling the plugin removes it. Edits are staged until saved; the layout
 * client reads the new values on the next page load.
 */
import { createElement as h } from 'react'
import { SegmentedControl, SettingsForm, SettingsFormModel, SettingsValueField, settingsNumberField } from '@deepseek-ai/dsh-client-ui-primitives'
import type { SettingsFieldSpec, SettingsFormScope, SettingsFormShell, SettingsFieldState } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ResolvedGridPanelConfig } from './config.ts'

/** The slice of the client slots service this card uses. */
interface SlotsLike {
  inject(key: string, callback: () => () => void): () => void
  register(options: {
    name: string
    key: string
    label: () => string
    locale: string
    inject: () => unknown
  }, factory: (props: CardProps) => unknown): () => void
}

/** The slice of the client config-forms service this card uses. */
interface ConfigFormsLike {
  get<T>(entryId: string): SettingsFormScope<T>
  whileServed(namespaces: readonly string[], register: (served: ReadonlySet<string>) => () => void): () => void
}

/** Client context services the settings card needs beyond the layout ones. */
export interface SettingsContext {
  slots?: SlotsLike
  configForms?: ConfigFormsLike
}

/** The props the Plugins page hands a `plugins.bundle.config` entry. */
interface CardProps {
  view?: string
  t: (key: string) => string
  useGridPanelCard: <S>(select: (snapshot: CardState) => S) => S
  edit: (field: string, text: string) => void
  resetField: (field: string) => void
  save: () => void
  discard: () => void
}

interface CardState extends SettingsFormShell {
  minTileSize: SettingsFieldState
  compactTileSize: SettingsFieldState
  gap: SettingsFieldState
  labelAlign: SettingsFieldState
}

/** The label alignment choice, staged as the draft text "top" or "middle". */
const labelAlignField: SettingsFieldSpec = {
  field: 'labelAlign',
  format: value => value === 'top' || value === 'middle' ? value : '',
  parse: text => text === 'top' || text === 'middle' ? { kind: 'set', value: text } : undefined,
}

/**
 * The Settings UI identifies bundle-installed entries with an `include:`
 * prefix, while base-composition rows carry their bare id. Watch both forms.
 */
const NAMESPACES = ['include:dsh-grid-panel', 'dsh-grid-panel']

/**
 * The choice field repeats the SettingsValueField rhythm (12 px padding,
 * hairline separator, 13 px label, 12 px hint) so it reads as one form, and
 * the trailing note matches the form's hint metrics. Rendered with the card,
 * the style element leaves with it.
 */
const STYLE = `
.dsh-grid-panel-settings-field { padding: 12px 0; border-top: 0.5px solid var(--dsw-alias-border-l2); }
.dsh-grid-panel-settings-head { display: flex; align-items: center; gap: 8px; }
.dsh-grid-panel-settings-label { flex: 1; min-width: 0; font-size: 13px; font-weight: 500; line-height: 1.5; color: var(--dsw-alias-label-primary); }
.dsh-grid-panel-settings-hint { margin: 4px 0 0; font-size: 12px; line-height: 1.5; color: var(--dsw-alias-label-tertiary); }
.dsh-grid-panel-settings-note { margin: 12px 0 0; font-size: 12px; line-height: 1.5; color: var(--dsw-alias-label-tertiary); }
`

/** The card component the Plugins page renders on the bundle detail page. */
function GridPanelCard(props: CardProps) {
  const { t } = props
  const state = props.useGridPanelCard(snapshot => snapshot)
  const disabled = !state.writable
  return h(SettingsForm, {
    labels: {
      unavailable: t('settings.unavailable'),
      readOnly: t('settings.readOnly'),
      saveFailed: t('settings.saveFailed'),
      save: t('settings.save'),
      saving: t('settings.saving'),
    },
    state,
    onSave: props.save,
    onDiscard: props.discard,
  }, [
    h('style', { key: 'style' }, STYLE),
    ...(['minTileSize', 'compactTileSize', 'gap'] as const).map(field => h(SettingsValueField, {
      key: field,
      id: `dsh-grid-panel-${field}`,
      label: t(`settings.${field}`),
      hint: t(`settings.${field}Hint`),
      numeric: true,
      disabled,
      ...state[field],
      overriddenLabel: t('settings.overridden'),
      resetLabel: t('settings.reset'),
      invalidLabel: t('settings.invalidNumber'),
      onEdit: text => props.edit(field, text),
      onReset: () => props.resetField(field),
    })),
    h('div', { key: 'labelAlign', className: 'dsh-grid-panel-settings-field' }, [
      h('div', { key: 'head', className: 'dsh-grid-panel-settings-head' }, [
        h('span', { key: 'label', className: 'dsh-grid-panel-settings-label' }, t('settings.labelAlign')),
        h(SegmentedControl, {
          key: 'control',
          id: 'dsh-grid-panel-labelAlign',
          value: (state.labelAlign.text === 'top' ? 'top' : 'middle') as 'top' | 'middle',
          options: [
            { value: 'middle' as const, label: t('settings.labelAlignMiddle') },
            { value: 'top' as const, label: t('settings.labelAlignTop') },
          ],
          label: t('settings.labelAlign'),
          disabled: !state.writable || state.saving,
          onChange: next => props.edit('labelAlign', next),
        }),
      ]),
      h('p', { key: 'hint', className: 'dsh-grid-panel-settings-hint' }, t('settings.labelAlignHint')),
    ]),
    h('p', { key: 'reload', className: 'dsh-grid-panel-settings-note' }, t('settings.reload')),
  ])
}

/**
 * Mount the settings card while the host serves the settings namespace.
 * No-op for direct API callers, whose context has no slots or configForms.
 */
export function mountSettingsCard(
  ctx: SettingsContext & { effect: (setup: () => (() => void) | void, label: string) => unknown },
  translate: (key: string) => string,
) {
  if (!ctx.slots || !ctx.configForms) return
  const slots = ctx.slots
  const configForms = ctx.configForms
  ctx.effect(() => configForms.whileServed(NAMESPACES, served => {
    // The served set tells us which id form this profile composed.
    const ns = NAMESPACES.find(name => served.has(name)) ?? NAMESPACES[1]
    const form = new SettingsFormModel<ResolvedGridPanelConfig>(configForms.get(ns), [
      settingsNumberField('minTileSize'),
      settingsNumberField('compactTileSize'),
      settingsNumberField('gap'),
      labelAlignField,
    ])
    const store = form.bind((): CardState => ({
      ...form.shell(),
      minTileSize: form.field('minTileSize'),
      compactTileSize: form.field('compactTileSize'),
      gap: form.field('gap'),
      labelAlign: form.field('labelAlign'),
    }))
    const disposeSlot = slots.inject('plugins.bundle.config', () => slots.register({
      name: 'plugins.bundle.config',
      // The page renders this entry on the detail page of the package whose
      // name matches the key.
      key: '@spectershell/dsh-grid-panel',
      label: () => translate('settings.title'),
      locale: 'dsh-grid-panel',
      inject: () => ({ hooks: { gridPanelCard: store }, ...form.actions() }),
    }, GridPanelCard))
    return () => {
      disposeSlot()
      form.dispose()
    }
  }), 'dsh-grid-panel: settings card')
}

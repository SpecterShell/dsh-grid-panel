import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'

/** Construct a minimal host launcher fingerprint. */
export function button({ active = false, titled = true } = {}) {
  return {
    tagName: 'BUTTON',
    getAttribute: name => name === 'aria-label' ? 'Panel' : name === 'aria-current' && active ? 'page' : null,
    querySelector: selector => selector === ':scope > span' || selector === 'svg' ? {} : null,
    querySelectorAll: selector => selector === ':scope > span' ? new Array(titled ? 2 : 1).fill({}) : [],
  }
}

/** Construct a mutable navigation with deterministic geometry. */
export function nav(children, width = 240, top = 180, left = 12) {
  const attributes = new Map()
  return {
    tagName: 'NAV', children, attributes,
    getBoundingClientRect: () => ({ left, top, width, height: 60 }),
    getAttribute: name => attributes.get(name) ?? null,
    setAttribute: (name, value) => attributes.set(name, value),
    removeAttribute: name => attributes.delete(name),
    contains: element => children.includes(element),
  }
}

/** Load the emitted ModuleLoader script with injectable browser globals. */
export async function loadClient(t, globals = {}) {
  const source = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
  assert.ok(source.startsWith('window.__ModuleLoader__.load({'))
  let definition
  vm.runInNewContext(source, {
    window: { __ModuleLoader__: { load: value => { definition = value } } }, ...globals,
  })
  assert.equal(definition.id, '@spectershell/dsh-grid-panel')
  // The factory requires React and the settings primitives from the browser
  // module table; the layout tests never mount the card, so stubs suffice.
  return definition.factory(name => {
    if (name === 'react') return { createElement: () => ({}) }
    if (name === '@deepseek-ai/dsh-client-ui-primitives') return {}
    throw new Error(`unexpected require: ${name}`)
  })
}

/** Provide observer and DOM stubs with effect cleanup tracking. */
export function environment(candidate) {
  const cleanups = []
  const listeners = new Set()
  const registrations = new Map()
  let language = 'en'
  const styles = []
  const observers = []
  class Observer {
    constructor(callback) {
      this.callback = callback
      observers.push(this)
    }
    observe() {}
    disconnect() { this.disconnected = true }
  }
  const document = {
    body: {},
    head: { appendChild: style => styles.push(style) },
    getElementById: id => styles.find(style => style.id === id),
    createElement: () => ({ remove() { this.removed = true } }),
    querySelectorAll: () => candidate ? [candidate] : [],
  }
  const ctx = {
    effect(setup) {
      const cleanup = setup()
      if (cleanup) cleanups.push(cleanup)
    },
    locale: {
      register(namespace, dictionaries) {
        registrations.set(namespace, dictionaries)
        return () => registrations.delete(namespace)
      },
      bind: namespace => key => registrations.get(namespace)?.[language]?.[key] ?? key,
      subscribe(listener) {
        listeners.add(listener)
        return () => listeners.delete(listener)
      },
    },
  }
  return { globals: { document, MutationObserver: Observer, ResizeObserver: Observer, queueMicrotask }, ctx, styles, observers, listeners, registrations,
    setCandidate: value => { candidate = value },
    setLanguage(value) { language = value; for (const listener of listeners) listener() },
    dispose: () => { for (const cleanup of cleanups.splice(0).reverse()) cleanup() } }
}

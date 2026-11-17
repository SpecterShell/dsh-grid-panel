/**
 * Runtime dictionaries.
 *
 * The locale JSON files mix flat runtime strings with a nested `meta`
 * object for package metadata. Importing them at build time keeps the
 * browser free of runtime dictionary fetches.
 */
import en from '../locale/en.json' with { type: 'json' }
import zh from '../locale/zh.json' with { type: 'json' }

export type Locales = Record<string, Record<string, string>>

/** Keep only top-level string values; nested metadata stays out of the runtime map. */
export function runtimeLocales(dictionaries: Record<string, Record<string, unknown>>): Locales {
  return Object.fromEntries(Object.entries(dictionaries).map(([language, dictionary]) => [
    language,
    Object.fromEntries(Object.entries(dictionary).filter((entry): entry is [string, string] => typeof entry[1] === 'string')),
  ]))
}

export const locales = runtimeLocales({ en, zh })

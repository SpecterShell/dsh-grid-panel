/**
 * Panel-navigation detection.
 *
 * Host CSS-module class names are generated per build, so detection cannot
 * match on them. It scores each `nav` by launcher structure, accessibility
 * attributes and viewport geometry instead.
 */

/**
 * Collect only launch buttons that are direct cells of a navigation list.
 * A wrapped row yields its direct launcher child, preferring the one with
 * `aria-current`, so a separate pin button in the same row is never treated
 * as the launcher.
 */
export function launcherButtons(nav: Element | null) {
  return Array.from(nav?.children ?? []).flatMap((child) => {
    if (child?.tagName === 'BUTTON') return [child]
    const nested = child.querySelector(':scope > button[aria-current]')
      ?? child.querySelector(':scope > button')
    return nested?.tagName === 'BUTTON' ? [nested] : []
  })
}

/** Score launcher structure within sidebar geometry, without host class names. */
export function panelNavigationScore(nav: Element | null) {
  if (!nav || nav.tagName !== 'NAV') return -1
  const buttons = launcherButtons(nav)
  if (buttons.length === 0) return -1
  const rect = nav.getBoundingClientRect()
  // Sidebar bounds: a navigation starting more than 420 px from the left or
  // 520 px from the top belongs to another region of the host.
  if (rect.left >= 420 || rect.width <= 0 || rect.width >= 420 || rect.top >= 520) return -1
  let score = 6
  if (buttons.every((button) => Boolean(button.getAttribute?.('aria-label')))) score += 2
  if (buttons.every((button) => Boolean(button.querySelector?.(':scope > span')))) score += 2
  if (buttons.some((button) => Boolean(button.querySelector?.('svg')))) score += 1
  if (buttons.some((button) => button.getAttribute?.('aria-current') === 'page') ) score += 2
  return score
}

/**
 * Use navigation width so retained labels cannot grid the 56 px rail.
 * The 96 px split sits between the rail width and the expanded navigation.
 */
export function navigationMode(nav: Element) {
  return nav.getBoundingClientRect().width > 96 ? 'wide' : 'rail'
}

/**
 * Choose one best structural match so unrelated application navs stay
 * untouched. A candidate needs the base score of 6 plus at least one
 * two-point signal, and ties break toward the navigation nearest the top.
 */
export function findPanelNavigation(root: ParentNode = document): HTMLElement | null {
  const candidates = Array.from(root.querySelectorAll?.('nav') ?? [])
    .map((nav) => ({ nav, score: panelNavigationScore(nav) }))
    .filter(({ score }) => score >= 8)
    .sort((left, right) => right.score - left.score
      || (left.nav.getBoundingClientRect?.().top ?? Infinity)
        - (right.nav.getBoundingClientRect?.().top ?? Infinity))
  return candidates[0]?.nav ?? null
}

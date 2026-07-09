// Remembers a page's scroll position across a "leave and come back" round
// trip (e.g. open a recipe or edit it, then return) so the user doesn't
// have to re-scroll to find where they were. Uses sessionStorage — scoped
// to the current tab, keyed per page — since a normal navigation (as
// opposed to the browser's own back/forward) always starts a fresh page
// at the top and forgets scroll position on its own.

function storageKey(key) {
  return `cooklog:scroll:${key}`
}

/**
 * Call once per page load. Saves `window.scrollY` (debounced to one write
 * per frame) as the user scrolls, so whatever they last saw is recorded
 * before they navigate away.
 */
export function rememberScrollPosition(key) {
  let ticking = false
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        sessionStorage.setItem(storageKey(key), String(window.scrollY))
        ticking = false
      })
    },
    { passive: true }
  )
}

/**
 * Call once, after the page's main content has finished its initial
 * render (so there's actually enough page height to scroll to).
 */
export function restoreScrollPosition(key) {
  const saved = sessionStorage.getItem(storageKey(key))
  if (saved === null) return
  window.scrollTo(0, Number(saved))
}

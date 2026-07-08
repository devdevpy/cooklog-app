// Animates a number counting up from 0 to `target` inside `el`.

const DEFAULT_DURATION_MS = 900

function easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t)
}

export function animateCountUp(el, target, { duration = DEFAULT_DURATION_MS } = {}) {
  if (!el) return
  if (!Number.isFinite(target) || target <= 0) {
    el.textContent = String(target)
    return
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = String(target)
    return
  }

  const start = performance.now()

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1)
    const value = Math.round(target * easeOutQuad(progress))
    el.textContent = String(value)
    if (progress < 1) {
      requestAnimationFrame(tick)
    }
  }

  requestAnimationFrame(tick)
}

/**
 * Like `animateCountUp`, but waits until `el` actually scrolls into view
 * before playing — avoids the animation finishing off-screen on pages
 * where the stat sits below the fold.
 */
export function observeCountUp(el, target, options = {}) {
  if (!el) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = String(target)
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        animateCountUp(el, target, options)
        observer.unobserve(el)
      })
    },
    { threshold: 0 }
  )
  observer.observe(el)
}

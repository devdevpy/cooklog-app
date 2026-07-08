// Fades + slides `.recipe-card` elements in as they scroll into view.
// Progressive enhancement: cards are visible by default (see main.css),
// so if this never runs (or reduced motion is on) nothing is hidden.

const STAGGER_STEP_S = 0.05
const MAX_STAGGER_INDEX = 8

let observer = null

function getObserver() {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const card = entry.target
          card.classList.remove('reveal-pending')
          card.addEventListener(
            'transitionend',
            () => {
              card.style.transitionDelay = ''
            },
            { once: true }
          )
          observer.unobserve(card)
        })
      },
      { threshold: 0, rootMargin: '0px 0px 50px 0px' }
    )
  }
  return observer
}

/**
 * Call after inserting fresh recipe cards into `container` (e.g. right
 * after setting `container.innerHTML = recipesGrid(...)`).
 */
export function revealCardsOnScroll(container) {
  if (!container) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const cards = container.querySelectorAll('.recipe-card:not(.recipe-card-skeleton)')
  const io = getObserver()
  cards.forEach((card, index) => {
    card.style.transitionDelay = `${Math.min(index, MAX_STAGGER_INDEX) * STAGGER_STEP_S}s`
    card.classList.add('reveal-pending')
    io.observe(card)
  })
}

const SCROLL_THRESHOLD = 300

function renderMarkup() {
  return `
    <button type="button" class="back-to-top-btn" aria-label="Back to top">
      <i class="bi bi-arrow-up"></i>
    </button>`
}

function getButton() {
  let button = document.querySelector('.back-to-top-btn')
  if (!button) {
    document.body.insertAdjacentHTML('beforeend', renderMarkup())
    button = document.querySelector('.back-to-top-btn')
  }
  return button
}

/**
 * Inject the "Back to Top" button (once per page) and wire up scroll-based
 * visibility plus a smooth scroll-to-top on click.
 */
export function initBackToTop() {
  const button = getButton()

  function toggleVisibility() {
    button.classList.toggle('is-visible', window.scrollY > SCROLL_THRESHOLD)
  }

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })

  window.addEventListener('scroll', toggleVisibility, { passive: true })
  toggleVisibility()
}

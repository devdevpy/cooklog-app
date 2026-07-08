// Lightweight, dependency-free confetti burst — a handful of colored
// pieces that fall/rotate across `container`, then remove themselves.

const COLORS = ['#D4AF37', '#F0D060', '#FAFAF8', '#2D6A4F', '#ffffff']
const MIN_DURATION_S = 2.2
const MAX_EXTRA_DURATION_S = 1.6
const MAX_DELAY_S = 0.4

export function burstConfetti(container, { count = 40 } = {}) {
  if (!container) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const fragment = document.createDocumentFragment()
  const pieces = []

  for (let i = 0; i < count; i++) {
    const piece = document.createElement('span')
    piece.className = 'confetti-piece'
    piece.style.left = `${Math.random() * 100}%`
    piece.style.background = COLORS[Math.floor(Math.random() * COLORS.length)]
    piece.style.animationDuration = `${MIN_DURATION_S + Math.random() * MAX_EXTRA_DURATION_S}s`
    piece.style.animationDelay = `${Math.random() * MAX_DELAY_S}s`
    piece.style.setProperty('--confetti-rotate-start', `${Math.random() * 360}deg`)
    fragment.appendChild(piece)
    pieces.push(piece)
  }

  container.appendChild(fragment)

  const maxLifetimeMs = (MIN_DURATION_S + MAX_EXTRA_DURATION_S + MAX_DELAY_S) * 1000 + 200
  setTimeout(() => {
    pieces.forEach((piece) => piece.remove())
  }, maxLifetimeMs)
}

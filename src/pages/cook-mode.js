import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { getRecipeWithDetails } from '../services/recipes.js'
import { burstConfetti } from '../js/confetti.js'

const SWIPE_THRESHOLD = 50

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function ingredientsListHtml(ingredients) {
  if (!ingredients.length) return '<li class="text-muted">No ingredients listed</li>'
  return ingredients
    .map(
      (ing) => `
      <li>
        <strong>${escapeHtml(ing.amount)} ${escapeHtml(ing.unit)}</strong>
        ${escapeHtml(ing.name)}
      </li>`
    )
    .join('')
}

function renderMessage(root, { title, message, backHref, backLabel = 'Back to recipes' }) {
  root.innerHTML = `
    <div class="cook-mode-message">
      <i class="bi bi-emoji-frown" style="font-size: 3rem; color: var(--color-accent);"></i>
      <h1 class="h3 mb-0" style="font-family: var(--font-heading); color: #fff;">${escapeHtml(title)}</h1>
      <p class="mb-0" style="color: rgba(255, 255, 255, 0.85);">${escapeHtml(message)}</p>
      <a href="${backHref}" class="btn cook-exit-btn mt-2">← ${escapeHtml(backLabel)}</a>
    </div>`
}

function wireStepNavigation(steps) {
  const stepNumberEl = document.getElementById('cookStepNumber')
  const stepTextEl = document.getElementById('cookStepText')
  const stepCounterEl = document.getElementById('cookStepCounter')
  const prevBtn = document.getElementById('cookPrevBtn')
  const nextBtn = document.getElementById('cookNextBtn')
  const mainEl = document.getElementById('cookMain')
  const congratsOverlay = document.getElementById('cookCongratsOverlay')

  const total = steps.length
  let current = 0
  let completed = false

  function render() {
    const step = steps[current]
    stepNumberEl.textContent = step.step_number
    stepTextEl.textContent = step.description
    stepCounterEl.textContent = `Step ${current + 1} of ${total}`
    prevBtn.classList.toggle('d-none', current === 0)
    nextBtn.textContent = current === total - 1 ? '🎉 Done!' : 'Next →'
  }

  function goPrev() {
    if (completed || current === 0) return
    current -= 1
    render()
  }

  function goNext() {
    if (completed) return
    if (current === total - 1) {
      completed = true
      congratsOverlay.classList.remove('d-none')
      burstConfetti(congratsOverlay)
      return
    }
    current += 1
    render()
  }

  prevBtn.addEventListener('click', goPrev)
  nextBtn.addEventListener('click', goNext)

  let touchStartX = 0
  mainEl.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX
  })
  mainEl.addEventListener('touchend', (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX
    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return
    if (deltaX < 0) {
      goNext()
    } else {
      goPrev()
    }
  })

  render()
}

function renderCookMode(root, recipe, ingredients, steps) {
  const backHref = `/src/pages/recipe-detail.html?id=${encodeURIComponent(recipe.id)}`
  const title = escapeHtml(recipe.title)

  root.innerHTML = `
    <div class="cook-mode-shell">
      <header class="cook-topbar">
        <a href="${backHref}" class="btn cook-exit-btn btn-sm">← Exit</a>
        <h1 class="cook-topbar-title" title="${title}">${title}</h1>
        <div class="cook-topbar-right">
          <span class="cook-step-counter" id="cookStepCounter"></span>
          <button
            type="button"
            class="btn btn-sm cook-ingredients-btn"
            data-bs-toggle="offcanvas"
            data-bs-target="#cookIngredientsPanel"
          >
            <i class="bi bi-basket"></i> Show Ingredients
          </button>
        </div>
      </header>

      <main class="cook-main" id="cookMain">
        <div class="cook-step-number" id="cookStepNumber"></div>
        <p class="cook-step-text" id="cookStepText"></p>
      </main>

      <footer class="cook-bottom-nav">
        <button type="button" class="btn cook-prev-btn" id="cookPrevBtn">← Previous</button>
        <button type="button" class="btn cook-next-btn" id="cookNextBtn"></button>
      </footer>
    </div>

    <div
      class="offcanvas offcanvas-end cook-ingredients-panel"
      tabindex="-1"
      id="cookIngredientsPanel"
      aria-labelledby="cookIngredientsPanelLabel"
    >
      <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="cookIngredientsPanelLabel">
          <i class="bi bi-basket me-2"></i>Ingredients
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div class="offcanvas-body">
        <ul class="list-unstyled cook-ingredients-list mb-0">
          ${ingredientsListHtml(ingredients)}
        </ul>
      </div>
    </div>

    <div class="cook-congrats-overlay d-none" id="cookCongratsOverlay">
      <div class="cook-congrats-inner">
        <i class="bi bi-check-circle-fill cook-congrats-icon"></i>
        <h2 class="cook-congrats-title">Recipe complete!</h2>
        <p class="cook-congrats-text">Enjoy your meal.</p>
        <a href="${backHref}" class="btn cook-congrats-btn">Back to Recipe</a>
      </div>
    </div>
  `

  wireStepNavigation(steps)
}

async function init() {
  const root = document.getElementById('cookModeRoot')
  const params = new URLSearchParams(window.location.search)
  const recipeId = params.get('id')

  if (!recipeId) {
    renderMessage(root, {
      title: 'No recipe selected',
      message: 'Open cook mode from a recipe page to get started.',
      backHref: '/',
    })
    return
  }

  const backHref = `/src/pages/recipe-detail.html?id=${encodeURIComponent(recipeId)}`

  try {
    const { recipe, ingredients, steps } = await getRecipeWithDetails(recipeId)

    if (!steps.length) {
      renderMessage(root, {
        title: 'No steps to cook',
        message: 'This recipe has no instructions yet.',
        backHref,
        backLabel: 'Back to recipe',
      })
      return
    }

    renderCookMode(root, recipe, ingredients, steps)
  } catch (error) {
    console.error('Failed to load recipe for cook mode:', error)
    if (error?.code === 'PGRST116') {
      renderMessage(root, {
        title: 'Recipe not found',
        message: "This recipe doesn't exist, or may have been removed.",
        backHref: '/',
      })
    } else {
      renderMessage(root, {
        title: 'Something went wrong',
        message: 'Failed to load recipe. Please try again.',
        backHref,
        backLabel: 'Back to recipe',
      })
    }
  }
}

init()

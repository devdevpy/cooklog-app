import { Modal } from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { initNavbar } from '../components/navbar.js'
import { initBackToTop } from '../components/back-to-top.js'
import { getUser, isAdmin } from '../services/auth.js'
import { getRecipeWithDetails, deleteRecipe } from '../services/recipes.js'
import { deleteRecipeImage } from '../services/storage.js'
import { addFavorite, removeFavorite, isFavorite } from '../services/favorites.js'
import { showToast, storeToast, consumeStoredToast } from '../js/toast.js'
import { notFoundState } from '../js/recipesView.js'

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

async function loadRecipe() {
  const params = new URLSearchParams(window.location.search)
  const recipeId = params.get('id')

  if (!recipeId) {
    showNotFound()
    return
  }

  try {
    const { recipe, ingredients, steps } = await getRecipeWithDetails(recipeId)

    const user = await getUser()
    const isOwner = !!user && user.id === recipe.user_id
    const admin = !isOwner && user ? await isAdmin() : false
    const canManage = isOwner || admin

    renderRecipe(recipe, ingredients, steps, { canManage })

    if (canManage) {
      wireManagementActions(recipe)
    }

    if (user) {
      const favorited = await isFavorite(recipe.id, user.id)
      wireFavoriteButton(recipe.id, favorited)
    }
  } catch (error) {
    console.error('Failed to load recipe:', error)
    // PGRST116 = PostgREST "no rows found" for .single() — an invalid or
    // deleted recipe id, distinct from a real fetch failure.
    if (error?.code === 'PGRST116') {
      showNotFound()
    } else {
      showError('Failed to load recipe. Please try again.')
    }
  }
}

function renderRecipe(recipe, ingredients, steps, { canManage }) {
  const container = document.getElementById('recipeContent')

  const categoryName = recipe.categories?.name || 'Uncategorized'
  const authorName = recipe.author?.full_name || 'Unknown'
  const imageHtml = recipe.image_url
    ? `<img src="${escapeHtml(recipe.image_url)}" alt="${escapeHtml(recipe.title)}"
         class="img-fluid rounded mb-4"
         style="max-height: 400px; width: 100%; object-fit: cover;">`
    : ''

  const ingredientsHtml =
    ingredients.length > 0
      ? ingredients
          .map(
            (ing) => `
        <li class="mb-2">
          <strong>${escapeHtml(ing.amount)} ${escapeHtml(ing.unit)}</strong>
          ${escapeHtml(ing.name)}
        </li>`
          )
          .join('')
      : '<li class="text-muted">No ingredients listed</li>'

  const stepsHtml =
    steps.length > 0
      ? steps
          .map(
            (step) => `
        <div class="d-flex gap-3 mb-3">
          <div class="flex-shrink-0">
            <span class="badge bg-primary rounded-circle"
              style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
              ${step.step_number}
            </span>
          </div>
          <div class="flex-grow-1">
            <p class="mb-0">${escapeHtml(step.description)}</p>
          </div>
        </div>`
          )
          .join('')
      : '<p class="text-muted">No instructions provided</p>'

  const manageBar = canManage
    ? `
      <div class="d-flex gap-2 mb-3">
        <a id="editRecipeBtn" href="/src/pages/edit-recipe.html?id=${escapeHtml(recipe.id)}"
           class="btn btn-outline-primary btn-sm">
          <i class="bi bi-pencil me-1"></i> Edit
        </a>
        <button type="button" id="deleteRecipeBtn" class="btn btn-outline-danger btn-sm">
          <i class="bi bi-trash me-1"></i> Delete
        </button>
      </div>`
    : ''

  container.innerHTML = `
    <div class="row justify-content-center">
      <div class="col-12 col-lg-10 col-xl-8">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <a href="/" class="text-decoration-none">
            <i class="bi bi-arrow-left me-1"></i> Back to recipes
          </a>
        </div>

        ${manageBar}

        <div class="card border-0 shadow-sm">
          <div class="card-body p-4">
            ${imageHtml}

            <div class="mb-3">
              <span class="badge bg-primary-subtle text-primary">${escapeHtml(categoryName)}</span>
              ${
                recipe.is_private && canManage
                  ? `<span class="badge bg-warning-subtle text-warning-emphasis ms-1" title="Private recipe">
                       <i class="bi bi-lock-fill me-1"></i>Private
                     </span>`
                  : ''
              }
            </div>

            <div class="d-flex justify-content-between align-items-start gap-2 mb-3">
              <h1 class="h2 mb-0">${escapeHtml(recipe.title)}</h1>
              <button
                type="button"
                id="favoriteBtn"
                class="btn favorite-btn d-none"
                aria-label="Add to favorites"
                title="Add to favorites"
              >
                <i class="bi bi-heart"></i>
              </button>
            </div>
            <p class="text-secondary mb-4">${escapeHtml(recipe.description || '')}</p>

            <div class="d-flex gap-4 mb-4 text-secondary flex-wrap">
              <div>
                <i class="bi bi-clock me-1"></i>
                <span>${recipe.prep_time || 0} min</span>
              </div>
              <div>
                <i class="bi bi-people me-1"></i>
                <span>${recipe.servings || 0} servings</span>
              </div>
              <div>
                <i class="bi bi-person me-1"></i>
                <span>${escapeHtml(authorName)}</span>
              </div>
            </div>

            <div class="d-grid d-sm-flex mb-4">
              <a href="/src/pages/cook-mode.html?id=${escapeHtml(recipe.id)}"
                 class="btn start-cooking-btn btn-lg d-inline-flex align-items-center justify-content-center gap-2">
                🍳 Start Cooking
              </a>
            </div>

            <hr class="my-4">

            <h3 class="h5 mb-3 section-header">
              <i class="bi bi-basket me-2"></i>Ingredients
            </h3>
            <ul class="list-unstyled mb-4">
              ${ingredientsHtml}
            </ul>

            <hr class="my-4">

            <h3 class="h5 mb-3 section-header">
              <i class="bi bi-list-ol me-2"></i>Instructions
            </h3>
            <div>
              ${stepsHtml}
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

function wireManagementActions(recipe) {
  const deleteBtn = document.getElementById('deleteRecipeBtn')
  if (!deleteBtn) return

  const modalEl = document.getElementById('deleteRecipeModal')
  const modal = Modal.getOrCreateInstance(modalEl)
  const confirmBtn = document.getElementById('confirmDeleteBtn')
  const titleEl = document.getElementById('deleteRecipeTitle')

  deleteBtn.addEventListener('click', () => {
    titleEl.textContent = recipe.title
    modal.show()
  })

  confirmBtn.addEventListener('click', async () => {
    confirmBtn.disabled = true
    confirmBtn.innerHTML = `
      <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
      Deleting...
    `
    try {
      const { imageUrl } = await deleteRecipe(recipe.id)
      if (imageUrl) {
        await deleteRecipeImage(imageUrl)
      }
      storeToast('Recipe deleted.', 'success')
      window.location.href = '/'
    } catch (error) {
      console.error('Failed to delete recipe:', error)
      showToast(error.message || 'Failed to delete recipe.', 'danger')
      confirmBtn.disabled = false
      confirmBtn.innerHTML = `<i class="bi bi-trash me-1"></i> Delete`
    }
  })
}

function wireFavoriteButton(recipeId, initiallyFavorited) {
  const btn = document.getElementById('favoriteBtn')
  if (!btn) return

  btn.classList.remove('d-none')
  const icon = btn.querySelector('i')
  let favorited = initiallyFavorited

  function paint() {
    icon.className = favorited ? 'bi bi-heart-fill' : 'bi bi-heart'
    btn.classList.toggle('is-favorited', favorited)
    const label = favorited ? 'Remove from favorites' : 'Add to favorites'
    btn.setAttribute('aria-label', label)
    btn.title = label
  }
  paint()

  btn.addEventListener('click', async () => {
    btn.disabled = true
    try {
      if (favorited) {
        await removeFavorite(recipeId)
        favorited = false
        showToast('Removed from favorites.', 'success')
      } else {
        await addFavorite(recipeId)
        favorited = true
        showToast('Added to favorites.', 'success')
      }
      paint()
    } catch (error) {
      console.error('Failed to update favorite:', error)
      showToast(error.message || 'Failed to update favorites.', 'danger')
    } finally {
      btn.disabled = false
    }
  })
}

function showError(message) {
  const container = document.getElementById('recipeContent')
  container.innerHTML = `
    <div class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>
      ${escapeHtml(message)}
    </div>
    <div class="text-center">
      <a href="/" class="btn btn-primary">
        <i class="bi bi-arrow-left me-1"></i> Back to recipes
      </a>
    </div>
  `
}

function showNotFound() {
  document.getElementById('recipeContent').innerHTML = notFoundState()
}

async function init() {
  await initNavbar()
  initBackToTop()
  consumeStoredToast()
  await loadRecipe()
}

init()

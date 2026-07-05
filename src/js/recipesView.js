// Pure UI rendering helpers for the recipes listing page.
// These functions only build markup from data — no data fetching here.

const DETAIL_URL = '/src/pages/recipe-detail.html'

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function totalTime(recipe) {
  const total = (recipe.prep_time || 0) + (recipe.cook_time || 0)
  return total > 0 ? `${total} min` : '—'
}

function placeholderMarkup() {
  return `
    <div class="d-flex align-items-center justify-content-center bg-body-secondary text-secondary" style="height: 200px;">
      <i class="bi bi-card-image fs-1"></i>
    </div>`
}

function imageBlock(recipe) {
  if (recipe.image_url) {
    // If the image fails to load, hide it and reveal the placeholder sibling.
    return `
      <img src="${escapeHtml(recipe.image_url)}" class="card-img-top object-fit-cover"
           style="height: 200px;" alt="${escapeHtml(recipe.title)}"
           onerror="this.onerror=null;this.classList.add('d-none');this.nextElementSibling.classList.remove('d-none');" />
      <div class="d-none">${placeholderMarkup()}</div>`
  }
  return placeholderMarkup()
}

/**
 * Render a single recipe as a Bootstrap card (column wrapper included).
 */
export function recipeCard(recipe) {
  const categoryName = recipe.categories?.name
  const authorName = recipe.author?.full_name
  const badge = categoryName
    ? `<span class="badge text-bg-primary">${escapeHtml(categoryName)}</span>`
    : `<span class="badge text-bg-secondary">Uncategorized</span>`
  // RLS only returns private recipes to their owner or an admin, so if
  // `is_private` is true here the current viewer is authorised to see it.
  const privateBadge = recipe.is_private
    ? `<span class="badge text-bg-warning ms-1" title="Private recipe">
         <i class="bi bi-lock-fill me-1"></i>Private
       </span>`
    : ''

  return `
  <div class="col">
    <div class="card h-100 shadow-sm border-0">
      ${imageBlock(recipe)}
      <div class="card-body d-flex flex-column">
        <div class="mb-2">${badge}${privateBadge}</div>
        <h5 class="card-title">${escapeHtml(recipe.title)}</h5>
        ${
          recipe.description
            ? `<p class="card-text text-secondary small flex-grow-1">${escapeHtml(
                recipe.description
              ).slice(0, 120)}${recipe.description.length > 120 ? '…' : ''}</p>`
            : '<div class="flex-grow-1"></div>'
        }
        <div class="d-flex align-items-center gap-3 text-secondary small mb-3">
          <span title="Total time"><i class="bi bi-clock me-1"></i>${totalTime(recipe)}</span>
          <span title="Servings"><i class="bi bi-people me-1"></i>${
            recipe.servings ? `${recipe.servings} servings` : '—'
          }</span>
        </div>
        ${
          authorName
            ? `<div class="text-secondary small mb-3"><i class="bi bi-person-circle me-1"></i>${escapeHtml(
                authorName
              )}</div>`
            : ''
        }
        <a href="${DETAIL_URL}?id=${encodeURIComponent(recipe.id)}"
           class="btn btn-outline-primary w-100 mt-auto d-flex align-items-center justify-content-center gap-1">
          <i class="bi bi-eye"></i> View Recipe
        </a>
      </div>
    </div>
  </div>`
}

/**
 * Render the full grid of recipe cards.
 */
export function recipesGrid(recipes) {
  return `
    <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      ${recipes.map(recipeCard).join('')}
    </div>`
}

export function loadingState() {
  return `
    <div class="text-center text-secondary py-5">
      <div class="spinner-border text-primary" role="status" aria-hidden="true"></div>
      <p class="mt-3 mb-0">Loading recipes…</p>
    </div>`
}

export function emptyState({ filtered = false } = {}) {
  if (filtered) {
    return `
      <div class="text-center text-secondary py-5">
        <i class="bi bi-search fs-1"></i>
        <h5 class="mt-3">No recipes match your filters</h5>
        <p class="mb-0">Try a different category or search term.</p>
      </div>`
  }
  return `
    <div class="text-center text-secondary py-5">
      <i class="bi bi-journal-plus fs-1"></i>
      <h5 class="mt-3">No recipes yet</h5>
      <p>Be the first to share a delicious recipe.</p>
      <a href="/src/pages/recipe-form.html" class="btn btn-primary d-inline-flex align-items-center gap-1">
        <i class="bi bi-plus-lg"></i> Add a recipe
      </a>
    </div>`
}

export function errorState(message) {
  return `
    <div class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle me-1"></i>
      ${escapeHtml(message || 'Failed to load recipes.')}
    </div>`
}

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '../css/style.css'
import { initNavbar } from '../components/navbar.js'
import { getRecipeById } from '../services/recipes.js'
import { supabase } from '../js/supabaseClient.js'

async function loadRecipe() {
  const params = new URLSearchParams(window.location.search)
  const recipeId = params.get('id')

  if (!recipeId) {
    showError('No recipe ID provided')
    return
  }

  try {
    const recipe = await getRecipeById(recipeId)

    const { data: ingredients } = await supabase
      .from('ingredients')
      .select('*')
      .eq('recipe_id', recipeId)
      .order('id')

    const { data: steps } = await supabase
      .from('recipe_steps')
      .select('*')
      .eq('recipe_id', recipeId)
      .order('step_number')

    renderRecipe(recipe, ingredients || [], steps || [])
  } catch (error) {
    console.error('Failed to load recipe:', error)
    showError('Failed to load recipe. Please try again.')
  }
}

function renderRecipe(recipe, ingredients, steps) {
  const container = document.getElementById('recipeContent')
  
  const categoryName = recipe.categories?.name || 'Uncategorized'
  const authorName = recipe.author?.full_name || 'Unknown'
  const imageHtml = recipe.image_url
    ? `<img src="${recipe.image_url}" alt="${recipe.title}" class="img-fluid rounded mb-4" style="max-height: 400px; width: 100%; object-fit: cover;">`
    : ''

  const ingredientsHtml = ingredients.length > 0
    ? ingredients.map(ing => `
        <li class="mb-2">
          <strong>${ing.amount} ${ing.unit}</strong> ${ing.name}
        </li>
      `).join('')
    : '<li class="text-muted">No ingredients listed</li>'

  const stepsHtml = steps.length > 0
    ? steps.map(step => `
        <div class="d-flex gap-3 mb-3">
          <div class="flex-shrink-0">
            <span class="badge bg-primary rounded-circle" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
              ${step.step_number}
            </span>
          </div>
          <div class="flex-grow-1">
            <p class="mb-0">${step.instruction}</p>
          </div>
        </div>
      `).join('')
    : '<p class="text-muted">No instructions provided</p>'

  container.innerHTML = `
    <div class="row justify-content-center">
      <div class="col-12 col-lg-10 col-xl-8">
        <div class="mb-3">
          <a href="/" class="text-decoration-none">
            <i class="bi bi-arrow-left me-1"></i> Back to recipes
          </a>
        </div>

        <div class="card border-0 shadow-sm">
          <div class="card-body p-4">
            ${imageHtml}
            
            <div class="mb-3">
              <span class="badge bg-primary-subtle text-primary">${categoryName}</span>
            </div>

            <h1 class="h2 mb-3">${recipe.title}</h1>
            <p class="text-secondary mb-4">${recipe.description}</p>

            <div class="d-flex gap-4 mb-4 text-secondary">
              <div>
                <i class="bi bi-clock me-1"></i>
                <span>${recipe.prep_time || 0} min</span>
              </div>
              <div>
                <i class="bi bi-people me-1"></i>
                <span>${recipe.servings} servings</span>
              </div>
              <div>
                <i class="bi bi-person me-1"></i>
                <span>${authorName}</span>
              </div>
            </div>

            <hr class="my-4">

            <h3 class="h5 mb-3">
              <i class="bi bi-basket me-2"></i>Ingredients
            </h3>
            <ul class="list-unstyled mb-4">
              ${ingredientsHtml}
            </ul>

            <hr class="my-4">

            <h3 class="h5 mb-3">
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

function showError(message) {
  const container = document.getElementById('recipeContent')
  container.innerHTML = `
    <div class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>
      ${message}
    </div>
    <div class="text-center">
      <a href="/" class="btn btn-primary">
        <i class="bi bi-arrow-left me-1"></i> Back to recipes
      </a>
    </div>
  `
}

async function init() {
  await initNavbar()
  await loadRecipe()
}

init()

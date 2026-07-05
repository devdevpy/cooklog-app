import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './css/style.css'
import { Modal } from 'bootstrap'
import { initNavbar } from './components/navbar.js'
import { supabase } from './js/supabaseClient.js'
import { getRecipes } from './services/recipes.js'
import { getCategories } from './js/categories.js'
import { consumeStoredToast } from './js/toast.js'
import {
  recipesGrid,
  recipeCard,
  loadingState,
  emptyState,
  errorState,
} from './js/recipesView.js'

const container = document.querySelector('#recipesContainer')
const searchInput = document.querySelector('#searchInput')
const categoryFilter = document.querySelector('#categoryFilter')
const randomBtn = document.querySelector('#randomBtn')
const randomModalEl = document.querySelector('#randomModal')
const randomModalBody = document.querySelector('#randomModalBody')
const viewScopeButtons = Array.from(document.querySelectorAll('[data-view-scope]'))

let allRecipes = []
let currentUserId = null
let activeViewScope = 'mine-public'

function getInitialViewScope() {
  const params = new URLSearchParams(window.location.search)
  return params.get('view') === 'mine' ? 'mine' : 'mine-public'
}

initNavbar('#navbar')
consumeStoredToast()

function getVisibleRecipePool() {
  if (activeViewScope === 'mine') {
    return allRecipes.filter((recipe) => recipe.user_id === currentUserId)
  }

  return allRecipes.filter((recipe) => {
    if (recipe.user_id === currentUserId) return true
    return !recipe.is_private
  })
}

function getRecipeCategoryId(recipe) {
  const candidates = [recipe?.category_id, recipe?.categoryId, recipe?.categories?.id]
  return candidates.find((value) => value !== undefined && value !== null && value !== '')
}

function getFiltered() {
  const term = searchInput.value.trim().toLowerCase()
  const categoryId = categoryFilter.value
  return getVisibleRecipePool().filter((recipe) => {
    const matchesCategory = !categoryId || String(getRecipeCategoryId(recipe)) === String(categoryId)
    const matchesSearch = !term || recipe.title.toLowerCase().includes(term)
    return matchesCategory && matchesSearch
  })
}

function updateViewButtons() {
  viewScopeButtons.forEach((button) => {
    const isActive = button.dataset.viewScope === activeViewScope
    // Not `.active` — Bootstrap's own `.btn.active` "pressed" rule has
    // higher specificity than our `.btn-primary` theme override and would
    // force its default blue back in, regardless of source order.
    button.classList.toggle('is-selected', isActive)
    button.classList.toggle('btn-primary', isActive)
    button.classList.toggle('btn-outline-primary', !isActive)
  })
}

function setViewScope(scope) {
  activeViewScope = scope
  const params = new URLSearchParams(window.location.search)
  params.set('view', scope)
  const nextUrl = `${window.location.pathname}?${params.toString()}`
  window.history.replaceState({}, '', nextUrl)
  updateViewButtons()
  renderList()
}

function renderList() {
  const filtered = getFiltered()
  if (filtered.length === 0) {
    const isFiltered = Boolean(searchInput.value.trim() || categoryFilter.value)
    container.innerHTML = emptyState({ filtered: isFiltered && allRecipes.length > 0 })
    return
  }
  container.innerHTML = recipesGrid(filtered)
}

async function loadCategories() {
  try {
    const categories = await getCategories()
    categoryFilter.insertAdjacentHTML(
      'beforeend',
      categories
        .map((c) => `<option value="${c.id}">${c.name}</option>`)
        .join('')
    )
  } catch (err) {
    console.error('Failed to load categories:', err)
  }
}

async function loadRecipes() {
  container.innerHTML = loadingState()
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    currentUserId = user?.id ?? null

    allRecipes = await getRecipes()
    activeViewScope = getInitialViewScope()
    updateViewButtons()
    renderList()
  } catch (err) {
    console.error('Failed to load recipes:', err)
    container.innerHTML = errorState(err?.message)
  }
}

function showRandomRecipe() {
  const pool = getFiltered()
  if (pool.length === 0) {
    randomModalBody.innerHTML =
      '<p class="text-secondary mb-0">No recipes available to pick from.</p>'
  } else {
    const pick = pool[Math.floor(Math.random() * pool.length)]
    // recipeCard returns a .col wrapper; a single column fills the modal nicely.
    randomModalBody.innerHTML = `<div class="row">${recipeCard(pick)}</div>`
  }
  Modal.getOrCreateInstance(randomModalEl).show()
}

// Debounced search
let searchTimer
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(renderList, 200)
})
categoryFilter.addEventListener('change', renderList)
randomBtn.addEventListener('click', showRandomRecipe)
viewScopeButtons.forEach((button) => {
  button.addEventListener('click', () => setViewScope(button.dataset.viewScope))
})

loadCategories()
loadRecipes()

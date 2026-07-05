import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { Modal } from 'bootstrap'
import { initNavbar } from './components/navbar.js'
import { supabase } from './js/supabaseClient.js'
import { getRecipes } from './services/recipes.js'
import { getCategories } from './js/categories.js'
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

let allRecipes = []

initNavbar('#navbar')

function getFiltered() {
  const term = searchInput.value.trim().toLowerCase()
  const categoryId = categoryFilter.value
  return allRecipes.filter((r) => {
    const matchesCategory = !categoryId || r.category_id === categoryId
    const matchesSearch = !term || r.title.toLowerCase().includes(term)
    return matchesCategory && matchesSearch
  })
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
    // "My Recipes" for authenticated users: only show the current user's rows.
    // Anonymous visitors still see the full public browsing list.
    const {
      data: { user },
    } = await supabase.auth.getUser()
    allRecipes = await getRecipes(user ? { userId: user.id } : {})
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

loadCategories()
loadRecipes()

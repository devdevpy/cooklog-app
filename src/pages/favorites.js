import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { initNavbar } from '../components/navbar.js'
import { initBackToTop } from '../components/back-to-top.js'
import { getUser } from '../services/auth.js'
import { getFavorites } from '../services/favorites.js'
import { recipesGrid, loadingState } from '../js/recipesView.js'

async function checkAuth() {
  const user = await getUser()
  if (!user) {
    window.location.href = '/src/pages/login.html'
    return null
  }
  return user
}

function emptyFavoritesState() {
  return `
    <div class="empty-state text-center py-5">
      <i class="bi bi-heart empty-state-icon"></i>
      <h5 class="empty-state-title mt-3">No favorites yet.</h5>
      <p class="text-secondary mb-3">Start exploring recipes!</p>
      <a href="/" class="btn btn-primary d-inline-flex align-items-center gap-1">
        <i class="bi bi-search"></i> Browse recipes
      </a>
    </div>`
}

function errorState() {
  return `
    <div class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>
      Failed to load your favorites. Please try again.
    </div>`
}

async function init() {
  await initNavbar()
  initBackToTop()
  const user = await checkAuth()
  if (!user) return

  const container = document.getElementById('favoritesContainer')
  container.innerHTML = loadingState()

  try {
    const recipes = await getFavorites(user.id)
    container.innerHTML = recipes.length > 0 ? recipesGrid(recipes) : emptyFavoritesState()
  } catch (error) {
    console.error('Failed to load favorites:', error)
    container.innerHTML = errorState()
  }
}

init()

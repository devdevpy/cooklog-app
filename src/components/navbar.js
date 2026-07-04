import { supabase } from '../js/supabaseClient.js'
import { signOut } from '../services/auth.js'

const ROUTES = {
  home: '/',
  login: '/src/pages/login.html',
  register: '/src/pages/register.html',
  addRecipe: '/src/pages/add-recipe.html',
}

function displayName(user) {
  if (!user) return ''
  return user.user_metadata?.full_name || user.email || 'Account'
}

function renderMarkup() {
  return `
  <nav class="navbar navbar-expand-lg bg-body-tertiary border-bottom sticky-top">
    <div class="container">
      <a class="navbar-brand fw-bold d-flex align-items-center gap-2" href="${ROUTES.home}">
        <i class="bi bi-egg-fried text-primary fs-4"></i>
        <span>CookLog</span>
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
              data-bs-target="#mainNav" aria-controls="mainNav"
              aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="mainNav">
        <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-1" data-auth-menu>
          <!-- populated by JS -->
        </ul>
      </div>
    </div>
  </nav>`
}

function loggedOutMenu() {
  return `
    <li class="nav-item">
      <a class="nav-link d-flex align-items-center gap-1" href="${ROUTES.login}">
        <i class="bi bi-box-arrow-in-right"></i> Login
      </a>
    </li>
    <li class="nav-item">
      <a class="btn btn-primary btn-sm d-flex align-items-center gap-1 ms-lg-2" href="${ROUTES.register}">
        <i class="bi bi-person-plus"></i> Register
      </a>
    </li>`
}

function loggedInMenu(user) {
  return `
    <li class="nav-item">
      <a class="nav-link d-flex align-items-center gap-1" href="${ROUTES.home}">
        <i class="bi bi-journal-richtext"></i> My Recipes
      </a>
    </li>
    <li class="nav-item">
      <a class="nav-link d-flex align-items-center gap-1" href="${ROUTES.addRecipe}">
        <i class="bi bi-plus-circle"></i> Add Recipe
      </a>
    </li>
    <li class="nav-item d-flex align-items-center text-secondary px-lg-2 py-2 py-lg-0">
      <i class="bi bi-person-circle me-1"></i>
      <span class="fw-medium text-truncate" style="max-width: 180px;">${displayName(user)}</span>
    </li>
    <li class="nav-item">
      <button type="button" class="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 ms-lg-2" data-logout>
        <i class="bi bi-box-arrow-right"></i> Logout
      </button>
    </li>`
}

function updateMenu(root, user) {
  const menu = root.querySelector('[data-auth-menu]')
  if (!menu) return
  menu.innerHTML = user ? loggedInMenu(user) : loggedOutMenu()

  const logoutBtn = menu.querySelector('[data-logout]')
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      logoutBtn.disabled = true
      try {
        await signOut()
        window.location.href = ROUTES.login
      } catch (err) {
        logoutBtn.disabled = false
        console.error('Logout failed:', err)
      }
    })
  }
}

/**
 * Render the shared navbar into `selector` and keep it in sync with the
 * Supabase auth state via onAuthStateChange.
 */
export async function initNavbar(selector = '#navbar') {
  const root = document.querySelector(selector)
  if (!root) return

  root.innerHTML = renderMarkup()

  // Initial state
  const {
    data: { user },
  } = await supabase.auth.getUser()
  updateMenu(root, user)

  // Keep in sync with future auth changes (login / logout / token refresh)
  supabase.auth.onAuthStateChange((_event, session) => {
    updateMenu(root, session?.user ?? null)
  })
}

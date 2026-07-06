import { supabase } from '../js/supabaseClient.js'
import { signOut, isAdmin, getAccountStatus, accountStatusMessage } from '../services/auth.js'
import { storeToast } from '../js/toast.js'

const ROUTES = {
  home: '/',
  about: '/src/pages/about.html',
  login: '/src/pages/login.html',
  register: '/src/pages/register.html',
  addRecipe: '/src/pages/add-recipe.html',
  admin: '/src/pages/admin.html',
  profile: '/src/pages/profile.html',
  favorites: '/src/pages/favorites.html',
}

function aboutLink() {
  return `
    <li class="nav-item">
      <a class="nav-link d-flex align-items-center gap-1" href="${ROUTES.about}">
        <i class="bi bi-info-circle"></i> About
      </a>
    </li>`
}

function displayName(user) {
  if (!user) return ''
  return user.user_metadata?.full_name || user.email || 'Account'
}

function renderMarkup() {
  return `
  <nav class="navbar navbar-expand-lg site-navbar sticky-top">
    <div class="container">
      <a class="navbar-brand fw-bold d-flex align-items-center gap-2 site-brand" href="${ROUTES.home}">
        <i class="bi bi-egg-fried fs-4"></i>
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
    ${aboutLink()}
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

function loggedInMenu(user, admin) {
  const adminLink = admin
    ? `
    <li class="nav-item">
      <a class="nav-link d-flex align-items-center gap-1" href="${ROUTES.admin}">
        <i class="bi bi-shield-lock"></i> Admin
      </a>
    </li>`
    : ''
  return `
    ${aboutLink()}
    <li class="nav-item">
      <a class="nav-link d-flex align-items-center gap-1" href="${ROUTES.home}?view=mine">
        <i class="bi bi-journal-richtext"></i> My Recipes
      </a>
    </li>
    <li class="nav-item">
      <a class="nav-link d-flex align-items-center gap-1" href="${ROUTES.addRecipe}">
        <i class="bi bi-plus-circle"></i> Add Recipe
      </a>
    </li>
    <li class="nav-item">
      <a class="nav-link d-flex align-items-center gap-1" href="${ROUTES.favorites}">
        <i class="bi bi-heart"></i> Favorites
      </a>
    </li>
    ${adminLink}
    <li class="nav-item">
      <a class="nav-link d-flex align-items-center text-secondary px-lg-2 py-2 py-lg-0" href="${ROUTES.profile}">
        <i class="bi bi-person-circle me-1"></i>
        <span class="fw-medium text-truncate" style="max-width: 180px;">${displayName(user)}</span>
      </a>
    </li>
    <li class="nav-item">
      <button type="button" class="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 ms-lg-2" data-logout>
        <i class="bi bi-box-arrow-right"></i> Logout
      </button>
    </li>`
}

async function updateMenu(root, user) {
  const menu = root.querySelector('[data-auth-menu]')
  if (!menu) return
  const admin = user ? await isAdmin(user.id) : false
  menu.innerHTML = user ? loggedInMenu(user, admin) : loggedOutMenu()

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
 * Signs out and redirects to login any already-logged-in user whose account
 * has since been restricted or soft-deleted by an admin (see
 * services/admin.js). Runs on every page since `initNavbar` is universal —
 * this is the single enforcement point for existing sessions (new sign-ins
 * are separately blocked in `signIn`).  Returns false when the caller should
 * stop (a redirect is in flight).
 */
async function enforceAccountStatus(user) {
  if (!user) return true

  const status = await getAccountStatus(user.id)
  if (!status.restricted && !status.deleted) return true

  await signOut()
  storeToast(accountStatusMessage(status), 'danger')
  window.location.href = ROUTES.login
  return false
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

  if (!(await enforceAccountStatus(user))) return

  await updateMenu(root, user)

  // Keep in sync with future auth changes (login / logout / token refresh)
  supabase.auth.onAuthStateChange((_event, session) => {
    updateMenu(root, session?.user ?? null)
  })
}

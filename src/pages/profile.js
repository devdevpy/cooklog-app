import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { Modal } from 'bootstrap'
import '../css/style.css'
import { initNavbar } from '../components/navbar.js'
import { getUser } from '../services/auth.js'
import { getProfile, updateAvatarUrl } from '../services/profiles.js'
import { getRecipes, deleteRecipe } from '../services/recipes.js'
import { deleteRecipeImage } from '../services/storage.js'
import { uploadAvatar } from '../services/avatarStorage.js'
import { setupImagePreview } from '../js/recipeForm.js'
import { recipesGrid, emptyState } from '../js/recipesView.js'
import { showToast } from '../js/toast.js'

let myRecipes = []

async function checkAuth() {
  const user = await getUser()
  if (!user) {
    window.location.href = '/src/pages/login.html'
    return null
  }
  return user
}

/**
 * Total recipe count + most-used category, derived client-side from the
 * already-fetched "my recipes" list (no extra count query needed).
 * Ties are broken by `getRecipes`' newest-first ordering: the first category
 * to *reach* the max count keeps it.
 */
function computeStats(recipes) {
  if (recipes.length === 0) return { total: 0, topCategory: null }

  const counts = new Map()
  let topCategory = null
  let topCount = 0
  for (const recipe of recipes) {
    const name = recipe.categories?.name ?? 'Uncategorized'
    const next = (counts.get(name) ?? 0) + 1
    counts.set(name, next)
    if (next > topCount) {
      topCount = next
      topCategory = name
    }
  }
  return { total: recipes.length, topCategory }
}

function renderStats(recipes) {
  const { total, topCategory } = computeStats(recipes)
  document.getElementById('statTotalRecipes').textContent = total
  document.getElementById('statTopCategory').textContent = topCategory ?? '—'
}

function renderRecipes(recipes) {
  const container = document.getElementById('myRecipesContainer')
  container.innerHTML =
    recipes.length > 0 ? recipesGrid(recipes, { showActions: true }) : emptyState()
}

function wireAvatarUpload(userId) {
  const input = document.getElementById('avatarInput')
  const spinner = document.getElementById('avatarSpinner')

  input.addEventListener('change', async (e) => {
    const file = e.target.files[0]
    if (!file || file.size === 0) return

    input.disabled = true
    spinner.classList.remove('d-none')
    try {
      const avatarUrl = await uploadAvatar(file, userId)
      await updateAvatarUrl(userId, avatarUrl)
      showToast('Avatar updated.', 'success')
    } catch (error) {
      console.error('Failed to update avatar:', error)
      showToast(error.message || 'Failed to update avatar.', 'danger')
    } finally {
      input.disabled = false
      spinner.classList.add('d-none')
      input.value = ''
    }
  })
}

function wireDeleteModal() {
  const modalEl = document.getElementById('deleteRecipeModal')
  const modal = Modal.getOrCreateInstance(modalEl)
  const titleEl = document.getElementById('deleteRecipeTitle')
  const confirmBtn = document.getElementById('confirmDeleteBtn')
  const container = document.getElementById('myRecipesContainer')
  let pendingDeleteId = null

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-delete-id]')
    if (!btn) return
    pendingDeleteId = btn.dataset.deleteId
    titleEl.textContent = btn.dataset.deleteTitle || 'this recipe'
    modal.show()
  })

  confirmBtn.addEventListener('click', async () => {
    if (!pendingDeleteId) return
    const recipeId = pendingDeleteId
    confirmBtn.disabled = true
    confirmBtn.innerHTML = `
      <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
      Deleting...
    `
    try {
      const { imageUrl } = await deleteRecipe(recipeId)
      if (imageUrl) {
        await deleteRecipeImage(imageUrl)
      }
      myRecipes = myRecipes.filter((r) => r.id !== recipeId)
      renderRecipes(myRecipes)
      renderStats(myRecipes)
      modal.hide()
      showToast('Recipe deleted.', 'success')
    } catch (error) {
      console.error('Failed to delete recipe:', error)
      showToast(error.message || 'Failed to delete recipe.', 'danger')
    } finally {
      pendingDeleteId = null
      confirmBtn.disabled = false
      confirmBtn.innerHTML = `<i class="bi bi-trash me-1"></i> Delete`
    }
  })
}

async function init() {
  await initNavbar()
  const user = await checkAuth()
  if (!user) return

  try {
    const [profile, recipes] = await Promise.all([
      getProfile(user.id),
      getRecipes({ userId: user.id }),
    ])
    myRecipes = recipes

    document.getElementById('profileFullName').textContent =
      profile.full_name || user.email || 'Unnamed user'
    setupImagePreview(
      document.getElementById('avatarInput'),
      document.getElementById('avatarPreview'),
      profile.avatar_url ? `${profile.avatar_url}?v=${Date.now()}` : null,
      { showCaption: false }
    )

    renderStats(myRecipes)
    renderRecipes(myRecipes)
    wireAvatarUpload(user.id)
    wireDeleteModal()

    document.getElementById('profileLoader').classList.add('d-none')
    document.getElementById('profileContent').classList.remove('d-none')
  } catch (error) {
    console.error('Failed to load profile:', error)
    document.getElementById('profileLoader').innerHTML = `
      <div class="alert alert-danger" role="alert">
        <i class="bi bi-exclamation-triangle me-2"></i>Failed to load your profile. Please try again.
      </div>
    `
  }
}

init()

import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { Modal } from 'bootstrap'
import { initNavbar } from '../components/navbar.js'
import { initBackToTop } from '../components/back-to-top.js'
import { getUser } from '../services/auth.js'
import { getProfile, updateAvatarUrl, updateFullName } from '../services/profiles.js'
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

function wireNameEdit(userId, initialName) {
  const displayRow = document.getElementById('fullNameDisplay')
  const nameEl = document.getElementById('profileFullName')
  const form = document.getElementById('editNameForm')
  const input = document.getElementById('fullNameInput')
  const editBtn = document.getElementById('editNameBtn')
  const cancelBtn = document.getElementById('cancelNameBtn')
  const saveBtn = document.getElementById('saveNameBtn')
  const saveSpinner = document.getElementById('saveNameSpinner')
  const saveIcon = document.getElementById('saveNameIcon')
  const errorEl = document.getElementById('nameError')

  let currentName = initialName

  function enterEditMode() {
    input.value = currentName
    errorEl.textContent = ''
    form.classList.remove('was-validated')
    displayRow.classList.add('d-none')
    form.classList.remove('d-none')
    input.focus()
  }

  function exitEditMode() {
    form.classList.add('d-none')
    displayRow.classList.remove('d-none')
  }

  editBtn.addEventListener('click', enterEditMode)
  cancelBtn.addEventListener('click', exitEditMode)

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (!form.checkValidity()) {
      form.classList.add('was-validated')
      return
    }

    const nextName = input.value.trim()
    saveBtn.disabled = true
    cancelBtn.disabled = true
    saveSpinner.classList.remove('d-none')
    saveIcon.classList.add('d-none')
    try {
      await updateFullName(userId, nextName)
      currentName = nextName
      nameEl.textContent = nextName
      exitEditMode()
      showToast('Name updated.', 'success')
    } catch (error) {
      console.error('Failed to update name:', error)
      errorEl.textContent = error.message || 'Failed to update name.'
    } finally {
      saveBtn.disabled = false
      cancelBtn.disabled = false
      saveSpinner.classList.add('d-none')
      saveIcon.classList.remove('d-none')
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
  initBackToTop()
  const user = await checkAuth()
  if (!user) return

  try {
    const [profile, recipes] = await Promise.all([
      getProfile(user.id),
      getRecipes({ userId: user.id }),
    ])
    myRecipes = recipes

    const displayName = profile.full_name || user.email || 'Unnamed user'
    document.getElementById('profileFullName').textContent = displayName
    wireNameEdit(user.id, displayName)
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

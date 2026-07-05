import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '../css/style.css'
import { initNavbar } from '../components/navbar.js'
import { getUser, isAdmin } from '../services/auth.js'
import { uploadRecipeImage, deleteRecipeImage } from '../services/storage.js'
import { getRecipeWithDetails, updateRecipe } from '../services/recipes.js'
import { showToast, storeToast } from '../js/toast.js'
import { notFoundState } from '../js/recipesView.js'
import {
  loadCategories,
  setupImagePreview,
  setupDynamicIngredients,
  setupDynamicSteps,
  refreshRemoveButtons,
  collectRecipeFormData,
  prefillScalarFields,
} from '../js/recipeForm.js'

function showError(message) {
  document.getElementById('initialLoader').classList.add('d-none')
  document.getElementById('formCard').classList.add('d-none')
  const errorEl = document.getElementById('errorState')
  errorEl.textContent = message
  errorEl.classList.remove('d-none')
}

function showNotFound() {
  document.getElementById('initialLoader').classList.add('d-none')
  document.getElementById('formCard').classList.add('d-none')
  const errorEl = document.getElementById('errorState')
  errorEl.className = ''
  errorEl.innerHTML = notFoundState()
  errorEl.classList.remove('d-none')
}

async function ensureAuthorised(recipe) {
  const user = await getUser()
  if (!user) {
    window.location.href = '/src/pages/login.html'
    return null
  }
  const owner = recipe.user_id === user.id
  const admin = owner ? false : await isAdmin()
  if (!owner && !admin) {
    showError('You are not allowed to edit this recipe.')
    return null
  }
  return user
}

async function handleSubmit(e, { recipeId, existingImageUrl, ownerId }) {
  e.preventDefault()
  const form = e.target
  if (!form.checkValidity()) {
    e.stopPropagation()
    form.classList.add('was-validated')
    return
  }

  const submitBtn = document.getElementById('submitBtn')
  const loadingSpinner = document.getElementById('loadingSpinner')

  try {
    submitBtn.disabled = true
    form.classList.add('d-none')
    loadingSpinner.classList.remove('d-none')

    const data = collectRecipeFormData(form)
    if (data.ingredients.length === 0) throw new Error('Please add at least one ingredient.')
    if (data.steps.length === 0) throw new Error('Please add at least one instruction step.')

    let imageUrl = existingImageUrl
    if (data.imageFile && data.imageFile.size > 0) {
      // Upload the new image under the recipe owner's folder so RLS keeps
      // matching the owning user, then remove the previous file.
      imageUrl = await uploadRecipeImage(data.imageFile, ownerId)
      if (existingImageUrl) {
        await deleteRecipeImage(existingImageUrl)
      }
    }

    await updateRecipe(
      recipeId,
      {
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        timeMinutes: data.timeMinutes,
        servings: data.servings,
        imageUrl,
        isPrivate: data.isPrivate,
      },
      data.ingredients,
      data.steps
    )

    storeToast('Recipe updated successfully!', 'success')
    window.location.href = `/src/pages/recipe-detail.html?id=${recipeId}`
  } catch (error) {
    console.error('Failed to update recipe:', error)
    showToast(error.message || 'Failed to update recipe.', 'danger')
    submitBtn.disabled = false
    form.classList.remove('d-none')
    loadingSpinner.classList.add('d-none')
  }
}

async function init() {
  await initNavbar()

  const params = new URLSearchParams(window.location.search)
  const recipeId = params.get('id')
  if (!recipeId) {
    showNotFound()
    return
  }

  let details
  try {
    details = await getRecipeWithDetails(recipeId)
  } catch (err) {
    console.error(err)
    // PGRST116 = PostgREST "no rows found" for .single() — an invalid or
    // deleted recipe id, distinct from a real fetch failure.
    if (err?.code === 'PGRST116') {
      showNotFound()
    } else {
      showError('Failed to load recipe.')
    }
    return
  }

  const { recipe, ingredients, steps } = details
  const user = await ensureAuthorised(recipe)
  if (!user) return

  document.getElementById('initialLoader').classList.add('d-none')
  document.getElementById('formCard').classList.remove('d-none')
  document.getElementById('cancelLink').href = `/src/pages/recipe-detail.html?id=${recipeId}`

  const form = document.getElementById('editRecipeForm')
  prefillScalarFields(form, recipe)

  await loadCategories(document.getElementById('category'), recipe.category_id)

  setupImagePreview(
    document.getElementById('image'),
    document.getElementById('imagePreview'),
    recipe.image_url
  )
  setupDynamicIngredients(
    document.getElementById('ingredientsList'),
    document.getElementById('addIngredientBtn'),
    ingredients
  )
  setupDynamicSteps(
    document.getElementById('stepsList'),
    document.getElementById('addStepBtn'),
    steps
  )
  refreshRemoveButtons()

  form.addEventListener('submit', (e) =>
    handleSubmit(e, {
      recipeId,
      existingImageUrl: recipe.image_url,
      ownerId: recipe.user_id,
    })
  )
}

init()

import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { initNavbar } from '../components/navbar.js'
import { initBackToTop } from '../components/back-to-top.js'
import { getUser } from '../services/auth.js'
import { uploadRecipeImage } from '../services/storage.js'
import { createRecipe } from '../services/recipes.js'
import { showToast, storeToast } from '../js/toast.js'
import {
  loadCategories,
  setupImagePreview,
  setupDynamicIngredients,
  setupDynamicSteps,
  refreshRemoveButtons,
  collectRecipeFormData,
  reportFirstInvalidField,
} from '../js/recipeForm.js'

async function checkAuth() {
  const user = await getUser()
  if (!user) {
    window.location.href = '/src/pages/login.html'
  }
  return user
}

async function handleSubmit(e) {
  e.preventDefault()

  const form = e.target
  if (!form.checkValidity()) {
    e.stopPropagation()
    form.classList.add('was-validated')
    reportFirstInvalidField(form)
    return
  }

  const user = await getUser()
  if (!user) {
    storeToast('You must be logged in to add a recipe.', 'warning')
    window.location.href = '/src/pages/login.html'
    return
  }

  const submitBtn = document.getElementById('submitBtn')
  const loadingSpinner = document.getElementById('loadingSpinner')
  const formContainer = document.getElementById('addRecipeForm')

  try {
    submitBtn.disabled = true
    formContainer.classList.add('d-none')
    loadingSpinner.classList.remove('d-none')

    const data = collectRecipeFormData(form)

    if (data.ingredients.length === 0) {
      throw new Error('Please add at least one ingredient.')
    }
    if (data.steps.length === 0) {
      throw new Error('Please add at least one instruction step.')
    }

    let imageUrl = null
    if (data.imageFile && data.imageFile.size > 0) {
      imageUrl = await uploadRecipeImage(data.imageFile, user.id)
    }

    const recipeData = {
      title: data.title,
      description: data.description,
      categoryId: data.categoryId,
      timeMinutes: data.timeMinutes,
      servings: data.servings,
      imageUrl,
      isPrivate: data.isPrivate,
      authorId: user.id,
    }

    const recipe = await createRecipe(recipeData, data.ingredients, data.steps)
    storeToast('Recipe added successfully!', 'success')
    window.location.href = `/src/pages/recipe-detail.html?id=${recipe.id}`
  } catch (error) {
    console.error('Failed to save recipe:', error)
    showToast(error.message || 'Failed to save recipe. Please try again.', 'danger')
    submitBtn.disabled = false
    formContainer.classList.remove('d-none')
    loadingSpinner.classList.add('d-none')
  }
}

async function init() {
  await initNavbar()
  initBackToTop()
  await checkAuth()

  await loadCategories(document.getElementById('category'))
  setupImagePreview(
    document.getElementById('image'),
    document.getElementById('imagePreview')
  )
  setupDynamicIngredients(
    document.getElementById('ingredientsList'),
    document.getElementById('addIngredientBtn')
  )
  setupDynamicSteps(
    document.getElementById('stepsList'),
    document.getElementById('addStepBtn')
  )
  refreshRemoveButtons()

  document
    .getElementById('addRecipeForm')
    .addEventListener('submit', handleSubmit)
}

init()

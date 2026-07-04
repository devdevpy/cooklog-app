import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '../css/style.css'
import { initNavbar } from '../components/navbar.js'
import { getUser } from '../services/auth.js'
import { supabase } from '../js/supabaseClient.js'
import { uploadRecipeImage } from '../services/storage.js'
import { createRecipe } from '../services/recipes.js'

let ingredientCount = 1
let stepCount = 1

async function checkAuth() {
  const user = await getUser()
  if (!user) {
    window.location.href = '/src/pages/login.html'
  }
  return user
}

async function loadCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')

  if (error) {
    console.error('Failed to load categories:', error)
    return
  }

  const categorySelect = document.getElementById('category')
  data.forEach((cat) => {
    const option = document.createElement('option')
    option.value = cat.id
    option.textContent = cat.name
    categorySelect.appendChild(option)
  })
}

function setupImagePreview() {
  const imageInput = document.getElementById('image')
  const previewContainer = document.getElementById('imagePreview')

  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        previewContainer.innerHTML = `
          <img src="${event.target.result}" alt="Preview" class="img-thumbnail" style="max-width: 300px; max-height: 300px;">
        `
      }
      reader.readAsDataURL(file)
    } else {
      previewContainer.innerHTML = ''
    }
  })
}

function setupDynamicIngredients() {
  const addBtn = document.getElementById('addIngredientBtn')
  const container = document.getElementById('ingredientsList')

  addBtn.addEventListener('click', () => {
    ingredientCount++
    const row = document.createElement('div')
    row.className = 'ingredient-row mb-2'
    row.innerHTML = `
      <div class="row g-2">
        <div class="col-md-5">
          <input
            type="text"
            class="form-control form-control-sm"
            placeholder="Ingredient name"
            name="ingredientName[]"
            required
          />
        </div>
        <div class="col-md-3">
          <input
            type="text"
            class="form-control form-control-sm"
            placeholder="Amount"
            name="ingredientAmount[]"
            required
          />
        </div>
        <div class="col-md-3">
          <select class="form-select form-select-sm" name="ingredientUnit[]" required>
            <option value="">Unit</option>
            <option value="g">g</option>
            <option value="kg">kg</option>
            <option value="ml">ml</option>
            <option value="l">l</option>
            <option value="tsp">tsp</option>
            <option value="tbsp">tbsp</option>
            <option value="cup">cup</option>
            <option value="pcs">pcs</option>
          </select>
        </div>
        <div class="col-md-1">
          <button type="button" class="btn btn-sm btn-outline-danger w-100 remove-ingredient">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    `
    container.appendChild(row)
    updateRemoveButtons()
  })

  container.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.remove-ingredient')
    if (removeBtn) {
      removeBtn.closest('.ingredient-row').remove()
      ingredientCount--
      updateRemoveButtons()
    }
  })
}

function setupDynamicSteps() {
  const addBtn = document.getElementById('addStepBtn')
  const container = document.getElementById('stepsList')

  addBtn.addEventListener('click', () => {
    stepCount++
    const row = document.createElement('div')
    row.className = 'step-row mb-3'
    row.innerHTML = `
      <div class="d-flex gap-2">
        <div class="flex-shrink-0">
          <span class="badge bg-primary rounded-circle step-number" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">${stepCount}</span>
        </div>
        <div class="flex-grow-1">
          <textarea
            class="form-control form-control-sm"
            rows="2"
            placeholder="Describe this step..."
            name="stepInstruction[]"
            required
          ></textarea>
        </div>
        <div class="flex-shrink-0">
          <button type="button" class="btn btn-sm btn-outline-danger remove-step">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    `
    container.appendChild(row)
    updateStepNumbers()
    updateRemoveButtons()
  })

  container.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.remove-step')
    if (removeBtn) {
      removeBtn.closest('.step-row').remove()
      stepCount--
      updateStepNumbers()
      updateRemoveButtons()
    }
  })
}

function updateStepNumbers() {
  const stepRows = document.querySelectorAll('.step-row')
  stepRows.forEach((row, index) => {
    const numberBadge = row.querySelector('.step-number')
    if (numberBadge) {
      numberBadge.textContent = index + 1
    }
  })
}

function updateRemoveButtons() {
  const ingredientRows = document.querySelectorAll('.ingredient-row')
  ingredientRows.forEach((row, index) => {
    const removeBtn = row.querySelector('.remove-ingredient')
    if (removeBtn) {
      removeBtn.disabled = ingredientRows.length === 1
    }
  })

  const stepRows = document.querySelectorAll('.step-row')
  stepRows.forEach((row, index) => {
    const removeBtn = row.querySelector('.remove-step')
    if (removeBtn) {
      removeBtn.disabled = stepRows.length === 1
    }
  })
}

function collectFormData() {
  const form = document.getElementById('addRecipeForm')
  const formData = new FormData(form)

  const ingredients = []
  const names = formData.getAll('ingredientName[]')
  const amounts = formData.getAll('ingredientAmount[]')
  const units = formData.getAll('ingredientUnit[]')

  for (let i = 0; i < names.length; i++) {
    if (names[i].trim() && amounts[i].trim() && units[i]) {
      ingredients.push({
        name: names[i].trim(),
        amount: amounts[i].trim(),
        unit: units[i],
      })
    }
  }

  const steps = []
  const instructions = formData.getAll('stepInstruction[]')
  instructions.forEach((instruction, index) => {
    if (instruction.trim()) {
      steps.push({
        step_number: index + 1,
        instruction: instruction.trim(),
      })
    }
  })

  return {
    title: formData.get('title').trim(),
    description: formData.get('description').trim(),
    categoryId: formData.get('category'),
    timeMinutes: parseInt(formData.get('timeMinutes'), 10),
    servings: parseInt(formData.get('servings'), 10),
    imageFile: formData.get('image'),
    ingredients,
    steps,
  }
}

async function handleSubmit(e) {
  e.preventDefault()

  const form = e.target
  if (!form.checkValidity()) {
    e.stopPropagation()
    form.classList.add('was-validated')
    return
  }

  const user = await getUser()
  if (!user) {
    alert('You must be logged in to add a recipe.')
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

    const data = collectFormData()

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
      authorId: user.id,
    }

    const recipe = await createRecipe(recipeData, data.ingredients, data.steps)

    window.location.href = `/src/pages/recipe-detail.html?id=${recipe.id}`
  } catch (error) {
    console.error('Failed to save recipe:', error)
    alert(`Error: ${error.message || 'Failed to save recipe. Please try again.'}`)
    submitBtn.disabled = false
    formContainer.classList.remove('d-none')
    loadingSpinner.classList.add('d-none')
  }
}

async function init() {
  await initNavbar()
  const user = await checkAuth()
  await loadCategories()
  setupImagePreview()
  setupDynamicIngredients()
  setupDynamicSteps()
  updateRemoveButtons()

  const form = document.getElementById('addRecipeForm')
  form.addEventListener('submit', handleSubmit)
}

init()

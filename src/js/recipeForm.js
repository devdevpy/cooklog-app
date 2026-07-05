// Shared UI helpers for the add-recipe and edit-recipe forms.
// Keeps DOM wiring in one place so both pages behave identically.

import { supabase } from './supabaseClient.js'

const UNIT_OPTIONS = ['g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'pcs']

function escapeAttr(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Load categories from Supabase into a <select> element.
 * Optionally pre-selects `currentId`.
 */
export async function loadCategories(selectEl, currentId = null) {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')

  if (error) {
    console.error('Failed to load categories:', error)
    return
  }

  data.forEach((cat) => {
    const option = document.createElement('option')
    option.value = cat.id
    option.textContent = cat.name
    if (currentId && cat.id === currentId) option.selected = true
    selectEl.appendChild(option)
  })
}

/**
 * Wire the file input to render a live preview + optional existing image.
 */
export function setupImagePreview(imageInput, previewContainer, existingUrl = null) {
  if (existingUrl) {
    previewContainer.innerHTML = `
      <img src="${escapeAttr(existingUrl)}" alt="Current image" class="img-thumbnail" style="max-width: 300px; max-height: 300px;">
      <p class="form-text mb-0">Current image. Choose a new file to replace it.</p>
    `
  }

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
    } else if (existingUrl) {
      previewContainer.innerHTML = `
        <img src="${escapeAttr(existingUrl)}" alt="Current image" class="img-thumbnail" style="max-width: 300px; max-height: 300px;">
        <p class="form-text mb-0">Current image. Choose a new file to replace it.</p>
      `
    } else {
      previewContainer.innerHTML = ''
    }
  })
}

function ingredientRowHtml({ name = '', amount = '', unit = '' } = {}) {
  const options = UNIT_OPTIONS.map(
    (u) => `<option value="${u}"${u === unit ? ' selected' : ''}>${u}</option>`
  ).join('')
  return `
    <div class="row g-2">
      <div class="col-md-5">
        <input type="text" class="form-control form-control-sm"
          placeholder="Ingredient name" name="ingredientName[]"
          value="${escapeAttr(name)}" required />
      </div>
      <div class="col-md-3">
        <input type="text" class="form-control form-control-sm"
          placeholder="Amount" name="ingredientAmount[]"
          value="${escapeAttr(amount)}" required />
      </div>
      <div class="col-md-3">
        <select class="form-select form-select-sm" name="ingredientUnit[]" required>
          <option value="">Unit</option>
          ${options}
        </select>
      </div>
      <div class="col-md-1">
        <button type="button" class="btn btn-sm btn-outline-danger w-100 remove-ingredient">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </div>
  `
}

function stepRowHtml({ description = '' } = {}) {
  return `
    <div class="d-flex gap-2">
      <div class="flex-shrink-0">
        <span class="badge bg-primary rounded-circle step-number"
          style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">1</span>
      </div>
      <div class="flex-grow-1">
        <textarea class="form-control form-control-sm" rows="2"
          placeholder="Describe this step..." name="stepInstruction[]" required>${escapeAttr(description)}</textarea>
      </div>
      <div class="flex-shrink-0">
        <button type="button" class="btn btn-sm btn-outline-danger remove-step">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </div>
  `
}

function appendIngredientRow(container, data) {
  const row = document.createElement('div')
  row.className = 'ingredient-row mb-2'
  row.innerHTML = ingredientRowHtml(data)
  container.appendChild(row)
}

function appendStepRow(container, data) {
  const row = document.createElement('div')
  row.className = 'step-row mb-3'
  row.innerHTML = stepRowHtml(data)
  container.appendChild(row)
}

function updateStepNumbers() {
  document.querySelectorAll('.step-row').forEach((row, index) => {
    const badge = row.querySelector('.step-number')
    if (badge) badge.textContent = index + 1
  })
}

function updateRemoveButtons() {
  const ingredientRows = document.querySelectorAll('.ingredient-row')
  ingredientRows.forEach((row) => {
    const btn = row.querySelector('.remove-ingredient')
    if (btn) btn.disabled = ingredientRows.length === 1
  })

  const stepRows = document.querySelectorAll('.step-row')
  stepRows.forEach((row) => {
    const btn = row.querySelector('.remove-step')
    if (btn) btn.disabled = stepRows.length === 1
  })
}

/**
 * Wire ingredient list (add / remove) behaviour.
 * If `initial` is provided, existing rows are cleared and replaced.
 */
export function setupDynamicIngredients(container, addBtn, initial = null) {
  if (initial && initial.length > 0) {
    container.innerHTML = ''
    initial.forEach((item) => appendIngredientRow(container, item))
  }

  addBtn.addEventListener('click', () => {
    appendIngredientRow(container)
    updateRemoveButtons()
  })

  container.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.remove-ingredient')
    if (removeBtn) {
      removeBtn.closest('.ingredient-row').remove()
      updateRemoveButtons()
    }
  })
}

/**
 * Wire step list (add / remove / auto-number) behaviour.
 */
export function setupDynamicSteps(container, addBtn, initial = null) {
  if (initial && initial.length > 0) {
    container.innerHTML = ''
    initial.forEach((item) => appendStepRow(container, item))
    updateStepNumbers()
  }

  addBtn.addEventListener('click', () => {
    appendStepRow(container)
    updateStepNumbers()
    updateRemoveButtons()
  })

  container.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.remove-step')
    if (removeBtn) {
      removeBtn.closest('.step-row').remove()
      updateStepNumbers()
      updateRemoveButtons()
    }
  })
}

/**
 * Refresh the disabled state of remove buttons. Call after initial render.
 */
export function refreshRemoveButtons() {
  updateRemoveButtons()
}

/**
 * Collect the current recipe form data into a plain object.
 * Ingredients and steps are trimmed and filtered so empty rows are ignored.
 */
export function collectRecipeFormData(form) {
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
  formData.getAll('stepInstruction[]').forEach((instruction, index) => {
    if (instruction.trim()) {
      steps.push({
        step_number: index + 1,
        description: instruction.trim(),
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
    isPrivate: formData.get('isPrivate') === 'on',
    ingredients,
    steps,
  }
}

/**
 * Pre-fill scalar fields (title, description, time, servings). Category is set
 * during `loadCategories`; ingredients / steps are pre-populated by their
 * respective `setup*` calls.
 */
export function prefillScalarFields(form, recipe) {
  form.querySelector('#title').value = recipe.title ?? ''
  form.querySelector('#description').value = recipe.description ?? ''
  form.querySelector('#timeMinutes').value = recipe.prep_time ?? ''
  form.querySelector('#servings').value = recipe.servings ?? ''
  const isPrivateEl = form.querySelector('#isPrivate')
  if (isPrivateEl) isPrivateEl.checked = Boolean(recipe.is_private)
}

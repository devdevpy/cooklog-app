// Shared HTML5 form-validation feedback — used by every form in the app
// that relies on `checkValidity()` + Bootstrap's `was-validated` styling
// (recipe forms, register, login, add/edit category, change name/password).

import { showToast } from './toast.js'

// Fields with no matching <label for> (repeated array-named inputs, or a
// compact inline field with no visible label) fall back to this map.
const FIELD_LABEL_OVERRIDES = {
  'ingredientName[]': 'Ingredient name',
  'ingredientAmount[]': 'Ingredient amount',
  'stepInstruction[]': 'Instruction step',
  fullName: 'Full name',
}

function friendlyFieldLabel(field, form) {
  if (field.id) {
    const label = form.querySelector(`label[for="${field.id}"]`)
    if (label) return label.textContent.replace('*', '').trim()
  }

  const baseName = FIELD_LABEL_OVERRIDES[field.name]
  if (baseName) {
    const sameName = Array.from(form.querySelectorAll(`[name="${field.name}"]`))
    const index = sameName.indexOf(field)
    return sameName.length > 1 ? `${baseName} (row ${index + 1})` : baseName
  }

  return field.placeholder || field.name || 'This field'
}

/**
 * Finds the first invalid field in `form` (document order matches the
 * visual top-to-bottom order), scrolls/focuses it, and names it in a toast.
 * Covers both empty required fields and custom validity (e.g. a
 * `setCustomValidity()` password-mismatch check) — anything `:invalid`.
 * A red border alone is easy to miss, especially when the submit button
 * and the actual problem field are far apart (e.g. a long form) or the
 * field is inside a modal/collapsed section.
 */
export function reportFirstInvalidField(form) {
  const invalidField = form.querySelector(':invalid')
  if (!invalidField) return

  const label = friendlyFieldLabel(invalidField, form)
  showToast(`Please fill in **${label}** before saving.`, 'warning')

  invalidField.scrollIntoView({ behavior: 'smooth', block: 'center' })
  invalidField.focus({ preventScroll: true })
}

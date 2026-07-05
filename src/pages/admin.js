import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { Modal } from 'bootstrap'
import '../css/style.css'
import { initNavbar } from '../components/navbar.js'
import { getUser, isAdmin } from '../services/auth.js'
import { getUsersWithRoles, setUserRole, getAdminStats } from '../services/admin.js'
import { showToast, storeToast } from '../js/toast.js'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  countRecipesInCategory,
} from '../js/categories.js'

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Only logged-in admins may reach this page. Anonymous visitors go to
 * login (matching the pattern used elsewhere); logged-in non-admins are
 * bounced home with a toast shown via `storeToast` (read on the home
 * page's next load since we're navigating away here).
 */
async function guardAccess() {
  const user = await getUser()
  if (!user) {
    window.location.href = '/src/pages/login.html'
    return null
  }
  const admin = await isAdmin(user.id)
  if (!admin) {
    storeToast('You do not have access to the admin panel.', 'warning')
    window.location.href = '/'
    return null
  }
  return user
}

async function loadStats() {
  try {
    const stats = await getAdminStats()
    document.getElementById('statRecipes').textContent = stats.recipes
    document.getElementById('statUsers').textContent = stats.users
    document.getElementById('statCategories').textContent = stats.categories
  } catch (err) {
    console.error('Failed to load stats:', err)
  }
}

// --- Categories -----------------------------------------------------------

function categoryRowHtml(cat) {
  return `
    <tr>
      <td>${escapeHtml(cat.name)}</td>
      <td class="text-end">
        <button type="button" class="btn btn-sm btn-outline-primary me-1 edit-category-btn"
          data-id="${cat.id}" data-name="${escapeHtml(cat.name)}">
          <i class="bi bi-pencil"></i>
        </button>
        <button type="button" class="btn btn-sm btn-outline-danger delete-category-btn"
          data-id="${cat.id}" data-name="${escapeHtml(cat.name)}">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>`
}

async function loadCategoriesTable() {
  const tbody = document.getElementById('categoriesTableBody')
  tbody.innerHTML = `<tr><td colspan="2" class="text-center text-secondary py-4">
    <span class="spinner-border spinner-border-sm me-2"></span>Loading...</td></tr>`
  try {
    const categories = await getCategories()
    tbody.innerHTML = categories.length
      ? categories.map(categoryRowHtml).join('')
      : `<tr><td colspan="2" class="text-center text-secondary py-4">No categories yet.</td></tr>`
  } catch (err) {
    console.error('Failed to load categories:', err)
    tbody.innerHTML = `<tr><td colspan="2" class="text-danger py-4">Failed to load categories.</td></tr>`
  }
}

const categoryModalEl = document.getElementById('categoryModal')
const categoryModal = Modal.getOrCreateInstance(categoryModalEl)
const categoryForm = document.getElementById('categoryForm')
const categoryIdInput = document.getElementById('categoryId')
const categoryNameInput = document.getElementById('categoryName')
const categoryModalTitle = document.getElementById('categoryModalLabel')
const categorySaveBtn = document.getElementById('categorySaveBtn')

function openAddCategoryModal() {
  categoryForm.reset()
  categoryForm.classList.remove('was-validated')
  categoryIdInput.value = ''
  categoryModalTitle.innerHTML = '<i class="bi bi-tags me-2"></i>Add Category'
  categorySaveBtn.innerHTML = '<i class="bi bi-plus-circle me-1"></i> Add Category'
  categoryModal.show()
}

function openEditCategoryModal(id, name) {
  categoryForm.reset()
  categoryForm.classList.remove('was-validated')
  categoryIdInput.value = id
  categoryNameInput.value = name
  categoryModalTitle.innerHTML = '<i class="bi bi-tags me-2"></i>Edit Category'
  categorySaveBtn.innerHTML = '<i class="bi bi-check-circle me-1"></i> Save Changes'
  categoryModal.show()
}

categoryForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  if (!categoryForm.checkValidity()) {
    categoryForm.classList.add('was-validated')
    return
  }

  const id = categoryIdInput.value
  const name = categoryNameInput.value.trim()

  categorySaveBtn.disabled = true
  try {
    if (id) {
      await updateCategory(id, name)
      showToast(`Category "${name}" updated.`, 'success')
    } else {
      await createCategory(name)
      showToast(`Category "${name}" added.`, 'success')
    }
    categoryModal.hide()
    await loadCategoriesTable()
  } catch (err) {
    console.error('Failed to save category:', err)
    const message =
      err?.code === '23505'
        ? 'A category with this name already exists.'
        : err?.message || 'Failed to save category.'
    showToast(message, 'danger')
  } finally {
    categorySaveBtn.disabled = false
  }
})

const deleteCategoryModalEl = document.getElementById('deleteCategoryModal')
const deleteCategoryModal = Modal.getOrCreateInstance(deleteCategoryModalEl)
const deleteCategoryBody = document.getElementById('deleteCategoryBody')
const deleteCategoryFooter = document.getElementById('deleteCategoryFooter')

async function openDeleteCategoryModal(id, name) {
  deleteCategoryBody.innerHTML = `<div class="text-center py-3"><span class="spinner-border spinner-border-sm"></span></div>`
  deleteCategoryFooter.innerHTML = ''
  deleteCategoryModal.show()

  let usageCount
  try {
    usageCount = await countRecipesInCategory(id)
  } catch (err) {
    console.error('Failed to check category usage:', err)
    deleteCategoryBody.innerHTML = `<p class="text-danger mb-0">Failed to check whether this category is in use.</p>`
    deleteCategoryFooter.innerHTML = `<button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>`
    return
  }

  if (usageCount > 0) {
    deleteCategoryBody.innerHTML = `
      <p class="mb-0">
        <i class="bi bi-exclamation-triangle text-warning me-2"></i>
        "<strong>${escapeHtml(name)}</strong>" is used by ${usageCount} recipe${usageCount === 1 ? '' : 's'}
        and can't be deleted. Reassign or delete ${usageCount === 1 ? 'that recipe' : 'those recipes'} first.
      </p>`
    deleteCategoryFooter.innerHTML = `<button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>`
    return
  }

  deleteCategoryBody.innerHTML = `
    <p class="mb-0">Are you sure you want to delete "<strong>${escapeHtml(name)}</strong>"? This action cannot be undone.</p>`
  deleteCategoryFooter.innerHTML = `
    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
    <button type="button" class="btn btn-danger" id="confirmDeleteCategoryBtn"><i class="bi bi-trash me-1"></i> Delete</button>`

  document.getElementById('confirmDeleteCategoryBtn').addEventListener('click', async (e) => {
    const btn = e.currentTarget
    btn.disabled = true
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Deleting...`
    try {
      await deleteCategory(id)
      deleteCategoryModal.hide()
      showToast(`Category "${name}" deleted.`, 'success')
      await loadCategoriesTable()
    } catch (err) {
      console.error('Failed to delete category:', err)
      btn.disabled = false
      btn.innerHTML = `<i class="bi bi-trash me-1"></i> Delete`
      showToast(err?.message || 'Failed to delete category.', 'danger')
    }
  })
}

document.getElementById('addCategoryBtn').addEventListener('click', openAddCategoryModal)

document.getElementById('categoriesTableBody').addEventListener('click', (e) => {
  const editBtn = e.target.closest('.edit-category-btn')
  if (editBtn) {
    openEditCategoryModal(editBtn.dataset.id, editBtn.dataset.name)
    return
  }
  const deleteBtn = e.target.closest('.delete-category-btn')
  if (deleteBtn) {
    openDeleteCategoryModal(deleteBtn.dataset.id, deleteBtn.dataset.name)
  }
})

// --- Users -----------------------------------------------------------------

let currentAdminId = null

function userRowHtml(u) {
  const isSelf = u.id === currentAdminId
  const isAdminRole = u.role === 'admin'
  return `
    <tr>
      <td>
        ${escapeHtml(u.fullName || 'Unnamed user')}
        ${isSelf ? '<span class="badge bg-secondary-subtle text-secondary ms-1">You</span>' : ''}
      </td>
      <td>${formatDate(u.createdAt)}</td>
      <td><span class="badge ${isAdminRole ? 'bg-primary' : 'bg-secondary-subtle text-secondary'}">${u.role}</span></td>
      <td class="text-end">
        <button type="button"
          class="btn btn-sm ${isAdminRole ? 'btn-outline-danger' : 'btn-outline-primary'} toggle-role-btn d-inline-flex align-items-center gap-1"
          data-id="${u.id}" data-role="${u.role}"
          ${isSelf ? 'disabled title="You can\'t change your own role"' : ''}>
          <i class="bi ${isAdminRole ? 'bi-shield-slash' : 'bi-shield-check'}"></i>
          ${isAdminRole ? 'Revoke admin' : 'Make admin'}
        </button>
      </td>
    </tr>`
}

async function loadUsersTable() {
  const tbody = document.getElementById('usersTableBody')
  tbody.innerHTML = `<tr><td colspan="4" class="text-center text-secondary py-4">
    <span class="spinner-border spinner-border-sm me-2"></span>Loading...</td></tr>`
  try {
    const users = await getUsersWithRoles()
    tbody.innerHTML = users.length
      ? users.map(userRowHtml).join('')
      : `<tr><td colspan="4" class="text-center text-secondary py-4">No users yet.</td></tr>`
  } catch (err) {
    console.error('Failed to load users:', err)
    tbody.innerHTML = `<tr><td colspan="4" class="text-danger py-4">Failed to load users.</td></tr>`
  }
}

document.getElementById('usersTableBody').addEventListener('click', async (e) => {
  const btn = e.target.closest('.toggle-role-btn')
  if (!btn) return

  const userId = btn.dataset.id
  const nextRole = btn.dataset.role === 'admin' ? 'user' : 'admin'

  btn.disabled = true
  const originalHtml = btn.innerHTML
  btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`
  try {
    await setUserRole(userId, nextRole)
    showToast(`Role updated to "${nextRole}".`, 'success')
    await loadUsersTable()
  } catch (err) {
    console.error('Failed to update role:', err)
    btn.disabled = false
    btn.innerHTML = originalHtml
    showToast(err?.message || 'Failed to update role.', 'danger')
  }
})

async function init() {
  await initNavbar()

  const user = await guardAccess()
  if (!user) return
  currentAdminId = user.id

  document.getElementById('accessLoader').classList.add('d-none')
  document.getElementById('adminContent').classList.remove('d-none')

  await Promise.all([loadStats(), loadCategoriesTable(), loadUsersTable()])
}

init()

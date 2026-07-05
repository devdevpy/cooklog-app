// Shared toast notification helper — replaces plain alert() calls with
// Bootstrap toasts so success/error feedback looks consistent everywhere.

import { Toast } from 'bootstrap'

const STORAGE_KEY = 'cooklog:toast'

const VARIANTS = {
  success: { icon: 'bi-check-circle-fill', bg: 'text-bg-success' },
  danger: { icon: 'bi-exclamation-triangle-fill', bg: 'text-bg-danger' },
  warning: { icon: 'bi-exclamation-circle-fill', bg: 'text-bg-warning' },
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function getContainer() {
  let container = document.getElementById('toastContainer')
  if (!container) {
    container = document.createElement('div')
    container.id = 'toastContainer'
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3'
    container.style.zIndex = '1080'
    document.body.appendChild(container)
  }
  return container
}

/**
 * Show a Bootstrap toast immediately.
 * @param {string} message
 * @param {'success'|'danger'|'warning'} [type='success']
 */
export function showToast(message, type = 'success') {
  const variant = VARIANTS[type] ?? VARIANTS.success
  const container = getContainer()

  const toastEl = document.createElement('div')
  toastEl.className = `toast align-items-center ${variant.bg} border-0`
  toastEl.setAttribute('role', 'alert')
  toastEl.setAttribute('aria-live', 'assertive')
  toastEl.setAttribute('aria-atomic', 'true')
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body d-flex align-items-center gap-2">
        <i class="bi ${variant.icon}"></i>
        <span>${escapeHtml(message)}</span>
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>`

  container.appendChild(toastEl)
  const toast = new Toast(toastEl, { delay: 5000 })
  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove())
  toast.show()
}

/**
 * Persist a toast message so it survives a redirect (e.g. after create/
 * update/delete actions that navigate to another page). Call
 * `consumeStoredToast()` on the next page's load to display it.
 */
export function storeToast(message, type = 'success') {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ message, type }))
}

/**
 * Show and clear any toast stored via `storeToast` on the previous page.
 */
export function consumeStoredToast() {
  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return
  sessionStorage.removeItem(STORAGE_KEY)
  try {
    const { message, type } = JSON.parse(raw)
    if (message) showToast(message, type)
  } catch {
    // Ignore malformed stored payloads.
  }
}

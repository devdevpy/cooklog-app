import { supabase } from '../js/supabaseClient.js'

/**
 * Register a new user with email + password.
 * The `full_name` is passed as user metadata so the `handle_new_user`
 * database trigger can populate the `profiles` row automatically.
 * As a fallback (in case the trigger is missing), we upsert the profile
 * client-side when a session is available.
 */
export async function signUp({ email, password, fullName }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  })

  if (error) throw error

  // Fallback client-side profile insert (only works when a session exists,
  // e.g. when email confirmation is disabled). Safe to ignore otherwise.
  if (data.user && data.session) {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ id: data.user.id, full_name: fullName }, { onConflict: 'id' })

    if (profileError) throw profileError
  }

  return data
}

/**
 * Sign in an existing user with email + password. Rejects (and signs back
 * out) restricted or deleted accounts — see `getAccountStatus`.
 */
export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error

  const status = await getAccountStatus(data.user.id)
  if (status.restricted || status.deleted) {
    await supabase.auth.signOut()
    throw new Error(accountStatusMessage(status))
  }

  return data
}

/**
 * Change the current user's password. Re-verifies `currentPassword` with a
 * fresh sign-in before applying `newPassword`, so an unlocked/left-open
 * session can't have its password swapped without re-proving identity.
 */
export async function changePassword(email, currentPassword, newPassword) {
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  })
  if (verifyError) throw new Error('Current password is incorrect.')

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
  if (updateError) throw updateError
}

/**
 * Sign the current user out.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * Get the currently authenticated user (or null).
 */
export async function getUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * Check whether a user has the `admin` role, per the `user_roles` table.
 * Defaults to the currently authenticated user when `userId` is omitted.
 * Returns false when there is no session/id or when the row is missing.
 */
export async function isAdmin(userId) {
  const id = userId ?? (await getUser())?.id
  if (!id) return false

  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', id)
    .maybeSingle()

  if (error) {
    console.error('Failed to load user role:', error)
    return false
  }
  return data?.role === 'admin'
}

/**
 * Check whether a user is temporarily restricted or soft-deleted, per the
 * admin panel's "Restrict"/"Delete" actions (see services/admin.js).
 * `restricted` only reflects `restricted_until` while it's in the future.
 */
export async function getAccountStatus(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('restricted_until, deleted_at')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('Failed to load account status:', error)
    return { restricted: false, deleted: false, restrictedUntil: null }
  }

  const restrictedUntil = data?.restricted_until ?? null
  return {
    restricted: Boolean(restrictedUntil) && new Date(restrictedUntil) > new Date(),
    deleted: Boolean(data?.deleted_at),
    restrictedUntil,
  }
}

/**
 * User-facing message for a blocked (restricted/deleted) account status.
 */
export function accountStatusMessage(status) {
  if (status.deleted) return 'This account has been deleted.'
  return `This account is restricted until ${new Date(status.restrictedUntil).toLocaleDateString()}.`
}

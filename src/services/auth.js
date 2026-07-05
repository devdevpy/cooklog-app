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
 * Sign in an existing user with email + password.
 */
export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
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

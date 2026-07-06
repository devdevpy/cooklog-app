import { supabase } from '../js/supabaseClient.js'

/**
 * Fetch a single profile row (full name + avatar) by user id.
 * RLS ("Users can view own profile") restricts this to the profile owner.
 */
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, created_at')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

/**
 * Persist a newly uploaded avatar's public URL onto the profile row.
 * RLS ("Users can update own profile") restricts this to the owner.
 */
export async function updateAvatarUrl(userId, avatarUrl) {
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId)

  if (error) throw error
}

/**
 * Update the current user's display name in both places it's read from:
 * `profiles.full_name` (recipe author attribution, admin user list) and
 * the auth user's metadata (navbar.js reads `user.user_metadata.full_name`,
 * not the profiles table). Updating auth metadata fires a `USER_UPDATED`
 * event that the navbar's `onAuthStateChange` listener already handles, so
 * the navbar refreshes on its own.
 */
export async function updateFullName(userId, fullName) {
  const { error: authError } = await supabase.auth.updateUser({ data: { full_name: fullName } })
  if (authError) throw authError

  const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', userId)
  if (error) throw error
}

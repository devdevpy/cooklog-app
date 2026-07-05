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

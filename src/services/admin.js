import { supabase } from '../js/supabaseClient.js'

/**
 * List every profile together with its role from `user_roles`.
 * The two tables aren't linked by a foreign key to each other (both
 * reference `auth.users` independently), so PostgREST can't embed one
 * inside the other — fetch separately and merge by user id.
 */
export async function getUsersWithRoles() {
  const [
    { data: profiles, error: profilesError },
    { data: roles, error: rolesError },
  ] = await Promise.all([
    supabase.from('profiles').select('id, full_name, created_at').order('created_at'),
    supabase.from('user_roles').select('user_id, role'),
  ])

  if (profilesError) throw profilesError
  if (rolesError) throw rolesError

  const roleByUserId = new Map((roles ?? []).map((r) => [r.user_id, r.role]))

  return (profiles ?? []).map((p) => ({
    id: p.id,
    fullName: p.full_name,
    createdAt: p.created_at,
    role: roleByUserId.get(p.id) ?? 'user',
  }))
}

/**
 * Set a user's role in `user_roles`. Upserts so it also works for users
 * whose role row is missing for any reason. RLS restricts this to admins.
 */
export async function setUserRole(userId, role) {
  const { error } = await supabase
    .from('user_roles')
    .upsert({ user_id: userId, role }, { onConflict: 'user_id' })

  if (error) throw error
}

/**
 * Simple site-wide counts for the admin dashboard cards.
 */
export async function getAdminStats() {
  const [
    { count: recipes, error: recipesError },
    { count: users, error: usersError },
    { count: categories, error: categoriesError },
  ] = await Promise.all([
    supabase.from('recipes').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
  ])

  if (recipesError) throw recipesError
  if (usersError) throw usersError
  if (categoriesError) throw categoriesError

  return {
    recipes: recipes ?? 0,
    users: users ?? 0,
    categories: categories ?? 0,
  }
}

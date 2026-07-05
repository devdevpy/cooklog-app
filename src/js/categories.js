import { supabase } from './supabaseClient.js'

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}

/**
 * Create a new category. RLS restricts this to admins.
 */
export async function createCategory(name) {
  const { data, error } = await supabase
    .from('categories')
    .insert({ name })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Rename an existing category. RLS restricts this to admins.
 */
export async function updateCategory(id, name) {
  const { error } = await supabase
    .from('categories')
    .update({ name })
    .eq('id', id)

  if (error) throw error
}

/**
 * Count how many recipes reference a category, so the admin panel can
 * block deletion of categories that are still in use.
 */
export async function countRecipesInCategory(id) {
  const { count, error } = await supabase
    .from('recipes')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', id)

  if (error) throw error
  return count ?? 0
}

/**
 * Delete a category. RLS restricts this to admins. Callers should check
 * `countRecipesInCategory` first — `recipes.category_id` is
 * ON DELETE SET NULL, so the database itself won't block the delete.
 */
export async function deleteCategory(id) {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}

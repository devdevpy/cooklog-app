import { supabase } from '../js/supabaseClient.js'

const RECIPE_SELECT = `
  id,
  title,
  description,
  image_url,
  prep_time,
  cook_time,
  servings,
  created_at,
  category_id,
  categories ( name ),
  author:profiles!recipes_author_fkey ( full_name )
`

/**
 * Fetch recipes, newest first. Optional server-side filters.
 * @param {{ categoryId?: string|null, search?: string }} [opts]
 */
export async function getRecipes({ categoryId = null, search = '' } = {}) {
  let query = supabase
    .from('recipes')
    .select(RECIPE_SELECT)
    .order('created_at', { ascending: false })

  if (categoryId) query = query.eq('category_id', categoryId)
  if (search) query = query.ilike('title', `%${search}%`)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

/**
 * Fetch a single recipe by id (used by the detail page).
 */
export async function getRecipeById(id) {
  const { data, error } = await supabase
    .from('recipes')
    .select(RECIPE_SELECT)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

import { supabase } from '../js/supabaseClient.js'

// Same shape as `RECIPE_SELECT` in recipes.js so favorited recipes can be
// rendered with the exact same `recipeCard` markup used elsewhere.
const RECIPE_FIELDS = `
  id,
  title,
  description,
  image_url,
  prep_time,
  cook_time,
  servings,
  is_private,
  category_id,
  categories ( name ),
  author:profiles!recipes_author_fkey ( full_name )
`

async function requireUserId() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('You must be logged in to manage favorites.')
  return user.id
}

/**
 * Favorite a recipe for the current user.
 */
export async function addFavorite(recipeId) {
  const userId = await requireUserId()

  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, recipe_id: recipeId })

  if (error) throw error
}

/**
 * Un-favorite a recipe for the current user.
 */
export async function removeFavorite(recipeId) {
  const userId = await requireUserId()

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('recipe_id', recipeId)

  if (error) throw error
}

/**
 * Fetch a user's favorited recipes (joined with recipe data), newest
 * favorite first. Returned rows are shaped like `getRecipes()`'s output so
 * they can be rendered with the shared `recipeCard` / `recipesGrid` helpers.
 */
export async function getFavorites(userId) {
  const { data, error } = await supabase
    .from('favorites')
    .select(`recipe_id, created_at, recipes ( ${RECIPE_FIELDS} )`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map((row) => row.recipes).filter(Boolean)
}

/**
 * Whether `recipeId` is already favorited by `userId`.
 */
export async function isFavorite(recipeId, userId) {
  if (!userId) return false

  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('recipe_id', recipeId)
    .maybeSingle()

  if (error) throw error
  return !!data
}

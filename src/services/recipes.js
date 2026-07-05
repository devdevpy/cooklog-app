import { supabase } from '../js/supabaseClient.js'

const RECIPE_SELECT = `
  id,
  user_id,
  title,
  description,
  image_url,
  prep_time,
  cook_time,
  servings,
  is_private,
  created_at,
  category_id,
  categories ( name ),
  author:profiles!recipes_author_fkey ( full_name )
`

/**
 * Fetch recipes, newest first. Optional server-side filters.
 * @param {{ categoryId?: string|null, search?: string }} [opts]
 */
export async function getRecipes({ categoryId = null, search = '', userId = null } = {}) {
  let query = supabase
    .from('recipes')
    .select(RECIPE_SELECT)
    .order('created_at', { ascending: false })

  if (userId) query = query.eq('user_id', userId)
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

/**
 * Create a new recipe with ingredients and steps.
 * @param {Object} recipeData - Recipe information
 * @param {string} recipeData.title
 * @param {string} recipeData.description
 * @param {string} recipeData.categoryId
 * @param {number} recipeData.timeMinutes
 * @param {number} recipeData.servings
 * @param {string} recipeData.imageUrl
 * @param {string} recipeData.authorId
 * @param {Array<{name: string, amount: string, unit: string}>} ingredients
 * @param {Array<{step_number: number, description: string}>} steps
 * @returns {Promise<{id: string}>} The created recipe
 */
export async function createRecipe(recipeData, ingredients, steps) {
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .insert({
      title: recipeData.title,
      description: recipeData.description,
      category_id: recipeData.categoryId,
      prep_time: recipeData.timeMinutes,
      cook_time: 0,
      servings: recipeData.servings,
      image_url: recipeData.imageUrl,
      is_private: recipeData.isPrivate === true,
      user_id: recipeData.authorId,
    })
    .select('id')
    .single()

  if (recipeError) throw recipeError

  if (ingredients && ingredients.length > 0) {
    const ingredientsData = ingredients.map((ing) => ({
      recipe_id: recipe.id,
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
    }))

    const { error: ingredientsError } = await supabase
      .from('ingredients')
      .insert(ingredientsData)

    if (ingredientsError) {
      throw new Error(`Failed to add ingredients: ${ingredientsError.message}`)
    }
  }

  if (steps && steps.length > 0) {
    const stepsData = steps.map((step) => ({
      recipe_id: recipe.id,
      step_number: step.step_number,
      description: step.description,
    }))

    const { error: stepsError } = await supabase
      .from('recipe_steps')
      .insert(stepsData)

    if (stepsError) {
      throw new Error(`Failed to add steps: ${stepsError.message}`)
    }
  }

  return recipe
}

/**
 * Fetch a recipe together with its ingredients and steps.
 * Useful for the detail and edit pages.
 */
export async function getRecipeWithDetails(id) {
  const recipe = await getRecipeById(id)

  const [{ data: ingredients }, { data: steps }] = await Promise.all([
    supabase.from('ingredients').select('*').eq('recipe_id', id).order('id'),
    supabase
      .from('recipe_steps')
      .select('*')
      .eq('recipe_id', id)
      .order('step_number'),
  ])

  return {
    recipe,
    ingredients: ingredients ?? [],
    steps: steps ?? [],
  }
}

/**
 * Update an existing recipe and reconcile its ingredients / steps.
 * Simplest safe approach: delete existing children and re-insert the new lists.
 * RLS ensures only the owner or an admin can perform this.
 */
export async function updateRecipe(recipeId, recipeData, ingredients, steps) {
  const updatePayload = {
    title: recipeData.title,
    description: recipeData.description,
    category_id: recipeData.categoryId,
    prep_time: recipeData.timeMinutes,
    servings: recipeData.servings,
    updated_at: new Date().toISOString(),
  }
  if (recipeData.imageUrl !== undefined) {
    updatePayload.image_url = recipeData.imageUrl
  }
  if (recipeData.isPrivate !== undefined) {
    updatePayload.is_private = recipeData.isPrivate === true
  }

  // `.select()` forces PostgREST to return the updated row(s), so we can
  // tell a genuine 0-row match (e.g. RLS silently filtered it out) apart
  // from success — Postgrest returns no `error` for either case otherwise.
  const { data: updatedRows, error: updateError } = await supabase
    .from('recipes')
    .update(updatePayload)
    .eq('id', recipeId)
    .select('id')

  if (updateError) throw updateError
  if (!updatedRows || updatedRows.length === 0) {
    throw new Error(
      'Update failed: this recipe could not be found, or you do not have permission to edit it.'
    )
  }

  const { error: delIngErr } = await supabase
    .from('ingredients')
    .delete()
    .eq('recipe_id', recipeId)
  if (delIngErr) throw new Error(`Failed to clear ingredients: ${delIngErr.message}`)

  const { error: delStepsErr } = await supabase
    .from('recipe_steps')
    .delete()
    .eq('recipe_id', recipeId)
  if (delStepsErr) throw new Error(`Failed to clear steps: ${delStepsErr.message}`)

  if (ingredients && ingredients.length > 0) {
    const { error: ingErr } = await supabase.from('ingredients').insert(
      ingredients.map((ing) => ({
        recipe_id: recipeId,
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
      }))
    )
    if (ingErr) throw new Error(`Failed to add ingredients: ${ingErr.message}`)
  }

  if (steps && steps.length > 0) {
    const { error: stepsErr } = await supabase.from('recipe_steps').insert(
      steps.map((step) => ({
        recipe_id: recipeId,
        step_number: step.step_number,
        description: step.description,
      }))
    )
    if (stepsErr) throw new Error(`Failed to add steps: ${stepsErr.message}`)
  }

  return { id: recipeId }
}

/**
 * Delete a recipe by id. Ingredients / steps are removed via ON DELETE CASCADE.
 * Returns the deleted recipe's image_url so the caller can clean up storage.
 */
export async function deleteRecipe(recipeId) {
  const { data: existing, error: fetchError } = await supabase
    .from('recipes')
    .select('image_url')
    .eq('id', recipeId)
    .single()

  if (fetchError) throw fetchError

  const { error } = await supabase.from('recipes').delete().eq('id', recipeId)
  if (error) throw error

  return { imageUrl: existing?.image_url ?? null }
}

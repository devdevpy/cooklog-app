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

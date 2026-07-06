-- =============================================
-- MIGRATION: Add missing indexes on foreign key columns
-- =============================================
-- Postgres does not automatically index foreign key columns (only PRIMARY
-- KEY / UNIQUE constraints get an automatic index). These columns are
-- filtered on by RLS policies (auth.uid() = user_id, on every recipes
-- query) and by app queries (recipes.js, favorites.js) on every request,
-- and are scanned on every ON DELETE CASCADE.

CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON public.recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_category_id ON public.recipes(category_id);
CREATE INDEX IF NOT EXISTS idx_ingredients_recipe_id ON public.ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_steps_recipe_id ON public.recipe_steps(recipe_id);
CREATE INDEX IF NOT EXISTS idx_favorites_recipe_id ON public.favorites(recipe_id);

-- =============================================
-- MIGRATION: Restrict private recipe content from unauthorized reads
-- =============================================
-- `recipes.is_private` is enforced correctly for authenticated users
-- ("Authenticated can view own or public recipes"), but two other
-- SELECT policies predate that flag and were never updated to respect it:
--
--   * "Anon can view recipes" (20260705000003) used `USING (true)` -- any
--     unauthenticated request could read a private recipe's row directly
--     (e.g. the recipe-detail page, or a raw REST call), even though the
--     home feed's client-side filter (main.js) hid it from the anonymous
--     browsing UI.
--   * "Anyone can view ingredients" / "Anyone can view recipe_steps"
--     (20260702000003) used `USING (true)` with no role restriction at
--     all, so even a *logged-in* non-owner could read a private recipe's
--     ingredients/steps directly, bypassing the `recipes` table's own
--     privacy check entirely.
--
-- Fix: anon may only read public recipes; ingredients/recipe_steps are only
-- readable when their parent recipe is owned by the caller, public, or the
-- caller is an admin -- mirroring the `recipes` authenticated policy. This
-- one USING clause covers anon too, since auth.uid() is null for anon
-- (falls through to the NOT is_private check).

DROP POLICY IF EXISTS "Anon can view recipes" ON public.recipes;
CREATE POLICY "Anon can view recipes"
  ON public.recipes
  FOR SELECT
  TO anon
  USING (NOT is_private);

DROP POLICY IF EXISTS "Anyone can view ingredients" ON public.ingredients;
CREATE POLICY "View ingredients of visible recipes"
  ON public.ingredients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.recipes r
      WHERE r.id = ingredients.recipe_id
        AND (r.user_id = auth.uid() OR NOT r.is_private OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Anyone can view recipe_steps" ON public.recipe_steps;
CREATE POLICY "View recipe_steps of visible recipes"
  ON public.recipe_steps
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.recipes r
      WHERE r.id = recipe_steps.recipe_id
        AND (r.user_id = auth.uid() OR NOT r.is_private OR public.is_admin())
    )
  );

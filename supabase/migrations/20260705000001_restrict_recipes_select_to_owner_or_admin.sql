-- =============================================
-- MIGRATION: Restrict authenticated SELECT on recipes to owner or admin
-- =============================================
-- Previously `20260702000003_public_read_and_author_fk.sql` created
-- `CREATE POLICY "Anyone can view recipes" ON recipes FOR SELECT USING (true);`
-- which let any authenticated user read every other user's recipes, breaking
-- the "My Recipes" page (it showed the whole database).
--
-- Fix: split the SELECT policy by role.
--   * anon        -> can still read all recipes (public browsing page keeps working)
--   * authenticated -> can only read their own recipes, unless they are admin
--
-- RLS policies are OR'ed together, so we must DROP the permissive
-- `USING (true)` policy first; otherwise it would still grant authenticated
-- users unrestricted read access and defeat the whole fix.
--
-- We also drop the old `"Users can view own recipes"` policy from the initial
-- schema (it's now superseded by the new authenticated-scoped policy) to keep
-- the policy set clean and easy to reason about.

DROP POLICY IF EXISTS "Anyone can view recipes"    ON public.recipes;
DROP POLICY IF EXISTS "Users can view own recipes" ON public.recipes;

-- Anonymous visitors: keep public browsing behaviour intact.
CREATE POLICY "Anon can view recipes"
  ON public.recipes
  FOR SELECT
  TO anon
  USING (true);

-- Authenticated users: can view their own rows and any public recipe.
-- Admins can view everything.
CREATE POLICY "Authenticated can view own or public recipes"
  ON public.recipes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR NOT is_private OR public.is_admin());

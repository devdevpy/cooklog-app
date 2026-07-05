-- =============================================
-- MIGRATION: Let authenticated users view their own recipes and all public recipes
-- =============================================

DROP POLICY IF EXISTS "Anon can view recipes" ON public.recipes;
DROP POLICY IF EXISTS "Authenticated can view own or admin all" ON public.recipes;
DROP POLICY IF EXISTS "Authenticated can view own or public recipes" ON public.recipes;

CREATE POLICY "Anon can view recipes"
  ON public.recipes
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated can view own or public recipes"
  ON public.recipes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR NOT is_private OR public.is_admin());

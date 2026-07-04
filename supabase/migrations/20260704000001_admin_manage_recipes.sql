-- =============================================
-- MIGRATION: Allow admins to manage all recipes
-- =============================================
-- Extends the existing owner-only policies on recipes / ingredients /
-- recipe_steps so that admins (per `user_roles.role = 'admin'`) can also
-- update and delete any recipe. Reuses the SECURITY DEFINER helper
-- `public.is_admin()` introduced in 20260702000004 to avoid RLS recursion.

-- recipes: admin update / delete
CREATE POLICY "Admins can update any recipe" ON recipes
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete any recipe" ON recipes
  FOR DELETE USING (public.is_admin());

-- ingredients: admin full manage
CREATE POLICY "Admins can manage any ingredients" ON ingredients
  FOR ALL USING (public.is_admin());

-- recipe_steps: admin full manage
CREATE POLICY "Admins can manage any steps" ON recipe_steps
  FOR ALL USING (public.is_admin());

-- =============================================
-- STORAGE: Allow admins to delete any recipe image
-- =============================================
CREATE POLICY "Admins can delete any recipe image"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'recipe-images' AND public.is_admin()
);

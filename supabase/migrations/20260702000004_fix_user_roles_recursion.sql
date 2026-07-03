-- =============================================
-- MIGRATION: Fix infinite recursion in RLS policies
-- =============================================
-- The original "Admins can manage roles" / "Admins can manage categories"
-- policies query `user_roles` from inside a `user_roles` policy, causing
-- Postgres error 42P17 (infinite recursion). We move the admin check into a
-- SECURITY DEFINER function, which runs as the owner and bypasses RLS,
-- breaking the recursion.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- Recreate the admin policies using the safe helper function.
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
CREATE POLICY "Admins can manage roles" ON user_roles
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (public.is_admin());

-- =============================================
-- MIGRATION: Allow admins to view all profiles
-- =============================================
-- The admin panel's "Manage users" screen needs to list every profile.
-- The original policy only lets a user see their own row. This adds a
-- second permissive SELECT policy (OR'ed with the existing one) reusing
-- the `public.is_admin()` SECURITY DEFINER helper from
-- 20260702000004_fix_user_roles_recursion.sql, consistent with the
-- categories/user_roles admin policies.

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (public.is_admin());

-- =============================================
-- MIGRATION: Temporary user restriction / soft delete
-- =============================================
-- Adds admin-controlled account status to `profiles`. Restricting or deleting
-- a user does not touch `auth.users` (there is no service-role Admin API
-- available from this client-only app) — instead the app checks these
-- columns at sign-in and on every page load, signing the user back out if
-- either is set.

ALTER TABLE profiles ADD COLUMN restricted_until TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN deleted_at TIMESTAMPTZ;

-- Admins need to flip these columns on *other* users' profiles; the existing
-- "Users can update own profile" policy only covers auth.uid() = id. Reuses
-- the `public.is_admin()` SECURITY DEFINER helper from
-- 20260702000004_fix_user_roles_recursion.sql.
CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE USING (public.is_admin());

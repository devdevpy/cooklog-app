-- =============================================
-- MIGRATION: Restore missing admin policies on ingredients / recipe_steps
-- =============================================
-- Same drift pattern as 20260707000002: 20260704000001_admin_manage_recipes.sql
-- defines "Admins can manage any ingredients" and "Admins can manage any
-- steps" (both FOR ALL, so they cover INSERT/UPDATE/DELETE/SELECT), but a
-- live pg_policies check showed neither exists -- only the owner-only
-- "Users can manage own ingredients/steps" policies remain. Confirmed by
-- reproduction: an admin editing someone else's recipe got "new row
-- violates row-level security policy for table ingredients" on the
-- re-insert step of the edit flow (recipes.js's updateRecipe deletes and
-- re-inserts ingredients/steps on every save).

CREATE POLICY "Admins can manage any ingredients" ON ingredients
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage any steps" ON recipe_steps
  FOR ALL USING (public.is_admin());

-- =============================================
-- MIGRATION: Restore missing "admin can update any recipe" policy
-- =============================================
-- 20260704000001_admin_manage_recipes.sql defines both
-- "Admins can update any recipe" and "Admins can delete any recipe" for
-- the `recipes` table. A live-database check (pg_policies) showed only
-- the DELETE policy actually present -- the UPDATE one was missing,
-- likely dropped by an out-of-band change that was never captured in a
-- migration (the same kind of drift found earlier for 20260706000002).
--
-- Effect of the gap: with only "Users can update own recipes" USING
-- (auth.uid() = user_id) active for UPDATE, an admin editing someone
-- else's recipe matched zero rows -- the update silently affected
-- nothing and PostgREST returned an empty result, which the app
-- reported as "this recipe could not be found, or you do not have
-- permission to edit it." even though is_admin() itself was working
-- correctly (verified directly via RPC).

CREATE POLICY "Admins can update any recipe" ON recipes
  FOR UPDATE USING (public.is_admin());

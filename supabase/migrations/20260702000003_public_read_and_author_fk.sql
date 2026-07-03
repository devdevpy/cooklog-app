-- =============================================
-- MIGRATION: Public read access + author relationship
-- =============================================

-- Allow anyone (including anonymous visitors) to read recipes and the
-- data required to display them. Owner-only write policies remain in effect.
CREATE POLICY "Anyone can view recipes" ON recipes FOR SELECT USING (true);
CREATE POLICY "Anyone can view profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Anyone can view ingredients" ON ingredients FOR SELECT USING (true);
CREATE POLICY "Anyone can view recipe_steps" ON recipe_steps FOR SELECT USING (true);

-- Link recipes to profiles so PostgREST can embed the author's profile.
-- recipes.user_id already references auth.users(id); profiles.id shares the
-- same value, so this extra FK is safe and enables `profiles(...)` embeds.
ALTER TABLE recipes
  ADD CONSTRAINT recipes_author_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

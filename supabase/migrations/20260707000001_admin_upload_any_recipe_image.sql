-- =============================================
-- MIGRATION: Allow admins to upload/replace recipe images for any recipe
-- =============================================
-- When an admin edits someone else's recipe and replaces its image,
-- edit-recipe.js deliberately uploads under the *recipe owner's* folder
-- (not the admin's own), so the file stays organized under the actual
-- owner. But the only INSERT/UPDATE policies on storage.objects for this
-- bucket require `(storage.foldername(name))[1] = auth.uid()::text` --
-- i.e. uploading into your OWN folder -- so an admin's upload into
-- someone else's folder was rejected with "new row violates row-level
-- security policy". DELETE already got an admin-bypass policy
-- (20260704000001); INSERT/UPDATE never did.

CREATE POLICY "Admins can upload any recipe image"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'recipe-images' AND public.is_admin()
);

CREATE POLICY "Admins can update any recipe image"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'recipe-images' AND public.is_admin()
);

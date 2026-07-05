import { supabase } from '../js/supabaseClient.js'

const BUCKET_NAME = 'avatars'

/**
 * Upload (or replace) the current user's avatar in the avatars bucket.
 * Always stored at a fixed path per user (`${userId}/avatar.${ext}`) with
 * upsert enabled, so re-uploading simply overwrites the previous file — no
 * separate delete/cleanup step exists for this bucket.
 * @param {File} file - The image file to upload
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<string>} The public URL of the uploaded avatar
 */
export async function uploadAvatar(file, userId) {
  if (!file) throw new Error('No file provided')
  if (!userId) throw new Error('User ID is required')

  const fileExt = file.name.split('.').pop()
  const filePath = `${userId}/avatar.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (uploadError) throw uploadError

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)

  return publicUrl
}

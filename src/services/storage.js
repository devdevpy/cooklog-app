import { supabase } from '../js/supabaseClient.js'

const BUCKET_NAME = 'recipe-images'

/**
 * Upload an image file to the recipe-images bucket.
 * Files are stored in a user-specific folder: ${userId}/filename
 * @param {File} file - The image file to upload
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<string>} The public URL of the uploaded image
 */
export async function uploadRecipeImage(file, userId) {
  if (!file) throw new Error('No file provided')
  if (!userId) throw new Error('User ID is required')

  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `${userId}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) throw uploadError

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)

  return publicUrl
}

/**
 * Delete an image from the recipe-images bucket.
 * @param {string} imageUrl - The public URL of the image to delete
 * @param {string} userId - The authenticated user's ID (for path verification)
 */
export async function deleteRecipeImage(imageUrl, userId) {
  if (!imageUrl) return

  try {
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split('/')
    const bucketIndex = pathParts.indexOf(BUCKET_NAME)
    if (bucketIndex === -1) return

    const filePath = pathParts.slice(bucketIndex + 1).join('/')
    
    if (!filePath.startsWith(`${userId}/`)) {
      throw new Error('Unauthorized: Cannot delete files from other users')
    }

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath])
    if (error) throw error
  } catch (err) {
    console.error('Failed to delete image:', err)
    throw err
  }
}

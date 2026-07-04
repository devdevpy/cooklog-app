# Database Migrations

## Storage Setup

To enable image uploads for recipes, you need to run the storage migration:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the contents of `create_recipe_images_storage.sql`

This will:
- Create the `recipe-images` storage bucket with public read access
- Set up policies allowing authenticated users to upload images to their own folder
- Allow users to manage (update/delete) their own images
- Enable public read access for all recipe images

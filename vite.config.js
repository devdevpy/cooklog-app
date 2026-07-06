import { defineConfig } from 'vite'
import { resolve } from 'node:path'

// Multi-page setup so `vite build` includes the auth pages.
export default defineConfig({
  // 'mpa' so unmatched routes get a real 404 in dev instead of silently
  // falling back to index.html (the SPA default).
  appType: 'mpa',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'src/pages/about.html'),
        register: resolve(__dirname, 'src/pages/register.html'),
        login: resolve(__dirname, 'src/pages/login.html'),
        addRecipe: resolve(__dirname, 'src/pages/add-recipe.html'),
        editRecipe: resolve(__dirname, 'src/pages/edit-recipe.html'),
        recipeDetail: resolve(__dirname, 'src/pages/recipe-detail.html'),
        cookMode: resolve(__dirname, 'src/pages/cook-mode.html'),
        admin: resolve(__dirname, 'src/pages/admin.html'),
        profile: resolve(__dirname, 'src/pages/profile.html'),
        favorites: resolve(__dirname, 'src/pages/favorites.html'),
        notFound: resolve(__dirname, '404.html'),
      },
    },
  },
})

import { defineConfig } from 'vite'
import { resolve } from 'node:path'

// Multi-page setup so `vite build` includes the auth pages.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        register: resolve(__dirname, 'src/pages/register.html'),
        login: resolve(__dirname, 'src/pages/login.html'),
      },
    },
  },
})

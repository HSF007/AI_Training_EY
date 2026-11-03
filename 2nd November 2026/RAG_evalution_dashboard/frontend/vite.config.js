import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Forward /api calls to the FastAPI backend (same origin, so no CORS needed)
    proxy: {
      '/api': 'http://127.0.0.1:8000',
    },
  },
})

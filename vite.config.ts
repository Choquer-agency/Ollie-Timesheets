import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  esbuild: {
    jsx: 'automatic'
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.EMAIL_SERVER_URL || 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  preview: {
    proxy: {
      '/api': {
        target: process.env.EMAIL_SERVER_URL || 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})


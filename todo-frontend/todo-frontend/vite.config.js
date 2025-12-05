// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 🎯 OFFICIAL VITE PROXY CONFIGURATION
  server: {
    proxy: {
      // Proxy requests starting with /api to your backend
      '/api': {
        target: 'http://localhost:3001', // Points to your Node.js backend server
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'), // Ensures the path is correct
      }
    }
  }
})
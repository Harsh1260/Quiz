import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    host: '0.0.0.0',  // Exposes to the local network
    port: 5173,       // Ensure this port is open
    strictPort: true, // Ensures Vite doesn’t switch to another port
  }
})
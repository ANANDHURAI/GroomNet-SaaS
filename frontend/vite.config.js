import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  assetsInclude: ['**/*.mpeg'], 
 
  server: {
    port: 3000,
    port: 5173,
   
  }
})
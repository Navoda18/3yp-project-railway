import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), 
    },
  },
  base: '/e21-3yp-RAID/webapp/',
  build: {
    outDir: '../docs/webapp',
    emptyOutDir: true, 
  },
})

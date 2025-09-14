import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // ensures Netlify serves correctly from root
  build: {
    outDir: 'dist', // default, but keep it explicit
  },
})
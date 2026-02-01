import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// GitHub Pages serves at https://<user>.github.io/<repo-name>/
const repoName = 'news-explorer'
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? `/${repoName}/` : '/',
  server: {
    port: 5173,
    host: true,
    strictPort: false,
  },
}))

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths' // ✅ 추가됨

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths() // ✅ 여기에 등록
  ]
})

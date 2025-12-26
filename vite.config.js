import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: './', // 設定為相對路徑，避免部署後找不到 assets
  plugins: [vue()],
})

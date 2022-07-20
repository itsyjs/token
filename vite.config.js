import { defineConfig } from 'vitest/config'
import ViteVue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [ViteVue()],
  test: { environment: 'happy-dom' },
  build: {
    lib: {
      entry: resolve(__dirname, './index.js'),
      formats: ['es'],
    },
    target: 'esnext',
    rollupOptions: { external: ['vue'] }
  }
})

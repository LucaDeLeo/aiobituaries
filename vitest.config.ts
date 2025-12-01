import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.tsx'],
    // Exclude Playwright E2E tests from Vitest (they use @playwright/test, not vitest)
    exclude: ['**/node_modules/**', '**/tests/a11y/**', '**/tests/performance/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

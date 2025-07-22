/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
 
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom', // Default for most component tests
    setupFiles: './src/test/setup.ts',
    // Specify node environment for integration tests
    include: ['src/**/*.spec.ts'], // include all spec files
    environmentMatchGlobs: [
      ['src/test/schoology-auth.integration.spec.ts', 'node'],
    ],
  },
})

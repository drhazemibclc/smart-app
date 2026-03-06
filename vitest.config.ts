import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    passWithNoTests: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/db': path.resolve(__dirname, './src/server/db'),
      '@/prisma/client': path.resolve(__dirname, './src/generated/prisma/client.ts'),
      '@/prisma/types': path.resolve(__dirname, './src/generated/prisma/browser.ts'),
      '~': path.resolve(__dirname, '.')
    }
  }
});

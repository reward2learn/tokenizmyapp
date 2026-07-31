/// <reference types="vitest" />
import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: '.env.local' });

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { workflow } from '@workflow/vitest';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), workflow()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'workflows/**/*.test.ts'],
    testTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './shared/src'),
    },
  },
});

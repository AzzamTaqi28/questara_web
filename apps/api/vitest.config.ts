import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/test/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@questara/utils': path.resolve(__dirname, '../../packages/utils/src/index.ts'),
      '@questara/ai': path.resolve(__dirname, '../../packages/ai/src/index.ts'),
    },
  },
});
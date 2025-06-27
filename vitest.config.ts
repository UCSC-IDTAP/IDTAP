import { defineConfig } from 'vitest/config';
import path from 'path';
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './shared'),
      '@model': path.resolve(__dirname, './src/ts/model'),
    },
  },
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/ts/model/assemblage.ts'],
      reporter: ['text','json'],
    },
  },
});

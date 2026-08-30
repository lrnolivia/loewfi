import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['{functions,src}/**/*.test.ts'],
  },
});

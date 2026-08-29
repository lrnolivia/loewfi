import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'liquid-glass-web-react': fileURLToPath(new URL('./vendor/liquid-glass/pallavag/src/index.ts', import.meta.url)),
      '@samasante/liquid-glass': fileURLToPath(new URL('./vendor/liquid-glass/samasante/src/index.ts', import.meta.url))
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});

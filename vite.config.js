import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { copyFile } from 'node:fs/promises';

const cloudflarePages404 = () => ({
  name: 'cloudflare-pages-react-404',
  apply: 'build',
  async closeBundle() {
    await copyFile('dist/index.html', 'dist/404.html');
  },
});

export default defineConfig({
  plugins: [react(), cloudflarePages404()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        admin: fileURLToPath(new URL('./admin/index.html', import.meta.url)),
      }
    }
  }
});

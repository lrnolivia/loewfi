import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { copyFile } from 'node:fs/promises';

const landingPublicFiles = ['_redirects', 'favicon.svg', 'robots.txt', 'sitemap.xml'];

const cloudflarePages404 = () => ({
  name: 'cloudflare-pages-react-404',
  apply: 'build',
  async closeBundle() {
    await Promise.all(landingPublicFiles.map((file) => copyFile('public/' + file, 'dist/' + file)));
    await copyFile('dist/index.html', 'dist/404.html');
  },
});

export default defineConfig(({ command }) => ({
  plugins: [react(), cloudflarePages404()],
  publicDir: command === 'build' ? false : 'public',
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
}));

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ybouane/liquidglass': fileURLToPath(new URL('./vendor/liquid-glass/ybouane/dist/index.js', import.meta.url))
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        admin: fileURLToPath(new URL('./admin/index.html', import.meta.url)),
        hybrid: fileURLToPath(new URL('./hybrid-test/index.html', import.meta.url)),
        'generated-home': fileURLToPath(new URL('./generated-preview/home.html', import.meta.url)),
        'generated-about': fileURLToPath(new URL('./generated-preview/about.html', import.meta.url)),
        'generated-contact': fileURLToPath(new URL('./generated-preview/contact.html', import.meta.url)),
        'generated-avedastudio': fileURLToPath(new URL('./generated-preview/avedastudio.html', import.meta.url)),
        'generated-hydroviv': fileURLToPath(new URL('./generated-preview/hydroviv.html', import.meta.url)),
        'generated-cksteele': fileURLToPath(new URL('./generated-preview/cksteele.html', import.meta.url)),
        mockup: fileURLToPath(new URL('./mockup/index.html', import.meta.url)),
        'mockup-about': fileURLToPath(new URL('./mockup/about.html', import.meta.url)),
        'mockup-avedastudio': fileURLToPath(new URL('./mockup/avedastudio.html', import.meta.url)),
        'mockup-cksteele': fileURLToPath(new URL('./mockup/cksteele.html', import.meta.url)),
        'mockup-contact': fileURLToPath(new URL('./mockup/contact.html', import.meta.url)),
        'mockup-hydroviv': fileURLToPath(new URL('./mockup/hydroviv.html', import.meta.url))
      }
    }
  }
});

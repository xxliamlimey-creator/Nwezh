import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

function resolveFallbackVapidPublicKey(): string {
  if (process.env.VITE_VAPID_PUBLIC_KEY) return process.env.VITE_VAPID_PUBLIC_KEY;
  if (process.env.VAPID_PUBLIC_KEY) return process.env.VAPID_PUBLIC_KEY;
  try {
    const vapidPath = path.resolve(import.meta.dirname, '.nwezh-data', 'vapid.json');
    if (fs.existsSync(vapidPath)) {
      const parsed = JSON.parse(fs.readFileSync(vapidPath, 'utf8')) as {
        publicKey?: string;
      };
      if (parsed.publicKey) return parsed.publicKey;
    }
  } catch {
    // ignore
  }
  return '';
}

export default defineConfig(() => {
  const fallbackVapidPublicKey = resolveFallbackVapidPublicKey();
  return {
    define: {
      'import.meta.env.VITE_VAPID_PUBLIC_KEY': JSON.stringify(
        fallbackVapidPublicKey
      ),
    },
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.ts',
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        includeAssets: [
          'icon.svg',
          'apple-touch-icon.png',
          'favicon-32x32.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'pwa-maskable-512x512.png',
        ],
        manifest: {
          id: '/',
          name: 'Nwezh',
          short_name: 'Nwezh',
          description:
            'A masjid in your pocket — calm, accurate Islamic prayer times and reminders.',
          theme_color: '#FAF9F6',
          background_color: '#FAF9F6',
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: '/',
          scope: '/',
          categories: ['lifestyle', 'utilities'],
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        injectManifest: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        },
        devOptions: {
          enabled: true,
          type: 'module',
          navigateFallback: 'index.html',
        },
      }),
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(import.meta.dirname, 'dist');
          const srcAssets = path.resolve(import.meta.dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

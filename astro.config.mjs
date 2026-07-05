import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
// 1. CAMBIO AQUÍ: Importación por defecto en lugar de nombrada
import AstroPWA from '@vite-pwa/astro'; 

/**
 * PWA: offline-first. After the initial load everything is served from cache.
 * - Precache: all build assets (index.html, JS, CSS, images) cached on install.
 * - Runtime: StaleWhileRevalidate for navigations so the app shell loads
 *   instantly even on a flaky network, falling back to cache when offline;
 *   CacheFirst for images/fonts.
 */
const pwaConfig = {
  registerType: 'autoUpdate',
  includeAssets: ['favicon.svg', 'icons/*.svg', 'robots.txt'],
  manifest: {
    name: 'El Intruso',
    short_name: 'El Intruso',
    description: 'Juego de deducción social offline, pásalo y juega.',
    theme_color: '#0b0f19',
    background_color: '#0b0f19',
    display: 'standalone',
    orientation: 'portrait',
    start_url: '/',
    scope: '/',
    lang: 'es',
    categories: ['games', 'entertainment'],
    icons: [
      {
        src: '/icons/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icons/maskable.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
    navigateFallback: '/index.html',
    navigateFallbackDenylist: [/^\/api\//],
    runtimeCaching: [
      {
        urlPattern: ({ request }) => request.mode === 'navigate',
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'app-shell',
          expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
      {
        urlPattern: ({ request }) =>
          request.destination === 'style' ||
          request.destination === 'script' ||
          request.destination === 'worker',
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-resources',
          expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
      {
        urlPattern: ({ request }) =>
          request.destination === 'image' || request.destination === 'font',
        handler: 'CacheFirst',
        options: {
          cacheName: 'media-assets',
          expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 90 },
        },
      },
    ],
  },
  devOptions: {
    enabled: true,
    type: 'module',
  },
  experimental: {
    includeHmrOverlay: false,
  },
};

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://el-intruso.local',
  // 2. CAMBIO AQUÍ: Movemos AstroPWA a integrations (es un plugin de Astro, no de Vite)
  integrations: [react(), AstroPWA(pwaConfig)],
  vite: {
    plugins: [tailwindcss()],
  },
});
/// <reference path="../.astro/types.d.ts" />

declare module '@vite-pwa/astro' {
  import type { AstroIntegration } from 'astro';
  const VitePWA: (options?: any) => AstroIntegration;
  export { VitePWA };
}
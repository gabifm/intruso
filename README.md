# El Intruso

Offline-first, pass-and-play social deduction mobile **Progressive Web App**
(Spyfall-style), built with Astro (static output) + React + Zustand +
Tailwind CSS v4 and `@vite-pwa/astro`.

## Stack

| Concern            | Choice                                  |
| ------------------ | --------------------------------------- |
| Framework          | Astro 7 (static SSG)                    |
| UI                 | React 19 (`@astrojs/react`)              |
| State              | Zustand 5 (`src/store/gameStore.ts`)     |
| Styling            | Tailwind CSS 4 (`@tailwindcss/vite`)    |
| Offline / PWA      | `@vite-pwa/astro` (Workbox)             |
| Type safety        | TypeScript (`astro/tsconfigs/strict`)   |

## Getting started

Node `>= 20.9.0` is required.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # type-check + static build to dist/
npm run preview # serve the production build
```

## PWA / offline behaviour

- The service worker is registered in `src/layouts/Layout.astro` via
  `virtual:pwa-register` with `registerType: 'autoUpdate'`.
- The app shell (`navigateFallback: '/index.html'`) and all bundled JS/CSS
  are precached on first visit, so the game is fully playable offline after
  the initial load. Runtime caching uses `StaleWhileRevalidate` for
  navigations/scripts and `CacheFirst` for images/fonts.

## Game state machine

All game logic lives in `src/store/gameStore.ts` as a single Zustand store
built on a discriminated-union phase type:

```
LOBBY -> ROLE_REVEAL -> QUESTION_PHASE -> VOTING -> RESOLUTION
                                   \-> RESOLUTION (accusation)
```

Actions: `addPlayer`, `removePlayer`, `startGame`, `nextPlayerRoleReveal`,
`startTimer`, `accusePlayer`, `goToVoting`, `resetGame`.

## Project structure

```
astro.config.mjs        Astro + React + Tailwind v4 + VitePWA config
src/
  store/gameStore.ts    Zustand state machine (typed, discriminated union)
  layouts/Layout.astro  HTML shell + viewport + PWA SW registration
  pages/index.astro     Root placeholder (UI to be added)
  styles/global.css     Tailwind v4 import + dark theme tokens
  env.d.ts              Module + type declarations
public/
  favicon.svg
  icons/icon.svg        (any)
  icons/maskable.svg    (maskable)
```

## Notes

- No UI game components exist yet; only the architecture skeleton and the
  state machine.
- PWA icons are SVG. If you target stores that require raster icons, drop
  `icon-192.png` / `icon-512.png` into `public/icons/` and update the
  `manifest.icons` block in `astro.config.mjs`.



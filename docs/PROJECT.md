# El Intruso — Documentación del Proyecto

> Juego móvil web **offline-first** de deducción social (estilo *The Chameleon* / *Spyfall*),
> diseñado para jugarse **pasando el móvil** entre los participantes.
> Construido como **PWA** con Astro (SSG), React, Zustand y Tailwind CSS.

---

## 1. Resumen general

**El Intruso** es un juego de deducción social para 3+ jugadores en el que uno de
ellos es el *Intruso* (Imposter) y el resto son *Civiles* (Civilians).

Mecánica por ronda:
1. Se elige un **Mazo** (Pack) temático — ej. *Modo Niños*, *Modo Normal*.
2. Se escoge **una categoría** al azar dentro del mazo y **una palabra secreta**
   de esa categoría.
3. Un jugador al azar es nombrado **Intruso** en secreto.
4. Los Civiles conocen la categoría **y** la palabra. El Intruso **solo** conoce
   la categoría.
5. Los jugadores se hacen preguntas entre sí para identificar al Intruso.
6. Tras un temporizador (o por voto anticipado) se acusa a alguien.
7. Si el acusado **era** el Intruso → ganan los **Civiles**. Si no → gana el **Intruso**.

**Flow de fases (máquina de estados):**

```
LOBBY ─▶ ROLE_REVEAL ─▶ QUESTION_PHASE ─▶ VOTING ─▶ RESOLUTION
                                          ▲
                          (acuse directo) ┘
```

---

## 2. Stack técnico

| Concern            | Elección                                  |
| ------------------ | ----------------------------------------- |
| Framework          | Astro 7 (`output: 'static'`, SSG)         |
| UI (islas客户端)    | React 19 (`@astrojs/react`)                |
| State              | Zustand 5 (con `devtools`)                 |
| Styling            | Tailwind CSS 4 (`@tailwindcss/vite`)       |
| PWA / Offline      | `@vite-pwa/astro` (Workbox, autoUpdate)   |
| Lenguaje           | TypeScript (modo `strict`)                |
| Node                | `>= 20.9.0`                                |

---

## 3. Cómo ejecutar

```bash
npm install
npm run dev       # desarrollo en http://localhost:4321
npm run build     # astro check + build estático -> dist/
npm run preview   # servir el build de producción
```

El **primer load** descarga y cachea el service worker; a partir de ahí el
juego funciona **100% offline**.

---

## 4. Estructura de archivos

```
el-intruso/
├── astro.config.mjs          Config Astro + React + Tailwind v4 + VitePWA
├── package.json
├── tsconfig.json             aliases @/*, @components/*, @store/*
├── README.md
├── .gitignore
│
├── public/
│   ├── favicon.svg
│   └── icons/
│       ├── icon.svg          (purpose: any)
│       └── maskable.svg      (purpose: maskable)
│
└── src/
    ├── env.d.ts              declara módulo virtual `@vite-pwa/astro`
    ├── styles/
    │   └── global.css        Tailwind v4 + tema oscuro (tokens @theme)
    ├── data/
    │   └── packs.ts          GAME_PACKS (Mazos: categorías + palabras)
    ├── store/
    │   └── gameStore.ts      Zustand — máquina de estados del juego
    ├── components/
    │   ├── GameRouter.tsx    switch por `phase` → componente
    │   ├── Lobby.tsx        Fase LOBBY
    │   ├── RoleReveal.tsx   Fase ROLE_REVEAL
    │   ├── QuestionPhase.tsx Fase QUESTION_PHASE (timer + votar)
    │   ├── Voting.tsx       Fase VOTING (acuse)
    │   └── Resolution.tsx   Fase RESOLUTION (resultado)
    ├── layouts/
    │   └── Layout.astro      HTML shell: viewport, theme-color, SW register
    └── pages/
        └── index.astro      monta <GameRouter client:load />
```

---

## 5. El Store — `src/store/gameStore.ts`

### 5.1 Filosofía

Un **único store Zustand** contiene toda la lógica del juego. La fase actual
se modela con una **discriminated union** (`GamePhaseState`) de manera que
**el compilador** impida transiciones ilegales (p. ej. acusar desde el LOBBY).

```ts
type GamePhaseState =
  | { phase: 'LOBBY' }
  | { phase: 'ROLE_REVEAL'; currentRevealIndex: number }
  | { phase: 'QUESTION_PHASE'; questionerIndex: number; timerEnd: number | null }
  | { phase: 'VOTING' }
  | { phase: 'RESOLUTION'; accusedId: PlayerId | null; intruderWon: boolean };
```

Cada variante lleva **solo los datos relevantes** para esa fase → menos campos
fantasmas, menos re-renders.

### 5.2 Estado

```ts
interface GameState extends GamePhaseState {
  players: Player[];
  packId: string | null;     // Mazo seleccionado
  category: string | null;   // Categoría activa
  word: string | null;        // Palabra secreta
  roles: RoleMap;             // playerId -> 'CIVILIAN' | 'IMPOSTER'
  imposterId: PlayerId;       // atajo
}
```

### 5.3 Acciones

| Acción                  | Descripción                                                                |
| ----------------------- | ------------------------------------------------------------------------- |
| `addPlayer(name)`       | Añade jugador (dedupe por nombre, primer jugador = HOST)                 |
| `removePlayer(name)`    | Elimina jugador; reasigna HOST si hace falta                              |
| `startGame(packId)`     | Valida ≥3 jugadores, busca el pack, elige cat+palabra, asigna Impostor    |
| `nextPlayerRoleReveal()`| Marca jugador actual como visto, pasa al siguiente o va a QUESTION_PHASE  |
| `startTimer(ms?)`       | Inicia el timer en QUESTION_PHASE (default 8 min)                         |
| `accusePlayer(id)`      | Tras acuse → RESOLUTION: `intruderWon = id !== imposterId`               |
| `goToVoting()`          | QUESTION_PHASE → VOTING                                                    |
| `resetGame()`            | Vuelve a LOBBY **conservando** la lista de jugadores                       |

### 5.4 Selectores

Funciones puras que devuelven primitivos/slices:

```ts
selectPhase(s)                   // -> Phase
selectPlayers(s)                 // -> Player[]
selectWord(s), selectCategory(s) // -> string | null
selectRoles(s)                   // -> RoleMap
selectImposterId(s)              // -> PlayerId | null
selectRoleForPlayer(s, id)       // -> Role | null
selectCurrentRevealPlayer(s)     // -> Player | null (role_reveal)
selectQuestioner(s)              // -> Player | null (question_phase)
selectRoleRevealText(s, id)      // -> string (texto que ve el jugador)
```

Usa estos selectores con `useGameStore((s) => selectX(s))` para minimizar
re-renders (Zustand solo re-renderiza si cambia la referencia seleccionada).

> **⚠️ Nota**:alda selectores con parámetro como `selectRoleForPlayer(s, id)`
> deben usarse vía `useGameStore((s) => selectRoleForPlayer(s, id))`.

---

## 6. Datos — `src/data/packs.ts`

Define el contenido jugable:

```ts
interface GamePack {
  id: string;            // p.ej. 'kids-basic'
  name: string;          // p.ej. 'Modo Niños (Familiar)'
  description: string;
  categories: WordCategory[];   // { category, words[] }
}

export const GAME_PACKS: GamePack[] = [
  { id: 'kids-basic', ... 5 categorías ... },
  { id: 'adults-normal', ... 6 categorías ... },
];
```

**Para añadir un mazo nuevo** (p. ej. una expansión): añade un objeto a
`GAME_PACKS`. El Lobby lo detecta automáticamente y `startGame(packId)` lo
resuelve por id — **no hace falta tocar el store ni la UI**.

---

## 7. Componentes UI

Todos React (`.tsx`), hidratados por Astro vía `client:load` desde
`GameRouter.tsx`. Sigue estética: **mobile-first**, **dark mode**
(`bg-gray-900`, `text-white`), botones y texto **masivos** para
"pasar el móvil".

### 7.1 `GameRouter.tsx`
Lee `phase` del store y renderiza el componente correspondiente. Punto único
de ruteo entre fases — `index.astro` solo monta este componente.

### 7.2 `Lobby.tsx` — Fase `LOBBY`
- Input + botón "Add" para añadir jugadores.
- Lista de jugadores con badge HOST y botón × para eliminar.
- Sección **"Select Deck"**: tarjetas grandes para cada `GAME_PACKS[]`.
  El pack seleccionado se resalta con borde/acento naranja.
- Botón gigante **"Start Game"** (deshabilitado si <3 jugadores).
- Estado local: `name`, `selectedPackId` (default `GAME_PACKS[0].id`).
- Llama `startGame(selectedPackId)`.

### 7.3 `RoleReveal.tsx` — Fase `ROLE_REVEAL`
- **Estado 1 (oculto)**: "Pass the phone to **[Jugador]**" + botón
  "Tap to reveal role".
- **Estado 2 (revelado)**: usa `roles[player.id]`:
  - Impostor → **"You are the IMPOSTER"** en rojo + solo Categoría.
  - Civil → **"You are a Civilian"** en verde + Categoría + Palabra secreta.
- Botón **"Hide and Continue"** → `nextPlayerRoleReveal()`.
- Cuando el último jugador lo pulsa, el store auto-transiciona a
  `QUESTION_PHASE` (en `nextPlayerRoleReveal`, si `nextIndex >= players.length`).
- El flag `revealed` se resetea con un `useEffect` al cambiar
  `currentRevealIndex`.

### 7.4 `QuestionPhase.tsx` — Fase `QUESTION_PHASE`
- Al montar, llama `startTimer(3 min)` si `timerEnd === null`.
- Tick cada 250 ms; formatea `m:ss`. A los ≤30 s parpadea en rojo.
- Al llegar a 0 → `goToVoting()` (con `finishedRef` para no duplicar).
- Botón gigante **"Go to Voting"** para acabar antes.

### 7.5 `Voting.tsx` — Fase `VOTING`
- Titulo "Who is the Imposter?".
- Cada jugador es un botón gigante.
- Al pulsar abre **modal de confirmación** (nombre + Confirm/Cancel).
- `Confirm Accusation` → `accusePlayer(id)` → `RESOLUTION`.

### 7.6 `Resolution.tsx` — Fase `RESOLUTION`
- Lee `intruderWon`:
  - `false` → **"CIVILIANS WIN!"** en verde + "You caught the Imposter!".
  - `true` → **"IMPOSTER WINS!"** en rojo + "[Acusado] was innocent.".
- **Revelación final**:
  - Nombre del Intruso real `imposter`.
  - Categoría.
  - Palabra secreta.
- Botón **"Play Again"** → `resetGame()` (vuelve a LOBBY con la misma lista).

---

## 8. PWA / Offline

- `astro.config.mjs` usa `@vite-pwa/astro` con `registerType: 'autoUpdate'`.
- **Workbox** precachea `**/*.{js,css,html,svg,png,ico,woff2}` y usa
  `navigateFallback: '/index.html'` → el **app shell carga offline**.
- Runtime caching:
  - Navigations / scripts / styles → `StaleWhileRevalidate`.
  - Imágenes / fonts → `CacheFirst`.
- El SW se registra en `Layout.astro` vía `virtual:pwa-register`; en cada
  nueva versión se auto-recarga.
- Manifest en `astro.config.mjs`: nombre "El Intruso", tema `#0b0f19`,
  retrato, standalone, íconos SVG.

---

## 9. Estilos — `src/styles/global.css`

Tailwind **v4** (sin `tailwind.config.js`). Tokens vía `@theme`:

```css
@theme {
  --color-background: #0b0f19;
  --color-surface:    #111827;
  --color-accent:     #f97316;  /* naranja "El Intruso" */
  --color-text:       #f8fafc;
  --color-danger:     #ef4444;
  --color-success:    #22c55e;
  ...
}
```

Utilidades custom: `.safe-top` / `.safe-bottom` (padding safe-area) para
móviles con notch. `body` bloquea zoom y tap-highlight para sensación "app".

---

## 10. Convenciones de código

- **TypeScript strict**, `verbatimModuleSyntax`.
- **Sin comentarios explicativos** salvo bloques de sección en el store.
- **Selectores** como funciones puras para evitar re-renders.
- **Discriminated union** para la fase → seguridad de tipos en transiciones.
- **Mobile-first**: `h-full`, `min-h-screen`, botones `py-6`/`py-8`, textos
  `text-2xl` a `text-6xl`.
- **Sin dependencias de UI externas** (Radix, etc.) — solo Tailwind + React.

---

## 11. Ideas para futuras iteraciones

- [ ] **Fase de pregunta dirigida**: registrar quién pregunta a quién, rotar turno.
- [ ] **Multi-impostor** configurable según número de jugadores.
- [ ] **Editor de mazos**: que el usuario cree/cargue sus categorías.
- [ ] **Persistencia local** (localStorage / IndexedDB) de partida en curso.
- [ ] **Historial de partidas** y estadísticas por jugador.
- [ ] **Internacionalización** (astro-i18n) — añadir Inglés aparte del Español.
- [ ] **Sonido / vibración** en transiciones (Web Vibration API).
- [ ] **Refinar el timer**: pausar, añadir tiempo, sonar al finalizar.
- [ ] **PWA installable en stores** víaías PNG (192/512) en `public/icons/`
      y更新的 manifest.icons. Hsurface actual usa SVG, que algunos stores no
      aceptan para el ícono de showcase.
- [ ] **Tests**: Vitest para el store (acciones y transiciones de fase).
- [ ] **Accesibilidad**: revisar focus visible, contraste, roles ARIA en modales.

---

## 12. Puntos de atención / decisiones

- **El ruteo por fase vive en `GameRouter.tsx` (cliente)** porque Zustand solo
  corre en el navegador — no se puede leer el store en build time de Astro.
- **`packId` reemplaza al antiguo `wordBank` en el estado** tras añadir los
  Game Packs. Ya no existe `DEFAULT_WORD_BANK` / `WordBank` / `WordCategory`
  en el store (los tipos viven en `src/data/packs.ts`).
- **`resetGame` conserva la lista de jugadores** para partidas seguidas sin
  re-añadir nombres, pero resetea `hasSeenRole`, palabra, categoría, roles, etc.
- **`selectRoleRevealText`** genera el mensaje visible en la revelación de
  rol según el idioma plantilla inglés (se puede migrar a es/i18n luego).

---

_Documento generado como contexto para futuras mejoras. Última actualización:
state machine + 5 fases UI + Game Packs operativos._
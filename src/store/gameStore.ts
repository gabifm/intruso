import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { GAME_PACKS, type GamePack } from '../data/packs';

/**
 * El Intruso - Core game state machine.
 *
 * Mechanics modelled on "The Chameleon" / "Spyfall":
 * - A Category and Word are picked at random.
 * - One player is the Imposter (knows only the Category).
 * - All other players are Civilians (know Category + Word).
 *
 * Phases:
 *   LOBBY -> ROLE_REVEAL -> QUESTION_PHASE -> VOTING -> RESOLUTION
 *                                              \-> RESOLUTION (early accusation)
 */

/* -------------------------------------------------------------------------- */
/* Types & Data                                                               */
/* -------------------------------------------------------------------------- */

export type PlayerId = string;

export type Role = 'CIVILIAN' | 'IMPOSTER';

export interface Player {
  id: PlayerId;
  name: string;
  isHost: boolean;
  hasSeenRole: boolean;
}

/** Mapping of player id -> role, used during play. */
export type RoleMap = Record<PlayerId, Role>;

/* -------------------------------------------------------------------------- */
/* Discriminated union for phase-specific state                               */
/* -------------------------------------------------------------------------- */

export type GamePhaseState =
  | { phase: 'LOBBY' }
  | { phase: 'ROLE_REVEAL'; currentRevealIndex: number }
  | {
      phase: 'QUESTION_PHASE';
      questionerIndex: number;
      timerEnd: number | null;
    }
  | { phase: 'VOTING' }
  | {
      phase: 'RESOLUTION';
      accusedId: PlayerId | null;
      intruderWon: boolean;
    };

export type Phase = GamePhaseState['phase'];

export interface GameState extends GamePhaseState {
  players: Player[];
  /** Id of the pack selected for the current round. */
  packId: string | null;
  /** Currently selected category name. */
  category: string | null;
  /** Currently selected secret word. */
  word: string | null;
  /** Mapping playerId -> role for the current round. */
  roles: RoleMap;
  /** Convenience: id of the imposter for this round. */
  imposterId: PlayerId | null;
  /** Random play/reveal order for this round (player ids shuffled). */
  revealOrder: PlayerId[];
}

/* -------------------------------------------------------------------------- */
/* Actions                                                                    */
/* -------------------------------------------------------------------------- */

export interface GameActions {
  addPlayer: (name: string) => void;
  removePlayer: (name: string) => void;
  startGame: (packId: string) => void;
  nextPlayerRoleReveal: () => void;
  startTimer: (durationMs?: number) => void;
  accusePlayer: (playerId: PlayerId) => void;
  goToVoting: () => void;
  resetGame: () => void;
}

export type GameStore = GameState & GameActions;

const DEFAULT_TIMER_MS = 8 * 60 * 1000;

const initialState: GameState = {
  phase: 'LOBBY',
  players: [],
  packId: null,
  category: null,
  word: null,
  roles: {},
  imposterId: null,
  revealOrder: [],
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/** Fisher-Yates shuffle returning a new array. */
function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* Store                                                                      */
/* -------------------------------------------------------------------------- */

export const useGameStore = create<GameStore>()(
  devtools((set) => ({
    ...initialState,

    addPlayer: (name) =>
      set(
        (state) => {
          const trimmed = name.trim();
          if (!trimmed) return state;
          if (
            state.players.some(
              (p) => p.name.toLowerCase() === trimmed.toLowerCase()
            )
          ) {
            return state;
          }
          const player: Player = {
            id: `${trimmed}-${state.players.length}-${Date.now()}`,
            name: trimmed,
            isHost: state.players.length === 0,
            hasSeenRole: false,
          };
          return { players: [...state.players, player] };
        },
        false,
        'addPlayer'
      ),

    removePlayer: (name) =>
      set(
        (state) => {
          const players = state.players.filter((p) => p.name !== name);
          // Reassign host if host left.
          let updatedPlayers = players;
          if (players.length > 0 && !players[0].isHost) {
            updatedPlayers = players.map((p, i) => ({ ...p, isHost: i === 0 }));
          }
          return { players: updatedPlayers };
        },
        false,
        'removePlayer'
      ),

    startGame: (packId) =>
      set(
        (state) => {
          const MIN_PLAYERS = 3;
          if (state.players.length < MIN_PLAYERS) return state;

          // Find the selected pack; bail if it doesn't exist.
          const pack: GamePack | undefined = GAME_PACKS.find(
            (p) => p.id === packId
          );
          if (!pack || pack.categories.length === 0) return state;

          // Pick a random category from this pack, then a word from it.
          const categoryObj = pickRandom(pack.categories);
          const category = categoryObj.category;
          const word = pickRandom(categoryObj.words);

          // Pick the Imposter
          const imposter = pickRandom(state.players);
          const roles: RoleMap = {};

          // Assign roles: exactly one Imposter, all others Civilians
          for (const p of state.players) {
            roles[p.id] = p.id === imposter.id ? 'IMPOSTER' : 'CIVILIAN';
          }

          // Random play/reveal order for this round.
          const revealOrder = shuffle(state.players.map((p) => p.id));

          // Reset per-round flags
          const players = state.players.map((p) => ({
            ...p,
            hasSeenRole: false,
          }));

          return {
            players,
            packId,
            word,
            category,
            roles,
            imposterId: imposter.id,
            revealOrder,
            phase: 'ROLE_REVEAL',
            currentRevealIndex: 0,
          } as GameStore;
        },
        false,
        'startGame'
      ),

    nextPlayerRoleReveal: () =>
      set(
        (state) => {
          if (state.phase !== 'ROLE_REVEAL') return state;

          const currentIndex = state.currentRevealIndex;
          const currentId = state.revealOrder[currentIndex];
          const players = state.players.map((p) =>
            p.id === currentId ? { ...p, hasSeenRole: true } : p
          );

          const nextIndex = currentIndex + 1;
          if (nextIndex >= players.length) {
            // All players have revealed -> hand off to question phase
            return {
              players,
              phase: 'QUESTION_PHASE',
              questionerIndex: 0,
              timerEnd: null,
            } as GameStore;
          }

          return {
            players,
            phase: 'ROLE_REVEAL',
            currentRevealIndex: nextIndex,
          } as GameStore;
        },
        false,
        'nextPlayerRoleReveal'
      ),

    startTimer: (durationMs = DEFAULT_TIMER_MS) =>
      set(
        (state) => {
          if (state.phase !== 'QUESTION_PHASE') return state;
          return {
            phase: 'QUESTION_PHASE',
            questionerIndex:
              state.phase === 'QUESTION_PHASE' ? state.questionerIndex : 0,
            timerEnd: Date.now() + durationMs,
          } as GameStore;
        },
        false,
        'startTimer'
      ),

    accusePlayer: (playerId) =>
      set(
        (state) => {
          if (state.phase !== 'QUESTION_PHASE' && state.phase !== 'VOTING')
            return state;

          // The imposter wins if accused incorrectly
          const intruderWon = playerId !== state.imposterId;
          return {
            phase: 'RESOLUTION',
            accusedId: playerId,
            intruderWon,
          } as GameStore;
        },
        false,
        'accusePlayer'
      ),

    goToVoting: () =>
      set(
        (state) => {
          if (state.phase !== 'QUESTION_PHASE') return state;
          return { phase: 'VOTING' } as GameStore;
        },
        false,
        'goToVoting'
      ),

    resetGame: () =>
      set(
        (state) => ({
          ...initialState,
          phase: 'LOBBY',
          /* Keep the player roster; only reset per-round fields */
          players: state.players.map((p) => ({ ...p, hasSeenRole: false })),
        }),
        false,
        'resetGame'
      ),
  }))
);

/* -------------------------------------------------------------------------- */
/* Selectors                                                                  */
/* -------------------------------------------------------------------------- */
/**
 * Selectors return primitives/slices so subscribers re-render minimally.
 */
export const selectPhase = (s: GameStore): Phase => s.phase;
export const selectPlayers = (s: GameStore): Player[] => s.players;
export const selectWord = (s: GameStore): string | null => s.word;
export const selectCategory = (s: GameStore): string | null => s.category;
export const selectRoles = (s: GameStore): RoleMap => s.roles;
export const selectImposterId = (s: GameStore): PlayerId | null =>
  s.imposterId;

export const selectRoleForPlayer = (s: GameStore, id: PlayerId): Role | null =>
  s.roles[id] ?? null;

export const selectCurrentRevealPlayer = (s: GameStore): Player | null => {
  if (s.phase !== 'ROLE_REVEAL') return null;
  const id = s.revealOrder[s.currentRevealIndex];
  if (!id) return null;
  return s.players.find((p) => p.id === id) ?? null;
};

export const selectQuestioner = (s: GameStore): Player | null => {
  if (s.phase !== 'QUESTION_PHASE') return null;
  const id = s.revealOrder[s.questionerIndex];
  if (!id) return null;
  return s.players.find((p) => p.id === id) ?? null;
};

/** Returns the round's players ordered by the random reveal/play order. */
export const selectOrderedPlayers = (s: GameStore): Player[] => {
  const map = new Map(s.players.map((p) => [p.id, p]));
  return s.revealOrder
    .map((id) => map.get(id))
    .filter((p): p is Player => Boolean(p));
};

/**
 * Returns the text a player should see during ROLE_REVEAL.
 * - Civilian: "La Categoría es <Category>. La Palabra es <Word>."
 * - Imposter: "La Categoría es <Category>. TÚ ERES EL INTRUSO."
 */
export function selectRoleRevealText(
  s: GameStore,
  playerId: PlayerId
): string {
  const role = s.roles[playerId];
  const category = s.category ?? '???';
  if (!role) return 'Rol desconocido.';
  if (role === 'IMPOSTER') {
    return `La Categoría es ${category}. TÚ ERES EL INTRUSO.`;
  }
  return `La Categoría es ${category}. La Palabra es ${s.word ?? '???'}.`;
}
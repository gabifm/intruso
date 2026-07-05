import { useGameStore } from '../store/gameStore';
import Lobby from './Lobby';
import RoleReveal from './RoleReveal';
import QuestionPhase from './QuestionPhase';
import Voting from './Voting';
import Resolution from './Resolution';

/**
 * Phase router. Reads the phase from the Zustand store and renders the
 * matching screen. This lives in a client-hydrated React component because
 * Zustand hooks require the browser runtime; index.astro simply mounts it.
 */
export default function GameRouter() {
  const phase = useGameStore((s) => s.phase);

  switch (phase) {
    case 'LOBBY':
      return <Lobby />;
    case 'ROLE_REVEAL':
      return <RoleReveal />;
    case 'QUESTION_PHASE':
      return <QuestionPhase />;
    case 'VOTING':
      return <Voting />;
    case 'RESOLUTION':
      return <Resolution />;
    default:
      return null;
  }
}
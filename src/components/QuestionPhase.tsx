import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';

const DEFAULT_DURATION_MS = 3 * 60 * 1000;

function format(ms: number): string {
  if (ms < 0) ms = 0;
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function QuestionPhase() {
  const phase = useGameStore((s) => s.phase);
  const timerEndRaw = useGameStore((s) =>
    s.phase === 'QUESTION_PHASE' ? s.timerEnd : null
  );
  const players = useGameStore((s) => s.players);
  const questionerIndexRaw = useGameStore((s) =>
    s.phase === 'QUESTION_PHASE' ? s.questionerIndex : 0
  );
  const startTimer = useGameStore((s) => s.startTimer);
  const goToVoting = useGameStore((s) => s.goToVoting);

  const timerEnd = timerEndRaw ?? null;
  const questionerIndex = questionerIndexRaw ?? 0;

  const [, force] = useState(0);
  const finishedRef = useRef(false);

  // Start the timer the first time we enter QUESTION_PHASE.
  useEffect(() => {
    if (phase !== 'QUESTION_PHASE') {
      finishedRef.current = false;
      return;
    }
    if (timerEnd === null) {
      startTimer(DEFAULT_DURATION_MS);
    }
  }, [phase, timerEnd, startTimer]);

  // Tick every 250ms while the timer is running.
  useEffect(() => {
    if (phase !== 'QUESTION_PHASE' || timerEnd === null) return;
    const id = window.setInterval(() => {
      force((n) => n + 1);
      if (Date.now() >= timerEnd && !finishedRef.current) {
        finishedRef.current = true;
        goToVoting();
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [phase, timerEnd, goToVoting]);

  if (phase !== 'QUESTION_PHASE') return null;

  const remaining = timerEnd !== null ? timerEnd - Date.now() : DEFAULT_DURATION_MS;
  const questioner = players[questionerIndex] ?? players[0];
  const isLow = remaining <= 30 * 1000;

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <p className="mb-3 text-xl uppercase tracking-widest text-gray-500">
        Tiempo restante
      </p>
      <p
        className={`mb-2 font-mono text-8xl font-black tabular-nums ${
          isLow ? 'animate-pulse text-red-500' : 'text-white'
        }`}
      >
        {format(remaining)}
      </p>

      <p className="mb-12 text-lg text-gray-400">
        {questioner ? `${questioner.name} está preguntando.` : 'Discutid la categoría.'}
      </p>

      <button
        onClick={() => goToVoting()}
        className="w-full max-w-sm rounded-2xl bg-purple-600 py-8 text-2xl font-black text-white shadow-lg shadow-purple-600/30 active:scale-95"
      >
        Ir a Votación
      </button>
    </div>
  );
}
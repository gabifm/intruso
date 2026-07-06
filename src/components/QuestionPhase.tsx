import { useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore, selectOrderedPlayers } from '../store/gameStore';

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
  const spokenPlayerIds = useGameStore((s) =>
    s.phase === 'QUESTION_PHASE' ? s.spokenPlayerIds : []
  );
  const orderedPlayers = useGameStore(useShallow(selectOrderedPlayers));
  const questionerIndexRaw = useGameStore((s) =>
    s.phase === 'QUESTION_PHASE' ? s.questionerIndex : 0
  );
  const startTimer = useGameStore((s) => s.startTimer);
  const goToVoting = useGameStore((s) => s.goToVoting);
  const markPlayerSpoken = useGameStore((s) => s.markPlayerSpoken);

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
  const questioner = orderedPlayers[questionerIndex] ?? orderedPlayers[0] ?? null;
  const isLow = remaining <= 30 * 1000;

  return (
    <div className="flex h-full flex-col px-6 py-8">
      <div className="text-center">
        <p className="mb-2 text-xl uppercase tracking-widest text-gray-500">
          Tiempo restante
        </p>
        <p
          className={`mb-3 font-mono text-8xl font-black tabular-nums ${
            isLow ? 'animate-pulse text-red-500' : 'text-white'
          }`}
        >
          {format(remaining)}
        </p>

        <p className="mb-6 text-lg text-gray-400">
          {questioner ? `${questioner.name} está preguntando.` : 'Discutid la categoría.'}
        </p>
      </div>

      <section className="mb-6 flex-1">
        <h2 className="mb-3 flex items-center justify-between text-xl font-bold uppercase tracking-widest text-gray-500">
          <span>Orden de juego</span>
          <span>
            {spokenPlayerIds.length}/{orderedPlayers.length}
          </span>
        </h2>
        <ol className="space-y-3">
          {orderedPlayers.map((p, i) => {
            const isFirst = i === 0;
            const hasSpoken = spokenPlayerIds.includes(p.id);
            return (
              <li
                key={p.id}
                className={`flex items-center gap-4 rounded-2xl border-2 px-5 py-5 transition-colors ${
                  hasSpoken
                    ? 'border-green-500 bg-green-500/10'
                    : isFirst
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-gray-700 bg-gray-800'
                }`}
              >
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl font-black ${
                    hasSpoken
                      ? 'bg-green-500 text-white'
                      : isFirst
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {hasSpoken ? '✓' : i + 1}
                </span>
                <span
                  className={`text-3xl font-black ${
                    hasSpoken
                      ? 'text-green-400'
                      : isFirst
                      ? 'text-orange-400'
                      : 'text-white'
                  }`}
                >
                  {p.name}
                </span>
                {isFirst && !hasSpoken && (
                  <span className="ml-auto rounded-full bg-orange-500/20 px-3 py-1 text-sm font-bold uppercase tracking-widest text-orange-400">
                    Empieza
                  </span>
                )}
                {hasSpoken && (
                  <span className="ml-auto rounded-full bg-green-500/20 px-3 py-1 text-sm font-bold uppercase tracking-widest text-green-400">
                    Habló
                  </span>
                )}
                {!hasSpoken && (
                  <button
                    onClick={() => markPlayerSpoken(p.id)}
                    className="ml-auto rounded-xl bg-gray-700 px-5 py-3 text-lg font-bold text-white active:scale-95 active:bg-green-600"
                  >
                    Marcar
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <button
        onClick={() => goToVoting()}
        disabled={spokenPlayerIds.length < orderedPlayers.length}
        className="w-full max-w-sm self-center rounded-2xl bg-purple-600 py-8 text-2xl font-black text-white shadow-lg shadow-purple-600/30 transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
      >
        Ir a Votación
      </button>
    </div>
  );
}
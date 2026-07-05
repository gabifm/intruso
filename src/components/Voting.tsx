import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import type { PlayerId } from '../store/gameStore';

export default function Voting() {
  const phase = useGameStore((s) => s.phase);
  const players = useGameStore((s) => s.players);
  const accusePlayer = useGameStore((s) => s.accusePlayer);

  const [confirmId, setConfirmId] = useState<PlayerId | null>(null);

  if (phase !== 'VOTING') return null;

  const accused = players.find((p) => p.id === confirmId) ?? null;

  function handleConfirm() {
    if (confirmId === null) return;
    const id = confirmId;
    setConfirmId(null);
    accusePlayer(id);
  }

  return (
    <div className="flex h-full flex-col px-6 py-8">
      <header className="mb-8 text-center">
        <h2 className="text-4xl font-black text-white">Who is the Imposter?</h2>
        <p className="mt-2 text-lg text-gray-400">Tap a player to accuse.</p>
      </header>

      <ul className="flex-1 space-y-3 overflow-y-auto">
        {players.map((p) => (
          <li key={p.id}>
            <button
              onClick={() => setConfirmId(p.id)}
              className="w-full rounded-2xl bg-gray-800 py-7 text-3xl font-bold text-white active:scale-95"
            >
              {p.name}
            </button>
          </li>
        ))}
      </ul>

      {accused && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6"
          onClick={() => setConfirmId(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-gray-900 p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-2 text-lg text-gray-400">Accuse</p>
            <p className="mb-8 text-4xl font-black text-white break-words">
              {accused.name}
            </p>
            <div className="space-y-3">
              <button
                onClick={handleConfirm}
                className="w-full rounded-2xl bg-red-500 py-6 text-2xl font-black text-white active:scale-95"
              >
                Confirm Accusation
              </button>
              <button
                onClick={() => setConfirmId(null)}
                className="w-full rounded-2xl bg-gray-700 py-5 text-xl font-bold text-white active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';

export default function RoleReveal() {
  const phase = useGameStore((s) => s.phase);
  const players = useGameStore((s) => s.players);
  const currentRevealIndex =
    useGameStore((s) => (s.phase === 'ROLE_REVEAL' ? s.currentRevealIndex : 0));
  const category = useGameStore((s) => s.category);
  const word = useGameStore((s) => s.word);
  const roles = useGameStore((s) => s.roles);
  const nextPlayerRoleReveal = useGameStore((s) => s.nextPlayerRoleReveal);

  const [revealed, setRevealed] = useState(false);

  // Reset reveal state whenever the current player changes.
  useEffect(() => {
    setRevealed(false);
  }, [currentRevealIndex]);

  if (phase !== 'ROLE_REVEAL') return null;

  const player = players[currentRevealIndex];
  if (!player) return null;

  const role = roles[player.id];

  function handleContinue() {
    setRevealed(false);
    nextPlayerRoleReveal();
  }

  if (!revealed) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 text-2xl text-gray-400">Pass the phone to</p>
        <h2 className="mb-12 text-6xl font-black text-white break-words">
          {player.name}
        </h2>
        <button
          onClick={() => setRevealed(true)}
          className="w-full max-w-sm rounded-2xl bg-orange-500 py-8 text-2xl font-black text-white shadow-lg shadow-orange-500/30 active:scale-95"
        >
          Tap to reveal role
        </button>
        <p className="mt-8 text-lg text-gray-500">
          Make sure no one else is looking.
        </p>
      </div>
    );
  }

  const isImposter = role === 'IMPOSTER';

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <h2
        className={`mb-8 text-6xl font-black ${
          isImposter ? 'text-red-500' : 'text-green-500'
        }`}
      >
        {isImposter ? 'You are the IMPOSTER' : 'You are a Civilian'}
      </h2>

      <div className="mb-12 w-full max-w-md space-y-4">
        <div className="rounded-2xl bg-gray-800 px-6 py-5">
          <p className="text-sm font-bold uppercase tracking-widest text-gray-500">
            Category
          </p>
          <p className="mt-1 text-4xl font-black text-white">
            {category ?? '???'}
          </p>
        </div>

        {!isImposter && (
          <div className="rounded-2xl bg-gray-800 px-6 py-5">
            <p className="text-sm font-bold uppercase tracking-widest text-gray-500">
              Secret Word
            </p>
            <p className="mt-1 text-4xl font-black text-orange-400">
              {word ?? '???'}
            </p>
          </div>
        )}
      </div>

      <button
        onClick={handleContinue}
        className="w-full max-w-sm rounded-2xl bg-gray-700 py-8 text-2xl font-black text-white active:scale-95"
      >
        Hide and Continue
      </button>
    </div>
  );
}
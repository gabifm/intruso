import { useGameStore } from '../store/gameStore';

export default function Resolution() {
  const phase = useGameStore((s) => s.phase);
  const accusedId =
    useGameStore((s) => (s.phase === 'RESOLUTION' ? s.accusedId : null)) ?? null;
  const intruderWon =
    useGameStore((s) => (s.phase === 'RESOLUTION' ? s.intruderWon : false)) ?? false;
  const players = useGameStore((s) => s.players);
  const imposterId = useGameStore((s) => s.imposterId);
  const category = useGameStore((s) => s.category);
  const word = useGameStore((s) => s.word);
  const resetGame = useGameStore((s) => s.resetGame);

  if (phase !== 'RESOLUTION') return null;

  const accused = players.find((p) => p.id === accusedId) ?? null;
  const imposter = players.find((p) => p.id === imposterId) ?? null;
  const caughtImposter = !intruderWon;

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <h2
        className={`mb-3 text-5xl font-black ${
          caughtImposter ? 'text-green-500' : 'text-red-500'
        }`}
      >
        {caughtImposter ? 'CIVILIANS WIN!' : 'IMPOSTER WINS!'}
      </h2>

      <p className="mb-8 text-2xl text-white">
        {caughtImposter
          ? 'You caught the Imposter!'
          : `${accused?.name ?? 'They'} was innocent.`}
      </p>

      <div className="mb-8 w-full max-w-md space-y-4">
        <div className="rounded-2xl bg-gray-800 px-6 py-5">
          <p className="text-sm font-bold uppercase tracking-widest text-gray-500">
            The Imposter was
          </p>
          <p className="mt-1 text-3xl font-black text-red-400">
            {imposter?.name ?? '???'}
          </p>
        </div>

        <div className="rounded-2xl bg-gray-800 px-6 py-5">
          <p className="text-sm font-bold uppercase tracking-widest text-gray-500">
            Category
          </p>
          <p className="mt-1 text-3xl font-black text-white">
            {category ?? '???'}
          </p>
        </div>

        <div className="rounded-2xl bg-gray-800 px-6 py-5">
          <p className="text-sm font-bold uppercase tracking-widest text-gray-500">
            Secret Word
          </p>
          <p className="mt-1 text-3xl font-black text-orange-400">
            {word ?? '???'}
          </p>
        </div>
      </div>

      <button
        onClick={() => resetGame()}
        className="w-full max-w-sm rounded-2xl bg-orange-500 py-8 text-2xl font-black text-white shadow-lg shadow-orange-500/30 active:scale-95"
      >
        Play Again
      </button>
    </div>
  );
}
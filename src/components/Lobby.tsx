import { useState, type FormEvent } from 'react';
import { useGameStore } from '../store/gameStore';
import { GAME_PACKS } from '../data/packs';

export default function Lobby() {
  const players = useGameStore((s) => s.players);
  const addPlayer = useGameStore((s) => s.addPlayer);
  const removePlayer = useGameStore((s) => s.removePlayer);
  const startGame = useGameStore((s) => s.startGame);

  const [name, setName] = useState('');
  const [selectedPackId, setSelectedPackId] = useState<string>(
    GAME_PACKS[0]?.id ?? ''
  );

  const canStart = players.length >= 3 && selectedPackId !== '';

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    addPlayer(name);
    setName('');
  }

  function handleStart() {
    if (!canStart) return;
    startGame(selectedPackId);
  }

  return (
    <div className="flex h-full flex-col px-6 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-5xl font-black tracking-tight text-white">
          El Intruso
        </h1>
        <p className="mt-2 text-lg text-gray-400">
          Add players to begin. Minimum 3.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="mb-6 flex gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Player name"
          maxLength={20}
          autoComplete="off"
          autoCapitalize="words"
          className="w-full rounded-2xl border border-gray-700 bg-gray-800 px-5 py-4 text-2xl text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="shrink-0 rounded-2xl bg-gray-800 px-8 text-2xl font-bold text-white active:scale-95 disabled:opacity-40"
        >
          Add
        </button>
      </form>

      <ul className="mb-6 space-y-3 overflow-y-auto">
        {players.map((p, i) => (
          <li
            key={p.id}
            className="flex items-center justify-between rounded-2xl bg-gray-800 px-5 py-4"
          >
            <div className="flex items-center gap-3">
              {p.isHost && (
                <span className="rounded-full bg-orange-500/20 px-3 py-1 text-sm font-bold text-orange-400">
                  HOST
                </span>
              )}
              <span className="text-2xl font-semibold text-white">
                {i + 1}. {p.name}
              </span>
            </div>
            <button
              onClick={() => removePlayer(p.name)}
              aria-label={`Remove ${p.name}`}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15 text-3xl font-bold text-red-400 active:scale-90"
            >
              ×
            </button>
          </li>
        ))}
        {players.length === 0 && (
          <li className="mt-6 text-center text-xl text-gray-600">
            No players yet.
          </li>
        )}
      </ul>

      <section className="mb-6">
        <h2 className="mb-3 text-xl font-bold uppercase tracking-widest text-gray-500">
          Select Deck
        </h2>
        <div className="space-y-3">
          {GAME_PACKS.map((pack) => {
            const selected = pack.id === selectedPackId;
            return (
              <button
                key={pack.id}
                onClick={() => setSelectedPackId(pack.id)}
                className={`w-full rounded-2xl border-2 px-5 py-5 text-left active:scale-95 ${
                  selected
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-gray-700 bg-gray-800'
                }`}
              >
                <p
                  className={`text-2xl font-black ${
                    selected ? 'text-orange-400' : 'text-white'
                  }`}
                >
                  {pack.name}
                </p>
                <p className="mt-1 text-base text-gray-400">
                  {pack.description}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  {pack.categories.length} categories
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <button
        onClick={handleStart}
        disabled={!canStart}
        className="w-full rounded-2xl bg-orange-500 py-6 text-2xl font-black text-white shadow-lg shadow-orange-500/30 active:scale-95 disabled:bg-gray-700 disabled:text-gray-500 disabled:shadow-none"
      >
        {canStart ? 'Start Game' : `Need ${3 - players.length} more`}
      </button>
    </div>
  );
}
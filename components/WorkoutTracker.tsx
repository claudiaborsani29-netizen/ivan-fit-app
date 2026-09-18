'use client';

import { useEffect, useState } from 'react';
import { todayWorkout } from '@/lib/data';

type Entry = { kg: string; reps: string; done: boolean };

export default function WorkoutTracker() {
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const exercise = todayWorkout[exerciseIndex];
  const [entries, setEntries] = useState<Record<number, Entry[]>>({});
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const rows = entries[exercise.id] ?? Array.from({ length: exercise.sets }, () => ({
    kg: '', reps: exercise.targetReps, done: false
  }));

  const update = (index: number, patch: Partial<Entry>) => {
    const next = [...rows];
    next[index] = { ...next[index], ...patch };
    setEntries({ ...entries, [exercise.id]: next });
    localStorage.setItem('ivan-fit-workout', JSON.stringify({ ...entries, [exercise.id]: next }));
  };

  const time = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return (
    <div className="space-y-5">
      <div className="rounded-[2rem] border border-[#D6A62E]/30 bg-[#D6A62E]/[0.06] p-6">
        <div className="text-xs font-black uppercase tracking-[0.25em] text-[#D6A62E]">
          Esercizio {exerciseIndex + 1} di {todayWorkout.length}
        </div>
        <h2 className="mt-2 text-3xl font-black">{exercise.name}</h2>
        <div className="mt-3 text-sm text-white/55">Ultima volta: <b className="text-white">{exercise.last}</b></div>
        <div className="mt-1 text-sm text-[#D6A62E]">Suggerimento: {exercise.suggested}</div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#151515]">
        <div className="grid grid-cols-[50px_1fr_1fr_55px] border-b border-white/10 px-4 py-3 text-xs uppercase text-white/35">
          <span>Serie</span><span>Kg</span><span>Reps</span><span>OK</span>
        </div>
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-[50px_1fr_1fr_55px] items-center border-b border-white/5 px-4 py-3 last:border-0">
            <b>{i + 1}</b>
            <input value={row.kg} onChange={(e) => update(i, { kg: e.target.value })} inputMode="decimal"
              placeholder="80" className="w-20 rounded-xl border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-[#D6A62E]" />
            <input value={row.reps} onChange={(e) => update(i, { reps: e.target.value })} inputMode="numeric"
              className="w-20 rounded-xl border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-[#D6A62E]" />
            <button onClick={() => update(i, { done: !row.done })}
              className={`h-9 w-9 rounded-full font-black ${row.done ? 'bg-[#D6A62E] text-black' : 'border border-white/20 text-white/30'}`}>
              ✓
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
        <div><div className="text-xs uppercase text-white/35">Recupero</div><div className="text-3xl font-black">{time}</div></div>
        <div className="flex gap-2">
          <button onClick={() => setRunning(!running)} className="rounded-full bg-[#D6A62E] px-5 py-3 font-black text-black">{running ? 'Pausa' : 'Avvia'}</button>
          <button onClick={() => { setRunning(false); setSeconds(0); }} className="rounded-full border border-white/15 px-5 py-3 font-bold">Reset</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button disabled={exerciseIndex === 0} onClick={() => setExerciseIndex((x) => x - 1)}
          className="rounded-full border border-white/15 py-3 font-bold disabled:opacity-25">← Precedente</button>
        <button disabled={exerciseIndex === todayWorkout.length - 1} onClick={() => setExerciseIndex((x) => x + 1)}
          className="rounded-full bg-[#D6A62E] py-3 font-black text-black disabled:opacity-25">Successivo →</button>
      </div>
    </div>
  );
}

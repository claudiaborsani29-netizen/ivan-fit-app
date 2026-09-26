'use client';

import { useEffect, useMemo, useState } from 'react';

type ExerciseInfo = {
  id: string;
  name: string;
  muscle_group: string | null;
  description: string | null;
};

type SessionExercise = {
  id: string;
  exercise_id: string;
  exercise_order?: number | null;
  sets?: number | null;
  target_reps?: string | null;
  target_weight?: number | null;
  rest_seconds?: number | null;
  notes?: string | null;
  section?: string | null;
  week_1?: string | null;
  week_2?: string | null;
  week_3?: string | null;
  week_4?: string | null;
  exercises?: ExerciseInfo | ExerciseInfo[] | null;
};

type WorkoutSession = {
  id: string;
  name: string;
  day_order: number;
  focus: string | null;
  cardio_notes: string | null;
  exercises: SessionExercise[];
};

type Entry = { kg: string; reps: string; done: boolean };

function infoOf(exercise: SessionExercise) {
  if (!exercise.exercises) return null;
  return Array.isArray(exercise.exercises)
    ? exercise.exercises[0] ?? null
    : exercise.exercises;
}

export default function WorkoutTracker({ session }: { session: WorkoutSession }) {
  const exercises = useMemo(
    () =>
      [...session.exercises]
        .filter((item) => item.section !== 'warmup')
        .sort((a, b) => (a.exercise_order ?? 0) - (b.exercise_order ?? 0)),
    [session.exercises]
  );

  const warmup = useMemo(
    () =>
      [...session.exercises]
        .filter((item) => item.section === 'warmup')
        .sort((a, b) => (a.exercise_order ?? 0) - (b.exercise_order ?? 0)),
    [session.exercises]
  );

  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [entries, setEntries] = useState<Record<string, Entry[]>>({});
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setExerciseIndex(0);
    setSeconds(0);
    setRunning(false);
    const saved = localStorage.getItem(`ivan-fit-workout-${session.id}`);
    if (!saved) return setEntries({});
    try { setEntries(JSON.parse(saved)); } catch { setEntries({}); }
  }, [session.id]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  if (exercises.length === 0) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-[#151515] p-6">
        <div className="text-xs font-black uppercase tracking-[0.25em] text-[#D6A62E]">{session.name}</div>
        <h2 className="mt-3 text-2xl font-black">Nessun esercizio inserito</h2>
      </div>
    );
  }

  const exercise = exercises[exerciseIndex];
  const info = infoOf(exercise);
  const rows =
    entries[exercise.id] ??
    Array.from({ length: Math.max(exercise.sets ?? 1, 1) }, () => ({
      kg: exercise.target_weight != null ? String(exercise.target_weight) : '',
      reps: exercise.target_reps ?? '',
      done: false,
    }));

  const update = (index: number, patch: Partial<Entry>) => {
    const next = [...rows];
    next[index] = { ...next[index], ...patch };
    const updated = { ...entries, [exercise.id]: next };
    setEntries(updated);
    localStorage.setItem(`ivan-fit-workout-${session.id}`, JSON.stringify(updated));
  };

  const resetTimer = () => { setRunning(false); setSeconds(0); };
  const goTo = (index: number) => { setExerciseIndex(index); resetTimer(); };
  const time = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  const progression = [
    ['S1', exercise.week_1],
    ['S2', exercise.week_2],
    ['S3', exercise.week_3],
    ['S4', exercise.week_4],
  ].filter(([, value]) => value);

  return (
    <div className="space-y-5">
      <div className="rounded-[2rem] border border-[#D6A62E]/30 bg-[#D6A62E]/[0.06] p-6">
        <div className="text-xs font-black uppercase tracking-[0.25em] text-[#D6A62E]">{session.name}</div>
        {session.focus && <div className="mt-2 text-sm text-white/50">{session.focus}</div>}

        {warmup.length > 0 && exerciseIndex === 0 && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-white/35">Riscaldamento / Mobilità</div>
            <div className="mt-3 space-y-2">
              {warmup.map((item) => (
                <div key={item.id}>
                  <div className="font-bold">{infoOf(item)?.name || 'Esercizio'}</div>
                  {(item.target_reps || item.notes) && (
                    <div className="mt-1 text-sm text-white/45">
                      {[item.target_reps, item.notes].filter(Boolean).join(' · ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 text-xs font-black uppercase tracking-[0.25em] text-[#D6A62E]">
          Esercizio {exerciseIndex + 1} di {exercises.length}
        </div>
        <h2 className="mt-2 text-3xl font-black">{info?.name || 'Esercizio'}</h2>
        {info?.muscle_group && <div className="mt-2 text-sm font-bold uppercase tracking-[0.15em] text-white/35">{info.muscle_group}</div>}

        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          {exercise.sets != null && <span className="rounded-full border border-white/10 px-3 py-1.5 text-white/60">{exercise.sets} serie</span>}
          {exercise.target_reps && <span className="rounded-full border border-white/10 px-3 py-1.5 text-white/60">{exercise.target_reps} reps</span>}
          {exercise.rest_seconds != null && <span className="rounded-full border border-white/10 px-3 py-1.5 text-white/60">Recupero {exercise.rest_seconds}s</span>}
        </div>

        {exercise.notes && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs uppercase tracking-[0.15em] text-white/35">Note tecniche</div>
            <div className="mt-2 text-sm text-white/70">{exercise.notes}</div>
          </div>
        )}

        {progression.length > 0 && (
          <div className="mt-4">
            <div className="text-xs uppercase tracking-[0.15em] text-white/35">Progressione</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {progression.map(([week, value]) => (
                <div key={week} className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <div className="text-xs font-black text-[#D6A62E]">{week}</div>
                  <div className="mt-1 text-sm text-white/70">{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#151515]">
        <div className="grid grid-cols-[50px_1fr_1fr_55px] border-b border-white/10 px-4 py-3 text-xs uppercase text-white/35">
          <span>Serie</span><span>Kg</span><span>Reps</span><span>OK</span>
        </div>
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-[50px_1fr_1fr_55px] items-center border-b border-white/5 px-4 py-3 last:border-0">
            <b>{i + 1}</b>
            <input value={row.kg} onChange={(e) => update(i, { kg: e.target.value })} inputMode="decimal" placeholder="Kg"
              className="w-20 rounded-xl border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-[#D6A62E]" />
            <input value={row.reps} onChange={(e) => update(i, { reps: e.target.value })} inputMode="text"
              className="w-20 rounded-xl border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-[#D6A62E]" />
            <button type="button" onClick={() => update(i, { done: !row.done })}
              className={`h-9 w-9 rounded-full font-black ${row.done ? 'bg-[#D6A62E] text-black' : 'border border-white/20 text-white/30'}`}>✓</button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
        <div>
          <div className="text-xs uppercase text-white/35">Recupero</div>
          <div className="text-3xl font-black">{time}</div>
          {exercise.rest_seconds != null && <div className="mt-1 text-xs text-white/35">Target: {exercise.rest_seconds} sec</div>}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setRunning(!running)} className="rounded-full bg-[#D6A62E] px-5 py-3 font-black text-black">{running ? 'Pausa' : 'Avvia'}</button>
          <button type="button" onClick={resetTimer} className="rounded-full border border-white/15 px-5 py-3 font-bold">Reset</button>
        </div>
      </div>

      {exerciseIndex === exercises.length - 1 && session.cardio_notes && (
        <div className="rounded-[2rem] border border-white/10 bg-[#151515] p-5">
          <div className="text-xs font-black uppercase tracking-[0.2em] text-[#D6A62E]">Cardio post workout</div>
          <div className="mt-2 text-white/70">{session.cardio_notes}</div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button type="button" disabled={exerciseIndex === 0} onClick={() => goTo(exerciseIndex - 1)}
          className="rounded-full border border-white/15 py-3 font-bold disabled:opacity-25">← Precedente</button>
        <button type="button" disabled={exerciseIndex === exercises.length - 1} onClick={() => goTo(exerciseIndex + 1)}
          className="rounded-full bg-[#D6A62E] py-3 font-black text-black disabled:opacity-25">Successivo →</button>
      </div>
    </div>
  );
}

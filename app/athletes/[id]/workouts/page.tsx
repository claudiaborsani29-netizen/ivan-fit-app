'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Exercise = {
  id: string;
  name: string;
  muscle_group: string;
  description: string | null;
};

type SessionExercise = {
  localId: string;
  section: 'warmup' | 'workout';
  muscleGroup: string;
  exerciseId: string;
  sets: string;
  reps: string;
  rest: string;
  notes: string;
  week1: string;
  week2: string;
  week3: string;
  week4: string;
};

const emptyExercise = (
  section: 'warmup' | 'workout'
): SessionExercise => ({
  localId: `${Date.now()}-${Math.random()}`,
  section,
  muscleGroup: section === 'warmup' ? 'Mobilità' : '',
  exerciseId: '',
  sets: '',
  reps: '',
  rest: '',
  notes: '',
  week1: '',
  week2: '',
  week3: '',
  week4: '',
});

export default function WorkoutsPage() {
  const params = useParams();
  const router = useRouter();

  const athleteId = params.id as string;

  const [creatingSession, setCreatingSession] = useState(false);

  const [sessionName, setSessionName] = useState('Seduta A');
  const [focus, setFocus] = useState('');
  const [cardio, setCardio] = useState('');

  const [catalog, setCatalog] = useState<Exercise[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [saving, setSaving] = useState(false);
const [saveError, setSaveError] = useState('');
const [saved, setSaved] = useState(false);

  const [sessionExercises, setSessionExercises] = useState<
    SessionExercise[]
  >([]);

  useEffect(() => {
    const loadExercises = async () => {
      try {
        setCatalogLoading(true);
        setCatalogError('');

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push('/');
          return;
        }

        const response = await fetch('/api/exercises', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || 'Errore caricamento esercizi.'
          );
        }

        setCatalog(result.exercises ?? []);
      } catch (error) {
        setCatalogError(
          error instanceof Error
            ? error.message
            : 'Errore caricamento esercizi.'
        );
      } finally {
        setCatalogLoading(false);
      }
    };

    loadExercises();
  }, [router]);

  const muscleGroups = useMemo(() => {
    return Array.from(
      new Set(
        catalog
          .map((exercise) => exercise.muscle_group)
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b, 'it'));
  }, [catalog]);

  const openNewSession = () => {
    setSessionName('Seduta A');
    setFocus('');
    setCardio('');
    setSessionExercises([]);
    setCreatingSession(true);
  };

  const closeNewSession = () => {
    setCreatingSession(false);
  };

  const addExercise = (section: 'warmup' | 'workout') => {
    setSessionExercises((current) => [
      ...current,
      emptyExercise(section),
    ]);
  };

  const updateExercise = (
    localId: string,
    field: keyof SessionExercise,
    value: string
  ) => {
    setSessionExercises((current) =>
      current.map((exercise) => {
        if (exercise.localId !== localId) {
          return exercise;
        }

        if (field === 'muscleGroup') {
          return {
            ...exercise,
            muscleGroup: value,
            exerciseId: '',
          };
        }

        return {
          ...exercise,
          [field]: value,
        };
      })
    );
  };

  const removeExercise = (localId: string) => {
    setSessionExercises((current) =>
      current.filter(
        (exercise) => exercise.localId !== localId
      )
    );
  };
const saveSession = async () => {
  try {
    setSaving(true);
    setSaveError('');
    setSaved(false);

    if (!sessionName.trim()) {
      setSaveError('Inserisci il nome della seduta.');
      return;
    }

    const selectedExercises = sessionExercises.filter(
      (exercise) => exercise.exerciseId
    );

    if (selectedExercises.length === 0) {
      setSaveError('Inserisci almeno un esercizio.');
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push('/');
      return;
    }

    const response = await fetch('/api/workout-sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        athleteId,
        name: sessionName,
        focus,
        cardio,
        exercises: selectedExercises.map((exercise) => ({
          exerciseId: exercise.exerciseId,
          section: exercise.section,
          sets: exercise.sets,
          reps: exercise.reps,
          rest: exercise.rest,
          notes: exercise.notes,
          week1: exercise.week1,
          week2: exercise.week2,
          week3: exercise.week3,
          week4: exercise.week4,
        })),
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || 'Errore durante il salvataggio.'
      );
    }

    setSaved(true);

    setTimeout(() => {
      setCreatingSession(false);
      setSaved(false);
      setSessionExercises([]);
      setSessionName('Seduta A');
      setFocus('');
      setCardio('');
    }, 1000);
  } catch (error) {
    setSaveError(
      error instanceof Error
        ? error.message
        : 'Errore durante il salvataggio.'
    );
  } finally {
    setSaving(false);
  }
};
  const warmupExercises = sessionExercises.filter(
    (exercise) => exercise.section === 'warmup'
  );

  const workoutExercises = sessionExercises.filter(
    (exercise) => exercise.section === 'workout'
  );

  const renderExerciseEditor = (
    exercise: SessionExercise,
    index: number
  ) => {
    const availableExercises = catalog.filter(
      (catalogExercise) =>
        catalogExercise.muscle_group === exercise.muscleGroup
    );

    return (
      <div
        key={exercise.localId}
        className="rounded-[1.5rem] border border-white/10 bg-[#151515] p-5"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm font-black text-[#D6A62E]">
            Esercizio {index + 1}
          </div>

          <button
            type="button"
            onClick={() => removeExercise(exercise.localId)}
            className="text-xs font-bold text-white/35 transition hover:text-red-400"
          >
            Rimuovi
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-bold uppercase tracking-[0.12em] text-white/40">
              Gruppo muscolare
            </label>

            <select
              value={exercise.muscleGroup}
              onChange={(event) =>
                updateExercise(
                  exercise.localId,
                  'muscleGroup',
                  event.target.value
                )
              }
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#D6A62E]"
            >
              <option value="">Seleziona gruppo</option>

              {muscleGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-[0.12em] text-white/40">
              Esercizio
            </label>

            <select
              value={exercise.exerciseId}
              onChange={(event) =>
                updateExercise(
                  exercise.localId,
                  'exerciseId',
                  event.target.value
                )
              }
              disabled={!exercise.muscleGroup}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#D6A62E] disabled:opacity-40"
            >
              <option value="">
                {exercise.muscleGroup
                  ? 'Seleziona esercizio'
                  : 'Prima scegli il gruppo'}
              </option>

              {availableExercises.map((catalogExercise) => (
                <option
                  key={catalogExercise.id}
                  value={catalogExercise.id}
                >
                  {catalogExercise.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-[0.12em] text-white/40">
              Serie
            </label>

            <input
              type="text"
              value={exercise.sets}
              onChange={(event) =>
                updateExercise(
                  exercise.localId,
                  'sets',
                  event.target.value
                )
              }
              placeholder="Es. 4"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D6A62E]"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-[0.12em] text-white/40">
              Ripetizioni / durata
            </label>

            <input
              type="text"
              value={exercise.reps}
              onChange={(event) =>
                updateExercise(
                  exercise.localId,
                  'reps',
                  event.target.value
                )
              }
              placeholder="Es. 8-10"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D6A62E]"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-[0.12em] text-white/40">
              Recupero
            </label>

            <input
              type="text"
              value={exercise.rest}
              onChange={(event) =>
                updateExercise(
                  exercise.localId,
                  'rest',
                  event.target.value
                )
              }
              placeholder="Es. 90 sec"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D6A62E]"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs font-bold uppercase tracking-[0.12em] text-white/40">
            Note tecniche
          </label>

          <textarea
            value={exercise.notes}
            onChange={(event) =>
              updateExercise(
                exercise.localId,
                'notes',
                event.target.value
              )
            }
            placeholder="Indicazioni tecniche, tempo, esecuzione..."
            rows={2}
            className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D6A62E]"
          />
        </div>

        {exercise.section === 'workout' && (
          <div className="mt-5">
            <div className="text-xs font-black uppercase tracking-[0.15em] text-[#D6A62E]">
              Progressione
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <input
                type="text"
                value={exercise.week1}
                onChange={(event) =>
                  updateExercise(
                    exercise.localId,
                    'week1',
                    event.target.value
                  )
                }
                placeholder="S1 - Es. 4x8 RIR3"
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D6A62E]"
              />

              <input
                type="text"
                value={exercise.week2}
                onChange={(event) =>
                  updateExercise(
                    exercise.localId,
                    'week2',
                    event.target.value
                  )
                }
                placeholder="S2"
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D6A62E]"
              />

              <input
                type="text"
                value={exercise.week3}
                onChange={(event) =>
                  updateExercise(
                    exercise.localId,
                    'week3',
                    event.target.value
                  )
                }
                placeholder="S3"
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D6A62E]"
              />

              <input
                type="text"
                value={exercise.week4}
                onChange={(event) =>
                  updateExercise(
                    exercise.localId,
                    'week4',
                    event.target.value
                  )
                }
                placeholder="S4 / Scarico"
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D6A62E]"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#090A0A] px-5 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => router.push(`/athletes/${athleteId}`)}
          className="text-sm text-white/50 transition hover:text-white"
        >
          ← Torna alla scheda allievo
        </button>

        <header className="mt-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.3em] text-[#D6A62E]">
              Ivan Fit
            </div>

            <h1 className="mt-2 text-4xl font-black">
              Programmazione
            </h1>

            <p className="mt-2 text-white/40">
              Gestisci la scheda di allenamento dell’allievo.
            </p>
          </div>

          <button
            type="button"
            onClick={openNewSession}
            className="rounded-full bg-[#D6A62E] px-6 py-3 text-sm font-black text-black transition hover:scale-[1.02]"
          >
            + Nuova seduta
          </button>
        </header>

        {catalogError && (
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {catalogError}
          </div>
        )}

        {creatingSession && (
          <section className="mt-8 rounded-[2rem] border border-[#D6A62E]/30 bg-[#151515] p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.2em] text-[#D6A62E]">
                  Nuova seduta
                </div>

                <h2 className="mt-2 text-2xl font-black">
                  Crea la programmazione
                </h2>
              </div>

              <button
                type="button"
                onClick={closeNewSession}
                className="text-sm font-bold text-white/40 transition hover:text-white"
              >
                Chiudi
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.15em] text-white/40">
                  Nome seduta
                </label>

                <input
                  type="text"
                  value={sessionName}
                  onChange={(event) =>
                    setSessionName(event.target.value)
                  }
                  placeholder="Es. Seduta A"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D6A62E]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-[0.15em] text-white/40">
                  Specifiche / Focus
                </label>

                <input
                  type="text"
                  value={focus}
                  onChange={(event) =>
                    setFocus(event.target.value)
                  }
                  placeholder="Es. Lower - focus glutei + spinta d'anca"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D6A62E]"
                />
              </div>
            </div>

            <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.15em] text-[#D6A62E]">
                    Riscaldamento
                  </div>

                  <h3 className="mt-2 text-xl font-black">
                    Mobilità e preparazione
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => addExercise('warmup')}
                  disabled={catalogLoading}
                  className="rounded-full border border-[#D6A62E]/40 px-4 py-2 text-sm font-bold text-[#D6A62E] transition hover:bg-[#D6A62E]/10 disabled:opacity-40"
                >
                  {catalogLoading
                    ? 'Caricamento...'
                    : '+ Aggiungi esercizio'}
                </button>
              </div>

              {warmupExercises.length === 0 ? (
                <p className="mt-3 text-sm leading-6 text-white/40">
                  Nessun esercizio di riscaldamento inserito.
                </p>
              ) : (
                <div className="mt-5 space-y-4">
                  {warmupExercises.map((exercise, index) =>
                    renderExerciseEditor(exercise, index)
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.15em] text-[#D6A62E]">
                    Allenamento
                  </div>

                  <h3 className="mt-2 text-xl font-black">
                    Esercizi principali
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => addExercise('workout')}
                  disabled={catalogLoading}
                  className="rounded-full border border-[#D6A62E]/40 px-4 py-2 text-sm font-bold text-[#D6A62E] transition hover:bg-[#D6A62E]/10 disabled:opacity-40"
                >
                  {catalogLoading
                    ? 'Caricamento...'
                    : '+ Aggiungi esercizio'}
                </button>
              </div>

              {workoutExercises.length === 0 ? (
                <p className="mt-3 text-sm leading-6 text-white/40">
                  Nessun esercizio inserito.
                </p>
              ) : (
                <div className="mt-5 space-y-4">
                  {workoutExercises.map((exercise, index) =>
                    renderExerciseEditor(exercise, index)
                  )}
                </div>
              )}
            </div>

            <div className="mt-4">
              <label className="text-xs font-bold uppercase tracking-[0.15em] text-white/40">
                Cardio post allenamento
              </label>

              <textarea
                value={cardio}
                onChange={(event) =>
                  setCardio(event.target.value)
                }
                placeholder="Es. Tapis roulant 15 minuti - inclinazione 8%, velocità 5 km/h"
                rows={3}
                className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D6A62E]"
              />
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={closeNewSession}
                className="rounded-full border border-white/10 px-6 py-3 text-sm font-black text-white/60"
              >
                Annulla
              </button>

<div className="flex flex-col items-end gap-2">
  {saveError && (
    <div className="text-sm font-bold text-red-400">
      {saveError}
    </div>
  )}

  {saved && (
    <div className="text-sm font-bold text-green-400">
      Seduta salvata ✓
    </div>
  )}

  <button
    type="button"
    onClick={saveSession}
    disabled={saving || saved}
    className="rounded-full bg-[#D6A62E] px-6 py-3 text-sm font-black text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
  >
    {saving
      ? 'Salvataggio...'
      : saved
        ? 'Salvata ✓'
        : 'Salva Seduta'}
  </button>
</div>
            </div>
          </section>
        )}

        {!creatingSession && (
          <section className="mt-10">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.2em] text-[#D6A62E]">
                  Scheda attiva
                </div>

                <h2 className="mt-2 text-2xl font-black">
                  Sedute di allenamento
                </h2>
              </div>

              <div className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold text-white/40">
                0 sedute
              </div>
            </div>

            <div className="rounded-[2rem] border border-dashed border-white/15 bg-[#151515] p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#D6A62E]/10 text-2xl text-[#D6A62E]">
                +
              </div>

              <h3 className="mt-5 text-xl font-black">
                Nessuna seduta creata
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/40">
                Crea la prima seduta della scheda. Potrai
                organizzare riscaldamento, allenamento,
                progressioni e cardio.
              </p>

              <button
                type="button"
                onClick={openNewSession}
                className="mt-6 rounded-full border border-[#D6A62E]/40 px-6 py-3 text-sm font-black text-[#D6A62E] transition hover:bg-[#D6A62E]/10"
              >
                Crea Seduta A
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
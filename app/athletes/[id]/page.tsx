'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Athlete = {
  id: string;
  full_name: string;
  plan: string | null;
  goal: string | null;
  next_check: string | null;
};

export default function AthletePage() {
  const params = useParams();
  const router = useRouter();

  const athleteId = params.id as string;

  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState(false);
  const [plan, setPlan] = useState('');
  const [goal, setGoal] = useState('');
  const [nextCheck, setNextCheck] = useState('');

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadAthlete = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          setError('Sessione non disponibile.');
          return;
        }

        const response = await fetch(
          `/api/coach-athletes/${athleteId}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          setError(
            result.error || 'Impossibile caricare l’allievo.'
          );
          return;
        }

        setAthlete(result.athlete);
        setPlan(result.athlete.plan || '');
        setGoal(result.athlete.goal || '');
        setNextCheck(result.athlete.next_check || '');
      } catch (loadError) {
        console.error(loadError);
        setError('Errore durante il caricamento dell’allievo.');
      } finally {
        setLoading(false);
      }
    };

    loadAthlete();
  }, [athleteId]);

  const openEditing = () => {
    if (!athlete) return;

    setPlan(athlete.plan || '');
    setGoal(athlete.goal || '');
    setNextCheck(athlete.next_check || '');
    setSaveError('');
    setSaved(false);
    setEditing(true);
  };

  const closeEditing = () => {
    if (saving) return;

    setEditing(false);
    setSaveError('');
    setSaved(false);
  };

  const saveAthlete = async () => {
    try {
      setSaving(true);
      setSaveError('');
      setSaved(false);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setSaveError('Sessione non disponibile.');
        return;
      }

      const response = await fetch(
        `/api/coach-athletes/${athleteId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            plan,
            goal,
            next_check: nextCheck,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setSaveError(
          result.error || 'Impossibile salvare le modifiche.'
        );
        return;
      }

      setAthlete(result.athlete);
      setPlan(result.athlete.plan || '');
      setGoal(result.athlete.goal || '');
      setNextCheck(result.athlete.next_check || '');

      setSaved(true);

      setTimeout(() => {
        setEditing(false);
        setSaved(false);
      }, 700);
    } catch (saveException) {
      console.error(saveException);
      setSaveError(
        'Errore durante il salvataggio delle modifiche.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090A0A] text-white">
        <div className="text-sm text-white/50">
          Caricamento allievo...
        </div>
      </main>
    );
  }

  if (error || !athlete) {
    return (
      <main className="min-h-screen bg-[#090A0A] px-5 py-8 text-white">
        <div className="mx-auto max-w-3xl">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-white/50"
          >
            ← Torna alla dashboard
          </button>

          <div className="mt-8 rounded-[2rem] border border-red-500/20 bg-red-500/10 p-6 text-red-300">
            {error || 'Allievo non trovato.'}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090A0A] px-5 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => router.push('/')}
          className="text-sm text-white/50 transition hover:text-white"
        >
          ← Dashboard Coach
        </button>

        <header className="mt-8 flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.3em] text-[#D6A62E]">
              Ivan Fit
            </div>

            <h1 className="mt-2 text-4xl font-black">
              {athlete.full_name}
            </h1>

            <div className="mt-2 text-white/40">
              Scheda allievo
            </div>
          </div>

          <button
            type="button"
            onClick={openEditing}
            className="rounded-full bg-[#D6A62E] px-6 py-3 text-sm font-black text-black transition hover:scale-[1.02]"
          >
            Modifica allievo
          </button>
        </header>

        {editing && (
          <section className="mt-8 rounded-[2rem] border border-[#D6A62E]/30 bg-[#151515] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.2em] text-[#D6A62E]">
                  Modifica allievo
                </div>

                <h2 className="mt-2 text-2xl font-black">
                  Dati del percorso
                </h2>
              </div>

              <button
                type="button"
                onClick={closeEditing}
                disabled={saving}
                className="text-sm font-bold text-white/40 transition hover:text-white disabled:opacity-30"
              >
                Chiudi
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.15em] text-white/40">
                  Piano
                </label>

               <select
  value={plan}
  onChange={(event) => setPlan(event.target.value)}
  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#D6A62E]"
>
  <option value="">Seleziona un piano</option>
  <option value="Starter">Starter</option>
  <option value="Elite">Elite</option>
  <option value="Online">Online</option>
  <option value="Premium 90">Premium 90</option>
</select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-[0.15em] text-white/40">
                  Prossimo check
                </label>

                <input
                  type="date"
                  value={nextCheck}
                  onChange={(event) =>
                    setNextCheck(event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#D6A62E]"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-bold uppercase tracking-[0.15em] text-white/40">
                Obiettivo
              </label>

              <textarea
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                placeholder="Es. Aumento forza e miglioramento composizione corporea"
                rows={3}
                className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#D6A62E]"
              />
            </div>

            {saveError && (
              <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {saveError}
              </div>
            )}

            {saved && (
              <div className="mt-4 rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                Modifiche salvate correttamente.
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={saveAthlete}
                disabled={saving}
                className="rounded-full bg-[#D6A62E] px-6 py-3 text-sm font-black text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Salvataggio...' : 'Salva modifiche'}
              </button>
            </div>
          </section>
        )}

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[2rem] border border-white/10 bg-[#151515] p-6">
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-white/35">
              Piano
            </div>

            <div className="mt-3 text-xl font-black text-[#D6A62E]">
              {athlete.plan || 'Non assegnato'}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[#151515] p-6">
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-white/35">
              Prossimo check
            </div>

            <div className="mt-3 text-xl font-black">
              {athlete.next_check
                ? new Date(
                    `${athlete.next_check}T00:00:00`
                  ).toLocaleDateString('it-IT')
                : 'Da programmare'}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[#151515] p-6">
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-white/35">
              Stato
            </div>

            <div className="mt-3 text-xl font-black text-[#D6A62E]">
              Attivo
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-[2rem] border border-white/10 bg-[#151515] p-6">
          <div className="text-xs font-bold uppercase tracking-[0.15em] text-white/35">
            Obiettivo
          </div>

          <div className="mt-3 text-lg font-semibold">
            {athlete.goal || 'Nessun obiettivo inserito.'}
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-[#151515] p-6">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-[#D6A62E]">
              Allenamenti
            </div>

            <h2 className="mt-3 text-2xl font-black">
              Programmazione
            </h2>

            <p className="mt-2 text-sm text-white/40">
              Qui inseriremo le schede e gli allenamenti
              assegnati all’allievo.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[#151515] p-6">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-[#D6A62E]">
              Progressi
            </div>

            <h2 className="mt-3 text-2xl font-black">
              Monitoraggio
            </h2>

            <p className="mt-2 text-sm text-white/40">
              Qui inseriremo peso, misure, foto, record e
              andamento nel tempo.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
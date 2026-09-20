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
      } catch (loadError) {
        console.error(loadError);
        setError('Errore durante il caricamento dell’allievo.');
      } finally {
        setLoading(false);
      }
    };

    loadAthlete();
  }, [athleteId]);

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

        <header className="mt-8">
          <div className="text-xs font-black uppercase tracking-[0.3em] text-[#D6A62E]">
            Ivan Fit
          </div>

          <h1 className="mt-2 text-4xl font-black">
            {athlete.full_name}
          </h1>

          <div className="mt-2 text-white/40">
            Scheda allievo
          </div>
        </header>

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
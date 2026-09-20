'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function WorkoutsPage() {
  const params = useParams();
  const router = useRouter();

  const athleteId = params.id as string;

  const [creatingSession, setCreatingSession] = useState(false);
  const [sessionName, setSessionName] = useState('Seduta A');
  const [focus, setFocus] = useState('');
  const [cardio, setCardio] = useState('');

  const openNewSession = () => {
    setSessionName('Seduta A');
    setFocus('');
    setCardio('');
    setCreatingSession(true);
  };

  const closeNewSession = () => {
    setCreatingSession(false);
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
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#D6A62E]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-[0.15em] text-white/40">
                  Specifiche / Focus
                </label>

                <input
                  type="text"
                  value={focus}
                  onChange={(event) => setFocus(event.target.value)}
                  placeholder="Es. Lower - focus glutei + spinta d'anca"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#D6A62E]"
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
                  disabled
                  className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-white/30"
                >
                  + Aggiungi esercizio
                </button>
              </div>

              <p className="mt-3 text-sm leading-6 text-white/40">
                Qui inseriremo esercizio, serie, durata o
                ripetizioni e indicazioni tecniche.
              </p>
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
                  disabled
                  className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-white/30"
                >
                  + Aggiungi esercizio
                </button>
              </div>

              <div className="mt-5 overflow-x-auto">
                <div className="min-w-[820px]">
                  <div className="grid grid-cols-[1.6fr_.6fr_.8fr_.8fr_1.2fr] gap-3 border-b border-white/10 pb-3 text-xs font-black uppercase tracking-[0.1em] text-white/30">
                    <div>Esercizio</div>
                    <div>Serie</div>
                    <div>Ripetizioni</div>
                    <div>Recupero</div>
                    <div>Note</div>
                  </div>

                  <div className="py-6 text-center text-sm text-white/30">
                    Nessun esercizio inserito.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
              <div className="text-xs font-black uppercase tracking-[0.15em] text-[#D6A62E]">
                Progressione
              </div>

              <h3 className="mt-2 text-xl font-black">
                Programmazione settimanale
              </h3>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {['S1', 'S2', 'S3', 'S4 / Scarico'].map(
                  (week) => (
                    <div
                      key={week}
                      className="rounded-2xl border border-white/10 bg-[#151515] p-4"
                    >
                      <div className="text-sm font-black text-[#D6A62E]">
                        {week}
                      </div>

                      <div className="mt-2 text-xs text-white/30">
                        La progressione verrà impostata per ogni
                        esercizio.
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-bold uppercase tracking-[0.15em] text-white/40">
                Cardio post allenamento
              </label>

              <textarea
                value={cardio}
                onChange={(event) => setCardio(event.target.value)}
                placeholder="Es. Tapis roulant 15 minuti - inclinazione 8%, velocità 5 km/h"
                rows={3}
                className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#D6A62E]"
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

              <button
                type="button"
                disabled
                className="rounded-full bg-[#D6A62E] px-6 py-3 text-sm font-black text-black opacity-40"
              >
                Salva Seduta
              </button>
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
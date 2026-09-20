'use client';

import { useParams, useRouter } from 'next/navigation';

export default function WorkoutsPage() {
  const params = useParams();
  const router = useRouter();

  const athleteId = params.id as string;

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
            className="rounded-full bg-[#D6A62E] px-6 py-3 text-sm font-black text-black transition hover:scale-[1.02]"
          >
            + Nuova seduta
          </button>
        </header>

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
              Crea la prima seduta della scheda. Potrai inserire
              riscaldamento, esercizi, serie, ripetizioni, recuperi,
              note tecniche e progressioni settimanali.
            </p>

            <button
              type="button"
              className="mt-6 rounded-full border border-[#D6A62E]/40 px-6 py-3 text-sm font-black text-[#D6A62E] transition hover:bg-[#D6A62E]/10"
            >
              Crea Seduta A
            </button>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[2rem] border border-white/10 bg-[#151515] p-6">
            <div className="text-xs font-black uppercase tracking-[0.15em] text-white/35">
              Riscaldamento
            </div>

            <div className="mt-3 text-2xl font-black">
              Mobilità
            </div>

            <p className="mt-2 text-sm leading-6 text-white/40">
              Esercizi preparatori, durata, ripetizioni e indicazioni
              tecniche.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[#151515] p-6">
            <div className="text-xs font-black uppercase tracking-[0.15em] text-white/35">
              Allenamento
            </div>

            <div className="mt-3 text-2xl font-black">
              Esercizi
            </div>

            <p className="mt-2 text-sm leading-6 text-white/40">
              Serie, ripetizioni, recupero e note tecniche per ogni
              esercizio.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[#151515] p-6">
            <div className="text-xs font-black uppercase tracking-[0.15em] text-white/35">
              Progressione
            </div>

            <div className="mt-3 text-2xl font-black text-[#D6A62E]">
              S1 · S2 · S3 · S4
            </div>

            <p className="mt-2 text-sm leading-6 text-white/40">
              Programmazione settimanale con RIR, variazioni e
              settimana di scarico.
            </p>
          </div>
        </section>

      </div>
    </main>
  );
}
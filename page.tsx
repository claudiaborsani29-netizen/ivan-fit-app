'use client';

import { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import WorkoutTracker from '@/components/WorkoutTracker';
import { athletes, todayWorkout } from '@/lib/data';

export default function Home() {
  const [role, setRole] = useState<'athlete' | 'coach'>('athlete');
  const [tab, setTab] = useState('home');

  if (role === 'coach') {
    return (
      <main className="min-h-screen bg-[#090A0A] px-5 py-8 text-white">
        <div className="mx-auto max-w-5xl">
          <header className="flex items-center justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-[#D6A62E]">Ivan Fit</div>
              <h1 className="mt-2 text-3xl font-black">Dashboard Coach</h1>
            </div>
            <button onClick={() => setRole('athlete')} className="rounded-full border border-white/15 px-4 py-2 text-sm">Vista allievo</button>
          </header>

          <section className="mt-8 grid gap-4 sm:grid-cols-3">
            {[['Allievi attivi', '18'], ['Check questa settimana', '6'], ['Aderenza media', '91%']].map(([a,b]) => (
              <div key={a} className="rounded-[2rem] border border-white/10 bg-[#151515] p-6">
                <div className="text-sm text-white/45">{a}</div><div className="mt-2 text-4xl font-black text-[#D6A62E]">{b}</div>
              </div>
            ))}
          </section>

          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-black">Allievi</h2>
              <button className="rounded-full bg-[#D6A62E] px-5 py-3 text-sm font-black text-black">+ Nuovo allievo</button>
            </div>
            <div className="space-y-3">
              {athletes.map((a) => (
                <div key={a.id} className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-[#151515] p-5 md:grid-cols-[1fr_1fr_120px_160px] md:items-center">
                  <div className="font-black">{a.name}</div>
                  <div className="text-sm text-white/55">{a.plan}</div>
                  <div className="text-sm"><span className="text-white/35">Aderenza </span>{a.adherence}</div>
                  <div className="text-sm text-[#D6A62E]">Check: {a.nextCheck}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090A0A] px-5 pb-28 pt-7 text-white">
      <div className="mx-auto max-w-xl">
        <header className="flex items-center justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.3em] text-[#D6A62E]">Ivan Fit</div>
            <div className="mt-1 text-sm text-white/45">Personal Training • Milano</div>
          </div>
          <button onClick={() => setRole('coach')} className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold">Coach</button>
        </header>

        {tab === 'home' && (
          <div className="mt-9">
            <div className="text-sm uppercase tracking-[0.2em] text-white/35">Ciao Claudia</div>
            <h1 className="mt-2 text-4xl font-black">Pronta per oggi?</h1>

            <section className="mt-7 rounded-[2rem] border border-[#D6A62E]/35 bg-[linear-gradient(145deg,rgba(214,166,46,.16),rgba(21,21,21,1))] p-6">
              <div className="text-xs font-black uppercase tracking-[0.25em] text-[#D6A62E]">Allenamento di oggi</div>
              <h2 className="mt-3 text-3xl font-black">Lower Body</h2>
              <p className="mt-2 text-white/55">{todayWorkout.length} esercizi · ~65 min</p>
              <button onClick={() => setTab('workout')} className="mt-7 w-full rounded-full bg-[#D6A62E] py-4 font-black text-black">INIZIA ALLENAMENTO →</button>
            </section>

            <h2 className="mt-8 text-xl font-black">Ultimi progressi</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-[#151515] p-5"><div className="text-xs text-white/35">Peso</div><div className="mt-2 text-2xl font-black">61,7 kg</div></div>
              <div className="rounded-[1.5rem] border border-white/10 bg-[#151515] p-5"><div className="text-xs text-white/35">Squat</div><div className="mt-2 text-2xl font-black">80 × 8</div><div className="mt-1 text-xs text-[#D6A62E]">+5 kg</div></div>
            </div>

            <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
              <div className="text-xs uppercase text-white/35">Prossimo check</div>
              <div className="mt-2 text-xl font-black">24 settembre</div>
            </div>
          </div>
        )}

        {tab === 'workout' && <div className="mt-8"><WorkoutTracker /></div>}

        {tab === 'progress' && (
          <div className="mt-9">
            <h1 className="text-4xl font-black">Progressi</h1>
            <p className="mt-2 text-white/50">Peso, misure, composizione corporea e record.</p>
            <div className="mt-7 space-y-4">
              {[['Peso', '61,7 kg', '-1,3 kg'], ['Massa muscolare', '27,5 kg', '+0,6 kg'], ['Squat', '80 kg × 8', '+5 kg']].map(([a,b,c]) => (
                <div key={a} className="rounded-[1.5rem] border border-white/10 bg-[#151515] p-5">
                  <div className="text-sm text-white/40">{a}</div><div className="mt-2 text-2xl font-black">{b}</div><div className="mt-1 text-sm text-[#D6A62E]">{c}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'profile' && (
          <div className="mt-9">
            <h1 className="text-4xl font-black">Profilo</h1>
            <div className="mt-7 rounded-[2rem] border border-white/10 bg-[#151515] p-6">
              <div className="text-2xl font-black">Claudia</div>
              <div className="mt-2 text-[#D6A62E]">Premium 90</div>
              <div className="mt-6 space-y-3 text-sm text-white/55">
                <p>Obiettivo: forza e composizione corporea</p>
                <p>Coach: Ivan Cecchetti</p>
                <p>Prossimo check: 24 settembre</p>
              </div>
            </div>
          </div>
        )}
      </div>
      <BottomNav active={tab} onChange={setTab} />
    </main>
  );
}

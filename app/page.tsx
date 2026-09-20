'use client';

import { FormEvent, useEffect, useState } from 'react';
import BottomNav from '@/components/BottomNav';
import WorkoutTracker from '@/components/WorkoutTracker';
import { todayWorkout } from '@/lib/data';
import { supabase } from '@/lib/supabase';

type Role = 'athlete' | 'coach';

type Profile = {
  id: string;
  full_name: string;
  role: Role;
};

type CoachAthlete = {
  id: string;
  full_name: string;
  plan: string | null;
  goal: string | null;
  next_check: string | null;
};

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState('');

  const [tab, setTab] = useState('home');

  // ALLIEVI REALI DEL COACH
  const [coachAthletes, setCoachAthletes] = useState<CoachAthlete[]>([]);
  const [athletesLoading, setAthletesLoading] = useState(false);

  // MODALE NUOVO ALLIEVO
  const [showNewAthlete, setShowNewAthlete] = useState(false);
  const [athleteName, setAthleteName] = useState('');
  const [athleteEmail, setAthleteEmail] = useState('');
  const [athletePlan, setAthletePlan] = useState('');
  const [athleteGoal, setAthleteGoal] = useState('');
  const [athleteCheck, setAthleteCheck] = useState('');
  const [creatingAthlete, setCreatingAthlete] = useState(false);

  const loadProfile = async (userId: string) => {
    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Errore profilo:', profileError);
      setProfile(null);
      return null;
    }

    const loadedProfile = data as Profile;
    setProfile(loadedProfile);

    return loadedProfile;
  };

 const loadCoachAthletes = async (_coachId: string) => {
  setAthletesLoading(true);

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      console.error('Sessione non disponibile.');
      setCoachAthletes([]);
      return;
    }

    const response = await fetch('/api/coach-athletes', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Errore caricamento allievi:', result);
      setCoachAthletes([]);
      return;
    }

    setCoachAthletes(result.athletes ?? []);
  } catch (error) {
    console.error('Errore caricamento allievi:', error);
    setCoachAthletes([]);
  } finally {
    setAthletesLoading(false);
  }
};
    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const loadedProfile = await loadProfile(session.user.id);

        if (loadedProfile?.role === 'coach') {
          await loadCoachAthletes(loadedProfile.id);
        }
      }

      setLoading(false);
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setProfile(null);
        setCoachAthletes([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError('');
    setLoginLoading(true);

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError || !data.user) {
      setError('Email o password non corretti.');
      setLoginLoading(false);
      return;
    }

    const loadedProfile = await loadProfile(data.user.id);

    if (loadedProfile?.role === 'coach') {
      await loadCoachAthletes(loadedProfile.id);
    }

    setLoginLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();

    setProfile(null);
    setCoachAthletes([]);
    setEmail('');
    setPassword('');
    setTab('home');
  };

  const handleNewAthlete = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (creatingAthlete) {
      return;
    }

    setCreatingAthlete(true);
    setError('');

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        alert('Sessione scaduta. Esci e accedi nuovamente.');
        return;
      }

      const response = await fetch('/api/create-athlete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: athleteName,
          email: athleteEmail,
          plan: athletePlan,
          goal: athleteGoal,
          nextCheck: athleteCheck,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Errore creazione allievo:', result);

        alert(
          result.error ||
            'Errore durante la creazione dell’allievo.'
        );

        return;
      }

      // Aggiorniamo subito l'elenco senza ricaricare la pagina.
      if (profile?.role === 'coach') {
        await loadCoachAthletes(profile.id);
      }

      alert(
        `Allievo creato correttamente!\n\nEmail: ${athleteEmail}\nPassword temporanea: ${result.temporaryPassword}`
      );

      setAthleteName('');
      setAthleteEmail('');
      setAthletePlan('');
      setAthleteGoal('');
      setAthleteCheck('');
      setShowNewAthlete(false);
    } catch (creationError) {
      console.error('Errore:', creationError);

      alert(
        'Errore imprevisto durante la creazione dell’allievo.'
      );
    } finally {
      setCreatingAthlete(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090A0A] text-white">
        <div className="text-center">
          <div className="text-sm font-black uppercase tracking-[0.3em] text-[#D6A62E]">
            Ivan Fit
          </div>

          <div className="mt-4 text-sm text-white/40">
            Caricamento...
          </div>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090A0A] px-5 text-white">
        <div className="w-full max-w-md">
          <div className="text-center">
            <div className="text-sm font-black uppercase tracking-[0.35em] text-[#D6A62E]">
              Ivan Fit
            </div>

            <div className="mt-2 text-sm text-white/40">
              Personal Training • Milano
            </div>

            <h1 className="mt-10 text-4xl font-black">
              Bentornato
            </h1>

            <p className="mt-3 text-white/45">
              Accedi al tuo spazio personale.
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="mt-9 rounded-[2rem] border border-white/10 bg-[#151515] p-6"
          >
            <label className="text-xs font-bold uppercase tracking-[0.15em] text-white/40">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="nome@email.it"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-[#090A0A] px-4 py-4 text-white outline-none placeholder:text-white/20 focus:border-[#D6A62E]"
            />

            <label className="mt-5 block text-xs font-bold uppercase tracking-[0.15em] text-white/40">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-[#090A0A] px-4 py-4 text-white outline-none placeholder:text-white/20 focus:border-[#D6A62E]"
            />

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="mt-6 w-full rounded-full bg-[#D6A62E] py-4 font-black text-black disabled:opacity-50"
            >
              {loginLoading ? 'ACCESSO...' : 'ACCEDI →'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  if (profile.role === 'coach') {
    return (
      <main className="min-h-screen bg-[#090A0A] px-5 py-8 text-white">
        <div className="mx-auto max-w-5xl">
          <header className="flex items-center justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-[#D6A62E]">
                Ivan Fit
              </div>

              <h1 className="mt-2 text-3xl font-black">
                Dashboard Coach
              </h1>

              <div className="mt-1 text-sm text-white/40">
                {profile.full_name}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-full border border-white/15 px-4 py-2 text-sm"
            >
              Esci
            </button>
          </header>

          <section className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[2rem] border border-white/10 bg-[#151515] p-6">
              <div className="text-sm text-white/45">
                Allievi attivi
              </div>

              <div className="mt-2 text-4xl font-black text-[#D6A62E]">
                {coachAthletes.length}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[#151515] p-6">
              <div className="text-sm text-white/45">
                Check questa settimana
              </div>

              <div className="mt-2 text-4xl font-black text-[#D6A62E]">
                —
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[#151515] p-6">
              <div className="text-sm text-white/45">
                Aderenza media
              </div>

              <div className="mt-2 text-4xl font-black text-[#D6A62E]">
                —
              </div>
            </div>
          </section>

          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black">
                Allievi
              </h2>

              <button
                onClick={() => setShowNewAthlete(true)}
                className="rounded-full bg-[#D6A62E] px-5 py-3 text-sm font-black text-black"
              >
                + Nuovo allievo
              </button>
            </div>

            {athletesLoading ? (
              <div className="rounded-[1.5rem] border border-white/10 bg-[#151515] p-5 text-sm text-white/40">
                Caricamento allievi...
              </div>
            ) : coachAthletes.length === 0 ? (
              <div className="rounded-[1.5rem] border border-white/10 bg-[#151515] p-6">
                <div className="font-black">
                  Nessun allievo attivo
                </div>

                <div className="mt-2 text-sm text-white/40">
                  Crea il primo allievo con il pulsante in alto.
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {coachAthletes.map((athlete) => (
                  <div
                    key={athlete.id}
                    className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-white/10 bg-[#151515] p-5"
                  >
<div>
  <div className="font-black">
    {athlete.full_name}
  </div>

  <div className="mt-1 text-sm text-white/40">
    {athlete.plan || 'Piano non assegnato'}
  </div>

  {athlete.goal && (
    <div className="mt-1 text-xs text-white/30">
      {athlete.goal}
    </div>
  )}
</div>

<div className="text-right">
  <div className="text-sm font-bold text-[#D6A62E]">
    {athlete.next_check
      ? `Check: ${new Date(
          `${athlete.next_check}T00:00:00`
        ).toLocaleDateString('it-IT')}`
      : 'Check da programmare'}
  </div>

  <div className="mt-1 text-xs text-white/30">
    ATTIVO
  </div>
</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {showNewAthlete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-5">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-white/10 bg-[#151515] p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.25em] text-[#D6A62E]">
                    Ivan Fit
                  </div>

                  <h2 className="mt-2 text-3xl font-black">
                    Nuovo allievo
                  </h2>

                  <p className="mt-2 text-sm text-white/40">
                    Inserisci i dati del nuovo cliente.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowNewAthlete(false)}
                  className="rounded-full border border-white/10 px-3 py-2 text-sm text-white/60"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={handleNewAthlete}
                className="mt-7 space-y-5"
              >
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-white/40">
                    Nome e cognome
                  </label>

                  <input
                    value={athleteName}
                    onChange={(e) =>
                      setAthleteName(e.target.value)
                    }
                    required
                    placeholder="Es. Mario Rossi"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#090A0A] px-4 py-4 outline-none focus:border-[#D6A62E]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-white/40">
                    Email
                  </label>

                  <input
                    type="email"
                    value={athleteEmail}
                    onChange={(e) =>
                      setAthleteEmail(e.target.value)
                    }
                    required
                    placeholder="mario@email.it"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#090A0A] px-4 py-4 outline-none focus:border-[#D6A62E]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-white/40">
                    Piano
                  </label>

                  <select
                    value={athletePlan}
                    onChange={(e) =>
                      setAthletePlan(e.target.value)
                    }
                    required
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#090A0A] px-4 py-4 outline-none focus:border-[#D6A62E]"
                  >
                    <option value="">
                      Seleziona piano
                    </option>
                    <option value="Premium 90">
                      Premium 90
                    </option>
                    <option value="Autonomy 90">
                      Autonomy 90
                    </option>
                    <option value="Duo 90">
                      Duo 90
                    </option>
                    <option value="Personal">
                      Personal
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-white/40">
                    Obiettivo
                  </label>

                  <textarea
                    value={athleteGoal}
                    onChange={(e) =>
                      setAthleteGoal(e.target.value)
                    }
                    placeholder="Es. aumento forza, ricomposizione corporea..."
                    className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-white/10 bg-[#090A0A] px-4 py-4 outline-none focus:border-[#D6A62E]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-white/40">
                    Prossimo check
                  </label>

                  <input
                    type="date"
                    value={athleteCheck}
                    onChange={(e) =>
                      setAthleteCheck(e.target.value)
                    }
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#090A0A] px-4 py-4 outline-none focus:border-[#D6A62E]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={creatingAthlete}
                  className="w-full rounded-full bg-[#D6A62E] py-4 font-black text-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creatingAthlete
                    ? 'CREAZIONE...'
                    : 'CREA ALLIEVO →'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    );
  }

  const firstName =
    profile.full_name?.trim().split(' ')[0] || 'Atleta';

  return (
    <main className="min-h-screen bg-[#090A0A] px-5 pb-28 pt-7 text-white">
      <div className="mx-auto max-w-xl">
        <header className="flex items-center justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.3em] text-[#D6A62E]">
              Ivan Fit
            </div>

            <div className="mt-1 text-sm text-white/45">
              Personal Training • Milano
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold"
          >
            Esci
          </button>
        </header>

        {tab === 'home' && (
          <div className="mt-9">
            <div className="text-sm uppercase tracking-[0.2em] text-white/35">
              Ciao {firstName}
            </div>

            <h1 className="mt-2 text-4xl font-black">
              Pronta per oggi?
            </h1>

            <section className="mt-7 rounded-[2rem] border border-[#D6A62E]/35 bg-[linear-gradient(145deg,rgba(214,166,46,.16),rgba(21,21,21,1))] p-6">
              <div className="text-xs font-black uppercase tracking-[0.25em] text-[#D6A62E]">
                Allenamento di oggi
              </div>

              <h2 className="mt-3 text-3xl font-black">
                Lower Body
              </h2>

              <p className="mt-2 text-white/55">
                {todayWorkout.length} esercizi · ~65 min
              </p>

              <button
                onClick={() => setTab('workout')}
                className="mt-7 w-full rounded-full bg-[#D6A62E] py-4 font-black text-black"
              >
                INIZIA ALLENAMENTO →
              </button>
            </section>

            <h2 className="mt-8 text-xl font-black">
              Ultimi progressi
            </h2>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-[#151515] p-5">
                <div className="text-xs text-white/35">
                  Peso
                </div>
                <div className="mt-2 text-2xl font-black">
                  61,7 kg
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-[#151515] p-5">
                <div className="text-xs text-white/35">
                  Squat
                </div>
                <div className="mt-2 text-2xl font-black">
                  80 × 8
                </div>
                <div className="mt-1 text-xs text-[#D6A62E]">
                  +5 kg
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
              <div className="text-xs uppercase text-white/35">
                Prossimo check
              </div>

              <div className="mt-2 text-xl font-black">
                24 settembre
              </div>
            </div>
          </div>
        )}

        {tab === 'workout' && (
          <div className="mt-8">
            <WorkoutTracker />
          </div>
        )}

        {tab === 'progress' && (
          <div className="mt-9">
            <h1 className="text-4xl font-black">
              Progressi
            </h1>

            <p className="mt-2 text-white/50">
              Peso, misure, composizione corporea e record.
            </p>

            <div className="mt-7 space-y-4">
              {[
                ['Peso', '61,7 kg', '-1,3 kg'],
                ['Massa muscolare', '27,5 kg', '+0,6 kg'],
                ['Squat', '80 kg × 8', '+5 kg'],
              ].map(([a, b, c]) => (
                <div
                  key={a}
                  className="rounded-[1.5rem] border border-white/10 bg-[#151515] p-5"
                >
                  <div className="text-sm text-white/40">
                    {a}
                  </div>
                  <div className="mt-2 text-2xl font-black">
                    {b}
                  </div>
                  <div className="mt-1 text-sm text-[#D6A62E]">
                    {c}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'profile' && (
          <div className="mt-9">
            <h1 className="text-4xl font-black">
              Profilo
            </h1>

            <div className="mt-7 rounded-[2rem] border border-white/10 bg-[#151515] p-6">
              <div className="text-2xl font-black">
                {profile.full_name}
              </div>

              <div className="mt-2 text-[#D6A62E]">
                Premium 90
              </div>

              <div className="mt-6 space-y-3 text-sm text-white/55">
                <p>
                  Obiettivo: forza e composizione corporea
                </p>
                <p>Coach: Ivan Cecchetti</p>
                <p>Prossimo check: 24 settembre</p>
              </div>

              <button
                onClick={handleLogout}
                className="mt-7 w-full rounded-full border border-white/15 py-3 text-sm font-bold"
              >
                Esci dall&apos;account
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomNav active={tab} onChange={setTab} />
    </main>
  );
}
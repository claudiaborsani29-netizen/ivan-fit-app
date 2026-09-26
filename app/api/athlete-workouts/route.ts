import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseSecretKey) {
      return NextResponse.json(
        { error: 'Configurazione Supabase mancante.' },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseSecretKey
    );

    // Recuperiamo la sessione dell'allievo dal token inviato dall'app.
    const authorization = request.headers.get('authorization');

    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Non autorizzato.' },
        { status: 401 }
      );
    }

    const accessToken = authorization.replace('Bearer ', '');

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Sessione non valida.' },
        { status: 401 }
      );
    }

    // Questa API può essere utilizzata solamente da un allievo.
    const { data: profile, error: profileError } =
      await supabaseAdmin
        .from('profiles')
        .select('id, full_name, role, plan, goal, next_check')
        .eq('id', user.id)
        .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profilo non trovato.' },
        { status: 404 }
      );
    }

    if (profile.role !== 'athlete') {
      return NextResponse.json(
        { error: 'Accesso consentito solo agli allievi.' },
        { status: 403 }
      );
    }

    // Cerchiamo la scheda attiva assegnata all'allievo.
    const { data: plan, error: planError } =
      await supabaseAdmin
        .from('workout_plans')
        .select(
          'id, coach_id, athlete_id, name, description, start_date, end_date, active, created_at'
        )
        .eq('athlete_id', user.id)
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (planError) {
      console.error(
        'Errore caricamento scheda atleta:',
        planError
      );

      return NextResponse.json(
        { error: 'Errore durante il caricamento della scheda.' },
        { status: 500 }
      );
    }

    // Un allievo può esistere anche prima che Ivan gli abbia
    // preparato una programmazione.
    if (!plan) {
      return NextResponse.json({
        athlete: profile,
        plan: null,
        sessions: [],
      });
    }

    // Recuperiamo tutte le sedute della scheda.
    const { data: sessions, error: sessionsError } =
      await supabaseAdmin
        .from('workout_days')
        .select(
          'id, plan_id, name, day_order, notes, focus, cardio_notes, created_at'
        )
        .eq('plan_id', plan.id)
        .order('day_order', { ascending: true });

    if (sessionsError) {
      console.error(
        'Errore caricamento sedute:',
        sessionsError
      );

      return NextResponse.json(
        { error: 'Errore durante il caricamento delle sedute.' },
        { status: 500 }
      );
    }

    const workoutDayIds = (sessions ?? []).map(
      (session) => session.id
    );

    let sessionExercises: any[] = [];

    if (workoutDayIds.length > 0) {
      const { data, error: exercisesError } =
        await supabaseAdmin
          .from('workout_day_exercises')
          .select(`
            id,
            workout_day_id,
            exercise_id,
            exercise_order,
            sets,
            target_reps,
            target_weight,
            rest_seconds,
            notes,
            section,
            week_1,
            week_2,
            week_3,
            week_4,
            exercises (
              id,
              name,
              muscle_group,
              description
            )
          `)
          .in('workout_day_id', workoutDayIds)
          .order('exercise_order', { ascending: true });

      if (exercisesError) {
        console.error(
          'Errore caricamento esercizi:',
          exercisesError
        );

        return NextResponse.json(
          {
            error:
              'Errore durante il caricamento degli esercizi.',
          },
          { status: 500 }
        );
      }

      sessionExercises = data ?? [];
    }

    // Abbiniamo gli esercizi alla relativa seduta.
    const sessionsWithExercises = (sessions ?? []).map(
      (session) => ({
        ...session,
        exercises: sessionExercises.filter(
          (exercise) =>
            exercise.workout_day_id === session.id
        ),
      })
    );

    return NextResponse.json({
      athlete: profile,
      plan,
      sessions: sessionsWithExercises,
    });
  } catch (error) {
    console.error('Errore athlete-workouts:', error);

    return NextResponse.json(
      { error: 'Errore interno del server.' },
      { status: 500 }
    );
  }
}
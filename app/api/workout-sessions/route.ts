import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type ExerciseInput = {
  exerciseId: string;
  section: 'warmup' | 'workout';
  sets?: string;
  reps?: string;
  rest?: string;
  notes?: string;
  week1?: string;
  week2?: string;
  week3?: string;
  week4?: string;
};

export async function POST(request: Request) {
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
      supabaseSecretKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 1. Verifica sessione
    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Non autorizzato.' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    const {
      data: { user: coachUser },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !coachUser) {
      return NextResponse.json(
        { error: 'Sessione non valida.' },
        { status: 401 }
      );
    }

    // 2. Verifica che sia un coach
    const { data: coachProfile, error: coachError } =
      await supabaseAdmin
        .from('profiles')
        .select('id, role')
        .eq('id', coachUser.id)
        .single();

    if (
      coachError ||
      !coachProfile ||
      coachProfile.role !== 'coach'
    ) {
      return NextResponse.json(
        { error: 'Operazione consentita soltanto al coach.' },
        { status: 403 }
      );
    }

    // 3. Legge i dati inviati dall'app
    const body = await request.json();

    const athleteId =
      typeof body.athleteId === 'string'
        ? body.athleteId.trim()
        : '';

    const name =
      typeof body.name === 'string' ? body.name.trim() : '';

    const focus =
      typeof body.focus === 'string' && body.focus.trim()
        ? body.focus.trim()
        : null;

    const cardioNotes =
      typeof body.cardio === 'string' && body.cardio.trim()
        ? body.cardio.trim()
        : null;

    const exercises: ExerciseInput[] = Array.isArray(
      body.exercises
    )
      ? body.exercises
      : [];

    if (!athleteId || !name) {
      return NextResponse.json(
        { error: 'Allievo e nome della seduta sono obbligatori.' },
        { status: 400 }
      );
    }

    // 4. Verifica che l'allievo appartenga al coach
    const { data: relation, error: relationError } =
      await supabaseAdmin
        .from('coach_athletes')
        .select('athlete_id')
        .eq('coach_id', coachUser.id)
        .eq('athlete_id', athleteId)
        .eq('active', true)
        .maybeSingle();

    if (relationError) {
      return NextResponse.json(
        { error: relationError.message },
        { status: 500 }
      );
    }

    if (!relation) {
      return NextResponse.json(
        { error: 'Allievo non trovato.' },
        { status: 404 }
      );
    }

    // 5. Cerca una scheda attiva per l'allievo
    const { data: existingPlan, error: planSearchError } =
      await supabaseAdmin
        .from('workout_plans')
        .select('id')
        .eq('coach_id', coachUser.id)
        .eq('athlete_id', athleteId)
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (planSearchError) {
      return NextResponse.json(
        { error: planSearchError.message },
        { status: 500 }
      );
    }

    let planId = existingPlan?.id;

    // 6. Se non esiste, crea automaticamente la scheda attiva
    if (!planId) {
      const { data: newPlan, error: planCreateError } =
        await supabaseAdmin
          .from('workout_plans')
          .insert({
            coach_id: coachUser.id,
            athlete_id: athleteId,
            name: 'Scheda allenamento',
            description: null,
            active: true,
          })
          .select('id')
          .single();

      if (planCreateError || !newPlan) {
        return NextResponse.json(
          {
            error:
              planCreateError?.message ||
              'Errore durante la creazione della scheda.',
          },
          { status: 500 }
        );
      }

      planId = newPlan.id;
    }

    // 7. Determina l'ordine della nuova seduta
    const { data: existingDays, error: daysError } =
      await supabaseAdmin
        .from('workout_days')
        .select('day_order')
        .eq('plan_id', planId)
        .order('day_order', { ascending: false })
        .limit(1);

    if (daysError) {
      return NextResponse.json(
        { error: daysError.message },
        { status: 500 }
      );
    }

    const lastDayOrder =
      existingDays && existingDays.length > 0
        ? existingDays[0].day_order ?? 0
        : 0;

    const dayOrder = lastDayOrder + 1;

    // 8. Crea Seduta A / B / C...
    const { data: workoutDay, error: dayCreateError } =
      await supabaseAdmin
        .from('workout_days')
        .insert({
          plan_id: planId,
          name,
          day_order: dayOrder,
          notes: null,
          focus,
          cardio_notes: cardioNotes,
        })
        .select('id, name, day_order, focus, cardio_notes')
        .single();

    if (dayCreateError || !workoutDay) {
      return NextResponse.json(
        {
          error:
            dayCreateError?.message ||
            'Errore durante la creazione della seduta.',
        },
        { status: 500 }
      );
    }

    // 9. Prepara gli esercizi
    const validExercises = exercises.filter(
      (exercise) =>
        exercise &&
        typeof exercise.exerciseId === 'string' &&
        exercise.exerciseId.trim()
    );

    if (validExercises.length > 0) {
      const exerciseRows = validExercises.map(
        (exercise, index) => {
          const parsedSets = Number.parseInt(
            exercise.sets || '',
            10
          );

          const restMatch = String(
            exercise.rest || ''
          ).match(/\d+/);

          const parsedRest = restMatch
            ? Number.parseInt(restMatch[0], 10)
            : null;

          return {
            workout_day_id: workoutDay.id,
            exercise_id: exercise.exerciseId,
            exercise_order: index + 1,
            sets: Number.isNaN(parsedSets)
              ? null
              : parsedSets,
            target_reps: exercise.reps?.trim() || null,
            target_weight: null,
            rest_seconds: parsedRest,
            notes: exercise.notes?.trim() || null,
            section:
              exercise.section === 'warmup'
                ? 'warmup'
                : 'workout',
            week_1: exercise.week1?.trim() || null,
            week_2: exercise.week2?.trim() || null,
            week_3: exercise.week3?.trim() || null,
            week_4: exercise.week4?.trim() || null,
          };
        }
      );

      const { error: exerciseInsertError } =
        await supabaseAdmin
          .from('workout_day_exercises')
          .insert(exerciseRows);

      if (exerciseInsertError) {
        // Evita di lasciare una seduta vuota se falliscono gli esercizi
        await supabaseAdmin
          .from('workout_days')
          .delete()
          .eq('id', workoutDay.id);

        return NextResponse.json(
          { error: exerciseInsertError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      workoutDay,
      planId,
    });
  } catch (error) {
    console.error('Errore salvataggio seduta:', error);

    return NextResponse.json(
      { error: 'Errore durante il salvataggio della seduta.' },
      { status: 500 }
    );
  }
}
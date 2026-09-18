import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
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

    // Verifica che l'utente sia realmente un coach
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

    // Recuperiamo gli ID degli allievi collegati al coach
    const { data: relations, error: relationsError } =
      await supabaseAdmin
        .from('coach_athletes')
        .select('athlete_id')
        .eq('coach_id', coachUser.id)
        .eq('active', true);

    if (relationsError) {
      return NextResponse.json(
        { error: relationsError.message },
        { status: 500 }
      );
    }

    const athleteIds =
      relations?.map((relation) => relation.athlete_id) ?? [];

    if (athleteIds.length === 0) {
      return NextResponse.json({
        athletes: [],
      });
    }

    // Recuperiamo i dati reali degli allievi
    const { data: athletes, error: athletesError } =
      await supabaseAdmin
        .from('profiles')
        .select('id, full_name, plan, goal, next_check')
        .in('id', athleteIds)
        .eq('role', 'athlete');

    if (athletesError) {
      return NextResponse.json(
        { error: athletesError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      athletes: athletes ?? [],
    });
  } catch (error) {
    console.error('Errore caricamento allievi:', error);

    return NextResponse.json(
      { error: 'Errore durante il caricamento degli allievi.' },
      { status: 500 }
    );
  }
}
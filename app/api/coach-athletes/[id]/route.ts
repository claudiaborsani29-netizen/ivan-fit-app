import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: athleteId } = await context.params;

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

    // Verifichiamo che l'utente sia realmente un coach
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

    // Verifichiamo che questo allievo appartenga al coach
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

    // Recuperiamo i dati dell'allievo
    const { data: athlete, error: athleteError } =
      await supabaseAdmin
        .from('profiles')
        .select('id, full_name, plan, goal, next_check')
        .eq('id', athleteId)
        .eq('role', 'athlete')
        .single();

    if (athleteError || !athlete) {
      return NextResponse.json(
        { error: 'Allievo non trovato.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      athlete,
    });
  } catch (error) {
    console.error('Errore caricamento allievo:', error);

    return NextResponse.json(
      { error: 'Errore durante il caricamento dell’allievo.' },
      { status: 500 }
    );
  }
}
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
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Sessione non valida.' },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } =
      await supabaseAdmin
        .from('profiles')
        .select('id, role')
        .eq('id', user.id)
        .single();

    if (
      profileError ||
      !profile ||
      profile.role !== 'coach'
    ) {
      return NextResponse.json(
        { error: 'Operazione consentita soltanto al coach.' },
        { status: 403 }
      );
    }

    const { data: exercises, error: exercisesError } =
      await supabaseAdmin
        .from('exercises')
        .select('id, name, muscle_group, description')
        .order('muscle_group', { ascending: true })
        .order('name', { ascending: true });

    if (exercisesError) {
      return NextResponse.json(
        { error: exercisesError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      exercises: exercises ?? [],
    });
  } catch (error) {
    console.error('Errore caricamento esercizi:', error);

    return NextResponse.json(
      { error: 'Errore durante il caricamento degli esercizi.' },
      { status: 500 }
    );
  }
}
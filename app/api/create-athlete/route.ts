import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, email, plan, goal, nextCheck } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nome ed email sono obbligatori.' },
        { status: 400 }
      );
    }

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

    // Controlliamo che la richiesta provenga da un utente autenticato.
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

    // Verifichiamo che l'utente sia effettivamente un coach.
    const { data: coachProfile, error: coachProfileError } =
      await supabaseAdmin
        .from('profiles')
        .select('id, role')
        .eq('id', coachUser.id)
        .single();

    if (
      coachProfileError ||
      !coachProfile ||
      coachProfile.role !== 'coach'
    ) {
      return NextResponse.json(
        { error: 'Operazione consentita soltanto al coach.' },
        { status: 403 }
      );
    }

    // Creiamo una password temporanea casuale.
    const temporaryPassword =
      crypto.randomUUID() + 'Aa1!';

    // Creiamo l'account dell'allievo.
    const {
      data: createdUser,
      error: createUserError,
    } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        full_name: name,
      },
    });

    if (createUserError || !createdUser.user) {
      return NextResponse.json(
        {
          error:
            createUserError?.message ||
            'Impossibile creare l’account dell’allievo.',
        },
        { status: 400 }
      );
    }

    const athleteId = createdUser.user.id;

    // Creiamo il profilo dell'allievo.
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: athleteId,
        full_name: name,
        role: 'athlete',
      });

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(athleteId);

      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    // Colleghiamo l'allievo al coach.
    const { error: relationError } = await supabaseAdmin
      .from('coach_athletes')
      .insert({
        coach_id: coachUser.id,
        athlete_id: athleteId,
        active: true,
      });

    if (relationError) {
      await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', athleteId);

      await supabaseAdmin.auth.admin.deleteUser(athleteId);

      return NextResponse.json(
        { error: relationError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      athlete: {
        id: athleteId,
        name,
        email,
        plan,
        goal,
        nextCheck,
      },
      temporaryPassword,
    });
  } catch (error) {
    console.error('Errore creazione allievo:', error);

    return NextResponse.json(
      { error: 'Errore durante la creazione dell’allievo.' },
      { status: 500 }
    );
  }
}
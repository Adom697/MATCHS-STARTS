'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function signUpPlayer(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/signup?role=joueur&error=${encodeURIComponent(error.message)}`);
  }

  if (!data.user) {
    redirect(`/signup?role=joueur&error=${encodeURIComponent('Inscription impossible, réessaie.')}`);
  }

  if (!data.session) {
    // La confirmation d'email est activée côté Supabase : le compte est créé
    // mais pas encore utilisable tant que le lien reçu par email n'est pas cliqué.
    redirect('/login?info=confirm_email');
  }

  redirect('/onboarding');
}

export async function signUpAssistant(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const inviteCode = (formData.get('invite_code') as string)?.trim().toUpperCase();

  const supabase = await createClient();

  const { data: playerId, error: lookupError } = await supabase.rpc(
    'get_player_id_by_invite_code',
    { code: inviteCode }
  );

  if (lookupError || !playerId) {
    redirect(`/signup?role=assistant&error=${encodeURIComponent("Code d'invitation invalide.")}`);
  }

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error || !data.user) {
    redirect(`/signup?role=assistant&error=${encodeURIComponent(error?.message || 'Inscription impossible.')}`);
  }

  const { error: insertError } = await supabase.from('assistants').insert({
    id: data.user!.id,
    player_id: playerId,
  });

  if (insertError) {
    redirect(`/signup?role=assistant&error=${encodeURIComponent(insertError.message)}`);
  }

  if (!data.session) {
    redirect('/login?info=confirm_email');
  }

  redirect('/dashboard');
}

export async function logIn(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const message = error.message.toLowerCase().includes('confirm')
      ? "Ton email n'est pas encore confirmé. Vérifie ta boîte mail (et les spams) pour le lien de confirmation."
      : 'Email ou mot de passe incorrect.';
    redirect(`/login?error=${encodeURIComponent(message)}`);
  }

  redirect('/dashboard');
}

export async function logOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get('email') as string;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://matchs-starts.vercel.app';

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/reset-password`,
  });

  // Toujours rediriger vers le même message, que l'email existe ou non,
  // pour ne pas révéler quels emails sont enregistrés.
  redirect('/forgot-password?sent=1');
}

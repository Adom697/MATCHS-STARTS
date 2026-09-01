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

  redirect('/dashboard');
}

export async function logIn(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent('Email ou mot de passe incorrect.')}`);
  }

  redirect('/dashboard');
}

export async function logOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

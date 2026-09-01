'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function createPlayerProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const first_name = formData.get('first_name') as string;
  const last_name = formData.get('last_name') as string;
  const current_club = formData.get('current_club') as string;
  const position = formData.get('position') as string;
  const jersey_number = formData.get('jersey_number') as string;
  const strong_foot = formData.get('strong_foot') as string;
  const birth_date = formData.get('birth_date') as string;

  const { error } = await supabase.from('players').insert({
    id: user.id,
    first_name,
    last_name,
    current_club: current_club || null,
    position: position || null,
    jersey_number: jersey_number ? parseInt(jersey_number, 10) : null,
    strong_foot: strong_foot || null,
    birth_date: birth_date || null,
  });

  if (error) {
    redirect(`/onboarding?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

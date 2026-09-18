'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function addCoachPlayer(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const inviteCode = (formData.get('invite_code') as string)?.trim().toUpperCase();

  const { data: playerId, error } = await supabase.rpc('get_player_id_by_invite_code', {
    code: inviteCode,
  });

  if (error || !playerId) {
    redirect(`/coach?error=${encodeURIComponent("Code d'invitation invalide.")}`);
  }

  const { error: insertError } = await supabase
    .from('coach_players')
    .insert({ coach_id: user.id, player_id: playerId });

  if (insertError && !insertError.message.includes('duplicate')) {
    redirect(`/coach?error=${encodeURIComponent(insertError.message)}`);
  }

  revalidatePath('/coach');
}

export async function removeCoachPlayer(playerId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  await supabase.from('coach_players').delete().eq('coach_id', user.id).eq('player_id', playerId);
  revalidatePath('/coach');
}

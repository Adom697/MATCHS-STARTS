'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function createMatch(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Resolve the player_id: the current user is either the player, or an
  // assistant linked to one.
  let playerId = user.id;
  const { data: player } = await supabase.from('players').select('id').eq('id', user.id).maybeSingle();

  if (!player) {
    const { data: assistant } = await supabase
      .from('assistants')
      .select('player_id')
      .eq('id', user.id)
      .maybeSingle();
    if (assistant) playerId = assistant.player_id;
  }

  const opponent = formData.get('opponent') as string;
  const match_date = formData.get('match_date') as string;
  const competition = formData.get('competition') as string;
  const home_away = formData.get('home_away') as string;

  const { data: match, error } = await supabase
    .from('matches')
    .insert({
      player_id: playerId,
      opponent,
      match_date,
      competition: competition || null,
      home_away: home_away || null,
    })
    .select('id')
    .single();

  if (error || !match) {
    redirect(`/matches/new?error=${encodeURIComponent(error?.message || 'Erreur')}`);
  }

  await supabase.from('match_stats').insert({ match_id: match.id });

  redirect(`/matches/${match.id}/live`);
}

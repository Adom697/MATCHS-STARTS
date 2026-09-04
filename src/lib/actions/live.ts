'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { EVENT_TO_COLUMN } from '@/lib/event-columns';

export async function recordEvent(matchId: string, eventType: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const column = EVENT_TO_COLUMN[eventType];
  if (!column) return;

  await supabase.from('match_events').insert({
    match_id: matchId,
    event_type: eventType,
    created_by: user.id,
  });

  const { data: current } = await supabase
    .from('match_stats')
    .select(column)
    .eq('match_id', matchId)
    .single();

  const currentValue = (current as unknown as Record<string, number>)?.[column] || 0;

  await supabase
    .from('match_stats')
    .update({ [column]: currentValue + 1, updated_at: new Date().toISOString() })
    .eq('match_id', matchId);

  await supabase
    .from('matches')
    .update({ status: 'en_direct' })
    .eq('id', matchId)
    .eq('status', 'a_venir');

  revalidatePath(`/matches/${matchId}/live`);
}

export async function undoLastEvent(matchId: string) {
  const supabase = await createClient();

  const { data: lastEvent } = await supabase
    .from('match_events')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!lastEvent) return;

  const column = EVENT_TO_COLUMN[lastEvent.event_type];
  if (column) {
    const { data: current } = await supabase
      .from('match_stats')
      .select(column)
      .eq('match_id', matchId)
      .single();

    const currentValue = (current as unknown as Record<string, number>)?.[column] || 0;

    await supabase
      .from('match_stats')
      .update({ [column]: Math.max(0, currentValue - 1), updated_at: new Date().toISOString() })
      .eq('match_id', matchId);
  }

  await supabase.from('match_events').delete().eq('id', lastEvent.id);

  revalidatePath(`/matches/${matchId}/live`);
}

export async function finishMatch(formData: FormData) {
  const matchId = formData.get('match_id') as string;
  const team_score = formData.get('team_score') as string;
  const opponent_score = formData.get('opponent_score') as string;
  const minutes_played = formData.get('minutes_played') as string;
  const player_rating = formData.get('player_rating') as string;
  const coach_rating = formData.get('coach_rating') as string;

  const supabase = await createClient();

  await supabase
    .from('matches')
    .update({
      status: 'termine',
      team_score: team_score ? parseInt(team_score, 10) : null,
      opponent_score: opponent_score ? parseInt(opponent_score, 10) : null,
      minutes_played: minutes_played ? parseInt(minutes_played, 10) : null,
      player_rating: player_rating ? parseFloat(player_rating) : null,
      coach_rating: coach_rating ? parseFloat(coach_rating) : null,
    })
    .eq('id', matchId);

  redirect('/dashboard');
}

'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function updatePlayerProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const achievements = formData.get('achievements') as string;
  const current_club = formData.get('current_club') as string;
  const position = formData.get('position') as string;
  const player_category = formData.get('player_category') as string;
  const wantsPublic = formData.get('is_public') === 'on';
  const photo = formData.get('photo') as File | null;

  const { data: currentPlayer } = await supabase
    .from('players')
    .select('first_name, last_name, public_slug, plan')
    .eq('id', user.id)
    .single();

  // La vitrine publique est une fonctionnalité réservée à l'abonnement Pro.
  const is_public = wantsPublic && currentPlayer?.plan === 'pro';

  const updates: Record<string, unknown> = {
    achievements: achievements || null,
    current_club: current_club || null,
    position: position || null,
    player_category: player_category || 'Amateur',
    is_public,
  };

  if (is_public && currentPlayer && !currentPlayer.public_slug) {
    updates.public_slug = `${slugify(`${currentPlayer.first_name}-${currentPlayer.last_name}`)}-${user.id.slice(0, 6)}`;
  }

  if (photo && photo.size > 0) {
    const ext = photo.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, photo, { upsert: true });

    if (!uploadError) {
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(path);
      updates.avatar_url = `${publicUrl}?t=${Date.now()}`;
    }
  }

  const { error } = await supabase.from('players').update(updates).eq('id', user.id);

  if (error) {
    redirect(`/profile/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

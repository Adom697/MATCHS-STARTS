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
  const is_public = formData.get('is_public') === 'on';
  const photo = formData.get('photo') as File | null;

  const updates: Record<string, unknown> = {
    achievements: achievements || null,
    current_club: current_club || null,
    position: position || null,
    is_public,
  };

  if (is_public) {
    const { data: player } = await supabase
      .from('players')
      .select('first_name, last_name, public_slug')
      .eq('id', user.id)
      .single();

    if (player && !player.public_slug) {
      updates.public_slug = `${slugify(`${player.first_name}-${player.last_name}`)}-${user.id.slice(0, 6)}`;
    }
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

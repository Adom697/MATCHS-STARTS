'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function addCareerEntry(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const club = formData.get('club') as string;
  const category = formData.get('category') as string;
  const start_date = formData.get('start_date') as string;
  const end_date = formData.get('end_date') as string;
  const is_current = formData.get('is_current') === 'on';

  await supabase.from('career_history').insert({
    player_id: user.id,
    club,
    category: category || null,
    start_date: start_date || null,
    end_date: is_current ? null : end_date || null,
    is_current,
  });

  revalidatePath('/profile/career');
  redirect('/profile/career');
}

export async function deleteCareerEntry(entryId: string) {
  const supabase = await createClient();
  await supabase.from('career_history').delete().eq('id', entryId);
  revalidatePath('/profile/career');
}

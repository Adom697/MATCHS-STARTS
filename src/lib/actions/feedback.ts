'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function submitFeedback(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const message = formData.get('message') as string;
  const rating = formData.get('rating') as string;

  await supabase.from('feedback').insert({
    user_id: user.id,
    message,
    rating: rating ? parseInt(rating, 10) : null,
  });

  redirect('/feedback?sent=1');
}

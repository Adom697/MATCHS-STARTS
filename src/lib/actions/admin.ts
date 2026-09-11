'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function adminSetPlan(targetId: string, newPlan: 'free' | 'pro') {
  const supabase = await createClient();
  await supabase.rpc('admin_set_plan', { target_id: targetId, new_plan: newPlan });
  revalidatePath('/admin');
}

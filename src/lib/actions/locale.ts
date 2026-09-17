'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function setLocale(formData: FormData) {
  const locale = formData.get('locale') as string;
  const returnTo = (formData.get('return_to') as string) || '/dashboard';
  const cookieStore = await cookies();
  cookieStore.set('locale', locale === 'en' ? 'en' : 'fr', {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
  redirect(returnTo);
}

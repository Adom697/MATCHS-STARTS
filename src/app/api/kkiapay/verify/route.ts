import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: 'not_authenticated' }, { status: 401 });
  }

  const { transactionId } = await request.json();
  if (!transactionId) {
    return NextResponse.json({ success: false, error: 'missing_transaction_id' }, { status: 400 });
  }

  const privateKey = process.env.KKIAPAY_PRIVATE_KEY;
  const publicKey = process.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY;
  const sandbox = process.env.NEXT_PUBLIC_KKIAPAY_SANDBOX === 'true';

  if (!privateKey || !publicKey) {
    return NextResponse.json({ success: false, error: 'not_configured' }, { status: 500 });
  }

  // Vérification côté serveur auprès de Kkiapay — ne jamais faire confiance
  // uniquement à la réponse du widget côté navigateur.
  const verifyUrl = sandbox
    ? 'https://api-sandbox.kkiapay.me/api/v1/transactions/status'
    : 'https://api.kkiapay.me/api/v1/transactions/status';

  try {
    const kkiapayRes = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': publicKey,
        Authorization: privateKey,
      },
      body: JSON.stringify({ transactionId }),
    });

    const result = await kkiapayRes.json();

    if (result.status !== 'SUCCESS') {
      return NextResponse.json({ success: false, error: 'payment_not_successful' }, { status: 400 });
    }

    const { error } = await supabase.from('players').update({ plan: 'pro' }).eq('id', user.id);

    if (error) {
      return NextResponse.json({ success: false, error: 'db_update_failed' }, { status: 500 });
    }

    await supabase.from('feedback').insert({
      user_id: user.id,
      message: `[Système] Passage en Pro via Kkiapay, transaction ${transactionId}`,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'kkiapay_unreachable' }, { status: 502 });
  }
}

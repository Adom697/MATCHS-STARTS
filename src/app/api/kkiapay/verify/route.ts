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
  const secretKey = process.env.KKIAPAY_SECRET_KEY;
  const publicKey = process.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY;
  const sandbox = process.env.NEXT_PUBLIC_KKIAPAY_SANDBOX === 'true';

  if (!privateKey || !publicKey || !secretKey) {
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
        Accept: 'application/json',
        'X-API-KEY': publicKey,
        'X-PRIVATE-KEY': privateKey,
        'X-SECRET-KEY': secretKey,
      },
      body: JSON.stringify({ transactionId }),
    });

    const result = await kkiapayRes.json();

    if (result.status !== 'SUCCESS') {
      return NextResponse.json({ success: false, error: 'payment_not_successful' }, { status: 400 });
    }

    const proUntil = new Date();
    proUntil.setDate(proUntil.getDate() + 30);

    const { error } = await supabase
      .from('players')
      .update({ plan: 'pro', pro_until: proUntil.toISOString() })
      .eq('id', user.id);

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

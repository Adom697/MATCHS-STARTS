'use client';

import Script from 'next/script';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    openKkiapayWidget: (options: {
      amount: number;
      api_key: string;
      sandbox: boolean;
      email?: string;
      phone?: string;
      data?: string;
    }) => void;
    addKkiapayListener: (
      event: 'success' | 'failed',
      callback: (response: { transactionId: string }) => void
    ) => void;
    removeKkiapayListener: (event: 'success' | 'failed') => void;
  }
}

const AMOUNT_XOF = 3000;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY;
const SANDBOX = process.env.NEXT_PUBLIC_KKIAPAY_SANDBOX === 'true';

export function KkiapayButton({ email }: { email: string }) {
  const [scriptReady, setScriptReady] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  if (!PUBLIC_KEY) {
    return (
      <button
        disabled
        className="w-full bg-accent-strong/40 text-black/60 font-semibold rounded-lg py-2.5 cursor-not-allowed"
      >
        Paiement Mobile Money — bientôt disponible
      </button>
    );
  }

  function openWidget() {
    if (!scriptReady || !window.openKkiapayWidget) return;
    setError('');

    window.addKkiapayListener('success', async (response) => {
      window.removeKkiapayListener('success');
      setVerifying(true);
      try {
        const res = await fetch('/api/kkiapay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionId: response.transactionId }),
        });
        const data = await res.json();
        if (data.success) {
          router.push('/profile/subscription?activated=1');
          router.refresh();
        } else {
          setError("Le paiement n'a pas pu être vérifié. Contacte-nous si l'argent a été débité.");
        }
      } catch {
        setError('Erreur de connexion pendant la vérification. Réessaie.');
      } finally {
        setVerifying(false);
      }
    });

    window.openKkiapayWidget({
      amount: AMOUNT_XOF,
      api_key: PUBLIC_KEY as string,
      sandbox: SANDBOX,
      email,
    });
  }

  return (
    <>
      <Script
        src="https://cdn.kkiapay.me/k.js"
        onLoad={() => setScriptReady(true)}
        strategy="afterInteractive"
      />
      <button
        onClick={openWidget}
        disabled={!scriptReady || verifying}
        className="w-full bg-accent-strong hover:bg-accent disabled:opacity-50 text-black font-semibold rounded-lg py-2.5 transition-colors"
      >
        {verifying ? 'Vérification...' : `Payer ${AMOUNT_XOF} FCFA / mois`}
      </button>
      {error && <p className="text-danger text-xs mt-2 text-center">{error}</p>}
    </>
  );
}

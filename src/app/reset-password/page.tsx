'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // The recovery link puts the session in the URL; the browser client
    // picks it up automatically on load. We just wait for that to settle.
    supabase.auth.getSession().then(() => setReady(true));
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('6 caractères minimum.');
      return;
    }
    if (password !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      setError(
        updateError.message.includes('session')
          ? 'Le lien a expiré ou a déjà été utilisé. Redemande un lien depuis "Mot de passe oublié".'
          : updateError.message
      );
      return;
    }

    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Nouveau mot de passe</h1>
          <p className="text-muted mt-1 text-sm">Choisis-en un nouveau pour ton compte.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1.5">Nouveau mot de passe</label>
            <div className="relative">
              <input
                type={visible ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 pr-16 text-foreground focus:outline-none focus:border-accent"
                placeholder="6 caractères minimum"
              />
              <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-accent font-medium"
                tabIndex={-1}
              >
                {visible ? 'Cacher' : 'Afficher'}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-muted mb-1.5">Confirme-le</label>
            <input
              type={visible ? 'text' : 'password'}
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          {error && <p className="text-danger text-sm">{error}</p>}

          <button
            type="submit"
            disabled={!ready || submitting}
            className="w-full bg-accent-strong hover:bg-accent disabled:opacity-50 text-black font-semibold rounded-lg py-2.5 transition-colors"
          >
            {submitting ? 'Enregistrement...' : 'Changer le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  );
}

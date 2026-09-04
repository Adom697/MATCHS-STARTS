import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { KkiapayButton } from '@/components/KkiapayButton';

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ activated?: string }>;
}) {
  const { activated } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: player } = await supabase.from('players').select('plan').eq('id', user.id).single();
  const isPro = player?.plan === 'pro';

  return (
    <div className="min-h-screen bg-background px-5 py-8 max-w-md mx-auto">
      <Link href="/dashboard" className="text-muted text-sm mb-4 inline-block">
        ← Tableau de bord
      </Link>

      <h1 className="text-2xl font-bold text-foreground mb-1">Abonnement</h1>
      <p className="text-muted text-sm mb-6">
        Statut actuel :{' '}
        <span className={isPro ? 'text-accent font-semibold' : 'text-foreground font-semibold'}>
          {isPro ? 'Pro' : 'Gratuit'}
        </span>
      </p>

      {activated && (
        <div className="bg-accent-strong/15 border border-accent-strong/30 rounded-xl p-4 mb-6 text-center">
          <p className="text-accent text-sm font-medium">Ton compte Pro est activé ! 🎉</p>
        </div>
      )}

      <div className="grid gap-4">
        <div className="bg-surface border border-border rounded-2xl p-5">
          <h2 className="font-semibold text-foreground mb-3">Gratuit</h2>
          <ul className="space-y-2 text-sm text-muted">
            <li>✓ Saisie live illimitée des stats</li>
            <li>✓ Tableau de bord et bilan de saison</li>
            <li>✓ Historique de tous tes matchs</li>
            <li>✓ Parcours & clubs</li>
          </ul>
        </div>

        <div className="bg-surface border-2 border-accent-strong rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">Pro</h2>
            <span className="text-xs font-semibold text-accent bg-accent-strong/15 px-2 py-0.5 rounded-full">
              Recommandé
            </span>
          </div>
          <ul className="space-y-2 text-sm text-muted mb-4">
            <li className="text-foreground">✓ Tout le plan Gratuit, plus :</li>
            <li>✓ Page vitrine publique pour les recruteurs</li>
            <li>✓ Export CV en PDF</li>
            <li>✓ QR code partageable</li>
          </ul>
          {isPro ? (
            <p className="text-center text-accent text-sm font-medium py-2.5">Tu es déjà abonné ✓</p>
          ) : (
            <KkiapayButton email={user.email || ''} />
          )}
        </div>
      </div>

      <p className="text-muted text-xs mt-6 text-center">
        Paiement sécurisé via Mobile Money (MTN, Moov) propulsé par Kkiapay.
      </p>
    </div>
  );
}

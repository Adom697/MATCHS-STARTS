import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { KkiapayButton } from '@/components/KkiapayButton';
import { StadiumBackground } from '@/components/StadiumBackground';

const PRO_FEATURES = [
  {
    icon: '🎯',
    title: 'Vitrine publique',
    body: 'Un lien pro consultable par n\u2019importe quel recruteur ou club, sans qu\u2019il ait besoin de compte.',
  },
  {
    icon: '📄',
    title: 'CV en PDF',
    body: 'Ton profil complet, exportable et prêt à envoyer par email ou WhatsApp en un clic.',
  },
  {
    icon: '📱',
    title: 'QR code',
    body: 'Partage instantané sur un flyer, lors d\u2019un essai, ou face à un recruteur en personne.',
  },
  {
    icon: '📈',
    title: 'Analyse & Progression',
    body: 'Détection automatique de tes points faibles avec des exercices concrets pour progresser plus vite.',
  },
];

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
    <div className="min-h-screen relative">
      <StadiumBackground src="/images/subscription-bg.jpg" overlay={0.8} />

      {/* HERO */}
      <div className="px-5 pt-8 pb-10 max-w-md mx-auto text-center">
        <Link href="/dashboard" className="text-muted text-sm mb-6 inline-block self-start">
          ← Tableau de bord
        </Link>
        {isPro ? (
          <span className="text-xs font-semibold text-accent bg-accent-strong/20 border border-accent-strong/40 px-3 py-1 rounded-full">
            Compte Pro actif
          </span>
        ) : (
          <span className="text-xs font-semibold text-muted bg-surface-2 border border-border px-3 py-1 rounded-full">
            Compte Gratuit
          </span>
        )}
        <h1 className="text-3xl font-bold text-foreground mt-4 leading-tight">
          Fais de tes stats
          <br />
          <span className="text-accent">un vrai tremplin</span>
        </h1>
        <p className="text-muted text-sm mt-3">
          MatchStat Pro transforme tes performances en dossier de carrière que les recruteurs peuvent
          vraiment consulter.
        </p>
      </div>

      {activated && (
        <div className="px-5 max-w-md mx-auto mb-6">
          <div className="bg-accent-strong/15 border border-accent-strong/30 rounded-xl p-4 text-center">
            <p className="text-accent text-sm font-medium">Ton compte Pro est activé ! 🎉</p>
          </div>
        </div>
      )}

      {/* FEATURES */}
      <div className="px-5 max-w-md mx-auto space-y-3 mb-8">
        {PRO_FEATURES.map((f) => (
          <div
            key={f.title}
            className="bg-surface/95 backdrop-blur border border-border rounded-2xl p-4 flex gap-3 items-start"
          >
            <span className="text-2xl shrink-0">{f.icon}</span>
            <div>
              <p className="text-foreground font-semibold text-sm">{f.title}</p>
              <p className="text-muted text-xs mt-0.5">{f.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* PRICING CARD */}
      <div className="px-5 max-w-md mx-auto pb-10">
        <div className="bg-surface/95 backdrop-blur border-2 border-accent-strong rounded-2xl p-6 text-center">
          {isPro ? (
            <>
              <p className="text-foreground font-semibold mb-1">Tu es abonné Pro ✓</p>
              <p className="text-muted text-sm">Profite de toutes les fonctionnalités ci-dessus dès maintenant.</p>
            </>
          ) : (
            <>
              <p className="text-4xl font-bold text-foreground">
                3 000<span className="text-lg text-muted"> FCFA/mois</span>
              </p>
              <p className="text-muted text-xs mt-1 mb-5">Résiliable à tout moment, sans engagement.</p>
              <KkiapayButton email={user.email || ''} />
            </>
          )}
        </div>

        <p className="text-muted text-xs mt-4 text-center">
          Paiement sécurisé via Mobile Money (MTN, Moov) propulsé par Kkiapay.
        </p>

        <div className="mt-8 pt-6 border-t border-border/50">
          <p className="text-muted text-xs text-center mb-3">Toujours inclus, gratuitement</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs text-muted">
            <span>✓ Saisie live illimitée</span>
            <span>✓ Bilan de saison</span>
            <span>✓ Historique des matchs</span>
            <span>✓ Parcours & clubs</span>
          </div>
        </div>
      </div>
    </div>
  );
}

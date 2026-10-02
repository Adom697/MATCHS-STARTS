import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { StadiumBackground } from '@/components/StadiumBackground';

export default async function SubscriptionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: player } = await supabase
    .from('players')
    .select('plan, plan_code')
    .eq('id', user.id)
    .single();

  const { data: plans } = await supabase.from('plans').select('*').order('sort_order');

  const currentCode = player?.plan_code || (player?.plan === 'pro' ? 'carriere' : 'free');

  return (
    <div className="min-h-screen relative px-5 py-8 max-w-md mx-auto">
      <StadiumBackground src="/images/subscription-bg.jpg" overlay={0.8} />

      <Link href="/dashboard" className="text-muted text-sm mb-6 inline-block">
        ← Tableau de bord
      </Link>

      <h1 className="text-2xl font-bold text-foreground mb-1">Abonnements</h1>
      <p className="text-muted text-sm mb-6">
        Du joueur qui gère tout seul à celui qui veut une analyse complète de ses matchs.
      </p>

      <div className="space-y-4">
        {(plans || []).map((p) => {
          const isCurrent = p.code === currentCode;
          const features = (p.features as string[]) || [];
          return (
            <div
              key={p.code}
              className={`bg-surface/95 backdrop-blur border rounded-2xl p-5 ${
                isCurrent ? 'border-accent-strong border-2' : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-bold text-foreground">{p.name}</h2>
                {isCurrent && (
                  <span className="text-xs font-semibold text-accent bg-accent-strong/15 px-2 py-0.5 rounded-full">
                    Actuel
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-foreground mb-3">
                {p.price_fcfa === 0 ? 'Gratuit' : `${p.price_fcfa.toLocaleString('fr-FR')} FCFA`}
                {p.price_fcfa > 0 && <span className="text-sm text-muted font-normal">/mois</span>}
              </p>
              <ul className="space-y-1.5 mb-4">
                {features.map((f) => (
                  <li key={f} className="text-sm text-muted">
                    ✓ {f}
                  </li>
                ))}
              </ul>
              {!isCurrent && p.price_fcfa > 0 && (
                <button
                  disabled
                  className="w-full bg-accent-strong/40 text-black/60 font-semibold rounded-lg py-2.5 text-sm cursor-not-allowed"
                >
                  Contacte-nous pour souscrire
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-muted text-xs mt-6 text-center">
        Paiement Mobile Money (MTN, Moov) via Kkiapay — activation en cours de finalisation pour les
        nouvelles offres.
      </p>
    </div>
  );
}

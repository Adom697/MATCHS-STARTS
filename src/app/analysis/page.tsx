import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { analyzeWeaknesses, type MatchStatsRow } from '@/lib/analysis';

export default async function AnalysisPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  let player = (await supabase.from('players').select('*').eq('id', user.id).maybeSingle()).data;

  if (!player) {
    const { data: assistant } = await supabase
      .from('assistants')
      .select('player_id')
      .eq('id', user.id)
      .maybeSingle();
    if (assistant) {
      player = (await supabase.from('players').select('*').eq('id', assistant.player_id).maybeSingle()).data;
    }
  }

  if (!player) redirect('/onboarding');

  if (player.plan !== 'pro') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-background">
        <div className="w-full max-w-sm text-center">
          <div className="bg-surface border border-accent-strong/30 rounded-2xl p-6">
            <span className="text-xs font-semibold text-accent bg-accent-strong/15 px-2 py-0.5 rounded-full">
              PRO
            </span>
            <h1 className="text-xl font-bold text-foreground mt-3">Analyse & Progression</h1>
            <p className="text-muted text-sm mt-2">
              Détecte automatiquement tes points faibles à partir de tes stats, avec des exercices
              concrets pour progresser — réservé à l&apos;abonnement Pro.
            </p>
            <Link
              href="/profile/subscription"
              className="inline-block mt-4 bg-accent-strong hover:bg-accent text-black font-semibold rounded-lg px-4 py-2 text-sm transition-colors"
            >
              Découvrir le Pro
            </Link>
          </div>
          <Link href="/dashboard" className="text-muted text-sm mt-4 inline-block">
            ← Tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  const { data: matches } = await supabase
    .from('matches')
    .select('*, match_stats(*)')
    .eq('player_id', player.id)
    .eq('status', 'termine')
    .order('match_date', { ascending: false })
    .limit(10);

  const allMatches = matches || [];
  const statsOf = (m: (typeof allMatches)[number]) => {
    const s = Array.isArray(m.match_stats) ? m.match_stats[0] : m.match_stats;
    return (s || {}) as MatchStatsRow;
  };

  const recent = allMatches.slice(0, 5).map(statsOf);
  const previous = allMatches.slice(5, 10).map(statsOf);

  const weaknesses = analyzeWeaknesses(player.position, recent, previous);

  const trendLabel: Record<string, { text: string; color: string }> = {
    up: { text: '↗ En progrès', color: 'text-accent' },
    down: { text: '↘ En baisse', color: 'text-danger' },
    stable: { text: '→ Stable', color: 'text-muted' },
    new: { text: 'Première analyse', color: 'text-muted' },
  };

  return (
    <div className="min-h-screen bg-background px-5 py-8 max-w-2xl mx-auto">
      <Link href="/dashboard" className="text-muted text-sm mb-4 inline-block">
        ← Tableau de bord
      </Link>
      <h1 className="text-2xl font-bold text-foreground mb-1">Analyse & Progression</h1>
      <p className="text-muted text-sm mb-6">
        Basé sur tes {recent.length} derniers match{recent.length > 1 ? 's' : ''} terminé
        {recent.length > 1 ? 's' : ''}.
      </p>

      {recent.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-6 text-center">
          <p className="text-muted text-sm">
            Termine au moins un match pour que l&apos;analyse puisse démarrer.
          </p>
        </div>
      ) : weaknesses.length === 0 ? (
        <div className="bg-surface border border-accent-strong/30 rounded-2xl p-6 text-center">
          <p className="text-foreground font-medium">Aucun point faible détecté 🎉</p>
          <p className="text-muted text-sm mt-1">
            Tes ratios sont au-dessus des seuils sur tous les indicateurs suivis pour ton poste.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {weaknesses.map((w) => (
            <div key={w.key} className="bg-surface border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-foreground font-semibold">{w.title}</h2>
                <span className={`text-xs font-medium ${trendLabel[w.trend].color}`}>
                  {trendLabel[w.trend].text}
                </span>
              </div>
              <p className="text-muted text-sm mb-3">
                Taux de réussite actuel : <span className="text-foreground font-semibold">{Math.round(w.ratio * 100)}%</span>
                {w.previousRatio !== null && (
                  <> (précédemment {Math.round(w.previousRatio * 100)}%)</>
                )}
              </p>
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                Exercices recommandés
              </p>
              <ul className="space-y-1.5">
                {w.exercises.map((ex, i) => (
                  <li key={i} className="text-sm text-foreground flex gap-2">
                    <span className="text-accent">•</span>
                    {ex}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <p className="text-muted text-xs mt-6 text-center">
        Analyse basée sur tes statistiques de match, pas sur une intelligence artificielle — recalculée à
        chaque nouveau match terminé.
      </p>
    </div>
  );
}

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

const STAT_LABELS: Record<string, string> = {
  touches: 'Touches de balle',
  passes_reussies: 'Passes réussies',
  passes_ratees: 'Passes ratées',
  passes_decisives: 'Passes décisives',
  dribbles_reussis: 'Dribbles réussis',
  dribbles_rates: 'Dribbles ratés',
  tirs_cadres: 'Tirs cadrés',
  buts: 'Buts',
};

export default async function PublicPlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: player } = await supabase
    .from('players')
    .select('*')
    .eq('public_slug', slug)
    .eq('is_public', true)
    .maybeSingle();

  if (!player) notFound();

  const { data: matches } = await supabase
    .from('matches')
    .select('*, match_stats(*)')
    .eq('player_id', player.id)
    .eq('status', 'termine')
    .order('match_date', { ascending: false });

  const seasonTotals: Record<string, number> = {};
  for (const key of Object.keys(STAT_LABELS)) seasonTotals[key] = 0;
  for (const m of matches || []) {
    const stats = Array.isArray(m.match_stats) ? m.match_stats[0] : m.match_stats;
    if (!stats) continue;
    for (const key of Object.keys(STAT_LABELS)) seasonTotals[key] += stats[key] || 0;
  }

  return (
    <div className="min-h-screen bg-background px-5 py-10 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        {player.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={player.avatar_url}
            alt={player.first_name}
            className="w-20 h-20 rounded-full object-cover border-2 border-accent"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-surface-2 border border-border flex items-center justify-center text-muted text-2xl">
            {player.first_name?.[0]}
            {player.last_name?.[0]}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {player.first_name} {player.last_name}
          </h1>
          <p className="text-muted text-sm">
            {player.current_club || 'Club non renseigné'}
            {player.position ? ` · ${player.position}` : ''}
            {player.jersey_number ? ` · #${player.jersey_number}` : ''}
          </p>
        </div>
      </div>

      {player.achievements && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">Palmarès</h2>
          <p className="text-foreground whitespace-pre-line bg-surface border border-border rounded-xl p-4">
            {player.achievements}
          </p>
        </section>
      )}

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
          Statistiques de la saison · {(matches || []).length} match{(matches || []).length > 1 ? 's' : ''}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(STAT_LABELS).map(([key, label]) => (
            <div key={key} className="bg-surface border border-border rounded-xl p-3.5">
              <p className="text-2xl font-bold text-accent">{seasonTotals[key]}</p>
              <p className="text-xs text-muted mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="text-center text-muted text-xs mt-10">Propulsé par MatchStat</p>
    </div>
  );
}

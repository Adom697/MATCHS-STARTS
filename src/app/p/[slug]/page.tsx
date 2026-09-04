import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { PrintButton } from '@/components/PrintButton';

const MIDFIELD_ATTACK_LABELS: Record<string, string> = {
  touches: 'Touches de balle',
  passes_reussies: 'Passes réussies',
  passes_ratees: 'Passes ratées',
  passes_decisives: 'Passes décisives',
  dribbles_reussis: 'Dribbles réussis',
  dribbles_rates: 'Dribbles ratés',
  tirs_cadres: 'Tirs cadrés',
  buts: 'Buts',
};

const DEFENDER_LABELS: Record<string, string> = {
  tacles_reussis: 'Tacles réussis',
  interceptions: 'Interceptions',
  duels_aeriens_gagnes: 'Duels aériens gagnés',
  degagements_reussis: 'Dégagements réussis',
  passes_reussies: 'Passes réussies',
  passes_ratees: 'Passes ratées',
};

const GOALKEEPER_LABELS: Record<string, string> = {
  arrets: 'Arrêts',
  buts_encaisses: 'Buts encaissés',
  penalties_arretes: 'Penaltys arrêtés',
  degagements_reussis: 'Dégagements réussis',
  sorties_aeriennes_reussies: 'Sorties aériennes',
  passes_reussies: 'Passes réussies',
  passes_ratees: 'Passes ratées',
};

function labelsForPosition(position: string | null) {
  if (position === 'Gardien') return GOALKEEPER_LABELS;
  if (position === 'Défenseur') return DEFENDER_LABELS;
  return MIDFIELD_ATTACK_LABELS;
}

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

  const isGoalkeeper = player.position === 'Gardien';
  const STAT_LABELS = labelsForPosition(player.position);

  const { data: matches } = await supabase
    .from('matches')
    .select('*, match_stats(*)')
    .eq('player_id', player.id)
    .eq('status', 'termine')
    .order('match_date', { ascending: false });

  const { data: career } = await supabase
    .from('career_history')
    .select('*')
    .eq('player_id', player.id)
    .order('start_date', { ascending: false, nullsFirst: false });

  const seasonTotals: Record<string, number> = {};
  for (const key of Object.keys(STAT_LABELS)) seasonTotals[key] = 0;
  let wins = 0,
    draws = 0,
    losses = 0,
    cleanSheets = 0;

  for (const m of matches || []) {
    const stats = Array.isArray(m.match_stats) ? m.match_stats[0] : m.match_stats;
    if (stats) {
      for (const key of Object.keys(STAT_LABELS)) seasonTotals[key] += stats[key] || 0;
      if (isGoalkeeper && stats.buts_encaisses === 0) cleanSheets++;
    }
    if (m.team_score !== null && m.opponent_score !== null) {
      if (m.team_score > m.opponent_score) wins++;
      else if (m.team_score === m.opponent_score) draws++;
      else losses++;
    }
  }

  const pageUrl = `https://matchs-starts.vercel.app/p/${slug}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(pageUrl)}`;

  return (
    <div className="min-h-screen bg-background px-5 py-10 max-w-2xl mx-auto print:bg-white print:text-black">
      <div className="flex justify-end mb-4">
        <PrintButton />
      </div>

      <div className="flex flex-col items-center text-center mb-8">
        {player.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={player.avatar_url}
            alt={player.first_name}
            className="w-24 h-24 rounded-full object-cover border-2 border-accent"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-surface-2 border-2 border-border flex items-center justify-center text-muted text-3xl font-medium">
            {player.first_name?.[0]}
            {player.last_name?.[0]}
          </div>
        )}
        <h1 className="text-2xl font-bold text-foreground print:text-black mt-3">
          {player.first_name} {player.last_name}
        </h1>
        <p className="text-muted text-sm mt-0.5">
          {player.current_club || 'Club non renseigné'}
          {player.position ? ` · ${player.position}` : ''}
          {player.jersey_number ? ` · #${player.jersey_number}` : ''}
        </p>
      </div>

      {player.achievements && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">Palmarès</h2>
          <p className="text-foreground print:text-black whitespace-pre-line bg-surface print:bg-white print:border-gray-300 border border-border rounded-xl p-4">
            {player.achievements}
          </p>
        </section>
      )}

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
          Bilan · {(matches || []).length} match{(matches || []).length > 1 ? 's' : ''}
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-surface print:bg-white print:border-gray-300 border border-border rounded-xl p-3.5 text-center">
            <p className="text-2xl font-bold text-accent">{wins}</p>
            <p className="text-xs text-muted mt-0.5">Victoires</p>
          </div>
          <div className="bg-surface print:bg-white print:border-gray-300 border border-border rounded-xl p-3.5 text-center">
            <p className="text-2xl font-bold text-foreground print:text-black">{draws}</p>
            <p className="text-xs text-muted mt-0.5">Nuls</p>
          </div>
          <div className="bg-surface print:bg-white print:border-gray-300 border border-border rounded-xl p-3.5 text-center">
            <p className="text-2xl font-bold text-danger">{losses}</p>
            <p className="text-xs text-muted mt-0.5">Défaites</p>
          </div>
        </div>
        {isGoalkeeper && (
          <div className="mt-3 bg-surface print:bg-white print:border-gray-300 border border-border rounded-xl p-3.5 text-center">
            <p className="text-2xl font-bold text-accent">{cleanSheets}</p>
            <p className="text-xs text-muted mt-0.5">Clean sheets</p>
          </div>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Statistiques</h2>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(STAT_LABELS).map(([key, label]) => (
            <div key={key} className="bg-surface print:bg-white print:border-gray-300 border border-border rounded-xl p-3.5">
              <p className="text-2xl font-bold text-accent">{seasonTotals[key]}</p>
              <p className="text-xs text-muted mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {(career || []).length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Parcours</h2>
          <div className="space-y-2">
            {(career || []).map((entry) => (
              <div
                key={entry.id}
                className="bg-surface print:bg-white print:border-gray-300 border border-border rounded-xl p-3.5"
              >
                <p className="text-foreground print:text-black font-medium">{entry.club}</p>
                <p className="text-muted text-xs mt-0.5">
                  {entry.category ? `${entry.category} · ` : ''}
                  {entry.start_date
                    ? new Date(entry.start_date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
                    : '?'}
                  {' → '}
                  {entry.is_current
                    ? "Aujourd'hui"
                    : entry.end_date
                    ? new Date(entry.end_date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
                    : '?'}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col items-center gap-2 mt-10 print:mt-16">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrUrl} alt="QR code du profil" width={120} height={120} className="rounded-lg bg-white p-2" />
        <p className="text-muted text-xs">Scanne pour retrouver ce profil</p>
      </section>

      <p className="text-center text-muted text-xs mt-6">Propulsé par MatchStat</p>
    </div>
  );
}

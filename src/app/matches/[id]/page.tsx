import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const MIDFIELD_ATTACK_ROWS: { key: string; label: string }[] = [
  { key: 'touches', label: 'Touches de balle' },
  { key: 'passes_reussies', label: 'Passes réussies' },
  { key: 'passes_ratees', label: 'Passes ratées' },
  { key: 'passes_decisives', label: 'Passes décisives' },
  { key: 'dribbles_reussis', label: 'Dribbles réussis' },
  { key: 'dribbles_rates', label: 'Dribbles ratés' },
  { key: 'tirs_cadres', label: 'Tirs cadrés' },
  { key: 'tirs_non_cadres', label: 'Tirs non cadrés' },
  { key: 'buts', label: 'Buts' },
  { key: 'ballons_perdus', label: 'Ballons perdus' },
  { key: 'ballons_recuperes', label: 'Ballons récupérés' },
  { key: 'fautes_commises', label: 'Fautes commises' },
  { key: 'fautes_subies', label: 'Fautes subies' },
  { key: 'cartons_jaunes', label: 'Cartons jaunes' },
  { key: 'cartons_rouges', label: 'Cartons rouges' },
];

const DEFENDER_ROWS: { key: string; label: string }[] = [
  { key: 'tacles_reussis', label: 'Tacles réussis' },
  { key: 'tacles_rates', label: 'Tacles ratés' },
  { key: 'interceptions', label: 'Interceptions' },
  { key: 'duels_aeriens_gagnes', label: 'Duels aériens gagnés' },
  { key: 'duels_aeriens_perdus', label: 'Duels aériens perdus' },
  { key: 'degagements_reussis', label: 'Dégagements réussis' },
  { key: 'degagements_rates', label: 'Dégagements ratés' },
  { key: 'touches', label: 'Touches de balle' },
  { key: 'passes_reussies', label: 'Passes réussies' },
  { key: 'passes_ratees', label: 'Passes ratées' },
  { key: 'fautes_commises', label: 'Fautes commises' },
  { key: 'fautes_subies', label: 'Fautes subies' },
  { key: 'cartons_jaunes', label: 'Cartons jaunes' },
  { key: 'cartons_rouges', label: 'Cartons rouges' },
];

const GOALKEEPER_ROWS: { key: string; label: string }[] = [
  { key: 'arrets', label: 'Arrêts' },
  { key: 'buts_encaisses', label: 'Buts encaissés' },
  { key: 'penalties_arretes', label: 'Penaltys arrêtés' },
  { key: 'degagements_reussis', label: 'Dégagements réussis' },
  { key: 'degagements_rates', label: 'Dégagements ratés' },
  { key: 'sorties_aeriennes_reussies', label: 'Sorties aériennes' },
  { key: 'touches', label: 'Touches de balle' },
  { key: 'passes_reussies', label: 'Passes réussies' },
  { key: 'passes_ratees', label: 'Passes ratées' },
  { key: 'fautes_commises', label: 'Fautes commises' },
  { key: 'fautes_subies', label: 'Fautes subies' },
  { key: 'cartons_jaunes', label: 'Cartons jaunes' },
  { key: 'cartons_rouges', label: 'Cartons rouges' },
];

function rowsForPosition(position: string | null) {
  if (position === 'Gardien') return GOALKEEPER_ROWS;
  if (position === 'Défenseur') return DEFENDER_ROWS;
  return MIDFIELD_ATTACK_ROWS;
}

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: match } = await supabase
    .from('matches')
    .select('*, players(position)')
    .eq('id', id)
    .single();
  const { data: stats } = await supabase.from('match_stats').select('*').eq('match_id', id).single();

  if (!match) redirect('/dashboard');

  const STAT_ROWS = rowsForPosition(match.players?.position || null);
  const hasScore = match.team_score !== null && match.opponent_score !== null;
  const hasRatings = match.player_rating !== null || match.coach_rating !== null;

  return (
    <div className="min-h-screen bg-background px-5 py-8 max-w-2xl mx-auto">
      <Link href="/dashboard" className="text-muted text-sm mb-4 inline-block">
        ← Tableau de bord
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">vs {match.opponent}</h1>
        <p className="text-muted text-sm mt-1">
          {new Date(match.match_date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
          {match.competition ? ` · ${match.competition}` : ''}
          {match.home_away ? ` · ${match.home_away === 'domicile' ? 'Domicile' : 'Extérieur'}` : ''}
        </p>
        {hasScore && (
          <p className="text-3xl font-bold text-foreground mt-3">
            {match.team_score} - {match.opponent_score}
          </p>
        )}
        {match.minutes_played !== null && (
          <p className="text-muted text-sm mt-1">{match.minutes_played} minutes jouées</p>
        )}
      </div>

      {hasRatings && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {match.player_rating !== null && (
            <div className="bg-surface border border-border rounded-xl p-3.5 text-center">
              <p className="text-2xl font-bold text-accent">{match.player_rating}/10</p>
              <p className="text-xs text-muted mt-0.5">Ma note</p>
            </div>
          )}
          {match.coach_rating !== null && (
            <div className="bg-surface border border-border rounded-xl p-3.5 text-center">
              <p className="text-2xl font-bold text-accent">{match.coach_rating}/10</p>
              <p className="text-xs text-muted mt-0.5">Note du coach</p>
            </div>
          )}
        </div>
      )}

      {stats ? (
        <div className="grid grid-cols-2 gap-3">
          {STAT_ROWS.map((row) => (
            <div key={row.key} className="bg-surface border border-border rounded-xl p-3.5">
              <p className="text-2xl font-bold text-accent">{stats[row.key]}</p>
              <p className="text-xs text-muted mt-0.5">{row.label}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted text-sm">Aucune statistique enregistrée pour ce match.</p>
      )}
    </div>
  );
}

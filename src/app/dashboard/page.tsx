import { createClient } from '@/lib/supabase/server';
import { logOut } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const STAT_LABELS: Record<string, string> = {
  touches: 'Touches de balle',
  passes_reussies: 'Passes réussies',
  passes_ratees: 'Passes ratées',
  dribbles_reussis: 'Dribbles réussis',
  dribbles_rates: 'Dribbles ratés',
  tirs_cadres: 'Tirs cadrés',
  tirs_non_cadres: 'Tirs non cadrés',
  buts: 'Buts',
  passes_decisives: 'Passes décisives',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  let player = (await supabase.from('players').select('*').eq('id', user.id).maybeSingle()).data;
  let isAssistant = false;

  if (!player) {
    const { data: assistant } = await supabase
      .from('assistants')
      .select('player_id')
      .eq('id', user.id)
      .maybeSingle();

    if (assistant) {
      isAssistant = true;
      player = (await supabase.from('players').select('*').eq('id', assistant.player_id).maybeSingle()).data;
    }
  }

  if (!player) redirect('/onboarding');

  const { data: matches } = await supabase
    .from('matches')
    .select('*, match_stats(*)')
    .eq('player_id', player.id)
    .order('match_date', { ascending: false });

  const seasonTotals: Record<string, number> = {};
  for (const key of Object.keys(STAT_LABELS)) seasonTotals[key] = 0;

  for (const m of matches || []) {
    const stats = Array.isArray(m.match_stats) ? m.match_stats[0] : m.match_stats;
    if (!stats) continue;
    for (const key of Object.keys(STAT_LABELS)) {
      seasonTotals[key] += stats[key] || 0;
    }
  }

  const matchCount = matches?.length || 0;

  return (
    <div className="min-h-screen bg-background px-5 py-8 max-w-2xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {player.first_name} {player.last_name}
          </h1>
          <p className="text-muted text-sm mt-0.5">
            {player.current_club || 'Aucun club renseigné'}
            {player.position ? ` · ${player.position}` : ''}
            {player.jersey_number ? ` · #${player.jersey_number}` : ''}
          </p>
        </div>
        <form action={logOut}>
          <button type="submit" className="text-muted text-sm hover:text-foreground">
            Déconnexion
          </button>
        </form>
      </div>

      <Link
        href="/matches/new"
        className="block w-full text-center bg-accent-strong hover:bg-accent text-black font-semibold rounded-xl py-3.5 mb-8 transition-colors"
      >
        + Nouveau match
      </Link>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
          Saison en cours · {matchCount} match{matchCount > 1 ? 's' : ''}
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

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Matchs</h2>
        <div className="space-y-2">
          {(matches || []).length === 0 && (
            <p className="text-muted text-sm">Aucun match enregistré pour l&apos;instant.</p>
          )}
          {(matches || []).map((m) => (
            <Link
              key={m.id}
              href={m.status === 'termine' ? `/matches/${m.id}` : `/matches/${m.id}/live`}
              className="flex items-center justify-between bg-surface border border-border rounded-xl px-4 py-3 hover:border-accent transition-colors"
            >
              <div>
                <p className="text-foreground font-medium">vs {m.opponent}</p>
                <p className="text-muted text-xs mt-0.5">
                  {new Date(m.match_date).toLocaleDateString('fr-FR')}
                  {m.competition ? ` · ${m.competition}` : ''}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  m.status === 'en_direct'
                    ? 'bg-danger/20 text-danger'
                    : m.status === 'termine'
                    ? 'bg-surface-2 text-muted'
                    : 'bg-accent/20 text-accent'
                }`}
              >
                {m.status === 'en_direct' ? 'En direct' : m.status === 'termine' ? 'Terminé' : 'À venir'}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {!isAssistant && (
        <section>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Assistants</h2>
          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-muted text-sm mb-2">
              Partage ce code à une personne pour qu&apos;elle puisse saisir tes stats en direct à ta place.
            </p>
            <p className="text-2xl font-mono font-bold text-accent tracking-widest">{player.invite_code}</p>
          </div>
        </section>
      )}
    </div>
  );
}

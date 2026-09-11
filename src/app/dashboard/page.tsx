import { createClient } from '@/lib/supabase/server';
import { logOut } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

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
  tacles_rates: 'Tacles ratés',
  interceptions: 'Interceptions',
  duels_aeriens_gagnes: 'Duels aériens gagnés',
  degagements_reussis: 'Dégagements réussis',
  passes_reussies: 'Passes réussies',
  passes_ratees: 'Passes ratées',
  fautes_commises: 'Fautes commises',
};

const GOALKEEPER_LABELS: Record<string, string> = {
  arrets: 'Arrêts',
  buts_encaisses: 'Buts encaissés',
  penalties_arretes: 'Penaltys arrêtés',
  degagements_reussis: 'Dégagements réussis',
  degagements_rates: 'Dégagements ratés',
  sorties_aeriennes_reussies: 'Sorties aériennes',
  passes_reussies: 'Passes réussies',
  passes_ratees: 'Passes ratées',
};

function labelsForPosition(position: string | null) {
  if (position === 'Gardien') return GOALKEEPER_LABELS;
  if (position === 'Défenseur') return DEFENDER_LABELS;
  return MIDFIELD_ATTACK_LABELS;
}

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

  const isGoalkeeper = player.position === 'Gardien';
  const STAT_LABELS = labelsForPosition(player.position);

  const { data: matches } = await supabase
    .from('matches')
    .select('*, match_stats(*)')
    .eq('player_id', player.id)
    .order('match_date', { ascending: false });

  const seasonTotals: Record<string, number> = {};
  for (const key of Object.keys(STAT_LABELS)) seasonTotals[key] = 0;

  let wins = 0,
    draws = 0,
    losses = 0,
    cleanSheets = 0,
    playedCount = 0;
  let ratingSum = 0,
    ratingCount = 0;

  for (const m of matches || []) {
    const stats = Array.isArray(m.match_stats) ? m.match_stats[0] : m.match_stats;
    if (stats) {
      for (const key of Object.keys(STAT_LABELS)) {
        seasonTotals[key] += stats[key] || 0;
      }
      if (isGoalkeeper && m.status === 'termine' && stats.buts_encaisses === 0) cleanSheets++;
    }

    if (m.status === 'termine') {
      playedCount++;
      if (m.team_score !== null && m.opponent_score !== null) {
        if (m.team_score > m.opponent_score) wins++;
        else if (m.team_score === m.opponent_score) draws++;
        else losses++;
      }
      if (m.player_rating !== null) {
        ratingSum += m.player_rating;
        ratingCount++;
      }
    }
  }

  const matchCount = matches?.length || 0;
  const avgRating = ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : null;

  return (
    <div className="min-h-screen bg-background px-5 py-8 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-2">
        {user.email === 'cedriccassy312@gmail.com' ? (
          <Link href="/admin" className="text-muted text-sm hover:text-foreground">
            📊 Admin
          </Link>
        ) : (
          <span />
        )}
        <form action={logOut}>
          <button type="submit" className="text-muted text-sm hover:text-foreground">
            Déconnexion
          </button>
        </form>
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
        <h1 className="text-2xl font-bold text-foreground mt-3">
          {player.first_name} {player.last_name}
        </h1>
        <p className="text-muted text-sm mt-0.5">
          {player.current_club || 'Aucun club renseigné'}
          {player.position ? ` · ${player.position}` : ''}
          {player.jersey_number ? ` · #${player.jersey_number}` : ''}
        </p>
      </div>

      {!isAssistant && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Link
            href="/profile/edit"
            className="text-center border border-border text-foreground rounded-xl py-2.5 text-sm hover:border-accent transition-colors"
          >
            Modifier mon profil
          </Link>
          <Link
            href="/profile/career"
            className="text-center border border-border text-foreground rounded-xl py-2.5 text-sm hover:border-accent transition-colors"
          >
            Parcours & clubs
          </Link>
        </div>
      )}

      <Link
        href="/analysis"
        className="flex items-center justify-center gap-2 w-full text-center border border-border text-foreground rounded-xl py-2.5 mb-3 text-sm hover:border-accent transition-colors"
      >
        Analyse & Progression
        <span className="text-[10px] font-semibold text-accent bg-accent-strong/15 px-2 py-0.5 rounded-full">
          PRO
        </span>
      </Link>

      {!isAssistant && (
        <Link
          href="/profile/subscription"
          className="flex items-center justify-center gap-2 w-full text-center border border-border text-foreground rounded-xl py-2.5 mb-3 text-sm hover:border-accent transition-colors"
        >
          Abonnement
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              player.plan === 'pro' ? 'text-accent bg-accent-strong/15' : 'text-muted bg-surface-2'
            }`}
          >
            {player.plan === 'pro' ? 'PRO' : 'GRATUIT'}
          </span>
        </Link>
      )}

      {!isAssistant && player.is_public && player.public_slug && (
        <a
          href={`https://matchs-starts.vercel.app/p/${player.public_slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center text-accent text-sm py-2 mb-3 underline"
        >
          Voir ma page vitrine →
        </a>
      )}

      <Link
        href="/matches/new"
        className="block w-full text-center bg-accent-strong hover:bg-accent text-black font-semibold rounded-xl py-3.5 mb-3 transition-colors"
      >
        + Nouveau match
      </Link>

      <Link
        href="/feedback"
        className="block w-full text-center text-muted text-sm py-2 mb-8 hover:text-foreground transition-colors"
      >
        💬 Donner mon avis sur l&apos;app
      </Link>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
          Bilan de la saison · {playedCount} match{playedCount > 1 ? 's' : ''} joué{playedCount > 1 ? 's' : ''}
        </h2>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="bg-surface border border-border rounded-xl p-3.5 text-center">
            <p className="text-2xl font-bold text-accent">{wins}</p>
            <p className="text-xs text-muted mt-0.5">Victoires</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-3.5 text-center">
            <p className="text-2xl font-bold text-foreground">{draws}</p>
            <p className="text-xs text-muted mt-0.5">Nuls</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-3.5 text-center">
            <p className="text-2xl font-bold text-danger">{losses}</p>
            <p className="text-xs text-muted mt-0.5">Défaites</p>
          </div>
        </div>
        <div className={`grid gap-3 ${isGoalkeeper || avgRating ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {isGoalkeeper && (
            <div className="bg-surface border border-border rounded-xl p-3.5 text-center">
              <p className="text-2xl font-bold text-accent">{cleanSheets}</p>
              <p className="text-xs text-muted mt-0.5">Clean sheets</p>
            </div>
          )}
          {avgRating && (
            <div className="bg-surface border border-border rounded-xl p-3.5 text-center">
              <p className="text-2xl font-bold text-accent">{avgRating}/10</p>
              <p className="text-xs text-muted mt-0.5">Note moyenne</p>
            </div>
          )}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
          Statistiques · {matchCount} match{matchCount > 1 ? 's' : ''}
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

      {!isAssistant && player.plan !== 'pro' && matchCount >= 2 && (
        <section className="mb-8">
          <div className="bg-gradient-to-br from-accent-strong/15 to-surface border border-accent-strong/30 rounded-2xl p-5">
            <p className="text-foreground font-semibold mb-1">
              {matchCount} matchs enregistrés — de quoi impressionner un recruteur 👀
            </p>
            <p className="text-muted text-sm mb-3">
              Passe en Pro pour transformer tes stats en page vitrine, CV PDF et QR code partageable.
            </p>
            <Link
              href="/profile/subscription"
              className="inline-block bg-accent-strong hover:bg-accent text-black font-semibold rounded-lg px-4 py-2 text-sm transition-colors"
            >
              Découvrir le Pro
            </Link>
          </div>
        </section>
      )}

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

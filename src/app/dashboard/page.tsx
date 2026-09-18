import { createClient } from '@/lib/supabase/server';
import { logOut } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { StadiumBackground } from '@/components/StadiumBackground';
import { PlayerCardAvatar } from '@/components/PlayerCardAvatar';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { getLocale } from '@/lib/locale';
import { getDictionary, translatePosition } from '@/lib/i18n';

const MIDFIELD_ATTACK_LABELS_FR: Record<string, string> = {
  touches: 'Touches de balle',
  passes_reussies: 'Passes réussies',
  passes_ratees: 'Passes ratées',
  passes_decisives: 'Passes décisives',
  dribbles_reussis: 'Dribbles réussis',
  dribbles_rates: 'Dribbles ratés',
  tirs_cadres: 'Tirs cadrés',
  buts: 'Buts',
};

const DEFENDER_LABELS_FR: Record<string, string> = {
  tacles_reussis: 'Tacles réussis',
  tacles_rates: 'Tacles ratés',
  interceptions: 'Interceptions',
  duels_aeriens_gagnes: 'Duels aériens gagnés',
  degagements_reussis: 'Dégagements réussis',
  passes_reussies: 'Passes réussies',
  passes_ratees: 'Passes ratées',
  fautes_commises: 'Fautes commises',
};

const GOALKEEPER_LABELS_FR: Record<string, string> = {
  arrets: 'Arrêts',
  buts_encaisses: 'Buts encaissés',
  penalties_arretes: 'Penaltys arrêtés',
  degagements_reussis: 'Dégagements réussis',
  degagements_rates: 'Dégagements ratés',
  sorties_aeriennes_reussies: 'Sorties aériennes',
  passes_reussies: 'Passes réussies',
  passes_ratees: 'Passes ratées',
};

const MIDFIELD_ATTACK_LABELS_EN: Record<string, string> = {
  touches: 'Touches',
  passes_reussies: 'Passes completed',
  passes_ratees: 'Passes missed',
  passes_decisives: 'Key passes',
  dribbles_reussis: 'Dribbles won',
  dribbles_rates: 'Dribbles lost',
  tirs_cadres: 'Shots on target',
  buts: 'Goals',
};

const DEFENDER_LABELS_EN: Record<string, string> = {
  tacles_reussis: 'Tackles won',
  tacles_rates: 'Tackles lost',
  interceptions: 'Interceptions',
  duels_aeriens_gagnes: 'Aerial duels won',
  degagements_reussis: 'Clearances',
  passes_reussies: 'Passes completed',
  passes_ratees: 'Passes missed',
  fautes_commises: 'Fouls committed',
};

const GOALKEEPER_LABELS_EN: Record<string, string> = {
  arrets: 'Saves',
  buts_encaisses: 'Goals conceded',
  penalties_arretes: 'Penalties saved',
  degagements_reussis: 'Clearances',
  degagements_rates: 'Failed clearances',
  sorties_aeriennes_reussies: 'Claims',
  passes_reussies: 'Passes completed',
  passes_ratees: 'Passes missed',
};

function labelsForPosition(position: string | null, locale: 'fr' | 'en') {
  if (locale === 'en') {
    if (position === 'Gardien') return GOALKEEPER_LABELS_EN;
    if (position === 'Défenseur') return DEFENDER_LABELS_EN;
    return MIDFIELD_ATTACK_LABELS_EN;
  }
  if (position === 'Gardien') return GOALKEEPER_LABELS_FR;
  if (position === 'Défenseur') return DEFENDER_LABELS_FR;
  return MIDFIELD_ATTACK_LABELS_FR;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const locale = await getLocale();
  const t = getDictionary(locale);

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

  if (!player) {
    const { data: coach } = await supabase.from('coaches').select('id').eq('id', user.id).maybeSingle();
    if (coach) redirect('/coach');
    redirect('/onboarding');
  }

  const isGoalkeeper = player.position === 'Gardien';
  const STAT_LABELS = labelsForPosition(player.position, locale);

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
  const dateLocale = locale === 'en' ? 'en-GB' : 'fr-FR';

  return (
    <div className="min-h-screen px-5 py-8 max-w-2xl mx-auto relative">
      <StadiumBackground overlay={0.65} />
      <div className="flex justify-between items-center mb-2">
        {user.email === 'cedriccassy312@gmail.com' ? (
          <Link href="/admin" className="text-muted text-sm hover:text-foreground">
            📊 Admin
          </Link>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-3">
          <LanguageSwitcher locale={locale} returnTo="/dashboard" />
          <form action={logOut}>
            <button type="submit" className="text-muted text-sm hover:text-foreground">
              {t.dash_logout}
            </button>
          </form>
        </div>
      </div>

      <div className="flex flex-col items-center text-center mb-8 animate-in">
        <PlayerCardAvatar
          src={player.avatar_url}
          initials={`${player.first_name?.[0] || ''}${player.last_name?.[0] || ''}`}
          size={100}
        />
        <h1 className="text-2xl font-bold text-foreground mt-3">
          {player.first_name} {player.last_name}
        </h1>
        <p className="text-muted text-sm mt-0.5">
          {player.current_club || (locale === 'en' ? 'No club yet' : 'Aucun club renseigné')}
          {player.position ? ` · ${translatePosition(player.position, locale)}` : ''}
          {player.jersey_number ? ` · #${player.jersey_number}` : ''}
        </p>
      </div>

      {!isAssistant && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Link
            href="/profile/edit"
            className="text-center border border-border text-foreground rounded-xl py-2.5 text-sm hover:border-accent active:scale-[0.98] transition-all"
          >
            {t.dash_edit_profile}
          </Link>
          <Link
            href="/profile/career"
            className="text-center border border-border text-foreground rounded-xl py-2.5 text-sm hover:border-accent active:scale-[0.98] transition-all"
          >
            {t.dash_career}
          </Link>
        </div>
      )}

      <Link
        href="/analysis"
        className="flex items-center justify-center gap-2 w-full text-center border border-border text-foreground rounded-xl py-2.5 mb-3 text-sm hover:border-accent active:scale-[0.98] transition-all"
      >
        {t.dash_analysis}
        <span className="text-[10px] font-semibold text-accent bg-accent-strong/15 px-2 py-0.5 rounded-full">
          PRO
        </span>
      </Link>

      {!isAssistant && (
        <Link
          href="/profile/subscription"
          className="flex items-center justify-center gap-2 w-full text-center border border-border text-foreground rounded-xl py-2.5 mb-3 text-sm hover:border-accent active:scale-[0.98] transition-all"
        >
          {t.dash_subscription}
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              player.plan === 'pro' ? 'text-accent bg-accent-strong/15' : 'text-muted bg-surface-2'
            }`}
          >
            {player.plan === 'pro' ? 'PRO' : locale === 'en' ? 'FREE' : 'GRATUIT'}
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
          {t.dash_view_vitrine}
        </a>
      )}

      <Link
        href="/matches/new"
        className="block w-full text-center bg-accent-strong hover:bg-accent active:scale-[0.98] text-black font-semibold rounded-xl py-3.5 mb-3 transition-transform animate-pulse-cta"
      >
        {t.dash_new_match}
      </Link>

      <Link
        href="/feedback"
        className="block w-full text-center text-muted text-sm py-2 mb-8 hover:text-foreground transition-colors"
      >
        {t.dash_feedback}
      </Link>

      <section className="mb-8 animate-in">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
          {t.dash_season_summary} · {playedCount} {playedCount > 1 ? t.dash_matches_played_plural : t.dash_matches_played}{' '}
          {playedCount > 1 ? t.dash_played_plural : t.dash_played}
        </h2>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="bg-surface border border-border rounded-xl p-3.5 text-center">
            <p className="text-2xl font-bold text-accent">
              <AnimatedNumber value={wins} />
            </p>
            <p className="text-xs text-muted mt-0.5">{t.dash_wins}</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-3.5 text-center">
            <p className="text-2xl font-bold text-foreground">
              <AnimatedNumber value={draws} />
            </p>
            <p className="text-xs text-muted mt-0.5">{t.dash_draws}</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-3.5 text-center">
            <p className="text-2xl font-bold text-danger">
              <AnimatedNumber value={losses} />
            </p>
            <p className="text-xs text-muted mt-0.5">{t.dash_losses}</p>
          </div>
        </div>
        <div className={`grid gap-3 ${isGoalkeeper || avgRating ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {isGoalkeeper && (
            <div className="bg-surface border border-border rounded-xl p-3.5 text-center">
              <p className="text-2xl font-bold text-accent">
                <AnimatedNumber value={cleanSheets} />
              </p>
              <p className="text-xs text-muted mt-0.5">{t.dash_clean_sheets}</p>
            </div>
          )}
          {avgRating && (
            <div className="bg-surface border border-border rounded-xl p-3.5 text-center">
              <p className="text-2xl font-bold text-accent">{avgRating}/10</p>
              <p className="text-xs text-muted mt-0.5">{t.dash_avg_rating}</p>
            </div>
          )}
        </div>
      </section>

      <section className="mb-8 animate-in" style={{ animationDelay: '80ms' }}>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
          {t.dash_stats} · {matchCount} {matchCount > 1 ? t.dash_matches_played_plural : t.dash_matches_played}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(STAT_LABELS).map(([key, label], i) => (
            <div
              key={key}
              className="bg-surface border border-border rounded-xl p-3.5 animate-in"
              style={{ animationDelay: `${120 + i * 40}ms` }}
            >
              <p className="text-2xl font-bold text-accent">
                <AnimatedNumber value={seasonTotals[key]} />
              </p>
              <p className="text-xs text-muted mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">{t.dash_matches}</h2>
        <div className="space-y-2">
          {(matches || []).length === 0 && <p className="text-muted text-sm">{t.dash_no_matches}</p>}
          {(matches || []).map((m) => (
            <Link
              key={m.id}
              href={m.status === 'termine' ? `/matches/${m.id}` : `/matches/${m.id}/live`}
              className="flex items-center justify-between bg-surface border border-border rounded-xl px-4 py-3 hover:border-accent active:scale-[0.98] transition-all"
            >
              <div>
                <p className="text-foreground font-medium">vs {m.opponent}</p>
                <p className="text-muted text-xs mt-0.5">
                  {new Date(m.match_date).toLocaleDateString(dateLocale)}
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
                {m.status === 'en_direct' && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-danger mr-1.5 animate-pulse-live" />
                )}
                {m.status === 'en_direct' ? t.dash_live : m.status === 'termine' ? t.dash_finished : t.dash_upcoming}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {!isAssistant && player.plan !== 'pro' && matchCount >= 2 && (
        <section className="mb-8">
          <div className="bg-gradient-to-br from-accent-strong/15 to-surface border border-accent-strong/30 rounded-2xl p-5">
            <p className="text-foreground font-semibold mb-1">
              {matchCount} {t.dash_upsell_title}
            </p>
            <p className="text-muted text-sm mb-3">{t.dash_upsell_body}</p>
            <Link
              href="/profile/subscription"
              className="inline-block bg-accent-strong hover:bg-accent text-black font-semibold rounded-lg px-4 py-2 text-sm transition-colors"
            >
              {t.dash_upsell_cta}
            </Link>
          </div>
        </section>
      )}

      {!isAssistant && (
        <section>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">{t.dash_assistants}</h2>
          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-muted text-sm mb-2">{t.dash_assistants_help}</p>
            <p className="text-2xl font-mono font-bold text-accent tracking-widest">{player.invite_code}</p>
          </div>
        </section>
      )}
    </div>
  );
}

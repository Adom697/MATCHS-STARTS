import { createClient } from '@/lib/supabase/server';
import { finishMatch, deleteMatch } from '@/lib/actions/live';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { groupsForPosition } from '@/lib/live-groups';
import { LiveEntryScreen } from '@/components/LiveEntryScreen';
import { getLocale } from '@/lib/locale';
import { getDictionary } from '@/lib/i18n';

export default async function LiveMatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const locale = await getLocale();
  const t = getDictionary(locale);

  const { data: match } = await supabase
    .from('matches')
    .select('*, players(position)')
    .eq('id', id)
    .single();
  const { data: stats } = await supabase.from('match_stats').select('*').eq('match_id', id).single();

  if (!match || !stats) redirect('/dashboard');

  const positionRaw = match.players?.position || null;
  const groups = groupsForPosition(positionRaw, locale);
  const position = positionRaw === 'Gardien' ? 'gardien' : positionRaw === 'Défenseur' ? 'defenseur' : 'autre';

  return (
    <div className="min-h-screen px-4 py-6 max-w-2xl mx-auto pb-32">
      <div className="mb-1">
        <Link href="/dashboard" className="text-muted text-xs">
          ← {locale === 'en' ? 'Dashboard' : 'Tableau de bord'}
        </Link>
        <h1 className="text-xl font-bold text-foreground mt-1">vs {match.opponent}</h1>
      </div>

      <LiveEntryScreen matchId={id} groups={groups} initialStats={stats} position={position} undoLabel={t.live_undo} locale={locale} />

      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border p-4">
        <details className="max-w-2xl mx-auto">
          <summary className="text-center text-muted text-sm cursor-pointer">{t.live_finish}</summary>
          <form action={finishMatch} className="flex flex-col gap-2 mt-3">
            <input type="hidden" name="match_id" value={id} />
            <div className="grid grid-cols-3 gap-2">
              <input
                name="team_score"
                type="number"
                min={0}
                placeholder={locale === 'en' ? 'Your score' : 'Score toi'}
                className="bg-surface-2 border border-border rounded-lg px-2 py-2 text-foreground text-sm"
              />
              <input
                name="opponent_score"
                type="number"
                min={0}
                placeholder={locale === 'en' ? 'Opp. score' : 'Score adv.'}
                className="bg-surface-2 border border-border rounded-lg px-2 py-2 text-foreground text-sm"
              />
              <input
                name="minutes_played"
                type="number"
                min={0}
                max={120}
                placeholder={locale === 'en' ? 'Min. played' : 'Min. jouées'}
                className="bg-surface-2 border border-border rounded-lg px-2 py-2 text-foreground text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                name="player_rating"
                type="number"
                min={0}
                max={10}
                step={0.5}
                placeholder={locale === 'en' ? 'My rating (/10)' : 'Ma note (/10)'}
                className="bg-surface-2 border border-border rounded-lg px-2 py-2 text-foreground text-sm"
              />
              <input
                name="coach_rating"
                type="number"
                min={0}
                max={10}
                step={0.5}
                placeholder={locale === 'en' ? "Coach's rating (/10)" : 'Note du coach (/10)'}
                className="bg-surface-2 border border-border rounded-lg px-2 py-2 text-foreground text-sm"
              />
            </div>
            <button
              type="submit"
              className="bg-accent-strong text-black font-semibold rounded-lg py-2.5 text-sm"
            >
              {t.live_close}
            </button>
          </form>
          <form action={deleteMatch.bind(null, id)} className="mt-3 text-center">
            <button type="submit" className="text-danger text-xs underline">
              {locale === 'en' ? 'Delete this match' : 'Supprimer ce match'}
            </button>
          </form>
        </details>
      </div>
    </div>
  );
}

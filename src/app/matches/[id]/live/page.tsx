import { createClient } from '@/lib/supabase/server';
import { recordEvent, undoLastEvent, finishMatch } from '@/lib/actions/live';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const BUTTON_GROUPS: { title: string; buttons: { type: string; label: string; tone?: 'positive' | 'negative' }[] }[] = [
  {
    title: 'Ballon',
    buttons: [{ type: 'touche', label: 'Touche de balle' }],
  },
  {
    title: 'Passes',
    buttons: [
      { type: 'passe_reussie', label: 'Passe réussie', tone: 'positive' },
      { type: 'passe_ratee', label: 'Passe ratée', tone: 'negative' },
      { type: 'passe_decisive', label: 'Passe décisive', tone: 'positive' },
    ],
  },
  {
    title: 'Dribbles',
    buttons: [
      { type: 'dribble_reussi', label: 'Dribble réussi', tone: 'positive' },
      { type: 'dribble_rate', label: 'Dribble raté', tone: 'negative' },
    ],
  },
  {
    title: 'Tirs',
    buttons: [
      { type: 'tir_cadre', label: 'Tir cadré', tone: 'positive' },
      { type: 'tir_non_cadre', label: 'Tir non cadré', tone: 'negative' },
      { type: 'but', label: 'BUT !', tone: 'positive' },
    ],
  },
  {
    title: 'Ballon perdu / récupéré',
    buttons: [
      { type: 'ballon_perdu', label: 'Ballon perdu', tone: 'negative' },
      { type: 'ballon_recupere', label: 'Ballon récupéré', tone: 'positive' },
    ],
  },
  {
    title: 'Discipline',
    buttons: [
      { type: 'faute_commise', label: 'Faute commise', tone: 'negative' },
      { type: 'faute_subie', label: 'Faute subie', tone: 'positive' },
      { type: 'carton_jaune', label: 'Carton jaune', tone: 'negative' },
      { type: 'carton_rouge', label: 'Carton rouge', tone: 'negative' },
    ],
  },
];

export default async function LiveMatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: match } = await supabase.from('matches').select('*').eq('id', id).single();
  const { data: stats } = await supabase.from('match_stats').select('*').eq('match_id', id).single();

  if (!match || !stats) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-background px-4 py-6 max-w-2xl mx-auto pb-32">
      <div className="flex items-center justify-between mb-5">
        <div>
          <Link href="/dashboard" className="text-muted text-xs">
            ← Tableau de bord
          </Link>
          <h1 className="text-xl font-bold text-foreground mt-1">vs {match.opponent}</h1>
        </div>
        <form action={undoLastEvent.bind(null, id)}>
          <button
            type="submit"
            className="text-sm text-muted border border-border rounded-lg px-3 py-2 hover:text-foreground"
          >
            ↩ Annuler
          </button>
        </form>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="bg-surface border border-border rounded-lg p-2.5 text-center">
          <p className="text-lg font-bold text-accent">{stats.touches}</p>
          <p className="text-[10px] text-muted">Touches</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-2.5 text-center">
          <p className="text-lg font-bold text-accent">{stats.buts}</p>
          <p className="text-[10px] text-muted">Buts</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-2.5 text-center">
          <p className="text-lg font-bold text-accent">
            {stats.passes_reussies}/{stats.passes_reussies + stats.passes_ratees}
          </p>
          <p className="text-[10px] text-muted">Passes</p>
        </div>
      </div>

      <div className="space-y-5">
        {BUTTON_GROUPS.map((group) => (
          <div key={group.title}>
            <h2 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">{group.title}</h2>
            <div className="grid grid-cols-2 gap-2">
              {group.buttons.map((btn) => (
                <form key={btn.type} action={recordEvent.bind(null, id, btn.type)}>
                  <button
                    type="submit"
                    className={`w-full rounded-xl py-4 font-medium text-sm transition-colors active:scale-95 ${
                      btn.tone === 'positive'
                        ? 'bg-accent-strong/15 text-accent border border-accent-strong/30 active:bg-accent-strong/25'
                        : btn.tone === 'negative'
                        ? 'bg-danger/15 text-danger border border-danger/30 active:bg-danger/25'
                        : 'bg-surface-2 text-foreground border border-border active:bg-surface'
                    }`}
                  >
                    {btn.label}
                  </button>
                </form>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border p-4">
        <details className="max-w-2xl mx-auto">
          <summary className="text-center text-muted text-sm cursor-pointer">Terminer le match</summary>
          <form action={finishMatch} className="flex flex-col gap-2 mt-3">
            <input type="hidden" name="match_id" value={id} />
            <div className="grid grid-cols-3 gap-2">
              <input
                name="team_score"
                type="number"
                min={0}
                placeholder="Score toi"
                className="bg-surface-2 border border-border rounded-lg px-2 py-2 text-foreground text-sm"
              />
              <input
                name="opponent_score"
                type="number"
                min={0}
                placeholder="Score adv."
                className="bg-surface-2 border border-border rounded-lg px-2 py-2 text-foreground text-sm"
              />
              <input
                name="minutes_played"
                type="number"
                min={0}
                max={120}
                placeholder="Min. jouées"
                className="bg-surface-2 border border-border rounded-lg px-2 py-2 text-foreground text-sm"
              />
            </div>
            <button
              type="submit"
              className="bg-accent-strong text-black font-semibold rounded-lg py-2.5 text-sm"
            >
              Clôturer le match
            </button>
          </form>
        </details>
      </div>
    </div>
  );
}

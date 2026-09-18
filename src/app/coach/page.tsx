import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { logOut } from '@/lib/actions/auth';
import { addCoachPlayer, removeCoachPlayer } from '@/lib/actions/coach';
import { SubmitButton } from '@/components/SubmitButton';
import Link from 'next/link';

export default async function CoachPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: coach } = await supabase.from('coaches').select('*').eq('id', user.id).maybeSingle();
  if (!coach) redirect('/dashboard');

  const { data: links } = await supabase
    .from('coach_players')
    .select('player_id, players(*)')
    .eq('coach_id', user.id)
    .order('added_at', { ascending: false });

  const playerIds = (links || []).map((l) => l.player_id);

  const { data: matches } = playerIds.length
    ? await supabase.from('matches').select('*, match_stats(*)').in('player_id', playerIds)
    : { data: [] };

  function summaryFor(playerId: string) {
    const playerMatches = (matches || []).filter((m) => m.player_id === playerId);
    const played = playerMatches.filter((m) => m.status === 'termine');
    const last = [...played].sort(
      (a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime()
    )[0];
    return { count: played.length, last };
  }

  return (
    <div className="min-h-screen px-5 py-8 max-w-2xl mx-auto">
      <div className="flex justify-end mb-2">
        <form action={logOut}>
          <button type="submit" className="text-muted text-sm hover:text-foreground">
            Déconnexion
          </button>
        </form>
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-1">Espace Coach</h1>
      <p className="text-muted text-sm mb-6">Suis les performances de tes joueurs, tous en un endroit.</p>

      <form action={addCoachPlayer} className="bg-surface border border-border rounded-2xl p-5 mb-8">
        <label className="block text-sm text-muted mb-1.5">Ajouter un joueur</label>
        <div className="flex gap-2">
          <input
            name="invite_code"
            required
            maxLength={6}
            placeholder="Code du joueur (ex: A1B2C3)"
            className="flex-1 bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-foreground uppercase tracking-widest focus:outline-none focus:border-accent"
          />
          <SubmitButton
            pendingText="..."
            className="bg-accent-strong hover:bg-accent text-black font-semibold rounded-lg px-4 text-sm shrink-0"
          >
            Ajouter
          </SubmitButton>
        </div>
        <p className="text-xs text-muted mt-2">
          Chaque joueur trouve son code dans son tableau de bord, section &quot;Assistants&quot;.
        </p>
        {error && <p className="text-danger text-xs mt-2">{error}</p>}
      </form>

      <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
        Mes joueurs ({links?.length || 0})
      </h2>

      <div className="space-y-2">
        {(links || []).length === 0 && (
          <p className="text-muted text-sm">Aucun joueur suivi pour l&apos;instant.</p>
        )}
        {(links || []).map((link) => {
          const player = link.players as unknown as {
            id: string;
            first_name: string;
            last_name: string;
            current_club: string | null;
            position: string | null;
            player_category: string | null;
          };
          if (!player) return null;
          const { count, last } = summaryFor(player.id);

          return (
            <div key={player.id} className="bg-surface border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-foreground font-semibold">
                    {player.first_name} {player.last_name}
                  </p>
                  <p className="text-muted text-xs mt-0.5">
                    {player.current_club || 'Club non renseigné'}
                    {player.position ? ` · ${player.position}` : ''}
                    {player.player_category ? ` · ${player.player_category}` : ''}
                  </p>
                </div>
                <form action={removeCoachPlayer.bind(null, player.id)}>
                  <button type="submit" className="text-muted text-xs hover:text-danger">
                    Retirer
                  </button>
                </form>
              </div>
              <div className="flex gap-4 mt-3 text-xs text-muted">
                <span>
                  <span className="text-foreground font-semibold">{count}</span> match
                  {count > 1 ? 's' : ''} joué{count > 1 ? 's' : ''}
                </span>
                {last && (
                  <span>
                    Dernier : vs {last.opponent} le {new Date(last.match_date).toLocaleDateString('fr-FR')}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-muted text-xs mt-8 text-center">
        <Link href="/dashboard" className="text-accent">
          ← Retour
        </Link>
      </p>
    </div>
  );
}

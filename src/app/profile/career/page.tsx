import { createClient } from '@/lib/supabase/server';
import { addCareerEntry, deleteCareerEntry } from '@/lib/actions/career';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function CareerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: entries } = await supabase
    .from('career_history')
    .select('*')
    .eq('player_id', user.id)
    .order('start_date', { ascending: false, nullsFirst: false });

  return (
    <div className="min-h-screen bg-background px-5 py-8 max-w-md mx-auto">
      <Link href="/dashboard" className="text-muted text-sm mb-4 inline-block">
        ← Tableau de bord
      </Link>

      <h1 className="text-2xl font-bold text-foreground mb-6">Parcours & clubs</h1>

      <form action={addCareerEntry} className="bg-surface border border-border rounded-2xl p-6 space-y-4 mb-8">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">Ajouter une étape</h2>
        <div>
          <label className="block text-sm text-muted mb-1.5">Club</label>
          <input
            name="club"
            required
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1.5">Catégorie</label>
          <input
            name="category"
            placeholder="Ex: U17, Réserve, Seniors..."
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:border-accent"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-muted mb-1.5">Début</label>
            <input
              name="start_date"
              type="date"
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1.5">Fin</label>
            <input
              name="end_date"
              type="date"
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:border-accent"
            />
          </div>
        </div>
        <label className="flex items-center gap-2">
          <input name="is_current" type="checkbox" className="w-4 h-4 accent-accent-strong" />
          <span className="text-sm text-muted">C&apos;est mon club actuel</span>
        </label>
        <button
          type="submit"
          className="w-full bg-accent-strong hover:bg-accent text-black font-semibold rounded-lg py-2.5 transition-colors"
        >
          Ajouter
        </button>
      </form>

      <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">Frise chronologique</h2>
      {(entries || []).length === 0 ? (
        <p className="text-muted text-sm">Aucune étape ajoutée pour l&apos;instant.</p>
      ) : (
        <div className="relative pl-6 space-y-6">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
          {(entries || []).map((entry) => (
            <div key={entry.id} className="relative">
              <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-accent-strong border-2 border-background" />
              <div className="bg-surface border border-border rounded-xl p-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-foreground font-semibold">{entry.club}</p>
                  {entry.category && <p className="text-muted text-xs mt-0.5">{entry.category}</p>}
                  <p className="text-muted text-xs mt-1">
                    {entry.start_date
                      ? new Date(entry.start_date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
                      : '?'}
                    {' → '}
                    {entry.is_current
                      ? 'Aujourd\u2019hui'
                      : entry.end_date
                      ? new Date(entry.end_date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
                      : '?'}
                  </p>
                </div>
                <form action={deleteCareerEntry.bind(null, entry.id)}>
                  <button type="submit" className="text-muted text-xs hover:text-danger">
                    Supprimer
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

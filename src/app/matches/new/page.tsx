import { createMatch } from '@/lib/actions/matches';
import Link from 'next/link';

export default async function NewMatchPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10 bg-background">
      <div className="w-full max-w-md">
        <Link href="/dashboard" className="text-muted text-sm mb-4 inline-block">
          ← Retour
        </Link>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Nouveau match</h1>
          <p className="text-muted mt-1 text-sm">Renseigne les infos, puis lance la saisie en direct.</p>
        </div>

        <form action={createMatch} className="bg-surface border border-border rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1.5">Adversaire</label>
            <input
              name="opponent"
              required
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:border-accent"
              placeholder="Ex: AS Cotonou"
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-1.5">Date</label>
            <input
              name="match_date"
              type="date"
              defaultValue={today}
              required
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-muted mb-1.5">Compétition</label>
              <input
                name="competition"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:border-accent"
                placeholder="Championnat, coupe..."
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1.5">Lieu</label>
              <select
                name="home_away"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:border-accent"
              >
                <option value="">—</option>
                <option value="domicile">Domicile</option>
                <option value="exterieur">Extérieur</option>
              </select>
            </div>
          </div>

          {error && <p className="text-danger text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-accent-strong hover:bg-accent text-black font-semibold rounded-lg py-2.5 transition-colors"
          >
            Démarrer la saisie live
          </button>
        </form>
      </div>
    </div>
  );
}

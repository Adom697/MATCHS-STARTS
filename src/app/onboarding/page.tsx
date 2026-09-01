import { createPlayerProfile } from '@/lib/actions/player';

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10 bg-background">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">Ton profil joueur</h1>
          <p className="text-muted mt-1 text-sm">Ces infos apparaîtront sur tes stats et ta page vitrine.</p>
        </div>

        <form action={createPlayerProfile} className="bg-surface border border-border rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-muted mb-1.5">Prénom</label>
              <input
                name="first_name"
                required
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1.5">Nom</label>
              <input
                name="last_name"
                required
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted mb-1.5">Date de naissance</label>
            <input
              name="birth_date"
              type="date"
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-1.5">Club actuel</label>
            <input
              name="current_club"
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-muted mb-1.5">Poste</label>
              <select
                name="position"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:border-accent"
              >
                <option value="">—</option>
                <option value="Gardien">Gardien</option>
                <option value="Défenseur">Défenseur</option>
                <option value="Milieu">Milieu</option>
                <option value="Attaquant">Attaquant</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted mb-1.5">Numéro</label>
              <input
                name="jersey_number"
                type="number"
                min={1}
                max={99}
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted mb-1.5">Pied fort</label>
            <select
              name="strong_foot"
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:border-accent"
            >
              <option value="">—</option>
              <option value="droit">Droit</option>
              <option value="gauche">Gauche</option>
              <option value="ambidextre">Ambidextre</option>
            </select>
          </div>

          {error && <p className="text-danger text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-accent-strong hover:bg-accent text-black font-semibold rounded-lg py-2.5 transition-colors"
          >
            Continuer
          </button>
        </form>
      </div>
    </div>
  );
}

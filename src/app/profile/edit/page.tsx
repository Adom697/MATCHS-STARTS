import { createClient } from '@/lib/supabase/server';
import { updatePlayerProfile } from '@/lib/actions/profile';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function EditProfilePage({
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

  const { data: player } = await supabase.from('players').select('*').eq('id', user.id).single();
  if (!player) redirect('/onboarding');

  return (
    <div className="min-h-screen bg-background px-5 py-8 max-w-md mx-auto">
      <Link href="/dashboard" className="text-muted text-sm mb-4 inline-block">
        ← Tableau de bord
      </Link>

      <h1 className="text-2xl font-bold text-foreground mb-6">Modifier mon profil</h1>

      <form
        action={updatePlayerProfile}
        encType="multipart/form-data"
        className="bg-surface border border-border rounded-2xl p-6 space-y-4"
      >
        <div className="flex items-center gap-4">
          {player.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={player.avatar_url}
              alt="Photo de profil"
              className="w-16 h-16 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-surface-2 border border-border flex items-center justify-center text-muted text-xl">
              {player.first_name?.[0]}
              {player.last_name?.[0]}
            </div>
          )}
          <div className="flex-1">
            <label className="block text-sm text-muted mb-1.5">Photo de profil</label>
            <input
              name="photo"
              type="file"
              accept="image/*"
              className="w-full text-sm text-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-surface-2 file:text-foreground"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-muted mb-1.5">Club actuel</label>
          <input
            name="current_club"
            defaultValue={player.current_club || ''}
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-sm text-muted mb-1.5">Poste</label>
          <select
            name="position"
            defaultValue={player.position || ''}
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
          <label className="block text-sm text-muted mb-1.5">Palmarès</label>
          <textarea
            name="achievements"
            defaultValue={player.achievements || ''}
            rows={4}
            placeholder="Trophées, distinctions, sélections en équipe nationale..."
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:border-accent resize-none"
          />
        </div>

        <label className="flex items-center gap-3 bg-surface-2 border border-border rounded-lg px-3 py-3">
          <input
            name="is_public"
            type="checkbox"
            defaultChecked={player.is_public}
            className="w-5 h-5 accent-accent-strong"
          />
          <div>
            <p className="text-sm text-foreground font-medium">Page vitrine publique</p>
            <p className="text-xs text-muted">
              Active un lien que tu peux envoyer à des recruteurs, sans qu&apos;ils aient besoin de compte.
            </p>
          </div>
        </label>

        {player.public_slug && (
          <p className="text-xs text-muted">
            Lien : <span className="text-accent">matchs-starts.vercel.app/p/{player.public_slug}</span>
          </p>
        )}

        {error && <p className="text-danger text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-accent-strong hover:bg-accent text-black font-semibold rounded-lg py-2.5 transition-colors"
        >
          Enregistrer
        </button>
      </form>
    </div>
  );
}

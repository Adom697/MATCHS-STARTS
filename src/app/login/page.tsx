import { logIn } from '@/lib/actions/auth';
import { PasswordInput } from '@/components/PasswordInput';
import Link from 'next/link';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; info?: string }>;
}) {
  const { error, info } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">MatchStat</h1>
          <p className="text-muted mt-1 text-sm">Suis tes performances, match après match.</p>
        </div>

        {info === 'confirm_email' && (
          <div className="bg-accent-strong/15 border border-accent-strong/30 rounded-xl p-4 mb-4 text-center">
            <p className="text-accent text-sm font-medium">Compte créé !</p>
            <p className="text-muted text-xs mt-1">
              Vérifie ta boîte mail (et les spams) pour confirmer ton adresse avant de te connecter.
            </p>
          </div>
        )}

        <form action={logIn} className="bg-surface border border-border rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1.5">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-accent"
              placeholder="toi@exemple.com"
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1.5">Mot de passe</label>
            <PasswordInput name="password" placeholder="••••••••" required />
            <div className="text-right mt-1.5">
              <Link href="/forgot-password" className="text-accent text-xs">
                Mot de passe oublié ?
              </Link>
            </div>
          </div>

          {error && <p className="text-danger text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-accent-strong hover:bg-accent text-black font-semibold rounded-lg py-2.5 transition-colors"
          >
            Se connecter
          </button>
        </form>

        <p className="text-center text-muted text-sm mt-5">
          Pas encore de compte ?{' '}
          <Link href="/signup" className="text-accent">
            Crée-en un
          </Link>
        </p>
      </div>
    </div>
  );
}

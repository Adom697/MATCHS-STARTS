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
    <div
      className="min-h-screen flex items-center justify-center px-6 relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/stadium-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/70" />
      <div className="w-full max-w-sm relative z-10">
        <div className="mb-6 text-center">
          <div className="relative w-24 h-28 mx-auto mb-2">
            {/* Ball bouncing on the player's foot */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 animate-juggle-ball">
              <svg width="22" height="22" viewBox="0 0 22 22">
                <circle cx="11" cy="11" r="10" fill="#f2f5f3" stroke="#4ade80" strokeWidth="1.5" />
                <path
                  d="M11 4 L14 8 L12 13 L10 13 L8 8 Z M11 4 L8 8 M11 4 L14 8 M8 8 L4 9 M14 8 L18 9 M10 13 L8 18 M12 13 L14 18"
                  stroke="#4ade80"
                  strokeWidth="0.8"
                  fill="none"
                />
              </svg>
            </div>
            {/* Simple player silhouette, one leg kicking up */}
            <svg
              width="70"
              height="90"
              viewBox="0 0 70 90"
              className="absolute left-1/2 -translate-x-1/2 bottom-0"
            >
              <circle cx="35" cy="14" r="9" fill="#8fa398" />
              <rect x="27" y="24" width="16" height="28" rx="6" fill="#4ade80" />
              <rect x="16" y="26" width="9" height="20" rx="4" fill="#8fa398" />
              <rect x="45" y="26" width="9" height="20" rx="4" fill="#8fa398" />
              <rect x="26" y="50" width="9" height="18" rx="4" fill="#f2f5f3" />
              <g className="animate-juggle-leg">
                <rect x="35" y="50" width="9" height="18" rx="4" fill="#f2f5f3" />
              </g>
            </svg>
          </div>
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

        <form action={logIn} className="bg-surface border border-border rounded-2xl p-6 space-y-4 animate-in">
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

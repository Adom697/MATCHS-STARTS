import { signUpPlayer, signUpAssistant } from '@/lib/actions/auth';
import { PasswordInput } from '@/components/PasswordInput';
import Link from 'next/link';

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; error?: string }>;
}) {
  const { role, error } = await searchParams;
  const isAssistant = role === 'assistant';

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">MatchStat</h1>
          <p className="text-muted mt-1 text-sm">Crée ton compte pour commencer.</p>
        </div>

        <div className="flex bg-surface-2 rounded-lg p-1 mb-5 border border-border">
          <Link
            href="/signup?role=joueur"
            className={`flex-1 text-center py-2 rounded-md text-sm font-medium transition-colors ${
              !isAssistant ? 'bg-accent-strong text-black' : 'text-muted'
            }`}
          >
            Je suis joueur
          </Link>
          <Link
            href="/signup?role=assistant"
            className={`flex-1 text-center py-2 rounded-md text-sm font-medium transition-colors ${
              isAssistant ? 'bg-accent-strong text-black' : 'text-muted'
            }`}
          >
            Je suis assistant
          </Link>
        </div>

        <form
          action={isAssistant ? signUpAssistant : signUpPlayer}
          className="bg-surface border border-border rounded-2xl p-6 space-y-4"
        >
          {isAssistant && (
            <div>
              <label className="block text-sm text-muted mb-1.5">Code d&apos;invitation du joueur</label>
              <input
                name="invite_code"
                type="text"
                required
                maxLength={6}
                className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-foreground uppercase tracking-widest focus:outline-none focus:border-accent"
                placeholder="EX: A1B2C3"
              />
              <p className="text-xs text-muted mt-1">
                Le joueur trouve ce code dans son tableau de bord, sous &quot;Assistants&quot;.
              </p>
            </div>
          )}

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
            <PasswordInput name="password" placeholder="6 caractères minimum" required minLength={6} />
          </div>

          {error && <p className="text-danger text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-accent-strong hover:bg-accent text-black font-semibold rounded-lg py-2.5 transition-colors"
          >
            Créer mon compte
          </button>
        </form>

        <p className="text-center text-muted text-sm mt-5">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-accent">
            Connecte-toi
          </Link>
        </p>
      </div>
    </div>
  );
}

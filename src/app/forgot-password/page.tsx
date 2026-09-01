import { requestPasswordReset } from '@/lib/actions/auth';
import Link from 'next/link';

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Mot de passe oublié</h1>
          <p className="text-muted mt-1 text-sm">On t&apos;envoie un lien pour en choisir un nouveau.</p>
        </div>

        {sent ? (
          <div className="bg-surface border border-border rounded-2xl p-6 text-center">
            <p className="text-foreground text-sm">
              Si un compte existe avec cet email, un lien de réinitialisation vient de t&apos;être envoyé.
            </p>
            <p className="text-muted text-xs mt-2">
              Vérifie aussi tes spams si tu ne le vois pas dans quelques minutes.
            </p>
          </div>
        ) : (
          <form action={requestPasswordReset} className="bg-surface border border-border rounded-2xl p-6 space-y-4">
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
            <button
              type="submit"
              className="w-full bg-accent-strong hover:bg-accent text-black font-semibold rounded-lg py-2.5 transition-colors"
            >
              Envoyer le lien
            </button>
          </form>
        )}

        <p className="text-center text-muted text-sm mt-5">
          <Link href="/login" className="text-accent">
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}

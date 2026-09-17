import { signUpPlayer, signUpAssistant } from '@/lib/actions/auth';
import { PasswordInput } from '@/components/PasswordInput';
import { SubmitButton } from '@/components/SubmitButton';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { getLocale } from '@/lib/locale';
import { getDictionary } from '@/lib/i18n';
import Link from 'next/link';

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; error?: string }>;
}) {
  const { role, error } = await searchParams;
  const isAssistant = role === 'assistant';
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-4">
          <LanguageSwitcher locale={locale} returnTo={`/signup${role ? `?role=${role}` : ''}`} />
        </div>
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">{t.signup_title}</h1>
          <p className="text-muted mt-1 text-sm">{t.signup_subtitle}</p>
        </div>

        <div className="flex bg-surface-2 rounded-lg p-1 mb-5 border border-border">
          <Link
            href="/signup?role=joueur"
            className={`flex-1 text-center py-2 rounded-md text-sm font-medium transition-colors ${
              !isAssistant ? 'bg-accent-strong text-black' : 'text-muted'
            }`}
          >
            {t.signup_role_player}
          </Link>
          <Link
            href="/signup?role=assistant"
            className={`flex-1 text-center py-2 rounded-md text-sm font-medium transition-colors ${
              isAssistant ? 'bg-accent-strong text-black' : 'text-muted'
            }`}
          >
            {t.signup_role_assistant}
          </Link>
        </div>

        <form
          action={isAssistant ? signUpAssistant : signUpPlayer}
          className="bg-surface border border-border rounded-2xl p-6 space-y-4"
        >
          {isAssistant && (
            <div>
              <label className="block text-sm text-muted mb-1.5">{t.signup_invite_code}</label>
              <input
                name="invite_code"
                type="text"
                required
                maxLength={6}
                className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-foreground uppercase tracking-widest focus:outline-none focus:border-accent"
                placeholder="EX: A1B2C3"
              />
              <p className="text-xs text-muted mt-1">{t.signup_invite_help}</p>
            </div>
          )}

          <div>
            <label className="block text-sm text-muted mb-1.5">{t.signup_email}</label>
            <input
              name="email"
              type="email"
              required
              className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-accent"
              placeholder="toi@exemple.com"
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1.5">{t.signup_password}</label>
            <PasswordInput name="password" placeholder={t.signup_password_hint} required minLength={6} />
          </div>

          {error && <p className="text-danger text-sm">{error}</p>}

          <SubmitButton pendingText={t.signup_submit_pending}>{t.signup_submit}</SubmitButton>
        </form>

        <p className="text-center text-muted text-sm mt-5">
          {t.signup_have_account}{' '}
          <Link href="/login" className="text-accent">
            {t.signup_login}
          </Link>
        </p>
      </div>
    </div>
  );
}

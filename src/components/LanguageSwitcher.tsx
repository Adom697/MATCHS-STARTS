import { setLocale } from '@/lib/actions/locale';
import type { Locale } from '@/lib/i18n';

export function LanguageSwitcher({ locale, returnTo }: { locale: Locale; returnTo: string }) {
  return (
    <form action={setLocale} className="inline-flex bg-surface-2 border border-border rounded-lg p-0.5 text-xs">
      <input type="hidden" name="return_to" value={returnTo} />
      <button
        type="submit"
        name="locale"
        value="fr"
        className={`px-2.5 py-1 rounded-md transition-colors ${
          locale === 'fr' ? 'bg-accent-strong text-black font-semibold' : 'text-muted'
        }`}
      >
        FR
      </button>
      <button
        type="submit"
        name="locale"
        value="en"
        className={`px-2.5 py-1 rounded-md transition-colors ${
          locale === 'en' ? 'bg-accent-strong text-black font-semibold' : 'text-muted'
        }`}
      >
        EN
      </button>
    </form>
  );
}

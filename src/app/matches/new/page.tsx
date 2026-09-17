import { SubmitButton } from '@/components/SubmitButton';
import { createMatch } from '@/lib/actions/matches';
import { getLocale } from '@/lib/locale';
import { getDictionary } from '@/lib/i18n';
import Link from 'next/link';

export default async function NewMatchPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const today = new Date().toISOString().split('T')[0];
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <Link href="/dashboard" className="text-muted text-sm mb-4 inline-block">
          ← {locale === 'en' ? 'Back' : 'Retour'}
        </Link>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">{t.match_new_title}</h1>
          <p className="text-muted mt-1 text-sm">{t.match_new_subtitle}</p>
        </div>

        <form action={createMatch} className="bg-surface border border-border rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1.5">{t.match_opponent}</label>
            <input
              name="opponent"
              required
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:border-accent"
              placeholder="Ex: AS Cotonou"
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-1.5">{t.match_date}</label>
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
              <label className="block text-sm text-muted mb-1.5">{t.match_competition}</label>
              <input
                name="competition"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:border-accent"
                placeholder={locale === 'en' ? 'League, cup...' : 'Championnat, coupe...'}
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1.5">{t.match_venue}</label>
              <select
                name="home_away"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:border-accent"
              >
                <option value="">—</option>
                <option value="domicile">{t.match_home}</option>
                <option value="exterieur">{t.match_away}</option>
              </select>
            </div>
          </div>

          {error && <p className="text-danger text-sm">{error}</p>}

          <SubmitButton pendingText={t.match_submit_pending}>{t.match_submit}</SubmitButton>
        </form>
      </div>
    </div>
  );
}

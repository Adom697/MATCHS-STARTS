import { submitFeedback } from '@/lib/actions/feedback';
import Link from 'next/link';

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;

  return (
    <div className="min-h-screen bg-background px-5 py-8 max-w-md mx-auto">
      <Link href="/dashboard" className="text-muted text-sm mb-4 inline-block">
        ← Tableau de bord
      </Link>

      <h1 className="text-2xl font-bold text-foreground mb-1">Ton avis compte</h1>
      <p className="text-muted text-sm mb-6">
        MatchStat est en test — dis-nous ce qui marche, ce qui manque, ou ce qui bloque.
      </p>

      {sent ? (
        <div className="bg-surface border border-border rounded-2xl p-6 text-center">
          <p className="text-foreground text-sm">Merci pour ton retour ! 🙏</p>
          <Link href="/dashboard" className="text-accent text-sm font-medium mt-3 inline-block">
            Retour au tableau de bord
          </Link>
        </div>
      ) : (
        <form action={submitFeedback} className="bg-surface border border-border rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm text-muted mb-2">Note globale</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <label key={n} className="flex-1">
                  <input type="radio" name="rating" value={n} className="peer sr-only" />
                  <div className="text-center py-2.5 rounded-lg border border-border text-muted peer-checked:border-accent-strong peer-checked:text-accent peer-checked:bg-accent-strong/10 cursor-pointer transition-colors">
                    {n}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted mb-1.5">Ton message</label>
            <textarea
              name="message"
              required
              rows={5}
              placeholder="Ce qui t'a plu, ce qui manque, un bug rencontré..."
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:border-accent resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-accent-strong hover:bg-accent text-black font-semibold rounded-lg py-2.5 transition-colors"
          >
            Envoyer
          </button>
        </form>
      )}
    </div>
  );
}

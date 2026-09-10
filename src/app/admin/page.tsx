import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const ADMIN_EMAIL = 'cedriccassy312@gmail.com';

type AdminStats = {
  total_players: number;
  pro_players: number;
  free_players: number;
  total_assistants: number;
  by_category: Record<string, number>;
  by_position: Record<string, number>;
  total_matches: number;
  matches_completed: number;
  matches_live: number;
  matches_upcoming: number;
  avg_feedback_rating: number | null;
  feedback_count: number;
  pro_conversions: number;
  signups_last_7_days: { date: string; count: number }[];
};

type FeedbackRow = {
  message: string;
  rating: number | null;
  created_at: string;
  email: string;
};

function StatCard({ value, label, accent }: { value: string | number; label: string; accent?: boolean }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <p className={`text-3xl font-bold ${accent ? 'text-accent' : 'text-foreground'}`}>{value}</p>
      <p className="text-xs text-muted mt-1">{label}</p>
    </div>
  );
}

function BreakdownBar({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data || {});
  const max = Math.max(1, ...entries.map(([, v]) => v));
  return (
    <div className="space-y-2.5">
      {entries.map(([key, val]) => (
        <div key={key}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-foreground">{key}</span>
            <span className="text-muted">{val}</span>
          </div>
          <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-strong rounded-full"
              style={{ width: `${(val / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
      {entries.length === 0 && <p className="text-muted text-sm">Aucune donnée pour l&apos;instant.</p>}
    </div>
  );
}

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) redirect('/dashboard');

  const { data: stats, error: statsError } = await supabase.rpc('get_admin_stats');
  const { data: feedback } = await supabase.rpc('get_admin_feedback');

  const s = stats as AdminStats | null;
  const feedbackRows = (feedback || []) as FeedbackRow[];

  if (statsError || !s) {
    return (
      <div className="min-h-screen bg-background px-5 py-8 max-w-2xl mx-auto">
        <p className="text-danger text-sm">
          Impossible de charger les statistiques admin. {statsError?.message}
        </p>
      </div>
    );
  }

  const maxSignup = Math.max(1, ...s.signups_last_7_days.map((d) => d.count));
  const estimatedRevenue = s.pro_players * 3000;

  return (
    <div className="min-h-screen bg-background px-5 py-8 max-w-3xl mx-auto">
      <Link href="/dashboard" className="text-muted text-sm mb-4 inline-block">
        ← Tableau de bord
      </Link>
      <h1 className="text-2xl font-bold text-foreground mb-1">Tableau de bord admin</h1>
      <p className="text-muted text-sm mb-8">Vue d&apos;ensemble de MatchStat, réservée à toi.</p>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Joueurs</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard value={s.total_players} label="Joueurs inscrits" accent />
          <StatCard value={s.pro_players} label="Abonnés Pro" accent />
          <StatCard value={s.free_players} label="Comptes gratuits" />
          <StatCard value={s.total_assistants} label="Assistants" />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Revenu estimé</h2>
        <div className="bg-surface border border-accent-strong/30 rounded-xl p-5">
          <p className="text-3xl font-bold text-accent">{estimatedRevenue.toLocaleString('fr-FR')} FCFA</p>
          <p className="text-xs text-muted mt-1">
            {s.pro_players} abonné{s.pro_players > 1 ? 's' : ''} Pro × 3 000 FCFA/mois
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
          Inscriptions — 7 derniers jours
        </h2>
        <div className="bg-surface border border-border rounded-xl p-4 flex items-end justify-between gap-2 h-40">
          {s.signups_last_7_days.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full">
              <div
                className="w-full bg-accent-strong rounded-t-md"
                style={{ height: `${Math.max(4, (d.count / maxSignup) * 100)}%` }}
              />
              <p className="text-[10px] text-muted mt-1.5">{d.date}</p>
              <p className="text-xs text-foreground font-medium">{d.count}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Matchs</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard value={s.total_matches} label="Matchs totaux" accent />
          <StatCard value={s.matches_completed} label="Terminés" />
          <StatCard value={s.matches_live} label="En direct" />
          <StatCard value={s.matches_upcoming} label="À venir" />
        </div>
      </section>

      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        <section>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Par catégorie</h2>
          <div className="bg-surface border border-border rounded-xl p-4">
            <BreakdownBar data={s.by_category} />
          </div>
        </section>
        <section>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Par poste</h2>
          <div className="bg-surface border border-border rounded-xl p-4">
            <BreakdownBar data={s.by_position} />
          </div>
        </section>
      </div>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Feedback</h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard value={s.avg_feedback_rating ?? '—'} label="Note moyenne" accent />
          <StatCard value={s.feedback_count} label="Avis reçus" />
        </div>
        <div className="space-y-2">
          {feedbackRows.length === 0 && <p className="text-muted text-sm">Aucun avis pour l&apos;instant.</p>}
          {feedbackRows.map((f, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-foreground text-sm font-medium">{f.email}</p>
                {f.rating && <p className="text-accent text-sm font-bold">{f.rating}/5</p>}
              </div>
              <p className="text-muted text-sm">{f.message}</p>
              <p className="text-muted text-xs mt-1.5">
                {new Date(f.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

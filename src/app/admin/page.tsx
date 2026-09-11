import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { SignupsChart } from '@/components/AdminCharts';

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

type FeedbackRow = { message: string; rating: number | null; created_at: string; email: string };

type UserRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  current_club: string | null;
  position: string | null;
  player_category: string | null;
  plan: string;
  created_at: string;
};

function BreakdownList({ data, colors }: { data: Record<string, number>; colors: string[] }) {
  const entries = Object.entries(data || {});
  const total = entries.reduce((sum, [, v]) => sum + v, 0) || 1;
  return (
    <div className="space-y-3">
      {entries.map(([key, val], i) => (
        <div key={key} className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colors[i % colors.length] }} />
          <span className="text-sm text-foreground flex-1">{key}</span>
          <span className="text-sm text-muted">{val}</span>
          <span className="text-xs text-muted w-12 text-right">{Math.round((val / total) * 100)}%</span>
        </div>
      ))}
      {entries.length === 0 && <p className="text-muted text-sm">Aucune donnée.</p>}
    </div>
  );
}

const DONUT_COLORS = ['#4ade80', '#22c55e', '#facc15', '#f87171', '#60a5fa', '#c084fc'];

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) redirect('/dashboard');

  const [{ data: stats, error: statsError }, { data: feedback }, { data: users, error: usersError }] =
    await Promise.all([
      supabase.rpc('get_admin_stats'),
      supabase.rpc('get_admin_feedback'),
      supabase.rpc('get_admin_users'),
    ]);

  const s = stats as AdminStats | null;
  const feedbackRows = (feedback || []) as FeedbackRow[];
  const userRows = (users || []) as UserRow[];

  if (statsError || !s) {
    return (
      <div className="min-h-screen bg-background px-5 py-8 max-w-2xl mx-auto">
        <p className="text-danger text-sm">
          Impossible de charger les statistiques admin. {statsError?.message}
        </p>
      </div>
    );
  }

  const estimatedRevenue = s.pro_players * 3000;
  const conversionRate = s.total_players > 0 ? ((s.pro_players / s.total_players) * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-background">
      {/* TOP BAR */}
      <div className="border-b border-border px-5 py-4 flex items-center justify-between sticky top-0 bg-background z-10">
        <div>
          <Link href="/dashboard" className="text-muted text-xs">
            ← Tableau de bord
          </Link>
          <h1 className="text-lg font-bold text-foreground">MatchStat — Admin</h1>
        </div>
        <span className="text-xs text-muted bg-surface-2 border border-border px-3 py-1 rounded-full">
          {s.total_players} utilisateurs
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-5 py-6">
        {/* HERO REVENUE */}
        <div className="bg-gradient-to-br from-surface to-surface-2 border border-border rounded-2xl p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs text-muted uppercase tracking-wide mb-1">Revenu mensuel estimé</p>
            <p className="text-4xl font-bold text-accent">{estimatedRevenue.toLocaleString('fr-FR')} FCFA</p>
            <p className="text-sm text-muted mt-1">
              {s.pro_players} abonné{s.pro_players > 1 ? 's' : ''} Pro · {conversionRate}% de conversion
            </p>
          </div>
          <div className="flex gap-4 sm:gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{s.total_players}</p>
              <p className="text-xs text-muted">Utilisateurs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{s.total_matches}</p>
              <p className="text-xs text-muted">Matchs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{s.feedback_count}</p>
              <p className="text-xs text-muted">Avis</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* SIGNUPS CHART */}
          <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Inscriptions — 7 derniers jours</h2>
            <SignupsChart data={s.signups_last_7_days} />
          </div>

          {/* MATCH STATUS */}
          <div className="bg-surface border border-border rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Statut des matchs</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">Terminés</span>
                <span className="text-lg font-bold text-accent">{s.matches_completed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">En direct</span>
                <span className="text-lg font-bold text-danger">{s.matches_live}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">À venir</span>
                <span className="text-lg font-bold text-foreground">{s.matches_upcoming}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mb-6">
          <div className="bg-surface border border-border rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Par catégorie</h2>
            <BreakdownList data={s.by_category} colors={DONUT_COLORS} />
          </div>
          <div className="bg-surface border border-border rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Par poste</h2>
            <BreakdownList data={s.by_position} colors={DONUT_COLORS} />
          </div>
        </div>

        {/* USERS TABLE */}
        <div className="bg-surface border border-border rounded-2xl p-5 mb-6 overflow-x-auto">
          <h2 className="text-sm font-semibold text-foreground mb-4">Utilisateurs ({userRows.length})</h2>
          {usersError && (
            <p className="text-danger text-xs mb-3">Erreur : {usersError.message}</p>
          )}
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="text-left text-muted border-b border-border">
                <th className="pb-2 pr-3 font-medium">Nom</th>
                <th className="pb-2 pr-3 font-medium">Email</th>
                <th className="pb-2 pr-3 font-medium">Club</th>
                <th className="pb-2 pr-3 font-medium">Poste</th>
                <th className="pb-2 pr-3 font-medium">Catégorie</th>
                <th className="pb-2 pr-3 font-medium">Plan</th>
                <th className="pb-2 font-medium">Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              {userRows.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="py-2.5 pr-3 text-foreground font-medium whitespace-nowrap">
                    {u.first_name} {u.last_name}
                  </td>
                  <td className="py-2.5 pr-3 text-muted">{u.email}</td>
                  <td className="py-2.5 pr-3 text-muted whitespace-nowrap">{u.current_club || '—'}</td>
                  <td className="py-2.5 pr-3 text-muted whitespace-nowrap">{u.position || '—'}</td>
                  <td className="py-2.5 pr-3 text-muted whitespace-nowrap">{u.player_category || '—'}</td>
                  <td className="py-2.5 pr-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        u.plan === 'pro' ? 'bg-accent-strong/15 text-accent' : 'bg-surface-2 text-muted'
                      }`}
                    >
                      {u.plan === 'pro' ? 'PRO' : 'Gratuit'}
                    </span>
                  </td>
                  <td className="py-2.5 text-muted whitespace-nowrap">
                    {new Date(u.created_at).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
              {userRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-muted">
                    Aucun utilisateur pour l&apos;instant.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FEEDBACK */}
        <div className="bg-surface border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Derniers avis testeurs</h2>
            <span className="text-xs text-muted">
              Note moyenne : <span className="text-accent font-semibold">{s.avg_feedback_rating ?? '—'}/5</span>
            </span>
          </div>
          <div className="space-y-2">
            {feedbackRows.length === 0 && <p className="text-muted text-sm py-4 text-center">Aucun avis.</p>}
            {feedbackRows.map((f, i) => (
              <div key={i} className="flex items-start justify-between gap-3 border-b border-border last:border-0 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-foreground text-sm font-medium truncate">{f.email}</p>
                  <p className="text-muted text-sm mt-0.5">{f.message}</p>
                </div>
                <div className="text-right shrink-0">
                  {f.rating && <p className="text-accent text-sm font-bold">{f.rating}/5</p>}
                  <p className="text-muted text-xs mt-0.5">{new Date(f.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

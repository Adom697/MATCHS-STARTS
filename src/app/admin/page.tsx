import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { SignupsChart, BreakdownDonut } from '@/components/AdminCharts';

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

function KpiCard({
  icon,
  value,
  label,
  sub,
}: {
  icon: string;
  value: string | number;
  label: string;
  sub?: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted mt-1">{label}</p>
      {sub && <p className="text-xs text-accent mt-1.5">{sub}</p>}
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

  const estimatedRevenue = s.pro_players * 3000;
  const conversionRate = s.total_players > 0 ? ((s.pro_players / s.total_players) * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-background px-5 py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/dashboard" className="text-muted text-sm">
            ← Tableau de bord
          </Link>
          <h1 className="text-2xl font-bold text-foreground mt-1">Vue d&apos;ensemble MatchStat</h1>
        </div>
        <span className="text-xs text-muted bg-surface-2 border border-border px-3 py-1.5 rounded-full">
          Admin
        </span>
      </div>

      {/* KPI ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard icon="👥" value={s.total_players} label="Utilisateurs" />
        <KpiCard
          icon="⭐"
          value={s.pro_players}
          label="Abonnements Pro"
          sub={`${conversionRate}% de conversion`}
        />
        <KpiCard
          icon="💰"
          value={`${estimatedRevenue.toLocaleString('fr-FR')} F`}
          label="Revenu estimé / mois"
        />
        <KpiCard icon="⚽" value={s.total_matches} label="Matchs enregistrés" />
      </div>

      {/* MAIN CHART */}
      <div className="bg-surface border border-border rounded-2xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-1">Inscriptions — 7 derniers jours</h2>
        <p className="text-xs text-muted mb-3">Nouveaux joueurs créant un compte, par jour</p>
        <SignupsChart data={s.signups_last_7_days} />
      </div>

      {/* SECONDARY CHARTS */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-surface border border-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3">Répartition par catégorie</h2>
          <BreakdownDonut data={s.by_category} />
        </div>
        <div className="bg-surface border border-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3">Répartition par poste</h2>
          <BreakdownDonut data={s.by_position} />
        </div>
      </div>

      {/* MATCH STATUS ROW */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-surface border border-border rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-accent">{s.matches_completed}</p>
          <p className="text-xs text-muted mt-1">Terminés</p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-danger">{s.matches_live}</p>
          <p className="text-xs text-muted mt-1">En direct</p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{s.matches_upcoming}</p>
          <p className="text-xs text-muted mt-1">À venir</p>
        </div>
      </div>

      {/* FEEDBACK TABLE */}
      <div className="bg-surface border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">Derniers avis testeurs</h2>
          <div className="flex items-center gap-3 text-xs text-muted">
            <span>
              Note moyenne : <span className="text-accent font-semibold">{s.avg_feedback_rating ?? '—'}/5</span>
            </span>
            <span>{s.feedback_count} avis</span>
          </div>
        </div>
        <div className="space-y-2">
          {feedbackRows.length === 0 && (
            <p className="text-muted text-sm py-4 text-center">Aucun avis pour l&apos;instant.</p>
          )}
          {feedbackRows.map((f, i) => (
            <div
              key={i}
              className="flex items-start justify-between gap-3 border-b border-border last:border-0 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-foreground text-sm font-medium truncate">{f.email}</p>
                <p className="text-muted text-sm mt-0.5">{f.message}</p>
              </div>
              <div className="text-right shrink-0">
                {f.rating && <p className="text-accent text-sm font-bold">{f.rating}/5</p>}
                <p className="text-muted text-xs mt-0.5">
                  {new Date(f.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

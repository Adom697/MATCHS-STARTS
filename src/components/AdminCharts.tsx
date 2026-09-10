'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const PIE_COLORS = ['#4ade80', '#22c55e', '#facc15', '#f87171', '#60a5fa', '#c084fc'];

export function SignupsChart({ data }: { data: { date: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="signupFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4ade80" stopOpacity={0.5} />
            <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#263029" vertical={false} />
        <XAxis dataKey="date" stroke="#8fa398" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#8fa398" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: '#131a17', border: '1px solid #263029', borderRadius: 8 }}
          labelStyle={{ color: '#f2f5f3' }}
          itemStyle={{ color: '#4ade80' }}
        />
        <Area type="monotone" dataKey="count" stroke="#4ade80" strokeWidth={2.5} fill="url(#signupFill)" name="Inscriptions" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function BreakdownDonut({ data }: { data: Record<string, number> }) {
  const chartData = Object.entries(data || {}).map(([name, value]) => ({ name, value }));

  if (chartData.length === 0) {
    return <p className="text-muted text-sm py-8 text-center">Aucune donnée pour l&apos;instant.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={3}
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: '#131a17', border: '1px solid #263029', borderRadius: 8 }}
          labelStyle={{ color: '#f2f5f3' }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => <span style={{ color: '#8fa398', fontSize: 12 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

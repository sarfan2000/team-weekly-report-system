import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTeamReports } from '@/lib/hooks';
import { Card, Spinner } from '@/components/ui';

const COMPLIANCE_COLORS: Record<string, string> = {
  'Approved': '#16a34a',
  'Pending': '#2563eb',
  'Needs Correction': '#ea580c',
  'Draft': '#94a3b8',
};

export function ManagerAnalyticsPage() {
  const { reports, loading } = useTeamReports();

  const taskTrendData = useMemo(() => {
    const byWeek = new Map<string, { week: string; completed: number; total: number }>();
    reports.forEach((r) => {
      const key = r.week_start;
      const existing = byWeek.get(key) || { week: format(parseISO(key), 'MMM d'), completed: 0, total: 0 };
      r.tasks?.forEach((t) => {
        existing.total++;
        if (t.status === 'Completed') existing.completed++;
      });
      byWeek.set(key, existing);
    });
    return Array.from(byWeek.values()).sort((a, b) => a.week.localeCompare(b.week));
  }, [reports]);

  const complianceData = useMemo(() => {
    const counts = { Approved: 0, Pending: 0, Late: 0, Draft: 0 };
    reports.forEach((r) => {
      if (r.status === 'approved') counts.Approved++;
      else if (r.status === 'submitted') counts.Pending++;
      else if (r.status === 'needs_correction') counts.Late++;
      else if (r.status === 'draft') counts.Draft++;
    });
    return [
      { name: 'Approved', value: counts.Approved },
      { name: 'Pending', value: counts.Pending },
      { name: 'Needs Correction', value: counts.Late },
      { name: 'Draft', value: counts.Draft },
    ];
  }, [reports]);

  const projectDistribution = useMemo(() => {
    const byProject = new Map<string, number>();
    reports.forEach((r) => {
      const name = r.project?.name || 'Unassigned';
      byProject.set(name, (byProject.get(name) || 0) + (r.tasks?.length || 0));
    });
    return Array.from(byProject.entries()).map(([name, value]) => ({ name, value }));
  }, [reports]);

  const hoursByCategory = useMemo(() => {
    const totals = { Development: 0, Testing: 0, Meetings: 0, Documentation: 0, Other: 0 };
    reports.forEach((r) => {
      const h = r.hours_breakdown;
      totals.Development += h.development || 0;
      totals.Testing += h.testing || 0;
      totals.Meetings += h.meetings || 0;
      totals.Documentation += h.documentation || 0;
      totals.Other += h.other || 0;
    });
    return [
      { name: 'Development', hours: totals.Development },
      { name: 'Testing', hours: totals.Testing },
      { name: 'Meetings', hours: totals.Meetings },
      { name: 'Documentation', hours: totals.Documentation },
      { name: 'Other', hours: totals.Other },
    ];
  }, [reports]);

  if (loading) return <Spinner />;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Team performance insights and trends</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Tasks Completed Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={taskTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="completed" stroke="#2563eb" strokeWidth={2} name="Completed" />
              <Line type="monotone" dataKey="total" stroke="#94a3b8" strokeWidth={2} name="Total" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Submission Compliance</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={complianceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(e: any) => e.value > 0 ? `${e.name}: ${e.value}` : ''}>
                {complianceData.map((entry, i) => <Cell key={i} fill={COMPLIANCE_COLORS[entry.name]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Task Distribution by Project</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={projectDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} name="Tasks" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Hours by Category</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hoursByCategory} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={90} />
              <Tooltip />
              <Bar dataKey="hours" fill="#16a34a" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

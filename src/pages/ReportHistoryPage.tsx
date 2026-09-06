import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Plus, FileText, AlertTriangle, Inbox } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useReports } from '@/lib/hooks';
import { Button, Card, StatusBadge, ProjectTag, Spinner, EmptyState, Select } from '@/components/ui';
import type { ReportStatus } from '@/lib/types';

export function ReportHistoryPage() {
  const { currentUser } = useAuth();
  const [weekFilter, setWeekFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { reports, loading } = useReports({ userId: currentUser?.id });

  const weekOptions = useMemo(() => {
    const weeks = new Map<string, string>();
    reports.forEach((r) => weeks.set(r.week_start, `${format(parseISO(r.week_start), 'MMM d')} – ${format(parseISO(r.week_end), 'MMM d, yyyy')}`));
    return Array.from(weeks.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [reports]);

  const filtered = reports.filter((r) => {
    if (weekFilter && r.week_start !== weekFilter) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    return true;
  });

  if (loading) return <Spinner />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage your weekly report history</p>
        </div>
        <Link to="/report/new"><Button><Plus className="w-4 h-4" /> New Report</Button></Link>
      </div>

      <Card className="p-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Filter by Week</label>
            <Select value={weekFilter} onChange={setWeekFilter} options={[{ value: '', label: 'All weeks' }, ...weekOptions.map(([v, l]) => ({ value: v, label: l }))]} />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Filter by Status</label>
            <Select value={statusFilter} onChange={setStatusFilter} options={[
              { value: '', label: 'All statuses' },
              { value: 'draft', label: 'Draft' },
              { value: 'submitted', label: 'Submitted' },
              { value: 'needs_correction', label: 'Needs Correction' },
              { value: 'approved', label: 'Approved' },
            ]} />
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={<Inbox className="w-12 h-12" />} title="No reports found" subtitle={reports.length === 0 ? "You haven't created any reports yet." : "No reports match your filters."} />
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((r) => (
              <Link key={r.id} to={`/reports/${r.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{format(parseISO(r.week_start), 'MMM d')} – {format(parseISO(r.week_end), 'MMM d, yyyy')}</p>
                    {r.status === 'needs_correction' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    {r.project && <ProjectTag name={r.project.name} color={r.project.color} />}
                    <span className="text-xs text-gray-400">{r.tasks?.length || 0} tasks</span>
                  </div>
                </div>
                <StatusBadge status={r.status as ReportStatus} />
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

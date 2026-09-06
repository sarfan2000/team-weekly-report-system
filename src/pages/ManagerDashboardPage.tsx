import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { FileText, Clock, AlertTriangle, CheckCircle, Users, Zap, Trophy, TableIcon } from 'lucide-react';
import { useTeamReports, useUsers, useProjects } from '@/lib/hooks';
import { Card, StatusBadge, ProjectTag, Avatar, Spinner, EmptyState, Select } from '@/components/ui';
import type { ReportStatus, ReportWithRelations } from '@/lib/types';

type Tab = 'all' | 'blockers' | 'achievements';

export function ManagerDashboardPage() {
  const { reports, loading } = useTeamReports();
  const { users } = useUsers();
  const { projects } = useProjects();
  const [memberFilter, setMemberFilter] = useState('');
  const [weekFilter, setWeekFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [tab, setTab] = useState<Tab>('all');

  const weekOptions = useMemo(() => {
    const weeks = new Map<string, string>();
    reports.forEach((r) => weeks.set(r.week_start, `${format(parseISO(r.week_start), 'MMM d')} – ${format(parseISO(r.week_end), 'MMM d, yyyy')}`));
    return Array.from(weeks.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [reports]);

  const filtered = reports.filter((r) => {
    if (memberFilter && r.user_id !== memberFilter) return false;
    if (weekFilter && r.week_start !== weekFilter) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    if (projectFilter && r.project_id !== projectFilter) return false;
    return true;
  });

  const stats = useMemo(() => ({
    total: reports.length,
    pending: reports.filter((r) => r.status === 'submitted').length,
    needsCorrection: reports.filter((r) => r.status === 'needs_correction').length,
    approved: reports.filter((r) => r.status === 'approved').length,
  }), [reports]);

  const latestWeek = weekOptions[0]?.[0];
  const compliance = useMemo(() => {
    if (!latestWeek) return { submitted: 0, total: users.filter((u) => u.role === 'team_member').length };
    const weekReports = reports.filter((r) => r.week_start === latestWeek);
    const submitted = weekReports.filter((r) => r.status !== 'draft').length;
    return { submitted, total: users.filter((u) => u.role === 'team_member').length };
  }, [reports, users, latestWeek]);

  const comparisonWeek = weekFilter || latestWeek || '';
  const comparisonReports = reports.filter((r) => r.week_start === comparisonWeek);

  if (loading) return <Spinner />;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Team overview, compliance tracking, and report management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<FileText className="w-5 h-5" />} label="Total Reports" value={stats.total} color="blue" />
        <StatCard icon={<Clock className="w-5 h-5" />} label="Pending Review" value={stats.pending} color="amber" />
        <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Needs Correction" value={stats.needsCorrection} color="orange" />
        <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Approved" value={stats.approved} color="emerald" />
      </div>

      {/* Compliance */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900">Submission Compliance</h2>
          </div>
          <span className="text-sm text-gray-500">{latestWeek ? `Week of ${format(parseISO(latestWeek), 'MMM d')}` : '—'}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all" style={{ width: `${compliance.total > 0 ? (compliance.submitted / compliance.total) * 100 : 0}%` }} />
            </div>
          </div>
          <span className="text-sm font-medium text-gray-700">{compliance.submitted}/{compliance.total} submitted</span>
        </div>
      </Card>

      {/* Tab buttons */}
      <div className="flex gap-2 border-b border-gray-200">
        <TabButton active={tab === 'all'} onClick={() => setTab('all')} icon={<TableIcon className="w-4 h-4" />} label="All Reports" />
        <TabButton active={tab === 'blockers'} onClick={() => setTab('blockers')} icon={<Zap className="w-4 h-4" />} label="Blockers Comparison" />
        <TabButton active={tab === 'achievements'} onClick={() => setTab('achievements')} icon={<Trophy className="w-4 h-4" />} label="Achievements Comparison" />
      </div>

      {tab === 'all' && (
        <>
          {/* Filters */}
          <Card className="p-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Select value={memberFilter} onChange={setMemberFilter} options={[{ value: '', label: 'All members' }, ...users.map((u) => ({ value: u.id, label: u.name }))]} />
              <Select value={weekFilter} onChange={setWeekFilter} options={[{ value: '', label: 'All weeks' }, ...weekOptions.map(([v, l]) => ({ value: v, label: l }))]} />
              <Select value={statusFilter} onChange={setStatusFilter} options={[{ value: '', label: 'All statuses' }, { value: 'draft', label: 'Draft' }, { value: 'submitted', label: 'Submitted' }, { value: 'needs_correction', label: 'Needs Correction' }, { value: 'approved', label: 'Approved' }]} />
              <Select value={projectFilter} onChange={setProjectFilter} options={[{ value: '', label: 'All projects' }, ...projects.map((p) => ({ value: p.id, label: p.name }))]} />
            </div>
          </Card>

          {/* Table */}
          <Card className="overflow-hidden">
            {filtered.length === 0 ? (
              <EmptyState icon={<FileText className="w-12 h-12" />} title="No reports found" subtitle="Adjust filters to see more results." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr className="text-left text-gray-500">
                      <th className="px-4 py-3 font-medium">Team Member</th>
                      <th className="px-4 py-3 font-medium">Week</th>
                      <th className="px-4 py-3 font-medium">Project</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Tasks</th>
                      <th className="px-4 py-3 font-medium">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((r) => (
                      <ReportRow key={r.id} report={r} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      {tab === 'blockers' && (
        <ComparisonGrid reports={comparisonReports} type="blockers" weekLabel={comparisonWeek ? format(parseISO(comparisonWeek), 'MMM d, yyyy') : 'latest week'} />
      )}
      {tab === 'achievements' && (
        <ComparisonGrid reports={comparisonReports} type="achievements" weekLabel={comparisonWeek ? format(parseISO(comparisonWeek), 'MMM d, yyyy') : 'latest week'} />
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    orange: 'bg-orange-50 text-orange-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>{icon}</div>
        <div><p className="text-2xl font-bold text-gray-900">{value}</p><p className="text-xs text-gray-500">{label}</p></div>
      </div>
    </Card>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${active ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
      {icon} {label}
    </button>
  );
}

function ReportRow({ report }: { report: ReportWithRelations }) {
  return (
    <tr className="hover:bg-gray-50 transition-colors cursor-pointer">
      <td className="px-4 py-3">
        <Link to={`/manager/review/${report.id}`} className="flex items-center gap-2">
          <Avatar name={report.user?.name || '?'} size="sm" />
          <div><p className="font-medium text-gray-900">{report.user?.name}</p><p className="text-xs text-gray-400">{report.user?.department}</p></div>
        </Link>
      </td>
      <td className="px-4 py-3 text-gray-600">{format(parseISO(report.week_start), 'MMM d')} – {format(parseISO(report.week_end), 'MMM d')}</td>
      <td className="px-4 py-3">{report.project && <ProjectTag name={report.project.name} color={report.project.color} />}</td>
      <td className="px-4 py-3"><StatusBadge status={report.status as ReportStatus} /></td>
      <td className="px-4 py-3 text-gray-600">{report.tasks?.length || 0}</td>
      <td className="px-4 py-3 text-gray-500">{report.submitted_at ? format(parseISO(report.submitted_at), 'MMM d') : '—'}</td>
    </tr>
  );
}

function ComparisonGrid({ reports, type, weekLabel }: { reports: ReportWithRelations[]; type: 'blockers' | 'achievements'; weekLabel: string }) {
  const isBlockers = type === 'blockers';
  return (
    <Card className="p-5">
      <h2 className="font-semibold text-gray-900 mb-1">{isBlockers ? 'Blockers & Challenges' : 'Achievements & Highlights'} — Comparison</h2>
      <p className="text-sm text-gray-500 mb-4">Week of {weekLabel}</p>
      {reports.length === 0 ? (
        <EmptyState title="No reports for this week" subtitle="Select a different week to compare." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((r) => {
            const items = isBlockers ? r.blockers : r.achievements;
            const keyItem = isBlockers ? items?.find((b: any) => b.is_key_issue) : items?.find((a: any) => a.is_key_achievement);
            return (
              <div key={r.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Avatar name={r.user?.name || '?'} size="sm" />
                  <p className="font-medium text-gray-900 text-sm">{r.user?.name}</p>
                </div>
                {keyItem && (
                  <div className={`rounded-lg p-2.5 mb-2 ${isBlockers ? 'bg-amber-50 border border-amber-200' : 'bg-emerald-50 border border-emerald-200'}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wide ${isBlockers ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {isBlockers ? 'Key Issue' : 'Key Achievement'}
                    </p>
                    <p className={`text-sm mt-0.5 ${isBlockers ? 'text-amber-900' : 'text-emerald-900'}`}>{keyItem.text}</p>
                  </div>
                )}
                <div className="space-y-1">
                  {items?.filter((item: any) => isBlockers ? !item.is_key_issue : !item.is_key_achievement).map((item: any, i: number) => (
                    <p key={i} className="text-sm text-gray-600 flex items-start gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isBlockers ? 'bg-gray-400' : 'bg-emerald-400'}`} />
                      {item.text}
                    </p>
                  ))}
                  {(!items || items.length === 0) && <p className="text-sm text-gray-400">None reported.</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

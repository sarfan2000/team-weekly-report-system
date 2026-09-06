import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { Briefcase, FileText, CheckCircle, Clock } from 'lucide-react';
import { useUsers, useTeamReports } from '@/lib/hooks';
import { Card, Avatar, Spinner, StatusBadge, ProjectTag } from '@/components/ui';

export function ManagerTeamPage() {
  const { users, loading: usersLoading } = useUsers();
  const { reports, loading: reportsLoading } = useTeamReports();

  const teamMembers = users.filter((u) => u.role === 'team_member');

  const memberStats = useMemo(() => {
    return teamMembers.map((m) => {
      const memberReports = reports.filter((r) => r.user_id === m.id);
      return {
        ...m,
        totalReports: memberReports.length,
        approved: memberReports.filter((r) => r.status === 'approved').length,
        pending: memberReports.filter((r) => r.status === 'submitted' || r.status === 'needs_correction').length,
        latestReport: memberReports[0],
        latestProject: memberReports[0]?.project,
      };
    });
  }, [teamMembers, reports]);

  if (usersLoading || reportsLoading) return <Spinner />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Team member profiles and performance summary</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {memberStats.map((m) => (
          <Card key={m.id} className="p-5">
            <div className="flex items-start gap-4">
              <Avatar name={m.name} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{m.name}</p>
                    <p className="text-sm text-gray-500">{m.department}</p>
                  </div>
                  {m.latestProject && <ProjectTag name={m.latestProject.name} color={m.latestProject.color} />}
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mx-auto mb-1">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-lg font-bold text-gray-900">{m.totalReports}</p>
                    <p className="text-xs text-gray-400">Reports</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mx-auto mb-1">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <p className="text-lg font-bold text-gray-900">{m.approved}</p>
                    <p className="text-xs text-gray-400">Approved</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center mx-auto mb-1">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <p className="text-lg font-bold text-gray-900">{m.pending}</p>
                    <p className="text-xs text-gray-400">Pending</p>
                  </div>
                </div>

                {m.latestReport && (
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-400">Latest: {format(parseISO(m.latestReport.week_start), 'MMM d')}</span>
                    <StatusBadge status={m.latestReport.status} />
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {teamMembers.length === 0 && (
        <Card className="p-8 text-center text-gray-500"><Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-2" />No team members found.</Card>
      )}
    </div>
  );
}

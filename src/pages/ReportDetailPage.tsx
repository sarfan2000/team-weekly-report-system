import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Lock, AlertTriangle, CheckCircle2, Circle, Zap, Trophy, Link as LinkIcon, History, X, Edit3, MessageSquare } from 'lucide-react';
import { useReport, useReportVersions, useReviewComments } from '@/lib/hooks';
import { Button, Card, StatusBadge, PriorityBadge, TaskStatusBadge, ProjectTag, Avatar, Spinner, EmptyState } from '@/components/ui';
import type { ReportVersion } from '@/lib/types';

export function ReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { report, loading } = useReport(id);
  const { versions } = useReportVersions(id);
  const { comments } = useReviewComments(id);
  const [showVersions, setShowVersions] = useState(false);
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);

  if (loading) return <Spinner />;
  if (!report) return <EmptyState icon={<AlertTriangle className="w-12 h-12" />} title="Report not found" />;

  const canEdit = report.status === 'draft' || report.status === 'needs_correction';
  const hours = report.hours_breakdown;
  const totalHours = Object.values(hours).reduce((a, b) => a + b, 0);
  const keyBlocker = report.blockers?.find((b) => b.is_key_issue);
  const keyAchievement = report.achievements?.find((a) => a.is_key_achievement);
  const latestComment = comments[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="w-4 h-4" /> Back</Button>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowVersions(true)}><History className="w-4 h-4" /> Version History ({versions.length})</Button>
          {canEdit ? (
            <Link to={`/report/edit/${report.id}`}><Button size="sm"><Edit3 className="w-4 h-4" /> Edit Report</Button></Link>
          ) : report.status === 'approved' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-400"><Lock className="w-4 h-4" /> Locked</span>
          ) : null}
        </div>
      </div>

      {/* Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{format(parseISO(report.week_start), 'MMM d')} – {format(parseISO(report.week_end), 'MMM d, yyyy')}</h1>
            <div className="flex items-center gap-3 mt-2">
              {report.project && <ProjectTag name={report.project.name} color={report.project.color} />}
              <StatusBadge status={report.status} />
            </div>
          </div>
          {report.user && (
            <div className="flex items-center gap-2">
              <Avatar name={report.user.name} size="md" />
              <div><p className="text-sm font-medium text-gray-900">{report.user.name}</p><p className="text-xs text-gray-400">{report.user.department}</p></div>
            </div>
          )}
        </div>
      </Card>

      {/* Review Comment Alert */}
      {report.review_comment && report.status === 'needs_correction' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900 text-sm">Manager Feedback — Changes Required</p>
            <p className="text-sm text-amber-800 mt-1">{report.review_comment}</p>
          </div>
        </div>
      )}

      {/* Latest Review Comment */}
      {latestComment && (
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{latestComment.reviewer?.name || 'Manager'}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${latestComment.action === 'approve' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  {latestComment.action === 'approve' ? 'Approved' : 'Requested Changes'}
                </span>
                <span className="text-xs text-gray-400">{format(parseISO(latestComment.created_at), 'MMM d, yyyy HH:mm')}</span>
              </div>
              <p className="text-sm text-gray-700 mt-1">{latestComment.comment}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Tasks */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tasks</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="pb-2 pr-3 font-medium">Task</th>
                <th className="pb-2 px-3 font-medium">Priority</th>
                <th className="pb-2 px-3 font-medium">Status</th>
                <th className="pb-2 px-3 font-medium">Planned</th>
                <th className="pb-2 px-3 font-medium">Actual</th>
                <th className="pb-2 px-3 font-medium">Hours</th>
                <th className="pb-2 px-3 font-medium">Output</th>
              </tr>
            </thead>
            <tbody>
              {report.tasks?.map((t, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-3 pr-3 font-medium text-gray-900">{t.name}</td>
                  <td className="py-3 px-3"><PriorityBadge priority={t.priority} /></td>
                  <td className="py-3 px-3"><TaskStatusBadge status={t.status} /></td>
                  <td className="py-3 px-3 text-gray-600">{t.planned_pct}%</td>
                  <td className="py-3 px-3 text-gray-600">{t.actual_pct}%</td>
                  <td className="py-3 px-3 text-gray-600">{t.time_spent}h / {t.time_planned}h</td>
                  <td className="py-3 px-3 text-gray-600 max-w-xs">{t.output}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Next Week Tasks */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Next Week Plan</h2>
          <div className="space-y-2">
            {report.next_week_tasks?.length ? report.next_week_tasks.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                {t.done ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4 text-gray-300" />}
                <span className={`text-sm ${t.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{t.text}</span>
              </div>
            )) : <p className="text-sm text-gray-400">No tasks planned.</p>}
          </div>
        </Card>

        {/* Hours Breakdown */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Hours Breakdown</h2>
          <div className="space-y-3">
            {(Object.keys(hours) as string[]).map((key) => {
              const val = (hours as unknown as Record<string, number>)[key];
              const pct = totalHours > 0 ? (val / totalHours) * 100 : 0;
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize text-gray-600">{key}</span>
                    <span className="text-gray-400">{val}h ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            <p className="text-sm font-medium text-gray-700 pt-2 border-t border-gray-100">Total: {totalHours} hours</p>
          </div>
        </Card>
      </div>

      {/* Blockers */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2"><Zap className="w-5 h-5 text-amber-500" /> Blockers / Challenges</h2>
        {keyBlocker && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 flex gap-2">
            <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div><p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Key Issue of the Week</p><p className="text-sm text-amber-900 mt-0.5">{keyBlocker.text}</p></div>
          </div>
        )}
        <div className="space-y-1">
          {report.blockers?.filter((b) => !b.is_key_issue).map((b, i) => <p key={i} className="text-sm text-gray-600 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> {b.text}</p>)}
          {report.blockers?.length === 0 && <p className="text-sm text-gray-400">No blockers reported.</p>}
        </div>
      </Card>

      {/* Achievements */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2"><Trophy className="w-5 h-5 text-emerald-500" /> Achievements / Highlights</h2>
        {keyAchievement && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-3 mb-3 flex gap-2">
            <Trophy className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div><p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Key Achievement of the Week</p><p className="text-sm text-emerald-900 mt-0.5">{keyAchievement.text}</p></div>
          </div>
        )}
        <div className="space-y-1">
          {report.achievements?.filter((a) => !a.is_key_achievement).map((a, i) => <p key={i} className="text-sm text-gray-600 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {a.text}</p>)}
          {report.achievements?.length === 0 && <p className="text-sm text-gray-400">No achievements recorded.</p>}
        </div>
      </Card>

      {/* Notes & Links */}
      {(report.notes || (report.links?.length > 0)) && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Notes & Links</h2>
          {report.notes && <p className="text-sm text-gray-600 mb-3">{report.notes}</p>}
          <div className="space-y-2">
            {report.links?.map((l, i) => (
              <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                <LinkIcon className="w-4 h-4" /> {l.label || l.url}
              </a>
            ))}
          </div>
        </Card>
      )}

      {/* Review Comments Feed */}
      {comments.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Review History</h2>
          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${c.action === 'approve' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{c.reviewer?.name || 'Manager'}</span>
                    <span className="text-xs text-gray-400">{format(parseISO(c.created_at), 'MMM d, yyyy HH:mm')}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{c.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Version History Drawer */}
      {showVersions && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowVersions(false)} />
          <div className="relative w-full max-w-md bg-white shadow-xl h-full overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Version History</h2>
              <button onClick={() => setShowVersions(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-3">
              {versions.length === 0 ? <p className="text-sm text-gray-400">No version history. This report has not been through a correction cycle.</p> : versions.map((v) => (
                <VersionCard key={v.id} version={v} expanded={expandedVersion === v.id} onToggle={() => setExpandedVersion(expandedVersion === v.id ? null : v.id)} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VersionCard({ version, expanded, onToggle }: { version: ReportVersion; expanded: boolean; onToggle: () => void }) {
  const c = version.content;
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
        <div className="text-left">
          <p className="text-sm font-medium text-gray-900">Version {version.version_number}</p>
          <p className="text-xs text-gray-400">{format(parseISO(version.created_at), 'MMM d, yyyy HH:mm')}</p>
        </div>
        <span className="text-xs text-gray-400">{expanded ? 'Collapse' : 'Expand'}</span>
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
          {version.review_comment && <p className="text-sm text-amber-700 bg-amber-50 rounded p-2">{version.review_comment}</p>}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Tasks</p>
            {c.tasks?.map((t, i) => <p key={i} className="text-sm text-gray-600">{t.name} — {t.actual_pct}% ({t.status})</p>)}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Blockers</p>
            {c.blockers?.map((b, i) => <p key={i} className="text-sm text-gray-600">{b.is_key_issue ? '★ ' : ''}{b.text}</p>)}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Achievements</p>
            {c.achievements?.map((a, i) => <p key={i} className="text-sm text-gray-600">{a.is_key_achievement ? '★ ' : ''}{a.text}</p>)}
          </div>
        </div>
      )}
    </div>
  );
}

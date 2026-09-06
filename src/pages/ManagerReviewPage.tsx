import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, CheckCircle, AlertTriangle, MessageSquare, History, X, Lock } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useReport, useReportVersions, useReviewComments, updateReport, addReviewComment } from '@/lib/hooks';
import { Button, Card, StatusBadge, PriorityBadge, TaskStatusBadge, ProjectTag, Avatar, Spinner, EmptyState, Textarea } from '@/components/ui';
import type { ReportVersion } from '@/lib/types';

export function ManagerReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { report, loading, refresh } = useReport(id);
  const { versions } = useReportVersions(id);
  const { comments } = useReviewComments(id);
  const [comment, setComment] = useState('');
  const [action, setAction] = useState<'approve' | 'request_changes' | null>(null);
  const [saving, setSaving] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);

  if (loading) return <Spinner />;
  if (!report) return <EmptyState icon={<AlertTriangle className="w-12 h-12" />} title="Report not found" />;

  const isApproved = report.status === 'approved';
  const canReview = report.status === 'submitted' || report.status === 'needs_correction';

  const handleApprove = async () => {
    if (!comment.trim()) return;
    setSaving(true);
    await addReviewComment(id!, currentUser!.id, comment, 'approve');
    setSaving(false);
    setAction(null);
    refresh();
    navigate('/manager/dashboard');
  };

  const handleRequestChanges = async () => {
    if (!comment.trim()) return;
    setSaving(true);
    await addReviewComment(id!, currentUser!.id, comment, 'request_changes');
    setSaving(false);
    setAction(null);
    refresh();
    navigate('/manager/dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate('/manager/dashboard')}><ArrowLeft className="w-4 h-4" /> Back to Dashboard</Button>
        <Button variant="secondary" size="sm" onClick={() => setShowVersions(true)}><History className="w-4 h-4" /> Versions ({versions.length})</Button>
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
        {isApproved && (
          <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
            <Lock className="w-4 h-4" /> This report is approved and locked.
          </div>
        )}
      </Card>

      {/* Existing review comment */}
      {report.review_comment && report.status === 'needs_correction' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div><p className="font-semibold text-amber-900 text-sm">Previous Feedback Sent</p><p className="text-sm text-amber-800 mt-1">{report.review_comment}</p></div>
        </div>
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
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Blockers</h2>
          {report.blockers?.map((b, i) => (
            <div key={i} className={`rounded-lg p-2.5 mb-2 ${b.is_key_issue ? 'bg-amber-50 border border-amber-200' : ''}`}>
              {b.is_key_issue && <p className="text-xs font-semibold text-amber-700 uppercase">Key Issue</p>}
              <p className="text-sm text-gray-700">{b.text}</p>
            </div>
          ))}
          {report.blockers?.length === 0 && <p className="text-sm text-gray-400">None reported.</p>}
        </Card>
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Achievements</h2>
          {report.achievements?.map((a, i) => (
            <div key={i} className={`rounded-lg p-2.5 mb-2 ${a.is_key_achievement ? 'bg-emerald-50 border border-emerald-200' : ''}`}>
              {a.is_key_achievement && <p className="text-xs font-semibold text-emerald-700 uppercase">Key Achievement</p>}
              <p className="text-sm text-gray-700">{a.text}</p>
            </div>
          ))}
          {report.achievements?.length === 0 && <p className="text-sm text-gray-400">None reported.</p>}
        </Card>
      </div>

      {/* Review Comments History */}
      {comments.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Review History</h2>
          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${c.action === 'approve' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{c.reviewer?.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.action === 'approve' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{c.action === 'approve' ? 'Approved' : 'Requested Changes'}</span>
                    <span className="text-xs text-gray-400">{format(parseISO(c.created_at), 'MMM d, yyyy HH:mm')}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{c.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Review Console */}
      {canReview && (
        <Card className="p-6 border-2 border-blue-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-blue-600" /> Review Console</h2>
          <Textarea value={comment} onChange={setComment} placeholder="Enter your review feedback..." rows={4} />
          <div className="flex items-center justify-end gap-3 mt-4">
            <Button variant="secondary" onClick={() => { setAction('request_changes'); }} disabled={!comment.trim() || saving}>
              <AlertTriangle className="w-4 h-4" /> Request Changes
            </Button>
            <Button variant="success" onClick={() => { setAction('approve'); }} disabled={!comment.trim() || saving}>
              <CheckCircle className="w-4 h-4" /> Approve
            </Button>
          </div>
          {action === 'request_changes' && (
            <ConfirmDialog message="Request changes from this team member?" onConfirm={handleRequestChanges} onCancel={() => setAction(null)} saving={saving} />
          )}
          {action === 'approve' && (
            <ConfirmDialog message="Approve this report? It will be locked." onConfirm={handleApprove} onCancel={() => setAction(null)} saving={saving} />
          )}
        </Card>
      )}

      {/* Version Drawer */}
      {showVersions && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowVersions(false)} />
          <div className="relative w-full max-w-md bg-white shadow-xl h-full overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Version History</h2>
              <button onClick={() => setShowVersions(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-3">
              {versions.length === 0 ? <p className="text-sm text-gray-400">No version history.</p> : versions.map((v) => (
                <VersionCard key={v.id} version={v} expanded={expandedVersion === v.id} onToggle={() => setExpandedVersion(expandedVersion === v.id ? null : v.id)} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel, saving }: { message: string; onConfirm: () => void; onCancel: () => void; saving: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <Card className="p-6 max-w-sm mx-4">
        <p className="text-gray-900 font-medium mb-4">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={onConfirm} disabled={saving}>{saving ? 'Saving...' : 'Confirm'}</Button>
        </div>
      </Card>
    </div>
  );
}

function VersionCard({ version, expanded, onToggle }: { version: ReportVersion; expanded: boolean; onToggle: () => void }) {
  const c = version.content;
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50">
        <div className="text-left"><p className="text-sm font-medium text-gray-900">Version {version.version_number}</p><p className="text-xs text-gray-400">{format(parseISO(version.created_at), 'MMM d, yyyy HH:mm')}</p></div>
        <span className="text-xs text-gray-400">{expanded ? 'Collapse' : 'Expand'}</span>
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-2 border-t border-gray-100 pt-3">
          {version.review_comment && <p className="text-sm text-amber-700 bg-amber-50 rounded p-2">{version.review_comment}</p>}
          {c.tasks?.map((t, i) => <p key={i} className="text-sm text-gray-600">{t.name} — {t.actual_pct}%</p>)}
        </div>
      )}
    </div>
  );
}

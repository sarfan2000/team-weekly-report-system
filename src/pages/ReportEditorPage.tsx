import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, AlertTriangle, Lock, Save, Send, CheckCircle, Zap, Trophy, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useProjects, useReport, useReportVersions, createReport, updateReport, createVersion } from '@/lib/hooks';
import { Button, Input, Textarea, Select, Card, Spinner } from '@/components/ui';
import type { Task, NextWeekTask, Blocker, Achievement, HoursBreakdown, ReportLink, Priority, TaskStatus } from '@/lib/types';

const DEFAULT_TASK: Task = { name: '', priority: 'Medium', planned_pct: 0, actual_pct: 0, status: 'Not Started', time_planned: 0, time_spent: 0, output: '' };
const DEFAULT_HOURS: HoursBreakdown = { development: 0, testing: 0, meetings: 0, documentation: 0, other: 0 };

const PRIORITIES: Priority[] = ['Low', 'Medium', 'High', 'Urgent'];
const TASK_STATUSES: TaskStatus[] = ['Not Started', 'In Progress', 'Completed', 'Blocked'];

export function ReportEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { projects } = useProjects();
  const { report, loading } = useReport(id);
  const { versions } = useReportVersions(id);
  const [saving, setSaving] = useState(false);

  const [weekStart, setWeekStart] = useState('');
  const [weekEnd, setWeekEnd] = useState('');
  const [projectId, setProjectId] = useState('');
  const [tasks, setTasks] = useState<Task[]>([{ ...DEFAULT_TASK }]);
  const [nextWeekTasks, setNextWeekTasks] = useState<NextWeekTask[]>([]);
  const [blockers, setBlockers] = useState<Blocker[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [hours, setHours] = useState<HoursBreakdown>({ ...DEFAULT_HOURS });
  const [notes, setNotes] = useState('');
  const [links, setLinks] = useState<ReportLink[]>([]);

  useEffect(() => {
    if (report) {
      setWeekStart(report.week_start ? report.week_start.split('T')[0] : '');
      setWeekEnd(report.week_end ? report.week_end.split('T')[0] : '');
      setProjectId(report.project_id || '');
      setTasks(report.tasks?.length ? report.tasks : [{ ...DEFAULT_TASK }]);
      setNextWeekTasks(report.next_week_tasks || []);
      setBlockers(report.blockers || []);
      setAchievements(report.achievements || []);
      setHours(report.hours_breakdown || { ...DEFAULT_HOURS });
      setNotes(report.notes || '');
      setLinks(report.links || []);
    }
  }, [report]);

  if (loading) return <Spinner />;

  const isEditing = !!id && !!report;
  const status = report?.status;
  const readOnly = status === 'submitted' || status === 'approved';
  const isNeedsCorrection = status === 'needs_correction';

  if (readOnly) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="p-8 text-center">
          {status === 'approved' ? <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" /> : <CheckCircle className="w-12 h-12 text-blue-400 mx-auto mb-3" />}
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {status === 'approved' ? 'Report Approved & Locked' : 'Awaiting Review'}
          </h2>
          <p className="text-gray-500 mb-4">
            {status === 'approved' ? 'This report has been approved and can no longer be edited.' : 'This report has been submitted and is awaiting manager review.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => navigate(-1)}>Go Back</Button>
            <Button onClick={() => navigate(`/reports/${id}`)}>View Report</Button>
          </div>
        </Card>
      </div>
    );
  }

  const activeProjects = projects.filter((p) => !p.archived);

  const saveDraft = async () => {
    setSaving(true);
    const payload = {
      user_id: currentUser!.id,
      project_id: projectId,
      week_start: weekStart,
      week_end: weekEnd,
      status: 'draft' as const,
      tasks, next_week_tasks: nextWeekTasks, blockers, achievements,
      hours_breakdown: hours, notes, links,
    };
    if (isEditing) {
      await updateReport(id!, { ...payload, review_comment: report?.review_comment || '' });
    } else {
      await createReport(payload);
    }
    setSaving(false);
    navigate('/reports/history');
  };

  const submitReport = async () => {
    setSaving(true);
    const now = new Date().toISOString();
    if (isEditing && isNeedsCorrection) {
      // Snapshot current version before resubmitting
      const nextVersionNum = (versions[0]?.version_number || 0) + 1;
      await createVersion(id!, nextVersionNum, { tasks, next_week_tasks: nextWeekTasks, blockers, achievements, hours_breakdown: hours, notes, links }, report?.review_comment || '');
      await updateReport(id!, { tasks, next_week_tasks: nextWeekTasks, blockers, achievements, hours_breakdown: hours, notes, links, status: 'submitted', submitted_at: now, review_comment: '' });
    } else if (isEditing) {
      await updateReport(id!, { tasks, next_week_tasks: nextWeekTasks, blockers, achievements, hours_breakdown: hours, notes, links, status: 'submitted', submitted_at: now });
    } else {
      await createReport({
        user_id: currentUser!.id, project_id: projectId, week_start: weekStart, week_end: weekEnd,
        status: 'submitted', submitted_at: now,
        tasks, next_week_tasks: nextWeekTasks, blockers, achievements, hours_breakdown: hours, notes, links,
      });
    }
    setSaving(false);
    navigate('/reports/history');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="w-4 h-4" /> Back</Button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNeedsCorrection ? 'Resubmit Report' : isEditing ? 'Edit Report' : 'New Weekly Report'}
          </h1>
        </div>
      </div>

      {isNeedsCorrection && report?.review_comment && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900 text-sm">Manager Feedback — Action Required</p>
            <p className="text-sm text-amber-800 mt-1">{report.review_comment}</p>
            <p className="text-xs text-amber-600 mt-2">Please address the feedback above and resubmit your report.</p>
          </div>
        </div>
      )}

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Week & Project</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Week Start</label>
            <Input type="date" value={weekStart} onChange={setWeekStart} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Week End</label>
            <Input type="date" value={weekEnd} onChange={setWeekEnd} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <Select value={projectId} onChange={setProjectId}
              options={[{ value: '', label: 'Select project...' }, ...activeProjects.map((p) => ({ value: p.id, label: p.name }))]} />
          </div>
        </div>
      </Card>

      {/* Tasks */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Tasks This Week</h2>
          <Button size="sm" variant="secondary" onClick={() => setTasks([...tasks, { ...DEFAULT_TASK }])}><Plus className="w-4 h-4" /> Add Task</Button>
        </div>
        <div className="space-y-3">
          {tasks.map((task, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Input value={task.name} placeholder="Task name" className="flex-1" onChange={(v) => updateTask(i, 'name', v)} />
                <button onClick={() => setTasks(tasks.filter((_, idx) => idx !== i))} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Priority</label>
                  <Select value={task.priority} onChange={(v) => updateTask(i, 'priority', v as Priority)} options={PRIORITIES.map((p) => ({ value: p, label: p }))} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Planned %</label>
                  <Input type="number" value={task.planned_pct} onChange={(v) => updateTask(i, 'planned_pct', Number(v))} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Actual %</label>
                  <Input type="number" value={task.actual_pct} onChange={(v) => updateTask(i, 'actual_pct', Number(v))} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Status</label>
                  <Select value={task.status} onChange={(v) => updateTask(i, 'status', v as TaskStatus)} options={TASK_STATUSES.map((s) => ({ value: s, label: s }))} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Planned hrs</label>
                  <Input type="number" value={task.time_planned} onChange={(v) => updateTask(i, 'time_planned', Number(v))} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Spent hrs</label>
                  <Input type="number" value={task.time_spent} onChange={(v) => updateTask(i, 'time_spent', Number(v))} />
                </div>
              </div>
              <Input value={task.output} placeholder="Output / Deliverable produced" onChange={(v) => updateTask(i, 'output', v)} />
            </div>
          ))}
          {tasks.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No tasks added yet. Click "Add Task" to get started.</p>}
        </div>
      </Card>

      {/* Next Week Tasks */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Tasks Planned for Next Week</h2>
          <Button size="sm" variant="secondary" onClick={() => setNextWeekTasks([...nextWeekTasks, { text: '', done: false }])}><Plus className="w-4 h-4" /> Add</Button>
        </div>
        <div className="space-y-2">
          {nextWeekTasks.map((t, i) => (
            <div key={i} className="flex items-center gap-3">
              <input type="checkbox" checked={t.done} onChange={(e) => setNextWeekTasks(nextWeekTasks.map((x, idx) => idx === i ? { ...x, done: e.target.checked } : x))} className="w-4 h-4 rounded text-blue-600" />
              <Input value={t.text} placeholder="Task planned for next week" className="flex-1" onChange={(v) => setNextWeekTasks(nextWeekTasks.map((x, idx) => idx === i ? { ...x, text: v } : x))} />
              <button onClick={() => setNextWeekTasks(nextWeekTasks.filter((_, idx) => idx !== i))} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          {nextWeekTasks.length === 0 && <p className="text-sm text-gray-400 py-2">No tasks planned yet.</p>}
        </div>
      </Card>

      {/* Blockers */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Zap className="w-5 h-5 text-amber-500" /> Blockers / Challenges</h2>
          <Button size="sm" variant="secondary" onClick={() => setBlockers([...blockers, { text: '', is_key_issue: false }])}><Plus className="w-4 h-4" /> Add</Button>
        </div>
        <div className="space-y-2">
          {blockers.map((b, i) => (
            <div key={i} className="flex items-center gap-3">
              <input type="radio" name="key_issue" checked={b.is_key_issue} onChange={() => setBlockers(blockers.map((x, idx) => ({ ...x, is_key_issue: idx === i })))} className="w-4 h-4 text-amber-600" />
              <Input value={b.text} placeholder="Blocker or challenge" className="flex-1" onChange={(v) => setBlockers(blockers.map((x, idx) => idx === i ? { ...x, text: v } : x))} />
              <button onClick={() => setBlockers(blockers.filter((_, idx) => idx !== i))} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          {blockers.length === 0 && <p className="text-sm text-gray-400 py-2">No blockers reported.</p>}
        </div>
        <p className="text-xs text-gray-400 mt-2">Select the radio button to flag one as the Key Issue of the Week.</p>
      </Card>

      {/* Achievements */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Trophy className="w-5 h-5 text-emerald-500" /> Achievements / Highlights</h2>
          <Button size="sm" variant="secondary" onClick={() => setAchievements([...achievements, { text: '', is_key_achievement: false }])}><Plus className="w-4 h-4" /> Add</Button>
        </div>
        <div className="space-y-2">
          {achievements.map((a, i) => (
            <div key={i} className="flex items-center gap-3">
              <input type="radio" name="key_achievement" checked={a.is_key_achievement} onChange={() => setAchievements(achievements.map((x, idx) => ({ ...x, is_key_achievement: idx === i })))} className="w-4 h-4 text-emerald-600" />
              <Input value={a.text} placeholder="Achievement or highlight" className="flex-1" onChange={(v) => setAchievements(achievements.map((x, idx) => idx === i ? { ...x, text: v } : x))} />
              <button onClick={() => setAchievements(achievements.filter((_, idx) => idx !== i))} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          {achievements.length === 0 && <p className="text-sm text-gray-400 py-2">No achievements recorded.</p>}
        </div>
        <p className="text-xs text-gray-400 mt-2">Select the radio button to flag one as the Key Achievement of the Week.</p>
      </Card>

      {/* Hours Breakdown */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Hours Worked by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {(Object.keys(hours) as (keyof HoursBreakdown)[]).map((key) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-500 mb-1 capitalize">{key}</label>
              <Input type="number" value={hours[key]} onChange={(v) => setHours({ ...hours, [key]: Number(v) })} />
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-3">Total: <span className="font-semibold">{Object.values(hours).reduce((a, b) => a + b, 0)} hours</span></p>
      </Card>

      {/* Notes & Links */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes & Attachments</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <Textarea value={notes} onChange={setNotes} placeholder="Additional notes..." />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Links / Attachments</label>
            <Button size="sm" variant="secondary" onClick={() => setLinks([...links, { label: '', url: '' }])}><Plus className="w-4 h-4" /> Add Link</Button>
          </div>
          <div className="space-y-2">
            {links.map((l, i) => (
              <div key={i} className="flex items-center gap-3">
                <LinkIcon className="w-4 h-4 text-gray-400 shrink-0" />
                <Input value={l.label} placeholder="Label" className="flex-1" onChange={(v) => setLinks(links.map((x, idx) => idx === i ? { ...x, label: v } : x))} />
                <Input value={l.url} placeholder="URL" className="flex-1" onChange={(v) => setLinks(links.map((x, idx) => idx === i ? { ...x, url: v } : x))} />
                <button onClick={() => setLinks(links.filter((_, idx) => idx !== i))} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            {links.length === 0 && <p className="text-sm text-gray-400 py-2">No links added.</p>}
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pb-6">
        <Button variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
        <Button variant="secondary" onClick={saveDraft} disabled={saving}><Save className="w-4 h-4" /> Save as Draft</Button>
        <Button variant="primary" onClick={submitReport} disabled={saving}>
          {isNeedsCorrection ? <><Send className="w-4 h-4" /> Resubmit</> : <><Send className="w-4 h-4" /> Submit for Review</>}
        </Button>
      </div>
    </div>
  );

  function updateTask(index: number, field: keyof Task, value: string | number) {
    setTasks(tasks.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  }
}

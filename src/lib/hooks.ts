import { useEffect, useState, useCallback } from 'react';
import { api } from './api';
import type { Report, ReportWithRelations, Project, User, ReportVersion, ReviewComment, ReportStatus, Task } from './types';

// Mapper functions to bridge backend DTOs (camelCase) to frontend types (snake_case required by UI).
function mapUser(u: any): User {
  if (!u) return u;
  return {
    ...u,
    id: u.id || u._id,
    created_at: u.createdAt || u.created_at,
    avatar_url: u.avatarUrl || u.avatar_url,
    phoneNumber: u.phoneNumber || u.phone_number,
    role: u.role === 'MANAGER' ? 'manager' : 'team_member'
  };
}

function mapProject(p: any): Project {
  if (!p) return p;
  return {
    ...p,
    id: p.id || p._id,
    created_at: p.createdAt || p.created_at,
    archived: p.status === 'ARCHIVED',
    color: p.color || '#3b82f6', // fallback color
  };
}

const mapTaskStatus = (t: string) => {
  if (t === 'NOT_STARTED') return 'Not Started';
  if (t === 'IN_PROGRESS') return 'In Progress';
  if (t === 'COMPLETED') return 'Completed';
  if (t === 'BLOCKED') return 'Blocked';
  return t; // fallback
};

const mapTaskPriority = (t: string) => {
  if (t === 'LOW') return 'Low';
  if (t === 'MEDIUM') return 'Medium';
  if (t === 'HIGH') return 'High';
  if (t === 'URGENT') return 'Urgent';
  return t; // fallback
};

function mapTasks(tasks: any[]): Task[] {
  if (!tasks) return [];
  return tasks.map(t => ({
    ...t,
    planned_pct: t.plannedPercent ?? t.planned_pct ?? 0,
    actual_pct: t.actualPercent ?? t.actual_pct ?? 0,
    time_planned: t.timePlanned ?? t.time_planned ?? 0,
    time_spent: t.timeSpent ?? t.time_spent ?? 0,
    output: t.deliverableOutput ?? t.output ?? '',
    status: mapTaskStatus(t.status) as Task['status'],
    priority: mapTaskPriority(t.priority) as Task['priority'],
  }));
}

function mapReport(r: any): ReportWithRelations {
  if (!r) return r;
  return {
    ...r,
    id: r.id || r._id,
    user_id: r.userId?._id || r.userId?.id || r.userId || r.user_id,
    project_id: r.projectId?._id || r.projectId?.id || r.projectId || r.project_id,
    week_start: r.weekStartDate || r.week_start,
    week_end: r.weekEndDate || r.week_end,
    status: (r.status || '').toLowerCase() as ReportStatus,
    next_week_tasks: r.nextWeekTasks || r.next_week_tasks || [],
    hours_breakdown: r.hoursBreakdown || r.hours_breakdown || { development: 0, testing: 0, meetings: 0, documentation: 0, other: 0 },
    review_comment: r.reviewComment || r.review_comment || '',
    submitted_at: r.submittedAt || r.submitted_at,
    approved_at: r.approvedAt || r.approved_at,
    created_at: r.createdAt || r.created_at,
    updated_at: r.updatedAt || r.updated_at,
    tasks: mapTasks(r.tasks || []),
    // Object-populated values
    user: (r.userId && r.userId.name) ? mapUser(r.userId) : undefined,
    project: (r.projectId && r.projectId.name) ? mapProject(r.projectId) : undefined,
  };
}

function mapVersion(v: any): ReportVersion {
  if (!v) return v;
  return {
    ...v,
    id: v.id || v._id,
    report_id: v.reportId || v.report_id,
    version_number: v.versionNumber || v.version_number,
    created_at: v.createdAt || v.created_at,
    content: {
      ...(v.snapshotData || v.content),
      next_week_tasks: v.snapshotData?.nextWeekTasks || v.content?.next_week_tasks || [],
      hours_breakdown: v.snapshotData?.hoursBreakdown || v.content?.hours_breakdown || {},
      tasks: mapTasks(v.snapshotData?.tasks || v.content?.tasks || []),
    }
  };
}

function mapTasksToBackend(tasks: Task[]): any[] {
  return tasks.map(t => ({
    name: t.name,
    priority: mapToBackendTaskPriority(t.priority),
    plannedPercent: t.planned_pct || 0,
    actualPercent: t.actual_pct || 0,
    status: mapToBackendTaskStatus(t.status),
    timePlanned: t.time_planned || 0,
    timeSpent: t.time_spent || 0,
    deliverableOutput: t.output || ''
  }));
}

function mapToBackendTaskStatus(t: string) {
  if (t === 'Not Started') return 'NOT_STARTED';
  if (t === 'In Progress') return 'IN_PROGRESS';
  if (t === 'Completed') return 'COMPLETED';
  if (t === 'Blocked') return 'BLOCKED';
  return t;
}

function mapToBackendTaskPriority(t: string) {
  if (t === 'Low') return 'LOW';
  if (t === 'Medium') return 'MEDIUM';
  if (t === 'High') return 'HIGH';
  if (t === 'Urgent') return 'URGENT';
  return t;
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getProjects();
      const mapped = (response.data || []).map(mapProject);
      setProjects(mapped);
    } catch (error) {
      console.error(error);
      setProjects([]);
    }
    setLoading(false);
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return { projects, loading, refresh };
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getUsers();
      const mapped = (response.data || []).map(mapUser);
      setUsers(mapped);
    } catch (error) {
      console.error(error);
      setUsers([]);
    }
    setLoading(false);
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return { users, loading, refresh };
}

export function useReports(filters?: { userId?: string; status?: ReportStatus; projectId?: string }) {
  const [reports, setReports] = useState<ReportWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getMyReports(filters as any);
      const reportsArray = Array.isArray(response.data) ? response.data : (response?.data?.data || []);
      const mapped = reportsArray.map((r: any) => mapReport(r));
      setReports(mapped);
    } catch (error) {
      console.error(error);
      setReports([]);
    }
    setLoading(false);
  }, [filters?.userId, filters?.status, filters?.projectId]);
  useEffect(() => { refresh(); }, [refresh]);
  return { reports, loading, refresh };
}

export function useTeamReports(filters?: { userId?: string; status?: ReportStatus; projectId?: string }) {
  const [reports, setReports] = useState<ReportWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getTeamReports(filters as any);
      const reportsArray = Array.isArray(response.data) ? response.data : (response?.data?.data || []);
      const mapped = reportsArray.map((r: any) => mapReport(r));
      setReports(mapped);
    } catch (error) {
      console.error(error);
      setReports([]);
    }
    setLoading(false);
  }, [filters?.userId, filters?.status, filters?.projectId]);
  useEffect(() => { refresh(); }, [refresh]);
  return { reports, loading, refresh };
}

export function useReport(id?: string) {
  const [report, setReport] = useState<ReportWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    try {
      const response = await api.getReport(id);
      setReport(response.data ? mapReport(response.data) : null);
    } catch (error) {
      console.error(error);
      setReport(null);
    }
    setLoading(false);
  }, [id]);
  useEffect(() => { refresh(); }, [refresh]);
  return { report, loading, refresh };
}

export function useReportVersions(reportId?: string) {
  const [versions, setVersions] = useState<ReportVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    if (!reportId) { setLoading(false); return; }
    setLoading(true);
    try {
      const response = await api.getReportVersions(reportId);
      const mapped = (response.data || []).map(mapVersion);
      setVersions(mapped);
    } catch (error) {
      console.error(error);
      setVersions([]);
    }
    setLoading(false);
  }, [reportId]);
  useEffect(() => { refresh(); }, [refresh]);
  return { versions, loading, refresh };
}

export function useReviewComments(reportId?: string) {
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    if (!reportId) { setLoading(false); return; }
    setLoading(true);
    try {
      const response = await api.getReport(reportId);
      const rep = response.data;
      if (rep && rep.reviews && Array.isArray(rep.reviews)) {
        setComments(rep.reviews.map((r: any) => ({
          id: r._id,
          report_id: r.reportId,
          reviewer_id: r.reviewerId?._id,
          reviewer: r.reviewerId ? mapUser(r.reviewerId) : undefined,
          version_number: r.versionNumber,
          action: r.action === 'APPROVED' ? 'approve' : 'request_changes',
          comment: r.comment,
          created_at: r.createdAt
        })) as ReviewComment[]);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error(error);
      setComments([]);
    }
    setLoading(false);
  }, [reportId]);
  useEffect(() => { refresh(); }, [refresh]);
  return { comments, loading, refresh };
}

export async function createReport(report: Partial<Report>): Promise<Report | null> {
  const backendPayload = {
    projectId: report.project_id!,
    weekStartDate: report.week_start!,
    weekEndDate: report.week_end!
  };
  const data = await api.createReport(backendPayload);
  let newRep = mapReport(data.data) as Report;

  // Apply additional properties and potentially submit
  if (Object.keys(report).some(k => !['project_id', 'week_start', 'week_end', 'user_id'].includes(k))) {
    await updateReport(newRep.id, report);
    newRep = { ...newRep, ...report } as Report;
  }

  return newRep;
}

export async function updateReport(id: string, updates: Partial<Report>): Promise<boolean> {
  const dto: any = {};
  if (updates.project_id) dto.projectId = updates.project_id;
  if (updates.tasks) dto.tasks = mapTasksToBackend(updates.tasks);
  if (updates.next_week_tasks) dto.nextWeekTasks = updates.next_week_tasks;
  if (updates.blockers) dto.blockers = updates.blockers.map(b => ({ text: b.text, isKeyIssue: b.is_key_issue }));
  if (updates.achievements) dto.achievements = updates.achievements.map(a => ({ text: a.text, isKeyAchievement: a.is_key_achievement }));
  if (updates.hours_breakdown) dto.hoursBreakdown = updates.hours_breakdown;
  if (updates.notes !== undefined) dto.notes = updates.notes;
  if (updates.links) dto.links = updates.links;

  // The backend might complain if we send empty DTO but ok.
  if (Object.keys(dto).length > 0) {
    await api.updateReport(id, dto);
  }

  if (updates.status === 'submitted') {
    await api.submitReport(id);
  }

  return true;
}

export async function deleteReport(id: string): Promise<boolean> {
  await api.deleteReport(id);
  return true;
}

export async function createVersion(reportId: string, versionNumber: number, content: ReportVersion['content'], reviewComment: string): Promise<void> {
  // Not implemented directly in api.ts?
  // Use submit or updateReport if needed.
}

export async function addReviewComment(reportId: string, reviewerId: string, comment: string, action: 'approve' | 'request_changes'): Promise<void> {
  const backendAction = action === 'approve' ? 'APPROVED' : 'REQUESTED_CHANGES';
  await api.reviewReport(reportId, backendAction, comment);
}

export async function createProject(name: string, description: string, color: string): Promise<Project | null> {
  const res = await api.createProject({ name, description, color });
  return mapProject(res.data) as Project;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<boolean> {
  const payload: any = {
    name: updates.name,
    description: updates.description,
    color: updates.color,
  };
  if (updates.archived !== undefined) {
    payload.status = updates.archived ? 'ARCHIVED' : 'ACTIVE';
  }
  await api.updateProject(id, payload);
  return true;
}

export async function deleteProject(id: string): Promise<boolean> {
  await api.deleteProject(id);
  return true;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<boolean> {
  const mappedUpdates: any = { ...updates };
  if (mappedUpdates.role) {
    mappedUpdates.role = mappedUpdates.role === 'manager' ? 'MANAGER' : 'TEAM_MEMBER';
  }
  await api.updateUser(id, mappedUpdates);
  return true;
}

export async function createUser(name: string, email: string, role: string, department: string, phoneNumber: string, password?: string) {
  const mappedRole = role === 'manager' ? 'MANAGER' : 'TEAM_MEMBER';
  const res = await api.register(name, email, password || '', mappedRole, phoneNumber);
  const user = mapUser(res.data?.user || res.data) as User;
  return { ...user, generatedPassword: res.generatedPassword };
}

export async function deleteUser(id: string): Promise<boolean> {
  await api.deleteUser(id);
  return true;
}

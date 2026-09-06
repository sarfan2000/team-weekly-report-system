export type Role = 'team_member' | 'manager';
export type ReportStatus = 'draft' | 'submitted' | 'needs_correction' | 'approved';
export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Blocked';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  phoneNumber?: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  archived: boolean;
  created_at: string;
}

export interface Task {
  name: string;
  priority: Priority;
  planned_pct: number;
  actual_pct: number;
  status: TaskStatus;
  time_planned: number;
  time_spent: number;
  output: string;
}

export interface NextWeekTask { text: string; done: boolean; }
export interface Blocker { text: string; is_key_issue: boolean; }
export interface Achievement { text: string; is_key_achievement: boolean; }

export interface HoursBreakdown {
  development: number;
  testing: number;
  meetings: number;
  documentation: number;
  other: number;
}

export interface ReportLink { label: string; url: string; }

export interface Report {
  id: string;
  user_id: string;
  project_id: string;
  week_start: string;
  week_end: string;
  status: ReportStatus;
  tasks: Task[];
  next_week_tasks: NextWeekTask[];
  blockers: Blocker[];
  achievements: Achievement[];
  hours_breakdown: HoursBreakdown;
  notes: string;
  links: ReportLink[];
  review_comment: string;
  submitted_at: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportWithRelations extends Report {
  user?: User;
  project?: Project;
}

export interface ReportVersion {
  id: string;
  report_id: string;
  version_number: number;
  content: {
    tasks: Task[];
    next_week_tasks: NextWeekTask[];
    blockers: Blocker[];
    achievements: Achievement[];
    hours_breakdown: HoursBreakdown;
    notes: string;
    links: ReportLink[];
  };
  review_comment: string;
  created_at: string;
}

export interface ReviewComment {
  id: string;
  report_id: string;
  reviewer_id: string;
  comment: string;
  action: 'approve' | 'request_changes';
  created_at: string;
  reviewer?: User;
}

export const STATUS_LABELS: Record<ReportStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  needs_correction: 'Needs Correction',
  approved: 'Approved',
};

export const STATUS_COLORS: Record<ReportStatus, string> = {
  draft: 'bg-gray-100 text-gray-700 border-gray-200',
  submitted: 'bg-blue-50 text-blue-700 border-blue-200',
  needs_correction: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  Low: 'bg-gray-100 text-gray-600',
  Medium: 'bg-blue-50 text-blue-600',
  High: 'bg-orange-50 text-orange-600',
  Urgent: 'bg-red-50 text-red-600',
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  'Not Started': 'bg-gray-100 text-gray-600',
  'In Progress': 'bg-blue-50 text-blue-600',
  'Completed': 'bg-emerald-50 text-emerald-600',
  'Blocked': 'bg-red-50 text-red-600',
};

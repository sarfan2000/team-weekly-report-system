import { Request } from 'express';
import { Document } from 'mongoose';

// Enums
export enum UserRole {
  TEAM_MEMBER = 'TEAM_MEMBER',
  MANAGER = 'MANAGER', // Manager has all admin capabilities (review, analytics, user management)
}

export enum ReportStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  NEEDS_CORRECTION = 'NEEDS_CORRECTION',
  APPROVED = 'APPROVED',
}

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TaskStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  BLOCKED = 'BLOCKED',
}

export enum ReviewAction {
  APPROVED = 'APPROVED',
  REQUESTED_CHANGES = 'REQUESTED_CHANGES',
}

// Interfaces for subdocuments
export interface ITaskItem {
  name: string;
  priority: TaskPriority;
  plannedPercent: number;
  actualPercent: number;
  status: TaskStatus;
  timePlanned: number;
  timeSpent: number;
  deliverableOutput: string;
}

export interface INextWeekTask {
  text: string;
  done: boolean;
}

export interface IBlocker {
  text: string;
  isKeyIssue: boolean;
}

export interface IAchievement {
  text: string;
  isKeyAchievement: boolean;
}

export interface IHoursBreakdown {
  development: number;
  testing: number;
  meetings: number;
  documentation: number;
  other: number;
}

export interface IReportLink {
  label: string;
  url: string;
}

// Document Interfaces (for MongoDB documents)
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IProject extends Document {
  name: string;
  description?: string;
  status: ProjectStatus;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReport extends Document {
  userId: string;
  projectId: string;
  weekStartDate: Date;
  weekEndDate: Date;
  status: ReportStatus;
  tasks: ITaskItem[];
  nextWeekTasks: INextWeekTask[];
  blockers: IBlocker[];
  achievements: IAchievement[];
  hoursBreakdown: IHoursBreakdown;
  notes?: string;
  links: IReportLink[];
  reviewComment?: string;
  submittedAt?: Date;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReportVersion extends Document {
  reportId: string;
  versionNumber: number;
  snapshotData: {
    tasks: ITaskItem[];
    nextWeekTasks: INextWeekTask[];
    blockers: IBlocker[];
    achievements: IAchievement[];
    hoursBreakdown: IHoursBreakdown;
    notes?: string;
    links: IReportLink[];
  };
  submittedAt: Date;
  createdAt: Date;
}

export interface IReviewComment extends Document {
  reportId: string;
  reviewerId: string;
  versionNumber: number;
  action: ReviewAction;
  comment: string;
  createdAt: Date;
}

// Request with authenticated user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

// DTOs (Data Transfer Objects)
export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role?: UserRole;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface CreateReportDTO {
  projectId: string;
  weekStartDate: Date;
  weekEndDate: Date;
}

export interface UpdateReportDTO {
  projectId?: string;
  tasks?: ITaskItem[];
  nextWeekTasks?: INextWeekTask[];
  blockers?: IBlocker[];
  achievements?: IAchievement[];
  hoursBreakdown?: IHoursBreakdown;
  notes?: string;
  links?: IReportLink[];
}

export interface ReviewReportDTO {
  action: ReviewAction;
  comment: string;
}

export interface CreateProjectDTO {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateProjectDTO {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  color?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface ReportFilterQuery extends PaginationQuery {
  userId?: string;
  projectId?: string;
  status?: ReportStatus;
  weekStartDate?: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

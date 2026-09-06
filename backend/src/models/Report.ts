import mongoose, { Schema } from 'mongoose';
import { IReport, ReportStatus, TaskPriority, TaskStatus } from '../types';

const taskItemSchema = new Schema(
  {
    name: { type: String, required: true },
    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      default: TaskPriority.MEDIUM,
    },
    plannedPercent: { type: Number, default: 0, min: 0, max: 100 },
    actualPercent: { type: Number, default: 0, min: 0, max: 100 },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.NOT_STARTED,
    },
    timePlanned: { type: Number, default: 0 },
    timeSpent: { type: Number, default: 0 },
    deliverableOutput: { type: String, default: '' },
  },
  { _id: false }
);

const nextWeekTaskSchema = new Schema(
  {
    text: { type: String, required: true },
    done: { type: Boolean, default: false },
  },
  { _id: false }
);

const blockerSchema = new Schema(
  {
    text: { type: String, required: true },
    isKeyIssue: { type: Boolean, default: false },
  },
  { _id: false }
);

const achievementSchema = new Schema(
  {
    text: { type: String, required: true },
    isKeyAchievement: { type: Boolean, default: false },
  },
  { _id: false }
);

const hoursBreakdownSchema = new Schema(
  {
    development: { type: Number, default: 0 },
    testing: { type: Number, default: 0 },
    meetings: { type: Number, default: 0 },
    documentation: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
  },
  { _id: false }
);

const reportLinkSchema = new Schema(
  {
    label: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false }
);

const reportSchema = new Schema<IReport>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      ref: 'User',
    },
    projectId: {
      type: String,
      required: [true, 'Project ID is required'],
      ref: 'Project',
    },
    weekStartDate: {
      type: Date,
      required: [true, 'Week start date is required'],
    },
    weekEndDate: {
      type: Date,
      required: [true, 'Week end date is required'],
    },
    status: {
      type: String,
      enum: Object.values(ReportStatus),
      default: ReportStatus.DRAFT,
    },
    tasks: {
      type: [taskItemSchema],
      default: [],
    },
    nextWeekTasks: {
      type: [nextWeekTaskSchema],
      default: [],
    },
    blockers: {
      type: [blockerSchema],
      default: [],
    },
    achievements: {
      type: [achievementSchema],
      default: [],
    },
    hoursBreakdown: {
      type: hoursBreakdownSchema,
      default: {
        development: 0,
        testing: 0,
        meetings: 0,
        documentation: 0,
        other: 0,
      },
    },
    notes: {
      type: String,
      default: '',
    },
    links: {
      type: [reportLinkSchema],
      default: [],
    },
    reviewComment: {
      type: String,
      default: '',
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for faster queries
reportSchema.index({ userId: 1, weekStartDate: -1 });
reportSchema.index({ status: 1 });
reportSchema.index({ projectId: 1 });
reportSchema.index({ weekStartDate: 1, weekEndDate: 1 });

export const Report = mongoose.model<IReport>('Report', reportSchema);

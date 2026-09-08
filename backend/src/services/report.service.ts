import { Report } from '../models/Report';
import { ReportVersion } from '../models/ReportVersion';
import { ReviewComment } from '../models/ReviewComment';
import {
  CreateReportDTO,
  UpdateReportDTO,
  ReviewReportDTO,
  ReportFilterQuery,
  ReportStatus,
  ReviewAction,
} from '../types';
import { AppError } from '../utils/errors';

export const getMyReports = async (
  userId: string,
  query: ReportFilterQuery
) => {
  const {
    page = 1,
    limit = 10,
    status,
    weekStartDate,
  } = query;

  const filter: any = { userId };

  if (status) {
    filter.status = status;
  }

  if (weekStartDate) {
    filter.weekStartDate = { $gte: new Date(weekStartDate) };
  }

  const skip = (page - 1) * limit;

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .populate('projectId', 'name description status')
      .sort({ weekStartDate: -1 })
      .skip(skip)
      .limit(limit),
    Report.countDocuments(filter),
  ]);

  return {
    data: reports,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getReportById = async (reportId: string): Promise<any> => {
  const report = await Report.findById(reportId)
    .populate('userId', 'name email role department avatarUrl')
    .populate('projectId', 'name description status');

  if (!report) {
    throw new AppError('Report not found', 404);
  }

  // Get review comments
  const reviews = await ReviewComment.find({ reportId })
    .populate('reviewerId', 'name email role')
    .sort({ createdAt: -1 });

  // Get version count
  const versionCount = await ReportVersion.countDocuments({ reportId });

  return {
    ...report.toJSON(),
    reviews,
    versionCount,
  };
};

export const createReport = async (userId: string, dto: CreateReportDTO) => {
  const report = await Report.create({
    userId,
    ...dto,
  });

  return report;
};

export const updateReport = async (
  reportId: string,
  dto: UpdateReportDTO
) => {
  const report = await Report.findById(reportId);

  if (!report) {
    throw new AppError('Report not found', 404);
  }

  // Can only update if status is DRAFT or NEEDS_CORRECTION
  if (
    report.status !== ReportStatus.DRAFT &&
    report.status !== ReportStatus.NEEDS_CORRECTION
  ) {
    throw new AppError(
      'Can only update reports in DRAFT or NEEDS_CORRECTION status',
      400
    );
  }

  Object.assign(report, dto);
  await report.save();

  return report;
};

export const submitReport = async (reportId: string) => {
  const report = await Report.findById(reportId);

  if (!report) {
    throw new AppError('Report not found', 404);
  }

  // Can only submit from DRAFT or NEEDS_CORRECTION
  if (
    report.status !== ReportStatus.DRAFT &&
    report.status !== ReportStatus.NEEDS_CORRECTION
  ) {
    throw new AppError(
      'Can only submit reports in DRAFT or NEEDS_CORRECTION status',
      400
    );
  }

  // If resubmitting from NEEDS_CORRECTION, create version snapshot
  if (report.status === ReportStatus.NEEDS_CORRECTION) {
    const existingVersions = await ReportVersion.countDocuments({ reportId });
    const newVersionNumber = existingVersions + 1;

    await ReportVersion.create({
      reportId,
      versionNumber: newVersionNumber,
      snapshotData: {
        tasks: report.tasks,
        nextWeekTasks: report.nextWeekTasks,
        blockers: report.blockers,
        achievements: report.achievements,
        hoursBreakdown: report.hoursBreakdown,
        notes: report.notes,
        links: report.links,
      },
      submittedAt: new Date(),
    });
  }

  report.status = ReportStatus.SUBMITTED;
  report.submittedAt = new Date();
  await report.save();

  return report;
};

export const getReportVersions = async (reportId: string) => {
  const report = await Report.findById(reportId);
  if (!report) {
    throw new AppError('Report not found', 404);
  }

  const versions = await ReportVersion.find({ reportId }).sort({
    versionNumber: -1,
  });

  return versions;
};

export const getReportVersion = async (
  reportId: string,
  versionNumber: number
) => {
  const version = await ReportVersion.findOne({ reportId, versionNumber });

  if (!version) {
    throw new AppError('Version not found', 404);
  }

  return version;
};

export const deleteReport = async (reportId: string) => {
  const report = await Report.findByIdAndDelete(reportId);

  if (!report) {
    throw new AppError('Report not found', 404);
  }

  // Clean up related data
  await Promise.all([
    ReportVersion.deleteMany({ reportId }),
    ReviewComment.deleteMany({ reportId }),
  ]);

  return report;
};

// Manager functions
export const getTeamReports = async (query: ReportFilterQuery) => {
  const {
    page = 1,
    limit = 10,
    userId,
    projectId,
    status,
    weekStartDate,
  } = query;

  const filter: any = {};

  if (userId) filter.userId = userId;
  if (projectId) filter.projectId = projectId;
  if (status) filter.status = status;
  if (weekStartDate) {
    filter.weekStartDate = { $gte: new Date(weekStartDate) };
  }

  const skip = (page - 1) * limit;

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .populate('userId', 'name email role department')
      .populate('projectId', 'name description')
      .sort({ weekStartDate: -1 })
      .skip(skip)
      .limit(limit),
    Report.countDocuments(filter),
  ]);

  return {
    data: reports,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const reviewReport = async (
  reportId: string,
  reviewerId: string,
  dto: ReviewReportDTO
) => {
  const report = await Report.findById(reportId);

  if (!report) {
    throw new AppError('Report not found', 404);
  }

  // Can only review submitted reports
  if (report.status !== ReportStatus.SUBMITTED) {
    throw new AppError('Can only review submitted reports', 400);
  }

  // Validate comment for REQUEST_CHANGES
  if (dto.action === ReviewAction.REQUESTED_CHANGES && !dto.comment.trim()) {
    throw new AppError('Comment is required when requesting changes', 400);
  }

  // Get current version number
  const versionCount = await ReportVersion.countDocuments({ reportId });
  const currentVersion = versionCount || 1;

  // Create review comment
  await ReviewComment.create({
    reportId,
    reviewerId,
    versionNumber: currentVersion,
    action: dto.action,
    comment: dto.comment,
  });

  // Update report status
  if (dto.action === ReviewAction.APPROVED) {
    report.status = ReportStatus.APPROVED;
    report.approvedAt = new Date();
    report.reviewComment = dto.comment;
  } else {
    report.status = ReportStatus.NEEDS_CORRECTION;
    report.reviewComment = dto.comment;
  }

  await report.save();

  return report;
};

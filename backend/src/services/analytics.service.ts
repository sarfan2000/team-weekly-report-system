import { Report } from '../models/Report';
import { ReportStatus, TaskStatus } from '../types';
import { startOfWeek, endOfWeek, subWeeks } from 'date-fns';

export const getAnalyticsSummary = async () => {
  const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  // Total submitted reports this week
  const submittedThisWeek = await Report.countDocuments({
    weekStartDate: { $gte: currentWeekStart, $lte: currentWeekEnd },
    status: { $in: [ReportStatus.SUBMITTED, ReportStatus.APPROVED] },
  });

  // Total reports expected this week (all team members)
  const totalReportsExpected = await Report.countDocuments({
    weekStartDate: { $gte: currentWeekStart, $lte: currentWeekEnd },
  });

  // Submission compliance rate
  const complianceRate =
    totalReportsExpected > 0
      ? Math.round((submittedThisWeek / totalReportsExpected) * 100)
      : 0;

  // Reports needing correction
  const needsCorrectionCount = await Report.countDocuments({
    status: ReportStatus.NEEDS_CORRECTION,
  });

  // Total open blockers
  const reportsWithBlockers = await Report.find({
    status: { $ne: ReportStatus.DRAFT },
    'blockers.0': { $exists: true },
  });

  const totalBlockers = reportsWithBlockers.reduce(
    (sum, report) => sum + report.blockers.length,
    0
  );

  return {
    submittedThisWeek,
    totalReportsExpected,
    complianceRate,
    needsCorrectionCount,
    totalBlockers,
  };
};

export const getAnalyticsCharts = async () => {
  // Get last 4 weeks of data
  const weeksToFetch = 4;
  const weeks = [];
  
  for (let i = 0; i < weeksToFetch; i++) {
    const weekStart = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
    weeks.push({ start: weekStart, end: weekEnd });
  }

  // Tasks completed trend
  const tasksCompletedTrend = await Promise.all(
    weeks.map(async ({ start, end }) => {
      const reports = await Report.find({
        weekStartDate: { $gte: start, $lte: end },
        status: { $in: [ReportStatus.SUBMITTED, ReportStatus.APPROVED] },
      });

      const completedTasks = reports.reduce((sum, report) => {
        return (
          sum +
          report.tasks.filter((task) => task.status === TaskStatus.COMPLETED)
            .length
        );
      }, 0);

      return {
        week: start.toISOString().split('T')[0],
        completed: completedTasks,
      };
    })
  );

  // Time breakdown by category
  const allReports = await Report.find({
    status: { $in: [ReportStatus.SUBMITTED, ReportStatus.APPROVED] },
    weekStartDate: {
      $gte: weeks[weeks.length - 1].start,
    },
  });

  const timeBreakdown = allReports.reduce(
    (acc, report) => {
      acc.development += report.hoursBreakdown.development;
      acc.testing += report.hoursBreakdown.testing;
      acc.meetings += report.hoursBreakdown.meetings;
      acc.documentation += report.hoursBreakdown.documentation;
      acc.other += report.hoursBreakdown.other;
      return acc;
    },
    {
      development: 0,
      testing: 0,
      meetings: 0,
      documentation: 0,
      other: 0,
    }
  );

  // Workload by project
  const workloadByProject = await Report.aggregate([
    {
      $match: {
        status: { $in: [ReportStatus.SUBMITTED, ReportStatus.APPROVED] },
        weekStartDate: { $gte: weeks[weeks.length - 1].start },
      },
    },
    {
      $lookup: {
        from: 'projects',
        localField: 'projectId',
        foreignField: '_id',
        as: 'project',
      },
    },
    {
      $unwind: '$project',
    },
    {
      $group: {
        _id: '$projectId',
        projectName: { $first: '$project.name' },
        totalTasks: { $sum: { $size: '$tasks' } },
        totalHours: {
          $sum: {
            $add: [
              '$hoursBreakdown.development',
              '$hoursBreakdown.testing',
              '$hoursBreakdown.meetings',
              '$hoursBreakdown.documentation',
              '$hoursBreakdown.other',
            ],
          },
        },
      },
    },
  ]);

  return {
    tasksCompletedTrend: tasksCompletedTrend.reverse(),
    timeBreakdown,
    workloadByProject,
  };
};

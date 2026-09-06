// import mongoose from 'mongoose';
// import { config } from '../config/env';
// import { User } from '../models/User';
// import { Project } from '../models/Project';
// import { Report } from '../models/Report';
// import { ReportVersion } from '../models/ReportVersion';
// import { ReviewComment } from '../models/ReviewComment';
// import {
//   UserRole,
//   ProjectStatus,
//   ReportStatus,
//   TaskPriority,
//   TaskStatus,
//   ReviewAction,
// } from '../types';
// import { subWeeks, startOfWeek, endOfWeek, addDays } from 'date-fns';

// export const seedDatabase = async (preventExit = false) => {
//   try {
//     console.log('🌱 Starting database seed...\n');

//     // Connect to database only if not already connected
//     if (mongoose.connection.readyState === 0) {
//       await mongoose.connect(config.mongoUri);
//       console.log('✓ Connected to MongoDB');
//     }

//     // Clear existing data
//     await Promise.all([
//       User.deleteMany({}),
//       Project.deleteMany({}),
//       Report.deleteMany({}),
//       ReportVersion.deleteMany({}),
//       ReviewComment.deleteMany({}),
//     ]);
//     console.log('✓ Cleared existing data');

//     // Create users
//     const manager = await User.create({
//       name: 'Sarah Manager',
//       email: 'sarah.manager@example.com',
//       password: 'Password123!',
//       role: UserRole.MANAGER,
//       department: 'Engineering',
//     });

//     const alice = await User.create({
//       name: 'Alice Developer',
//       email: 'alice.dev@example.com',
//       password: 'Password123!',
//       role: UserRole.TEAM_MEMBER,
//       department: 'Engineering',
//     });

//     const bob = await User.create({
//       name: 'Bob Developer',
//       email: 'bob.dev@example.com',
//       password: 'Password123!',
//       role: UserRole.TEAM_MEMBER,
//       department: 'Engineering',
//     });

//     const charlie = await User.create({
//       name: 'Charlie QA',
//       email: 'charlie.qa@example.com',
//       password: 'Password123!',
//       role: UserRole.TEAM_MEMBER,
//       department: 'Quality Assurance',
//     });

//     console.log('✓ Created users');

//     // Create projects
//     const ecommerce = await Project.create({
//       name: 'E-Commerce Platform',
//       description: 'Online shopping platform with payment integration',
//       status: ProjectStatus.ACTIVE,
//     });

//     const futsal = await Project.create({
//       name: 'Futsal Smart System',
//       description: 'Court booking and management system',
//       status: ProjectStatus.ACTIVE,
//     });

//     const tooling = await Project.create({
//       name: 'Internal Tooling',
//       description: 'Developer productivity tools',
//       status: ProjectStatus.ACTIVE,
//     });

//     console.log('✓ Created projects');

//     // Create reports for last 3 weeks
//     const teamMembers = [alice, bob, charlie];
//     const projects = [ecommerce, futsal, tooling];

//     for (let weekOffset = 2; weekOffset >= 0; weekOffset--) {
//       const weekStart = startOfWeek(subWeeks(new Date(), weekOffset), {
//         weekStartsOn: 1,
//       });
//       const weekEnd = endOfWeek(subWeeks(new Date(), weekOffset), {
//         weekStartsOn: 1,
//       });

//       for (const member of teamMembers) {
//         const project = projects[Math.floor(Math.random() * projects.length)];

//         // Determine report status based on week
//         let status: ReportStatus;
//         if (weekOffset === 2) {
//           status = ReportStatus.APPROVED; // 2 weeks ago - approved
//         } else if (weekOffset === 1) {
//           status = member.name === 'Alice Developer'
//             ? ReportStatus.NEEDS_CORRECTION
//             : ReportStatus.APPROVED; // 1 week ago
//         } else {
//           status = member.name === 'Bob Developer'
//             ? ReportStatus.SUBMITTED
//             : ReportStatus.DRAFT; // Current week
//         }

//         const report = await Report.create({
//           userId: member._id,
//           projectId: project._id,
//           weekStartDate: weekStart,
//           weekEndDate: weekEnd,
//           status,
//           tasks: [
//             {
//               name: 'Implement user authentication',
//               priority: TaskPriority.HIGH,
//               plannedPercent: 100,
//               actualPercent: 100,
//               status: TaskStatus.COMPLETED,
//               timePlanned: 16,
//               timeSpent: 18,
//               deliverableOutput: 'JWT-based auth system with refresh tokens',
//             },
//             {
//               name: 'Create API documentation',
//               priority: TaskPriority.MEDIUM,
//               plannedPercent: 100,
//               actualPercent: 75,
//               status: TaskStatus.IN_PROGRESS,
//               timePlanned: 8,
//               timeSpent: 6,
//               deliverableOutput: 'Swagger/OpenAPI documentation in progress',
//             },
//             {
//               name: 'Fix database performance issues',
//               priority: TaskPriority.URGENT,
//               plannedPercent: 100,
//               actualPercent: 50,
//               status: TaskStatus.BLOCKED,
//               timePlanned: 12,
//               timeSpent: 8,
//               deliverableOutput: 'Identified slow queries, blocked on DBA review',
//             },
//           ],
//           nextWeekTasks: [
//             { text: 'Complete API documentation', done: false },
//             { text: 'Start payment integration', done: false },
//             { text: 'Code review for authentication module', done: false },
//           ],
//           blockers: [
//             {
//               text: 'Waiting for database admin to review query optimization',
//               isKeyIssue: true,
//             },
//             {
//               text: 'Third-party API documentation is incomplete',
//               isKeyIssue: false,
//             },
//           ],
//           achievements: [
//             {
//               text: 'Successfully implemented secure authentication system',
//               isKeyAchievement: true,
//             },
//             {
//               text: 'Resolved critical security vulnerability',
//               isKeyAchievement: true,
//             },
//           ],
//           hoursBreakdown: {
//             development: 25,
//             testing: 8,
//             meetings: 5,
//             documentation: 4,
//             other: 2,
//           },
//           notes: `Made good progress this week. The authentication system is complete and tested.
          
// Performance optimization is blocked but we have identified the root cause.`,
//           links: [
//             { label: 'Pull Request #123', url: 'https://github.com/example/repo/pull/123' },
//             { label: 'Design Document', url: 'https://docs.example.com/auth-design' },
//           ],
//           submittedAt: status !== ReportStatus.DRAFT ? weekEnd : undefined,
//           approvedAt: status === ReportStatus.APPROVED ? addDays(weekEnd, 1) : undefined,
//         });

//         // Add review comments for approved/needs correction reports
//         if (status === ReportStatus.APPROVED) {
//           await ReviewComment.create({
//             reportId: report._id,
//             reviewerId: manager._id,
//             versionNumber: 1,
//             action: ReviewAction.APPROVED,
//             comment: 'Excellent work this week! Great progress on the authentication system.',
//           });
//         } else if (status === ReportStatus.NEEDS_CORRECTION) {
//           await ReviewComment.create({
//             reportId: report._id,
//             reviewerId: manager._id,
//             versionNumber: 1,
//             action: ReviewAction.REQUESTED_CHANGES,
//             comment: 'Please provide more detail on the blocked tasks and estimated resolution time.',
//           });

//           // Create a version snapshot
//           await ReportVersion.create({
//             reportId: report._id,
//             versionNumber: 1,
//             snapshotData: {
//               tasks: report.tasks,
//               nextWeekTasks: report.nextWeekTasks,
//               blockers: report.blockers,
//               achievements: report.achievements,
//               hoursBreakdown: report.hoursBreakdown,
//               notes: report.notes,
//               links: report.links,
//             },
//             submittedAt: weekEnd,
//           });
//         }
//       }
//     }

//     console.log('✓ Created reports with review history');
//     console.log('\n✨ Database seeded successfully!\n');
//     console.log('═══════════════════════════════════════════════════');
//     console.log('  Test Accounts');
//     console.log('═══════════════════════════════════════════════════');
//     console.log('  Manager:');
//     console.log('    Email: sarah.manager@example.com');
//     console.log('    Password: Password123!');
//     console.log('');
//     console.log('  Team Members:');
//     console.log('    Email: alice.dev@example.com');
//     console.log('    Email: bob.dev@example.com');
//     console.log('    Email: charlie.qa@example.com');
//     console.log('    Password: Password123! (for all)');
//     console.log('═══════════════════════════════════════════════════\n');

//     if (!preventExit) await mongoose.connection.close();
//     if (!preventExit) process.exit(0);
//   } catch (error) {
//     console.error('❌ Seed failed:', error);
//     if (!preventExit) process.exit(1);
//     throw error;
//   }
// };

// // If run directly via CLI (not imported)
// if (require.main === module) {
//   seedDatabase();
// }

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import { User } from '../models/User';
import { Project } from '../models/Project';
import { Report } from '../models/Report';
import { UserRole, ReportStatus } from '../types';
import { startOfWeek, endOfWeek } from 'date-fns';

// Test database connection
beforeAll(async () => {
  const testDbUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/weekly-reports-test';
  await mongoose.connect(testDbUri);
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    Report.deleteMany({}),
  ]);
});

describe('RBAC (Role-Based Access Control) Tests', () => {
  let managerToken: string;
  let teamMemberToken: string;
  let teamMember2Token: string;
  let teamMemberId: string;
  let teamMember2Id: string;
  let projectId: string;
  let reportId: string;

  beforeEach(async () => {
    // Create manager
    await request(app).post('/api/auth/register').send({
      name: 'Manager',
      email: 'manager@example.com',
      password: 'Password123!',
      role: UserRole.MANAGER,
    });

    const managerLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@example.com', password: 'Password123!' });
    managerToken = managerLogin.body.data.token;

    // Create team member 1
    const member1Res = await request(app).post('/api/auth/register').send({
      name: 'Team Member 1',
      email: 'member1@example.com',
      password: 'Password123!',
    });
    teamMemberToken = member1Res.body.data.token;
    teamMemberId = member1Res.body.data.user.id;

    // Create team member 2
    const member2Res = await request(app).post('/api/auth/register').send({
      name: 'Team Member 2',
      email: 'member2@example.com',
      password: 'Password123!',
    });
    teamMember2Token = member2Res.body.data.token;
    teamMember2Id = member2Res.body.data.user.id;

    // Create project
    const project = await Project.create({
      name: 'Test Project',
      description: 'Test',
    });
    projectId = project._id.toString();

    // Create report for team member 1
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

    const report = await Report.create({
      userId: teamMemberId,
      projectId,
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      status: ReportStatus.DRAFT,
    });
    reportId = report._id.toString();
  });

  describe('Report Ownership Enforcement', () => {
    it('should allow team member to view their own report', async () => {
      const response = await request(app)
        .get(`/api/reports/${reportId}`)
        .set('Authorization', `Bearer ${teamMemberToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should NOT allow team member to view another user\'s report', async () => {
      const response = await request(app)
        .get(`/api/reports/${reportId}`)
        .set('Authorization', `Bearer ${teamMember2Token}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should allow team member to update their own report', async () => {
      const response = await request(app)
        .put(`/api/reports/${reportId}`)
        .set('Authorization', `Bearer ${teamMemberToken}`)
        .send({ notes: 'Updated notes' });

      expect(response.status).toBe(200);
    });

    it('should NOT allow team member to update another user\'s report', async () => {
      const response = await request(app)
        .put(`/api/reports/${reportId}`)
        .set('Authorization', `Bearer ${teamMember2Token}`)
        .send({ notes: 'Trying to update' });

      expect(response.status).toBe(403);
    });

    it('should allow manager to view any team member\'s report', async () => {
      const response = await request(app)
        .get(`/api/reports/${reportId}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Manager Route Protection', () => {
    it('should NOT allow team member to access manager routes', async () => {
      const response = await request(app)
        .get('/api/manager/reports')
        .set('Authorization', `Bearer ${teamMemberToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should allow manager to access manager routes', async () => {
      const response = await request(app)
        .get('/api/manager/reports')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should allow manager to review reports', async () => {
      // First submit the report
      await request(app)
        .post(`/api/reports/${reportId}/submit`)
        .set('Authorization', `Bearer ${teamMemberToken}`);

      // Manager reviews
      const response = await request(app)
        .post(`/api/manager/reports/${reportId}/review`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          action: 'APPROVED',
          comment: 'Great work!',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe(ReportStatus.APPROVED);
    });

    it('should NOT allow team member to review reports', async () => {
      // Submit report
      await request(app)
        .post(`/api/reports/${reportId}/submit`)
        .set('Authorization', `Bearer ${teamMemberToken}`);

      // Team member tries to review
      const response = await request(app)
        .post(`/api/manager/reports/${reportId}/review`)
        .set('Authorization', `Bearer ${teamMember2Token}`)
        .send({
          action: 'APPROVED',
          comment: 'Trying to approve',
        });

      expect(response.status).toBe(403);
    });
  });

  describe('Analytics Access', () => {
    it('should NOT allow team member to access analytics', async () => {
      const response = await request(app)
        .get('/api/manager/analytics/summary')
        .set('Authorization', `Bearer ${teamMemberToken}`);

      expect(response.status).toBe(403);
    });

    it('should allow manager to access analytics', async () => {
      const response = await request(app)
        .get('/api/manager/analytics/summary')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});

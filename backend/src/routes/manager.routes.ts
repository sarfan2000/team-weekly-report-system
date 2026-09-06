import { Router } from 'express';
import { body } from 'express-validator';
import * as managerController from '../controllers/manager.controller';
import { authenticate, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { UserRole } from '../types';

const router = Router();

// Validation rules
const reviewReportValidation = [
  body('action')
    .isIn(['APPROVED', 'REQUESTED_CHANGES'])
    .withMessage('Action must be APPROVED or REQUESTED_CHANGES'),
  body('comment').trim().notEmpty().withMessage('Comment is required'),
];

// All routes require authentication and manager role
router.use(authenticate);
router.use(authorizeRoles(UserRole.MANAGER));

// Get team reports (filterable, paginated)
router.get('/reports', managerController.getTeamReports);

// Review a report
router.post(
  '/reports/:id/review',
  validate(reviewReportValidation),
  managerController.reviewReport
);

// Analytics endpoints
router.get('/analytics/summary', managerController.getAnalyticsSummary);
router.get('/analytics/charts', managerController.getAnalyticsCharts);

export default router;

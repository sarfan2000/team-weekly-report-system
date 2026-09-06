import { Router } from 'express';
import { body } from 'express-validator';
import * as reportController from '../controllers/report.controller';
import { authenticate, enforceReportOwnership } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// Validation rules
const createReportValidation = [
  body('projectId').notEmpty().withMessage('Project ID is required'),
  body('weekStartDate').isISO8601().withMessage('Valid week start date is required'),
  body('weekEndDate').isISO8601().withMessage('Valid week end date is required'),
];

const updateReportValidation = [
  body('projectId').optional(),
  body('tasks').optional().isArray(),
  body('nextWeekTasks').optional().isArray(),
  body('blockers').optional().isArray(),
  body('achievements').optional().isArray(),
  body('hoursBreakdown').optional().isObject(),
  body('notes').optional().isString(),
  body('links').optional().isArray(),
];

// All routes require authentication
router.use(authenticate);

// Get my reports history (paginated)
router.get('/my-history', reportController.getMyReports);

// Create new report
router.post(
  '/',
  validate(createReportValidation),
  reportController.createReport
);

// Get single report (with ownership check)
router.get('/:id', enforceReportOwnership, reportController.getReportById);

// Update report (with ownership check)
router.put(
  '/:id',
  enforceReportOwnership,
  validate(updateReportValidation),
  reportController.updateReport
);

// Submit report (with ownership check)
router.post('/:id/submit', enforceReportOwnership, reportController.submitReport);

// Get report versions
router.get('/:id/versions', enforceReportOwnership, reportController.getReportVersions);

// Get specific version
router.get('/:id/versions/:versionNum', enforceReportOwnership, reportController.getReportVersion);

// Delete report (with ownership check)
router.delete('/:id', enforceReportOwnership, reportController.deleteReport);

export default router;

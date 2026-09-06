import { Router } from 'express';
import { body } from 'express-validator';
import * as projectController from '../controllers/project.controller';
import { authenticate, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { UserRole } from '../types';

const router = Router();

// Validation rules
const createProjectValidation = [
  body('name').trim().notEmpty().withMessage('Project name is required'),
  body('description').optional().trim(),
  body('color').optional().trim(),
];

const updateProjectValidation = [
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('status').optional().isIn(['ACTIVE', 'ARCHIVED']),
  body('color').optional().trim(),
];

// All routes require authentication
router.use(authenticate);

// Get all projects (all authenticated users)
router.get('/', projectController.getAllProjects);

// Get single project
router.get('/:id', projectController.getProjectById);

// Create project (Manager only)
router.post(
  '/',
  authorizeRoles(UserRole.MANAGER),
  validate(createProjectValidation),
  projectController.createProject
);

// Update project (Manager only)
router.put(
  '/:id',
  authorizeRoles(UserRole.MANAGER),
  validate(updateProjectValidation),
  projectController.updateProject
);

// Delete project (Manager only)
router.delete(
  '/:id',
  authorizeRoles(UserRole.MANAGER),
  projectController.deleteProject
);

export default router;

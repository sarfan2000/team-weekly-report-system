import { Router } from 'express';
import { body } from 'express-validator';
import * as userController from '../controllers/user.controller';
import { authenticate, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { UserRole } from '../types';

const router = Router();

// Validation rules
const updateRoleValidation = [
  body('role')
    .isIn(Object.values(UserRole))
    .withMessage('Invalid role'),
];

// All routes require authentication
router.use(authenticate);

// Get all users (Manager only)
router.get(
  '/',
  authorizeRoles(UserRole.MANAGER),
  userController.getAllUsers
);

// Update user (Manager only)
router.patch(
  '/:id',
  authorizeRoles(UserRole.MANAGER),
  userController.updateUser
);

// Delete user (Manager only)
router.delete(
  '/:id',
  authorizeRoles(UserRole.MANAGER),
  userController.deleteUser
);

export default router;

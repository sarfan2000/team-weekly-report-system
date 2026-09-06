import { Router } from 'express';
import { body } from 'express-validator';
import * as aiController from '../controllers/ai.controller';
import { authenticate, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { UserRole } from '../types';

const router = Router();

// Validation rules
const chatValidation = [
  body('query').trim().notEmpty().withMessage('Query is required'),
];

// All routes require authentication and manager role
router.use(authenticate);
router.use(authorizeRoles(UserRole.MANAGER));

// AI chat endpoint
router.post('/chat', validate(chatValidation), aiController.chat);

export default router;

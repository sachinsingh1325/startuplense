import express from 'express';
import {
  getDashboardStats,
  getUsers,
  updateUserRole,
  getAnalytics
} from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:userId/role', updateUserRole);
router.get('/analytics', getAnalytics);

export default router;

import express from 'express';
import {
  getPlans,
  getMySubscription,
  createSubscription,
  checkSubscription
} from '../controllers/subscription.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/plans', getPlans);
router.get('/me', authenticate, getMySubscription);
router.get('/check', authenticate, checkSubscription);
router.post('/create', authenticate, createSubscription);

export default router;

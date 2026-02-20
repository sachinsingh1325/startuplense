import express from 'express';
import {
  trackEvent,
  trackConversion,
  getUserAnalytics
} from '../controllers/analytics.controller.js';
import { optionalAuth, authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/events', optionalAuth, trackEvent);
router.post('/conversions', authenticate, trackConversion);
router.get('/me', authenticate, getUserAnalytics);

export default router;

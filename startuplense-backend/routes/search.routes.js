import express from 'express';
import {
  searchArticles,
  getTrendingSearches
} from '../controllers/search.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/articles', optionalAuth, searchArticles);
router.get('/trending', getTrendingSearches);

export default router;

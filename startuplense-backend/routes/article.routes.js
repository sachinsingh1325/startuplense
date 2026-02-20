import express from 'express';
import {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle
} from '../controllers/article.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = express.Router();

router.get('/', optionalAuth, getArticles);
router.get('/:slug', optionalAuth, getArticle);
router.post('/', authenticate, requireAdmin, createArticle);
router.put('/:id', authenticate, requireAdmin, updateArticle);
router.delete('/:id', authenticate, requireAdmin, deleteArticle);

export default router;

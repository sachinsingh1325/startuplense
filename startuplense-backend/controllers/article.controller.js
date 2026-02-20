import Article from '../models/Article.model.js';
import UserArticleAccess from '../models/UserArticleAccess.model.js';
import ReadingLimit from '../models/ReadingLimit.model.js';
import Subscription from '../models/Subscription.model.js';
import AnalyticsEvent from '../models/AnalyticsEvent.model.js';

// Get all articles (with filters)
export const getArticles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      tags,
      isPremium,
      status = 'published',
      sort = 'publishedAt',
      order = 'desc'
    } = req.query;

    const query = { status };

    if (category) query.categoryId = category;
    if (tags) query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    if (isPremium !== undefined) query.isPremium = isPremium === 'true';

    // Free users can't see premium articles
    if (req.user?.role === 'free') {
      query.isPremium = false;
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sort]: sortOrder };

    const articles = await Article.find(query)
      .populate('categoryId', 'name slug')
      .populate('createdBy', 'name email')
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-content'); // Don't send full content in list

    const total = await Article.countDocuments(query);

    res.json({
      success: true,
      data: {
        articles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single article
export const getArticle = async (req, res) => {
  try {
    const { slug } = req.params;

    const article = await Article.findOne({ slug })
      .populate('categoryId', 'name slug')
      .populate('createdBy', 'name email');

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Check premium access
    if (article.isPremium) {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required for premium content'
        });
      }

      if (req.user.role === 'free') {
        const subscription = await Subscription.findOne({
          userId: req.user._id,
          isActive: true
        });

        if (!subscription || !subscription.isValid()) {
          return res.status(403).json({
            success: false,
            message: 'Premium subscription required',
            requiresSubscription: true
          });
        }
      }

      // Check reading limits for free users
      if (req.user.role === 'free') {
        const limit = await ReadingLimit.findOne({ role: 'free' });
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const readsThisMonth = await UserArticleAccess.countDocuments({
          userId: req.user._id,
          readAt: { $gte: startOfMonth }
        });

        if (readsThisMonth >= limit.maxReadsPerMonth) {
          return res.status(403).json({
            success: false,
            message: `Monthly reading limit reached (${limit.maxReadsPerMonth} articles). Please upgrade.`
          });
        }
      }
    }

    // Track access
    if (req.user) {
      await UserArticleAccess.findOneAndUpdate(
        { userId: req.user._id, articleId: article._id },
        { readAt: new Date() },
        { upsert: true, new: true }
      );

      // Track analytics
      await AnalyticsEvent.create({
        userId: req.user._id,
        event: 'ARTICLE_READ',
        articleId: article._id
      });
    }

    // Increment read count
    article.readCount += 1;
    await article.save();

    res.json({
      success: true,
      data: { article }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create article (Admin/Author)
export const createArticle = async (req, res) => {
  try {
    const article = await Article.create({
      ...req.body,
      createdBy: req.user._id,
      publishedAt: req.body.status === 'published' ? new Date() : null
    });

    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: { article }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update article
export const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && article.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this article'
      });
    }

    if (req.body.status === 'published' && article.status !== 'published') {
      req.body.publishedAt = new Date();
    }

    const updatedArticle = await Article.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Article updated successfully',
      data: { article: updatedArticle }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete article
export const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && article.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this article'
      });
    }

    await Article.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

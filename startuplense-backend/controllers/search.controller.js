import Article from '../models/Article.model.js';
import SearchLog from '../models/SearchLog.model.js';

// Search articles
export const searchArticles = async (req, res) => {
  try {
    const {
      q,
      category,
      tags,
      isPremium,
      page = 1,
      limit = 10,
      sort = 'publishedAt',
      order = 'desc'
    } = req.query;

    let query = { status: 'published' };

    // Text search
    if (q) {
      query.$text = { $search: q };
    }

    // Filters
    if (category) query.categoryId = category;
    if (tags) query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    if (isPremium !== undefined) query.isPremium = isPremium === 'true';

    // Free users can't see premium articles
    if (req.user?.role === 'free') {
      query.isPremium = false;
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    let sortObj = { [sort]: sortOrder };

    // If text search, add text score
    if (q) {
      sortObj = { score: { $meta: 'textScore' }, ...sortObj };
    }

    const articles = await Article.find(query, q ? { score: { $meta: 'textScore' } } : {})
      .populate('categoryId', 'name slug')
      .populate('createdBy', 'name email')
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-content');

    const total = await Article.countDocuments(query);

    // Log search
    if (q) {
      await SearchLog.create({
        userId: req.user?._id,
        keyword: q,
        filters: { category, tags, isPremium },
        resultsCount: total
      });
    }

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

// Get trending searches
export const getTrendingSearches = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const trending = await SearchLog.aggregate([
      {
        $group: {
          _id: '$keyword',
          count: { $sum: 1 },
          lastSearched: { $max: '$searchedAt' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      success: true,
      data: { trending }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

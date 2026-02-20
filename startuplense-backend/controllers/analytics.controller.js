import AnalyticsEvent from '../models/AnalyticsEvent.model.js';
import Conversion from '../models/Conversion.model.js';

// Track event
export const trackEvent = async (req, res) => {
  try {
    const { event, articleId, duration, metadata } = req.body;

    const analyticsEvent = await AnalyticsEvent.create({
      userId: req.user?._id,
      event,
      articleId,
      duration,
      metadata,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(201).json({
      success: true,
      message: 'Event tracked successfully',
      data: { event: analyticsEvent }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Track conversion
export const trackConversion = async (req, res) => {
  try {
    const { source, articleId, planBought, amount, conversionType } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const conversion = await Conversion.create({
      userId: req.user._id,
      source,
      articleId,
      planBought,
      amount,
      conversionType
    });

    res.status(201).json({
      success: true,
      message: 'Conversion tracked successfully',
      data: { conversion }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user analytics
export const getUserAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchStage = { userId: req.user._id };
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const events = await AnalyticsEvent.find(matchStage)
      .populate('articleId', 'title slug')
      .sort({ createdAt: -1 })
      .limit(100);

    const stats = await AnalyticsEvent.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$event',
          count: { $sum: 1 },
          totalDuration: { $sum: '$duration' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        events,
        stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

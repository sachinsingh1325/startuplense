import Subscription from '../models/Subscription.model.js';

export const checkSubscription = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Admin always has access
    if (req.user.role === 'admin') {
      return next();
    }

    // Check active subscription
    const subscription = await Subscription.findOne({
      userId: req.user._id,
      isActive: true
    }).populate('planId');

    if (!subscription || !subscription.isValid()) {
      return res.status(403).json({
        success: false,
        message: 'Active subscription required. Please subscribe to access premium content.',
        requiresSubscription: true
      });
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking subscription'
    });
  }
};

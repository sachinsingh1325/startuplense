import Subscription from '../models/Subscription.model.js';
import Plan from '../models/Plan.model.js';
import Payment from '../models/Payment.model.js';
import User from '../models/User.model.js';

// Get all plans
export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ price: 1 });

    res.json({
      success: true,
      data: { plans }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user's subscription
export const getMySubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.user._id,
      isActive: true
    })
      .populate('planId')
      .populate('paymentId');

    res.json({
      success: true,
      data: { subscription }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create subscription (after payment)
export const createSubscription = async (req, res) => {
  try {
    const { planId, paymentId } = req.body;

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Deactivate old subscriptions
    await Subscription.updateMany(
      { userId: req.user._id, isActive: true },
      { isActive: false }
    );

    // Calculate end date
    let endDate;
    if (plan.isLifetime) {
      endDate = new Date('2099-12-31'); // Far future
    } else {
      endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.durationInDays);
    }

    const subscription = await Subscription.create({
      userId: req.user._id,
      planId: plan._id,
      startDate: new Date(),
      endDate,
      isActive: true,
      paymentId
    });

    // Update user role
    await User.findByIdAndUpdate(req.user._id, { role: 'paid' });

    res.status(201).json({
      success: true,
      message: 'Subscription activated successfully',
      data: { subscription }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Check subscription status
export const checkSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.user._id,
      isActive: true
    }).populate('planId');

    if (!subscription || !subscription.isValid()) {
      // Update user role if subscription expired
      if (req.user.role === 'paid') {
        await User.findByIdAndUpdate(req.user._id, { role: 'free' });
      }

      return res.json({
        success: true,
        data: {
          hasActiveSubscription: false,
          subscription: null
        }
      });
    }

    res.json({
      success: true,
      data: {
        hasActiveSubscription: true,
        subscription
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

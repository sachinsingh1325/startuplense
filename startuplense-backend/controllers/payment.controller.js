import Payment from '../models/Payment.model.js';
import Plan from '../models/Plan.model.js';
import Subscription from '../models/Subscription.model.js';
import User from '../models/User.model.js';
import { createRazorpayOrder, verifyRazorpayPayment, isRazorpayConfigured } from '../utils/payment.util.js';

// Create payment order
export const createOrder = async (req, res) => {
  try {
    if (!isRazorpayConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Razorpay is not configured on server. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend .env'
      });
    }

    const { planId } = req.body;

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Create payment record
    const payment = await Payment.create({
      userId: req.user._id,
      planId: plan._id,
      gateway: 'Razorpay',
      amount: plan.price,
      status: 'pending'
    });

    // Create Razorpay order
    const orderResult = await createRazorpayOrder(
      plan.price,
      'INR',
      `order_${payment._id}`
    );

    if (!orderResult.success) {
      await Payment.findByIdAndUpdate(payment._id, { status: 'failed' });
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment order'
      });
    }

    // Update payment with order ID
    payment.razorpayOrderId = orderResult.orderId;
    await payment.save();

    res.json({
      success: true,
      data: {
        orderId: orderResult.orderId,
        amount: orderResult.amount,
        paymentId: payment._id
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Verify payment
export const verifyPayment = async (req, res) => {
  try {
    if (!isRazorpayConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Razorpay is not configured on server. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend .env'
      });
    }

    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentId
    } = req.body;

    // Verify signature
    const isValid = verifyRazorpayPayment(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      await Payment.findByIdAndUpdate(paymentId, { status: 'failed' });
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Update payment
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        status: 'success',
        transactionId: razorpayPaymentId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      },
      { new: true }
    );

    // Create subscription
    const plan = await Plan.findById(payment.planId);
    if (plan) {
      // Deactivate old subscriptions
      await Subscription.updateMany(
        { userId: req.user._id, isActive: true },
        { isActive: false }
      );

      // Calculate end date
      let endDate;
      if (plan.isLifetime) {
        endDate = new Date('2099-12-31');
      } else {
        endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.durationInDays);
      }

      await Subscription.create({
        userId: req.user._id,
        planId: plan._id,
        startDate: new Date(),
        endDate,
        isActive: true,
        paymentId: payment._id
      });

      // Update user role
      await User.findByIdAndUpdate(req.user._id, { role: 'paid' });
    }

    res.json({
      success: true,
      message: 'Payment verified and subscription activated',
      data: { payment }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get payment history
export const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .populate('planId', 'name price')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { payments }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

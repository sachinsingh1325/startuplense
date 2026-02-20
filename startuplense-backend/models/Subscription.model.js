import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  autoRenew: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for fast queries
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ isActive: 1 });
subscriptionSchema.index({ endDate: 1 });
subscriptionSchema.index({ userId: 1, isActive: 1 });

// Method to check if subscription is valid
subscriptionSchema.methods.isValid = function() {
  if (!this.isActive) return false;
  if (this.endDate < new Date()) return false;
  return true;
};

export default mongoose.model('Subscription', subscriptionSchema);

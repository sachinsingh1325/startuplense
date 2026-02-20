import mongoose from 'mongoose';

const analyticsEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Can track anonymous users
  },
  event: {
    type: String,
    enum: [
      'ARTICLE_READ',
      'ARTICLE_VIEWED',
      'SEARCH_PERFORMED',
      'SIGNUP',
      'LOGIN',
      'SUBSCRIPTION_STARTED',
      'PAYMENT_COMPLETED',
      'PROFILE_UPDATED',
      'BOOKMARK_ADDED',
      'SHARE_CLICKED'
    ],
    required: true
  },
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  },
  duration: {
    type: Number, // seconds
    default: 0
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Indexes for fast aggregation
analyticsEventSchema.index({ userId: 1 });
analyticsEventSchema.index({ event: 1 });
analyticsEventSchema.index({ articleId: 1 });
analyticsEventSchema.index({ createdAt: -1 });
analyticsEventSchema.index({ userId: 1, event: 1, createdAt: -1 });

export default mongoose.model('AnalyticsEvent', analyticsEventSchema);

import mongoose from 'mongoose';

const conversionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  source: {
    type: String,
    enum: ['article', 'newsletter', 'search', 'direct', 'referral', 'social'],
    required: true
  },
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  },
  planBought: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan'
  },
  amount: {
    type: Number,
    required: true
  },
  conversionType: {
    type: String,
    enum: ['subscription', 'service', 'consulting'],
    required: true
  }
}, {
  timestamps: true
});

// Indexes
conversionSchema.index({ userId: 1 });
conversionSchema.index({ source: 1 });
conversionSchema.index({ conversionType: 1 });
conversionSchema.index({ createdAt: -1 });

export default mongoose.model('Conversion', conversionSchema);

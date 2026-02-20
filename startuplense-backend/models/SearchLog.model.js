import mongoose from 'mongoose';

const searchLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Can be anonymous
  },
  keyword: {
    type: String,
    required: true,
    trim: true
  },
  filters: {
    category: String,
    tags: [String],
    isPremium: Boolean
  },
  resultsCount: {
    type: Number,
    default: 0
  },
  searchedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
searchLogSchema.index({ userId: 1 });
searchLogSchema.index({ keyword: 1 });
searchLogSchema.index({ searchedAt: -1 });

export default mongoose.model('SearchLog', searchLogSchema);

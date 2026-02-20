import mongoose from 'mongoose';

const userArticleAccessSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  },
  readAt: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number, // seconds spent reading
    default: 0
  }
}, {
  timestamps: true
});

// Index for fast lookup
userArticleAccessSchema.index({ userId: 1 });
userArticleAccessSchema.index({ articleId: 1 });
userArticleAccessSchema.index({ userId: 1, articleId: 1 }, { unique: true });
userArticleAccessSchema.index({ readAt: -1 });

export default mongoose.model('UserArticleAccess', userArticleAccessSchema);

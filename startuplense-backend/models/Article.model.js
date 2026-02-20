import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  excerpt: {
    type: String,
    maxlength: 300
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isPremium: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  readCount: {
    type: Number,
    default: 0
  },
  readTime: {
    type: Number, // in minutes
    default: 2
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  featuredImage: String,
  publishedAt: Date
}, {
  timestamps: true
});

// Indexes for fast queries
articleSchema.index({ slug: 1 });
articleSchema.index({ categoryId: 1 });
articleSchema.index({ status: 1 });
articleSchema.index({ isPremium: 1 });
articleSchema.index({ publishedAt: -1 });
articleSchema.index({ readCount: -1 });
articleSchema.index({ tags: 1 });

// Text index for search
articleSchema.index({ 
  title: 'text', 
  content: 'text', 
  excerpt: 'text',
  tags: 'text'
});

export default mongoose.model('Article', articleSchema);

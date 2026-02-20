import mongoose from 'mongoose';

const emailLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  email: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['WELCOME', 'PASSWORD_RESET', 'TRANSACTION', 'NOTIFICATION', 'NEWSLETTER_WELCOME'],
    required: true
  },
    
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'bounced'],
    default: 'pending'
  },
  subject: String,
  sentAt: Date,
  errorMessage: String
}, {
  timestamps: true
});

// Indexes
emailLogSchema.index({ userId: 1 });
emailLogSchema.index({ type: 1 });
emailLogSchema.index({ status: 1 });
emailLogSchema.index({ sentAt: -1 });

export default mongoose.model('EmailLog', emailLogSchema);

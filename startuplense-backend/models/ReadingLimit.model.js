import mongoose from 'mongoose';

const readingLimitSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['free', 'paid', 'admin'],
    required: true,
    unique: true
  },
  maxReadsPerMonth: {
    type: Number,
    required: true,
    default: 5
  },
  maxPremiumReadsPerMonth: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('ReadingLimit', readingLimitSchema);

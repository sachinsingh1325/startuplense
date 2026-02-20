import mongoose from 'mongoose';

const notificationPreferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  email: {
    type: Boolean,
    default: true
  },
  push: {
    type: Boolean,
    default: false
  },
  dailyNewsletter: {
    type: Boolean,
    default: true
  },
  weeklyDeepInsights: {
    type: Boolean,
    default: true
  },
  saturdayAllInOne: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index
notificationPreferenceSchema.index({ userId: 1 });

export default mongoose.model('NotificationPreference', notificationPreferenceSchema);

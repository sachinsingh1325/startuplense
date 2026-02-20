import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    enum: ['Monthly', 'Yearly', 'Lifetime']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  durationInDays: {
    type: Number,
    required: true,
    default: 30 // Monthly default
  },
  isLifetime: {
    type: Boolean,
    default: false
  },
  features: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index
planSchema.index({ name: 1 });
planSchema.index({ isActive: 1 });

export default mongoose.model('Plan', planSchema);

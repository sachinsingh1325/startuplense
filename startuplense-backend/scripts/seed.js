import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Plan from '../models/Plan.model.js';
import ReadingLimit from '../models/ReadingLimit.model.js';
import Category from '../models/Category.model.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/startuplense');
    console.log('✅ Connected to MongoDB');

    // Seed Plans
    const plans = [
      {
        name: 'Monthly',
        price: 499,
        durationInDays: 30,
        isLifetime: false,
        features: [
          'Daily startup news',
          'Weekly deep insights',
          'Startup ideas & opportunities',
          'Founder interviews',
          'Premium articles access',
          'Bookmark & save content'
        ]
      },
      {
        name: 'Yearly',
        price: 3999,
        durationInDays: 365,
        isLifetime: false,
        features: [
          'Everything in Monthly',
          'Priority support',
          'Early access to new features',
          'Founder community access',
          'Custom newsletter preferences'
        ]
      },
      {
        name: 'Lifetime',
        price: 9999,
        durationInDays: 36500, // ~100 years
        isLifetime: true,
        features: [
          'Everything in Yearly',
          'Lifetime access',
          'Founding member badge',
          'Exclusive founder events',
          '1-on-1 consulting sessions'
        ]
      }
    ];

    await Plan.deleteMany({});
    await Plan.insertMany(plans);
    console.log('✅ Plans seeded');

    // Seed Reading Limits
    const readingLimits = [
      {
        role: 'free',
        maxReadsPerMonth: 5,
        maxPremiumReadsPerMonth: 0
      },
      {
        role: 'paid',
        maxReadsPerMonth: -1, // Unlimited
        maxPremiumReadsPerMonth: -1
      },
      {
        role: 'admin',
        maxReadsPerMonth: -1,
        maxPremiumReadsPerMonth: -1
      }
    ];

    await ReadingLimit.deleteMany({});
    await ReadingLimit.insertMany(readingLimits);
    console.log('✅ Reading limits seeded');

    // Seed Categories
    const categories = [
      { name: 'Startup News', slug: 'startup-news', description: 'Daily startup news and updates' },
      { name: 'Case Studies', slug: 'case-studies', description: 'In-depth startup case studies' },
      { name: 'Startup Ideas', slug: 'startup-ideas', description: 'Curated startup ideas and opportunities' },
      { name: 'Interviews', slug: 'interviews', description: 'Founder and investor interviews' },
      { name: 'Market Trends', slug: 'market-trends', description: 'Market analysis and trends' },
      { name: 'AI & Tech', slug: 'ai-tech', description: 'AI and technology insights' },
      { name: 'FinTech', slug: 'fintech', description: 'Financial technology news' },
      { name: 'HealthTech', slug: 'healthtech', description: 'Healthcare technology' },
      { name: 'Web3', slug: 'web3', description: 'Web3 and blockchain' }
    ];

    await Category.deleteMany({});
    await Category.insertMany(categories);
    console.log('✅ Categories seeded');

    console.log('🎉 All seed data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

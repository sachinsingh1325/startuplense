import mongoose from 'mongoose';
import Article from '../models/Article.model.js';

export const createIndexes = async () => {
  try {
    console.log('📊 Creating MongoDB indexes...');

    // Article text index for searched
    await Article.collection.createIndex(
      { title: 'text', content: 'text', excerpt: 'text', tags: 'text' },
      { name: 'article_text_search' }
    );

    console.log('✅ All indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  }
};

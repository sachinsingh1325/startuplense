import express from 'express';
import NewsletterSubscriber from '../models/NewsletterSubscriber.model.js';
import { sendEmail } from '../utils/email.util.js';

const router = express.Router();

/**
 * POST /api/newsletter/subscribe
 */
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email'
      });
    }

    const existing = await NewsletterSubscriber.findOne({ email });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Already subscribed'
      });
    }

    await NewsletterSubscriber.create({ email });

    // Welcome email
    await sendEmail({
      to: email,
      subject: 'Welcome to StartupLense 🚀',
      type: 'NEWSLETTER_WELCOME',
      html: `
        <h2>Welcome to StartupLense</h2>
        <p>You are now subscribed to our newsletter.</p>
      `
    });

    res.status(201).json({
      success: true,
      message: 'Subscribed successfully'
    });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;

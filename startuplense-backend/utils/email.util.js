import nodemailer from 'nodemailer';
import EmailLog from '../models/EmailLog.model.js';
import dotenv from 'dotenv';
dotenv.config();

// 🔹 Debug SMTP config
console.log('SMTP HOST:', process.env.EMAIL_HOST);
console.log('SMTP PORT:', process.env.EMAIL_PORT);
console.log('SMTP USER:', process.env.EMAIL_USER);

// 🔹 Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 🔹 Verify SMTP once at startup
transporter.verify()
  .then(() => console.log('SMTP READY ✅'))
  .catch(err => console.log('SMTP ERROR ❌', err.message));

// 🔹 Base Email Sender
export const sendEmail = async ({ to, subject, html, type }) => {
  try {
    // sanitize email to avoid RFC 5321 errors
    const cleanTo = to.replace(/['<>]/g, '').trim();

    await transporter.sendMail({
      from: `"StartupLense" <${process.env.EMAIL_USER}>`,
      to: cleanTo,
      subject,
      html
    });

    await EmailLog.create({
      email: cleanTo,
      type,
      status: 'sent',
      subject
    });

    return { success: true };
  } catch (error) {
    await EmailLog.create({
      email: to,
      type,
      status: 'failed',
      subject,
      errorMessage: error.message
    });

    throw error;
  }
};

// 🔹 Welcome Email with optional verification token
export const sendWelcomeEmailWithToken = async (email, token = null) => {
  let html = `<h2>Welcome to StartupLense 🚀</h2><p>Glad to have you onboard!</p>`;
  if (token) {
    const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    html += `<p>Please verify your email by clicking <a href="${verifyLink}">here</a>.</p>`;
  }

  return sendEmail({
    to: email,
    subject: 'Welcome to StartupLense 🚀',
    type: 'WELCOME',
    html
  });
};

// 🔹 Password Reset Email
export const sendPasswordResetEmail = async (email, token) => {
  const cleanEmail = email.replace(/['<>]/g, '').trim();
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  return sendEmail({
    to: cleanEmail,
    subject: 'Reset Your Password',
    type: 'PASSWORD_RESET',
    html: `
      <p>You requested a password reset.</p>
      <p>Click here to reset: <a href="${resetLink}">${resetLink}</a></p>
      <p>If you did not request this, please ignore this email.</p>
    `
  });
};

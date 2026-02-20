import User from '../models/User.model.js';
import EmailVerification from '../models/EmailVerification.model.js';
import PasswordReset from '../models/PasswordReset.model.js';
import Session from '../models/Session.model.js';
import { generateToken, generateRefreshToken } from '../utils/jwt.util.js';
import { sendWelcomeEmailWithToken, sendPasswordResetEmail } from '../utils/email.util.js';
import { v4 as uuidv4 } from 'uuid';

// 🔹 Register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password // pre-save hook will hash
    });

    const verificationToken = uuidv4();
    await EmailVerification.create({
      userId: user._id,
      token: verificationToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    // ✅ Send Welcome + Verification Email (sanitize email)
    await sendWelcomeEmailWithToken(user.email.replace(/['<>]/g, ''), verificationToken);

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Verify Email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const verification = await EmailVerification.findOne({ token });
    if (!verification || verification.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    const user = await User.findById(verification.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isEmailVerified = true;
    await user.save();
    await EmailVerification.deleteOne({ _id: verification._id });

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: true, message: 'If email exists, password reset link has been sent' });

    const resetToken = uuidv4();
    await PasswordReset.create({
      userId: user._id,
      token: resetToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000)
    });

    // ✅ Send Password Reset Email
    await sendPasswordResetEmail(user.email.replace(/['<>]/g, ''), resetToken);

    res.json({ success: true, message: 'Password reset link sent to your email' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const reset = await PasswordReset.findOne({ token });
    if (!reset || reset.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    const user = await User.findById(reset.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.passwordHash = newPassword; // pre-save hook will hash
    await user.save();

    await PasswordReset.deleteOne({ _id: reset._id });
    await Session.deleteMany({ userId: user._id }); // invalidate all sessions

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Logout
export const logout = async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken;
    if (refreshToken) await Session.deleteOne({ refreshToken });

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

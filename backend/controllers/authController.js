import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import Category from '../models/Category.js';
import User from '../models/User.js';
import { defaultCategories } from '../data/defaultCategories.js';
import { sendOtpEmail } from '../services/emailService.js';
import { generateOtp, hashOtp, validateOtpForUser } from '../services/otpService.js';
import AppError from '../utils/appError.js';

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password is required'),
});

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

const otpSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  otp: z.string().trim().length(6, 'OTP must be 6 digits'),
});

const resetPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  otp: z.string().trim().length(6, 'OTP must be 6 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password is required'),
});

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: '7d',
  });

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 1000 * 60 * 60 * 24 * 7,
};

const setAuthCookie = (res, token) => {
  res.cookie('token', token, cookieOptions);
};

const createDefaultCategories = async (userId) => {
  const payload = defaultCategories.map((item) => ({
    user: userId,
    name: item.name,
    type: item.name in { Salary: 'income', Freelancing: 'income', Business: 'income', Investments: 'income', Allowance: 'income', Gifts: 'income', Other: 'income', Food: 'expense', Transportation: 'expense', Shopping: 'expense', Entertainment: 'expense', Education: 'expense', Health: 'expense', Bills: 'expense', Rent: 'expense', Travel: 'expense', 'Personal Care': 'expense', Subscriptions: 'expense' } ? (['Salary', 'Freelancing', 'Business', 'Investments', 'Allowance', 'Gifts', 'Other'].includes(item.name) ? 'income' : 'expense') : 'expense',
    color: item.color,
    icon: item.icon,
    isDefault: true,
  }));

  await Category.insertMany(payload);
};

const createOtpForUser = async (user, purpose = 'verification') => {
  const otp = generateOtp();
  const otpHash = await hashOtp(otp);
  const oneMinute = 60 * 1000;

  if (purpose === 'reset') {
    user.resetOtpHash = otpHash;
    user.resetOtpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    user.resetOtpAttempts = 0;
    user.lastOtpSentAt = new Date();
  } else {
    user.otpHash = otpHash;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    user.otpAttempts = 0;
    user.lastOtpSentAt = new Date();
  }

  await user.save();

  try {
    await sendOtpEmail({
      email: user.email,
      name: user.name,
      otp,
      purpose,
    });
  } catch (error) {
    console.error('Email send failed:', error.message);
    throw new AppError(500, 'OTP could not be delivered. Please try again later.');
  }

  return { otpSentAt: new Date(Date.now() + oneMinute) };
};

export const register = async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    if (data.password !== data.confirmPassword) {
      throw new AppError(400, 'Passwords do not match');
    }

    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (existingUser) {
      throw new AppError(409, 'An account with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
    });

    await createDefaultCategories(user._id);
    await createOtpForUser(user, 'verification');

    res.status(201).json({
      success: true,
      message: 'Account created. Check your email for the verification OTP.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const data = otpSchema.parse(req.body);
    const user = await User.findOne({ email: data.email.toLowerCase() });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const result = await validateOtpForUser({
      otp: data.otp,
      storedHash: user.otpHash,
      expiresAt: user.otpExpiresAt,
      attempts: user.otpAttempts || 0,
    });

    if (!result.valid) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();
      throw new AppError(400, result.reason);
    }

    user.emailVerified = true;
    user.otpHash = null;
    user.otpExpiresAt = null;
    user.otpAttempts = 0;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const resendOtp = async (req, res, next) => {
  try {
    const data = forgotPasswordSchema.parse(req.body);
    const user = await User.findOne({ email: data.email.toLowerCase() });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    if (user.lastOtpSentAt && Date.now() - new Date(user.lastOtpSentAt).getTime() < 60000) {
      throw new AppError(429, 'Please wait 60 seconds before requesting a new OTP');
    }

    await createOtpForUser(user, 'verification');
    res.json({ success: true, message: 'A fresh verification OTP has been sent.' });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await User.findOne({ email: data.email.toLowerCase() });

    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }

    const validPassword = await bcrypt.compare(data.password, user.password);
    if (!validPassword) {
      throw new AppError(401, 'Invalid credentials');
    }

    if (!user.emailVerified) {
      throw new AppError(403, 'Please verify your email before logging in');
    }

    const token = createToken(user._id);
    setAuthCookie(res, token);

    res.json({
      success: true,
      message: 'Logged in successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        currency: user.currency,
        theme: user.theme,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
};

export const getCurrentUser = async (req, res) => {
  res.json({ success: true, user: req.user });
};

export const forgotPassword = async (req, res, next) => {
  try {
    const data = forgotPasswordSchema.parse(req.body);
    const user = await User.findOne({ email: data.email.toLowerCase() });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    if (user.lastOtpSentAt && Date.now() - new Date(user.lastOtpSentAt).getTime() < 60000) {
      throw new AppError(429, 'Please wait 60 seconds before requesting a new password reset OTP');
    }

    const otp = generateOtp();
    const hashedOtp = await hashOtp(otp);
    user.resetOtpHash = hashedOtp;
    user.resetOtpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    user.resetOtpAttempts = 0;
    user.lastOtpSentAt = new Date();
    await user.save();

    try {
      await sendOtpEmail({ email: user.email, name: user.name, otp, purpose: 'reset' });
    } catch (error) {
      throw new AppError(500, 'Reset OTP could not be delivered.');
    }

    res.json({ success: true, message: 'Reset code sent to your email.' });
  } catch (error) {
    next(error);
  }
};

export const verifyResetOtp = async (req, res, next) => {
  try {
    const data = otpSchema.parse(req.body);
    const user = await User.findOne({ email: data.email.toLowerCase() });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const result = await validateOtpForUser({
      otp: data.otp,
      storedHash: user.resetOtpHash,
      expiresAt: user.resetOtpExpiresAt,
      attempts: user.resetOtpAttempts || 0,
    });

    if (!result.valid) {
      user.resetOtpAttempts = (user.resetOtpAttempts || 0) + 1;
      await user.save();
      throw new AppError(400, result.reason);
    }

    user.resetOtpHash = null;
    user.resetOtpExpiresAt = null;
    user.resetOtpAttempts = 0;
    await user.save();

    res.json({ success: true, message: 'Reset OTP verified.' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const data = resetPasswordSchema.parse(req.body);

    if (data.password !== data.confirmPassword) {
      throw new AppError(400, 'Passwords do not match');
    }

    const user = await User.findOne({ email: data.email.toLowerCase() });
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const result = await validateOtpForUser({
      otp: data.otp,
      storedHash: user.resetOtpHash,
      expiresAt: user.resetOtpExpiresAt,
      attempts: user.resetOtpAttempts || 0,
    });

    if (!result.valid) {
      user.resetOtpAttempts = (user.resetOtpAttempts || 0) + 1;
      await user.save();
      throw new AppError(400, result.reason);
    }

    user.password = await bcrypt.hash(data.password, 10);
    user.resetOtpHash = null;
    user.resetOtpExpiresAt = null;
    user.resetOtpAttempts = 0;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully. Please login again.' });
  } catch (error) {
    next(error);
  }
};

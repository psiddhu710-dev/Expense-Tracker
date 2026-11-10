import express from 'express';
import {
  forgotPassword,
  getCurrentUser,
  login,
  logout,
  register,
  resendOtp,
  resetPassword,
  verifyEmail,
  verifyResetOtp,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOtp);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getCurrentUser);

export default router;

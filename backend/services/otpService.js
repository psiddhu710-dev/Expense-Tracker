import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

export const generateOtp = () => crypto.randomInt(100000, 999999).toString();

export const hashOtp = async (otp) => bcrypt.hash(otp, 10);

export const verifyOtpHash = async (otp, hash) => bcrypt.compare(otp, hash);

export const isOtpExpired = (expiresAt) => !expiresAt || new Date(expiresAt).getTime() < Date.now();

export const getMaxAttempts = () => 5;

export const validateOtpForUser = async ({ otp, storedHash, expiresAt, attempts = 0 }) => {
  if (!storedHash) {
    return { valid: false, reason: 'No OTP found' };
  }

  if (isOtpExpired(expiresAt)) {
    return { valid: false, reason: 'OTP expired' };
  }

  if (attempts >= getMaxAttempts()) {
    return { valid: false, reason: 'Too many failed attempts' };
  }

  const matches = await verifyOtpHash(otp, storedHash);

  return {
    valid: matches,
    reason: matches ? 'Verified' : 'Invalid OTP',
  };
};

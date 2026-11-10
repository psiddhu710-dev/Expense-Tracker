import assert from 'node:assert/strict';
import test from 'node:test';
import { generateOtp, hashOtp, verifyOtpHash } from '../services/otpService.js';

test('generateOtp returns a six-digit string', () => {
  const otp = generateOtp();
  assert.equal(typeof otp, 'string');
  assert.equal(otp.length, 6);
  assert.match(otp, /^\d{6}$/);
});

test('hashOtp verifies generated OTP', async () => {
  const otp = '123456';
  const hash = await hashOtp(otp);
  const match = await verifyOtpHash(otp, hash);
  assert.equal(match, true);
});

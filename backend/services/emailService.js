import nodemailer from 'nodemailer';

const getTransport = () => {
  if (!process.env.EMAIL_API_KEY || !process.env.EMAIL_FROM) {
    return null;
  }

  const provider = (process.env.EMAIL_PROVIDER || 'smtp').toLowerCase();

  if (provider === 'resend') {
    return nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 587,
      secure: false,
      auth: {
        user: 'resend',
        pass: process.env.EMAIL_API_KEY,
      },
    });
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_FROM.match(/<(.+)>/)?.[1] || process.env.EMAIL_FROM,
      pass: process.env.EMAIL_API_KEY,
    },
  });
};

const buildOtpHtml = ({ name, otp, purpose, expiryMinutes = 5 }) => `
  <div style="font-family: Arial, sans-serif; background: #0f172a; color: #e2e8f0; padding: 24px; max-width: 560px; margin: 0 auto; border-radius: 12px;">
    <div style="text-align:center; padding-bottom: 18px;">
      <h2 style="margin:0; color:#a78bfa; letter-spacing:0.08em;">Expense Tracker</h2>
    </div>
    <h3 style="margin-bottom: 12px; color:#f8fafc;">${purpose === 'reset' ? 'Password reset verification' : 'Email verification'}</h3>
    <p>Hi ${name || 'there'},</p>
    <p>Your one-time password is:</p>
    <div style="font-size: 32px; letter-spacing: 10px; font-weight: 700; color: #8b5cf6; text-align:center; background:#111827; padding:18px; border-radius:12px; margin:20px 0;">${otp}</div>
    <p>This code expires in ${expiryMinutes} minutes.</p>
    <p>Do not share this code with anyone. If you did not request this, ignore this email.</p>
    <p style="font-size: 12px; color: #94a3b8;">Expense Tracker security notice.</p>
  </div>
`;

export const sendOtpEmail = async ({ email, name, otp, purpose }) => {
  const transport = getTransport();

  if (!transport) {
    throw new Error('Email delivery is not configured. Set EMAIL_API_KEY and EMAIL_FROM in your environment.');
  }

  const info = await transport.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: purpose === 'reset' ? 'Reset your Expense Tracker password' : 'Verify your Expense Tracker account',
    html: buildOtpHtml({ name, otp, purpose, expiryMinutes: 5 }),
  });

  return { messageId: info.messageId };
};

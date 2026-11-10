# Expense Tracker

Expense Tracker is a complete personal finance and expense tracker built with the MERN stack, with OTP-based email verification and secure, user-isolated financial data.

## Features

- Secure email-based registration and login
- OTP verification and password reset flows
- JWT authentication with secure HTTP-only cookies
- Dashboard summaries for income, expenses, balance and trends
- Transaction CRUD and category management
- Budget tracking and savings goals
- Analytics reports with real transaction data
- Dark premium layout, responsive design and reusable frontend components

## Project structure

- `/backend` - Express REST API, MongoDB models, validation and OTP email services
- `/frontend` - Vite + React + Tailwind client application
- `/package.json` - Root backend package scripts
- `/.env.example` - Environment variable template

## Local setup

1. Install dependencies:
   - `npm install`
   - `cd frontend && npm install`
2. Copy environment variables:
   - `copy .env.example .env`
3. Set real values for your MongoDB and email configuration.
4. Start backend:
   - `npm run dev`
5. Start frontend:
   - `cd frontend && npm run dev -- --host 0.0.0.0`
6. Open http://localhost:5173

## Environment variables

See `.env.example` for the full list.

Required:
- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `EMAIL_PROVIDER`
- `EMAIL_API_KEY`
- `EMAIL_FROM`
- `CLIENT_URL`

## Notes

- If `MONGODB_URI` is not configured, the backend automatically starts a MongoDB memory server for local development.
- Production email delivery requires valid SMTP or Resend credentials.
- The app is built to demonstrate a real OTP workflow with actual email delivery when configured.


# Pennywise — Personal Finance Tracker

A personal finance dashboard built with React, Vite, Express, and MongoDB. Track income and expenses, see your balance and spending patterns, and manage transactions from one responsive workspace.

## Features

- Dashboard with total balance, lifetime income and expenses, monthly spending, and transaction count.
- Six-month income-versus-expense chart and spending breakdown by category.
- Recent activity, searchable transaction history, and type/category filters.
- Add, edit, and delete income and expense transactions with dates, notes, and validation.
- Responsive interface designed for desktop and mobile.

## Run locally

Requirements: Node.js 18+ and MongoDB (local or hosted).

1. Configure the API:

   ```sh
   cd server
   cp .env.example .env
   npm install
   npm run dev
   ```

   Set `MONGO_URI` in `server/.env` to your MongoDB connection string. The API starts at `http://localhost:5000`.

2. In another terminal, configure and run the frontend:

   ```sh
   cd client
   cp .env.example .env
   npm install
   npm run dev
   ```

   Open the Vite URL shown in the terminal (usually `http://localhost:5173`). Set `VITE_API_URL` to the API origin if it is not `http://localhost:5000`.

## Environment variables

| Variable | Location | Purpose |
| --- | --- | --- |
| `MONGO_URI` | `server/.env` | MongoDB connection string (required) |
| `PORT` | `server/.env` | API port (defaults to `5000`) |
| `VITE_API_URL` | `client/.env` | API origin without `/api/expenses` (defaults to `http://localhost:5000`) |

Never commit `.env` files or MongoDB credentials.

## API

All transaction routes are under `/api/expenses`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/expenses` | List transactions, newest first |
| `POST` | `/api/expenses` | Create an income or expense |
| `PUT` | `/api/expenses/:id` | Update a transaction |
| `DELETE` | `/api/expenses/:id` | Delete a transaction |

Transaction fields: `title` (description), `amount` (positive number), `category`, `type` (`income` or `expense`), `date`, and optional `notes`. Existing expense records remain compatible; records without a `type` are treated as expenses.

## Deploy

- **API:** deploy the `server` directory to a Node.js host, set `MONGO_URI` and optionally `PORT`, and run `npm start`.
- **Frontend:** deploy the `client` directory as a Vite app and set `VITE_API_URL` to the deployed API origin.
- Configure MongoDB network access for the API host. Avoid opening database access more broadly than necessary.

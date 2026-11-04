# Expense Tracker (MERN)

React (Vite) + Express + MongoDB Atlas. Full CRUD, category filter, summary cards.

## Run locally
```bash
# 1) backend
cd server
cp .env.example .env      # paste your MongoDB Atlas URI
npm install
npm run dev               # http://localhost:5000

# 2) frontend (new terminal)
cd client
npm install
npm run dev               # http://localhost:5173
```

## Deploy
**Backend -> Render** (New Web Service, root dir `server`)
- Build: `npm install`   Start: `npm start`
- Env var: `MONGO_URI` = your Atlas string

**Frontend -> Vercel** (root dir `client`, framework Vite)
- Env var: `VITE_API_URL` = your Render URL (no trailing slash)

Atlas: Network Access must allow `0.0.0.0/0`.

## API
GET/POST `/api/expenses`, PUT/DELETE `/api/expenses/:id`

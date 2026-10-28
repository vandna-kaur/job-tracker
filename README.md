# Job Application Tracker (MERN)

Track job applications from wishlist to offer. Each user has a private account.

**Stack:** MongoDB + Mongoose, Express, React (Vite), Node.

## Features
- Sign up and log in (bcrypt-hashed passwords, JWT, 7-day sessions)
- Add, edit, delete applications (full CRUD, scoped to the logged-in user)
- Change status inline: Wishlist, Applied, Interview, Offer, Rejected
- Search by company or role (debounced), filter by status, pagination
- Status counts from a MongoDB aggregation pipeline
- Light and dark mode, responsive layout, keyboard-friendly

## API
| Method | Route | Purpose |
| --- | --- | --- |
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Log in, returns JWT |
| GET | /api/auth/me | Current user |
| GET | /api/jobs?status=&q=&page= | List jobs |
| GET | /api/jobs/stats | Count per status |
| POST | /api/jobs | Create job |
| PUT | /api/jobs/:id | Update job |
| DELETE | /api/jobs/:id | Delete job |

## Run locally
1. Install Node 18+.
2. `npm install` then `npm run install:all`
3. `npm run dev` and open http://localhost:5173

No database setup is needed. Without `MONGO_URI` in `server/.env`, the app runs a local MongoDB and saves data in `server/.data`. The first start downloads MongoDB and can take a minute.
To use MongoDB Atlas instead (needed for deployment), set `MONGO_URI` in `server/.env`.

## Deploy
Build and serve both from one Express server: `npm run build`, then `npm start`.
On Render or Railway: build command `npm run install:all && npm run build`, start command `npm start`, and set `MONGO_URI` and `JWT_SECRET`.

## Ideas to extend it
Drag-and-drop Kanban board, email reminders for follow-ups, file upload for resumes, tests with Jest and Supertest.

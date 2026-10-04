# Marigold — E-commerce Platform

A full-stack e-commerce web application: React (Vite) frontend, Node/Express REST API,
MongoDB database. Built as a realistic base application, ready to be containerized and
wired into a CI/CD, monitoring and infrastructure pipeline later — none of that is
included yet, on purpose.

## 1. Overview

Customers can browse a multi-category catalog, search and filter, manage a cart and
wishlist, check out with a simulated payment, and track orders. Admins get a dashboard
to manage products, categories, orders, customers, reviews and inventory.

## 2. Features

**Customer:** register/login, browse & search, filter & sort, categories, product
details with gallery and specs, ratings & reviews, cart, wishlist, guided checkout
(address → review → payment), order history & details, order cancellation, profile,
saved addresses, change password, forgot/reset password.

**Admin:** dashboard (revenue, order counts, low stock, recent activity), product CRUD
with image upload, category CRUD, order management with status transitions, customer
management (enable/disable), review moderation, inventory view with inline stock edits.

**Platform:** JWT auth with roles, input validation, centralized error handling,
structured JSON logging, health endpoint, environment-based config, seed data,
automated tests (backend + frontend).

## 3. Architecture

```
Browser → React (Vite) → REST/JSON → Express API → Mongoose → MongoDB
```

Backend layering: `routes → controllers → services → models`, with validation,
auth/role, sanitization and error-handling middleware. See `docs/architecture.md` for
notes on stock safety, order data, image storage and payments.

## 4. Technology stack

- Frontend: React 18, Vite, React Router, Redux Toolkit, Axios, Tailwind CSS, Lucide icons
- Backend: Node.js, Express, Mongoose, JWT, bcryptjs, Joi, Pino, Multer
- Database: MongoDB
- Tests: Jest + Supertest + mongodb-memory-server (backend), Vitest + Testing Library (frontend)

## 5. Prerequisites

- Node.js 18+ and npm
- A MongoDB instance — local (`mongod`), Docker, or a hosted MongoDB (e.g. Atlas)

## 6. Installation

```bash
git clone <this-repo>
cd ecommerce-platform

cd backend && npm install
cd ../frontend && npm install
```

## 7. Environment variables

Copy the example files and fill them in:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

**backend/.env** — key variables:

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random string used to sign tokens (**required**) |
| `CLIENT_URL` | Frontend origin(s) allowed by CORS |
| `PORT` | API port (default 5000) |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Admin account created by the seed script. Password is required when `NODE_ENV=production`; otherwise a dev default is used and printed after seeding. |

**frontend/.env** — `VITE_API_URL` can stay empty in development (Vite proxies `/api`
to the backend); set it to the deployed API URL in production.

## 8. Database setup

Start MongoDB locally, or point `MONGODB_URI` at any reachable MongoDB (local, Docker,
or a hosted cluster). No manual schema setup is needed — Mongoose creates collections
and indexes automatically.

## 9. Seed data

```bash
cd backend
npm run seed
```

This wipes and re-creates the catalog (29 products across 6 categories), sample
customers, reviews and orders, and prints the dev admin/customer login credentials to
the console. **Do not run this against a production database you care about** — it
deletes existing catalog and order data.

## 10. Running the backend

```bash
cd backend
npm run dev      # auto-restarts on file changes
# or
npm start
```

API runs at `http://localhost:5000`. Health check: `GET /health`.

## 11. Running the frontend

```bash
cd frontend
npm run dev
```

App runs at `http://localhost:5173` and proxies `/api` and `/uploads` to the backend
in development, so no CORS setup is needed locally.

- Store: `http://localhost:5173`
- Admin login: `http://localhost:5173/admin/login`

## 12. Running tests

```bash
# Backend (spins up an in-memory MongoDB automatically)
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 13. API overview

All responses follow `{ success, message, data }` (or `{ success, message, error }` on
failure). Key groups: `/api/auth`, `/api/users`, `/api/products`, `/api/categories`,
`/api/cart`, `/api/wishlist`, `/api/orders`, `/api/reviews`, `/api/admin/*`. See
`backend/src/routes/` for the full route list.

## 14. Project structure

```
ecommerce-platform/
├── backend/
│   └── src/{config,controllers,middleware,models,routes,services,utils,validators,seed}
├── frontend/
│   └── src/{api,app,components,features,pages,routes,hooks,utils}
├── docs/
└── README.md
```

## 15. Troubleshooting

- **API won't start / exits immediately**: check `MONGODB_URI` and `JWT_SECRET` are
  set in `backend/.env`.
- **`/health` returns 503**: MongoDB isn't reachable — check it's running and the URI
  is correct.
- **Frontend can't reach the API**: in dev, make sure the backend is running on the
  port `vite.config.js` proxies to (default 5000); in production, set `VITE_API_URL`.
- **Uploaded images 404**: the backend serves `/uploads` from its own `UPLOAD_DIR` —
  make sure that folder persists across restarts (or deploys) if you rely on it.

## 16. Future DevOps integration

This application is intentionally deployment-agnostic: all configuration is via
environment variables, there's a health endpoint, structured JSON logs, and no
hardcoded hosts or secrets. Docker, Docker Compose, Jenkins CI/CD, Terraform, Ansible,
Kubernetes, Helm, Prometheus, Grafana, ELK and AWS deployment are planned as a
separate follow-up project built around this application, not included here.

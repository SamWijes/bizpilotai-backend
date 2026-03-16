# BizPilotAI — Backend

> AI-Powered Business Management Suite for SMEs — Express.js REST API

---

## Quick Start

### 1. Prerequisites
- **Node.js** ≥ 18.0.0
- **MySQL** ≥ 8.0
- **npm**

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your MySQL credentials and OpenAI API key
```

Key variables to set in `.env`:
| Variable | Description |
|---|---|
| `DB_HOST` | MySQL host (default: `localhost`) |
| `DB_NAME` | Database name (default: `bizpilotai`) |
| `DB_USER` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `JWT_ACCESS_SECRET` | Strong random string for JWT signing |
| `JWT_REFRESH_SECRET` | Different strong random string |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `OPENAI_MODEL` | Model to use (default: `gpt-4o-mini`) |

### 4. Create Database

```sql
CREATE DATABASE bizpilotai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Run Migrations

```bash
npm run migrate
```

### 6. Seed Data (optional but recommended)

```bash
npm run seed
```

This creates:
- 3 subscription plans (Free, Starter, Pro)
- Platform admin user: `admin@bizpilotai.com` / `Admin@1234!`
- Demo business owner: `owner@demo.com` / `Owner@1234!`
- 3 demo products (one with low stock for testing alerts)

### 7. Start the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs at: **http://localhost:5000**

---

## API Documentation

Swagger UI is available at: **http://localhost:5000/api/docs**

All routes are versioned under `/api/v1`.

---

---

##  Authentication Flow

1. `POST /api/v1/auth/register` — create business + owner
2. `POST /api/v1/auth/login` — returns `accessToken` (1h) + `refreshToken` (7d)
3. Include header: `Authorization: Bearer <accessToken>`
4. `POST /api/v1/auth/refresh` — rotate tokens using refreshToken
5. `POST /api/v1/auth/logout` — invalidates refreshToken in DB

---

## AI Endpoints

All AI endpoints require authentication and are rate-limited to **10 req/min** per IP.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/ai/insights` | Natural language business insights |
| POST | `/api/v1/ai/email` | AI email composer |
| POST | `/api/v1/ai/invoice-summary` | Explain invoice in plain language |
| POST | `/api/v1/ai/social-post` | Marketing post generator |
| POST | `/api/v1/ai/chat` | AI business chatbot |

Request body: `{ "prompt": "Your question here" }`

---

##  PDF Invoice Download

```
GET /api/v1/invoices/:id/pdf
Authorization: Bearer <token>
```

Streams a professional A4 PDF directly — no disk storage needed.

---

##  API Base Routes

| Module | Route |
|---|---|
| Auth | `/api/v1/auth` |
| Business | `/api/v1/business` |
| Users | `/api/v1/users` |
| Customers | `/api/v1/customers` |
| Suppliers | `/api/v1/suppliers` |
| Products | `/api/v1/products` |
| Inventory | `/api/v1/inventory` |
| Sales | `/api/v1/sales` |
| Invoices | `/api/v1/invoices` |
| Finance | `/api/v1/finance` |
| Reports | `/api/v1/reports` |
| AI | `/api/v1/ai` |
| Admin | `/api/v1/admin` |

---

##  Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start with nodemon (auto-reload) |
| `npm start` | Start in production mode |
| `npm run migrate` | Apply all migrations |
| `npm run migrate:undo` | Rollback all migrations |
| `npm run seed` | Apply all seeders |
| `npm run seed:undo` | Rollback all seeders |

---

## Security Features

- **Helmet** — sets secure HTTP headers
- **CORS** — whitelist-based origin control
- **Rate Limiting** — 100/min global, 10/min AI, 20/min auth
- **bcrypt** — password hashing (12 rounds)
- **Joi** — input validation + unknown field stripping
- **JWT** — stateless access + revocable refresh tokens
- **Sequelize** — prevents SQL injection via parameterized queries
- **Centralized error handler** — never leaks stack traces in production

---

##  Production Deployment (AWS EC2)

See the deployment guide in `DEPLOYMENT.md` (Phase 6).

Basic PM2 setup:
```bash
npm install -g pm2
pm2 start server.js --name bizpilotai-api --instances max
pm2 save && pm2 startup
```

# MYSPHYRO

MYSPHYRO is a responsive personal dashboard for tasks, documents, expenses, plans, schedules, and personal reminders. The original dependency-free frontend remains **localStorage-first** and works by opening `index.html` directly. A secure Node/Express API in `backend/` adds optional authenticated persistence, CRUD, document uploads, and contextual chat.

## Frontend

```bash
python -m http.server 5173
# open http://localhost:5173
```

No frontend build step is required. Existing local data and the deterministic AI fallback remain available even if the API is off. To opt into API calls for an authenticated user, configure `window.MYSPHYRO_API_URL` (for example `http://localhost:3000/api/v1`) and `window.MYSPHYRO_API_TOKEN`, or place the JWT in localStorage as `mysphyro-api-token`. State sync is deliberately non-blocking so offline use still works.

## Backend quick start

**Requires Node.js 22.5+** for the built-in SQLite driver.

```bash
cd backend
cp .env.example .env
# Set JWT_SECRET to a long, random value before any production deployment.
npm install
npm start
```

The API listens on `http://localhost:3000`; use `npm run dev` for Node watch mode and `npm test` for the API suite. The SQLite database is created automatically at `backend/data/mysphyro.db`; schema creation is idempotent, so no separate migration command is needed for this version.

## Environment

| Variable | Required | Description |
| --- | --- | --- |
| `NODE_ENV` | No | `development`, `test`, or `production`; defaults to development. |
| `API_PORT` | No | API port; defaults to `3000`. |
| `DATABASE_PATH` | No | SQLite file path relative to `backend/`; defaults to `./data/mysphyro.db`. |
| `JWT_SECRET` | Yes in production | Long random signing secret. |
| `JWT_EXPIRES_IN` | No | JWT lifetime; defaults to `7d`. |
| `CORS_ORIGINS` | No | Comma-separated permitted browser origins. Empty permits local development origins. |
| `UPLOAD_DIR` | No | Upload storage path; defaults to `./uploads`. |
| `MAX_FILE_SIZE_MB` | No | Per-file upload cap; defaults to `10`. |

Never commit `.env`, the SQLite database, or uploaded files.

## API

All API responses use `{ "success": true, "data": ... }`; errors use `{ "success": false, "error": { "message", "requestId" } }`. Protected routes require `Authorization: Bearer <token>`.

### System

| Method | Path | Description |
| --- | --- | --- |
| GET | `/health` | Unauthenticated liveness check. |

Example: `GET /health` → `{"success":true,"data":{"status":"ok","timestamp":"..."}}`

### Authentication

| Method | Path | Body | Result |
| --- | --- | --- | --- |
| POST | `/api/v1/auth/register` | `{name,email,password}` (password min. 8 chars) | `201`, user and JWT |
| POST | `/api/v1/auth/login` | `{email,password}` | `200`, user and JWT |
| GET | `/api/v1/auth/me` | — | Current user |

Example registration body:

```json
{ "name": "Kirat", "email": "kirat@example.com", "password": "a-long-unique-password" }
```

### Dashboard and resources

| Method | Path | Body/query | Description |
| --- | --- | --- | --- |
| GET | `/api/v1/dashboard/state` | — | Load the authenticated user’s dashboard snapshot. |
| PUT | `/api/v1/dashboard/state` | `{state}` | Save allowed dashboard keys (`theme`, tasks, docs, expenses, personal, plans, classes, activities, mood). |
| GET | `/api/v1/resources/:type` | `page`, `limit` (max 100), `search` | Paginated list. |
| POST | `/api/v1/resources/:type` | `{data}` | Create a resource. |
| GET | `/api/v1/resources/:type/:id` | — | Fetch one owned resource. |
| PUT | `/api/v1/resources/:type/:id` | `{data}` | Replace one owned resource. |
| DELETE | `/api/v1/resources/:type/:id` | — | Delete one owned resource (`204`). |
| POST | `/api/v1/documents/upload` | multipart `file` | Upload one PDF, TXT, JPG, PNG, DOC, or DOCX file. |
| GET | `/api/v1/documents/files/:filename` | — | Download an uploaded file owned by the current user. |
| POST | `/api/v1/chat` | `{message,context}` | Get a dashboard-contextual response. |

Valid `:type` values: `tasks`, `documents`, `expenses`, `plans`, `personal`, `classes`, and `activities`. Resource data is allow-listed and validated per type; unknown fields are discarded. Example task creation:

```json
{ "data": { "title": "Finish DBMS assignment", "due": "Friday", "priority": "high", "category": "College", "done": false } }
```

The API enforces ownership on every protected resource, uses bcrypt password hashes and signed JWTs, validates request bodies, applies Helmet, request IDs/logging, CORS controls, auth/API rate limits, file type/size controls, and centralized errors.

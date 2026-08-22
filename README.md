# MYSPHYRO

MYSPHYRO is a responsive personal dashboard for tasks, documents, expenses, plans, schedules, and personal reminders. The original dependency-free frontend remains **localStorage-first** and works by opening `index.html` directly. A secure Node/Express API in `backend/` adds optional authenticated persistence, CRUD, document uploads, and contextual chat.

## Frontend

```bash
python -m http.server 5173
# open http://localhost:5173
```

No frontend build step is required. Existing local data and the deterministic AI fallback remain available even if the API is off. To opt into API calls for an authenticated user, configure `window.MYSPHYRO_API_URL` (for example `http://localhost:3000/api/v1`) and `window.MYSPHYRO_API_TOKEN`, or place the JWT in localStorage as `mysphyro-api-token`. State sync is deliberately non-blocking so offline use still works.

## Backend quick start

**Requires Node.js 22.5+**. Production persistence and authentication use Supabase.

```bash
cd backend
cp .env.example .env
# Set JWT_SECRET to a long, random value before any production deployment.
npm install
npm start
```

The API listens on `http://localhost:3000`; use `npm run dev` for Node watch mode and `npm test` for the API suite. Apply `supabase/migrations/20260822_initial_schema.sql` through the Supabase CLI (`supabase db push`) or SQL Editor before starting the production API. The isolated SQLite adapter is used only for automated tests without cloud credentials.


## Deploying on Vercel

This repository includes `api/[...path].js` and `vercel.json`, so deploy the **repository root** as one Vercel project: static files are the frontend and `/api/v1/*` is the serverless Express API.

1. Create a Supabase project, then run `backend/supabase/migrations/20260822_initial_schema.sql` in the Supabase SQL Editor (or run `supabase db push`). This creates the application tables, RLS policies, and the private `documents` Storage bucket.
2. In Vercel, click **Add New → Project**, import this Git repository, and retain the root directory as `./`. Vercel automatically detects the root `package.json`; no build command is needed for the static frontend.
3. Under **Project Settings → Environment Variables**, add these values for Production, Preview, and Development as appropriate:

   ```text
   SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
   GEMINI_API_KEY=your-gemini-api-key
   GEMINI_MODEL=gemini-2.5-flash
   SUPABASE_UPLOAD_BUCKET=documents
   NODE_ENV=production
   CORS_ORIGINS=https://your-domain.vercel.app,https://your-custom-domain.com
   ```

   Do not set `SUPABASE_SERVICE_ROLE_KEY` or `GEMINI_API_KEY` as `NEXT_PUBLIC_*`, `VITE_*`, or any browser-visible environment variable.
4. Deploy. Confirm `https://your-domain.vercel.app/api/health` returns an `ok` response. The frontend calls the same-origin `/api/v1` path by default, so it works without `localhost` configuration.
5. In Supabase **Authentication → URL Configuration**, add your deployed Vercel URL and custom domain to the allowed Site URL / redirect URLs. If email confirmation is enabled, a new registration returns `confirmationRequired: true` until the user verifies email.

### Vercel operational notes

- Vercel’s function filesystem is temporary. Uploaded files are therefore sent to the private Supabase Storage `documents` bucket; they are not retained in Vercel.
- The Vercel function uses a server-side Supabase service-role key. Keep that key in Vercel environment settings only and rotate it if exposed.
- `/api/v1/documents/files/:filename` checks the authenticated owner before retrieving a file from Supabase Storage.
- For a local static frontend served separately, set `window.MYSPHYRO_API_URL = 'http://localhost:3000/api/v1'`; Vercel does not need this override.

## Environment

| Variable | Required | Description |
| --- | --- | --- |
| `NODE_ENV` | No | `development`, `test`, or `production`; defaults to development. |
| `API_PORT` | No | API port; defaults to `3000`. |
| `SUPABASE_URL` | Yes in production | Your Supabase project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes in production | Server-only Supabase service-role key; never expose it to the browser. |
| `GEMINI_API_KEY` | Yes in production | Server-only Gemini API key used by `/api/v1/chat`. |
| `GEMINI_MODEL` | No | Gemini model name; defaults to `gemini-2.5-flash`. |
| `DATABASE_PATH` | Tests only | Isolated local SQLite test database path. |
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

The API uses Supabase Auth for secure password hashing and JWTs, validates request bodies, applies Helmet, request IDs/logging, CORS controls, auth/API rate limits, file type/size controls, Supabase row-level security, and centralized errors. Gemini receives only a bounded, validated dashboard summary; the API returns a local fallback if the provider is unavailable.

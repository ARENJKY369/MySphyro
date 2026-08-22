# MYSPHYRO Frontend

A dependency-light, interactive frontend prototype for **MYSPHYRO — Everything. Together.**

## What is included
- Responsive dashboard
- Tasks CRUD + filters + auto-priority demo
- College hub
- Document upload + search (local metadata only)
- Budget and expense tracker
- Calendar month navigation
- Plans
- Personal requirements + vibe selector
- AI assistant demo using local dashboard context
- 3 theme system: Minimal, Aesthetic, Cosmic
- LocalStorage persistence
- Toast notifications and modal forms

## Run
The project is intentionally static. Open `index.html` directly, or serve the folder with any simple static server.

Example:

```bash
python -m http.server 5173
```

Then open:

`http://localhost:5173`

No build step is required.

## Important
The AI assistant is a frontend demo with deterministic local responses. Replace `chatRespond()` in `app.js` with your real API call later.

Document upload currently stores metadata in localStorage and does not upload file bytes to a backend.

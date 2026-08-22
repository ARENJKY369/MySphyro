# MySphyro backend

The backend setup, environment reference, database details, API documentation, and examples live in the [repository README](../README.md#backend-quick-start) so frontend and API setup stay synchronized.

```bash
cd backend
cp .env.example .env
npm install
npm test
npm start
```

Use Node.js 22.5 or newer. The API is served at `http://localhost:3000`; its health check is `GET /health`.

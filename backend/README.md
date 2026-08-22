# MySphyro Backend Setup

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and add your GitHub PAT:
```bash
cp .env.example .env
```

Edit `backend/.env`:
```
GITHUB_PAT=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
API_PORT=3000
NODE_ENV=development
GITHUB_REPO=ARENJKY369/MySphyro
```

### 3. Get Your GitHub PAT
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Click "Generate new token"
3. Give it a name like "MySphyro-Backend"
4. Select these scopes:
   - `repo` (full control of private repositories)
   - `gist` (for documents)
   - `user:email` (for profile)
5. Copy the token and paste it in `.env`

### 4. Start the Backend
```bash
npm start
```

You should see:
```
🚀 MySphyro Backend running on http://localhost:3000
📝 API endpoints available at http://localhost:3000/api
```

### 5. Test the API
```bash
# Check health
curl http://localhost:3000/health

# Sync state to backend
curl -X POST http://localhost:3000/api/sync \
  -H "Content-Type: application/json" \
  -d '{"userId":"default","state":{"theme":"minimal"}}'

# Chat with AI
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What should I do next?","context":{}}'

# Fetch GitHub issues
curl http://localhost:3000/api/github/issues
```

## API Endpoints

### Sync
- **POST** `/api/sync` - Save user state
- **GET** `/api/sync/:userId` - Load user state

### Chat
- **POST** `/api/chat` - Get AI response

### Documents
- **POST** `/api/upload` - Upload a document

### GitHub
- **GET** `/api/github/issues` - List open issues
- **POST** `/api/github/issue` - Create a new issue

## Deployment

For production:
1. Replace `http://localhost:3000` in `app.js` with your production URL
2. Use a real database instead of in-memory storage (MongoDB, PostgreSQL, etc.)
3. Add authentication and rate limiting
4. Deploy to Vercel, Heroku, or your server

## Troubleshooting

**"Cannot find module 'express'"**
- Run `npm install` in the backend directory

**"GitHub API error"**
- Check your PAT is correct and has necessary permissions
- Ensure `GITHUB_REPO` is set correctly

**"Backend not reachable from frontend"**
- Make sure backend is running on port 3000
- Check CORS is enabled
- Verify the API_BASE_URL in app.js matches your backend URL

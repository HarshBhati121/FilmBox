# FilmBox

Social database and discovery platform for pop culture. Phase 1 keeps movies/TV working on the existing React + Express + MongoDB stack, with an early-web visual language.

## Architecture

```
Frontend (React / Vite)
  → /api (Vite proxy)
Backend (Express)
  → TMDB adapter (cached)  [more providers later]
  → MongoDB (users, reviews, lists, watchlist, activity)
```

Adding a category later should mean: add a provider adapter, normalize results, reuse search / reviews / lists / tracking. Do not copy the whole app.

Content identity (planned, not fully migrated): `type + provider + externalId`.
Today movies still use TMDB numeric IDs so existing data keeps working.

## Tech stack

- Frontend: React 18, Vite, React Router
- Backend: Node, Express, Mongoose
- Auth: JWT in localStorage
- Movies/TV provider: TMDB (server-side key only)

## Setup

### Backend (`Backend/.env`)

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
TMDB_API_KEY=your_tmdb_key
FRONTEND_URL=https://your-vercel-domain.vercel.app
```

`FRONTEND_URL` is optional; use it for your production frontend domain. Multiple origins can be comma-separated. Local development and this project's Vercel preview URLs are also allowed.

### Frontend (`Frontend/.env`) optional

```
VITE_API_URL=https://your-backend-url/api
VITE_TMDB_IMAGE_BASE=https://image.tmdb.org/t/p/w500
```

For local development, leave `VITE_API_URL` unset: the frontend uses `/api` and Vite proxies it to `http://localhost:5000`. Never put provider secrets in the frontend. Image base URLs are public.

## Commands

```bash
# Terminal 1
cd Backend
npm install
npm run dev

# Terminal 2
cd Frontend
npm install
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:5000

On Windows, keep the project outside OneDrive if Node reports file-read or esbuild errors while starting; the frontend setup notes include a suggested local path.

## Adding a provider later

1. Create `Backend/src/providers/<name>Provider.js` that returns normalized `{ type, provider, externalId, title, year, image, description }`.
2. Register it in a content service.
3. Wire `/api/search` and `/api/<type>/...` without changing list/review/social UIs.

## Personalized recommendations

The signed-in **For You** page asks for movie preferences, retrieves candidate movies and full movie facts from TMDB, then optionally asks Gemini to rank only those verified candidates. A separate history-based list uses the user's watched/rated films and recent submitted search terms to find similar TMDB candidates, then asks Gemini to rank them. If Gemini is unavailable or returns unusable output, the API ranks the TMDB results locally. Search history is recorded only for signed-in users submitting a full search, and is stored in the user's activity records; autocomplete queries are not recorded.

### Local setup

Copy `Backend/.env.example` to `Backend/.env`, preserve your existing local values, and add a newly generated Gemini key:

```text
GEMINI_API_KEY=your_new_gemini_api_key
```

Do not put Gemini credentials in `Frontend/.env`, use a `VITE_` prefix, or commit the key. `GEMINI_MODEL` is optional and defaults to `gemini-2.5-flash`. The endpoints `POST /api/recommendations` and `POST /api/recommendations/history` require JWT authentication and share a limit of five requests per user per 15 minutes. Results are cached in backend memory for 30 minutes. Questionnaire data is not persisted to MongoDB; history recommendations use saved activity and recent search terms.

Run the feature locally using the existing app commands:

```powershell
cd Backend
npm install
npm test
npm run dev
```

In a second terminal:

```powershell
cd Frontend
npm install
npm run dev
```

Sign in, open **For You**, complete the questionnaire, and verify that recommendations show either Gemini ranking or the TMDB fallback. The Gemini key must also be added as a backend environment variable in the deployed backend service before enabling the feature there. Deploy the backend and frontend changes together, verify the endpoint and UI on a preview deployment, then promote the preview to production.

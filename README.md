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
```

### Frontend (`Frontend/.env`) optional

```
VITE_API_BASE=/api
VITE_TMDB_IMAGE_BASE=https://image.tmdb.org/t/p/w500
```

Never put provider secrets in the frontend. Image base URLs are public.

## Commands

```bash
cd Backend && npm install && npm run dev
cd Frontend && npm install && npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:5000

## Adding a provider later

1. Create `Backend/src/providers/<name>Provider.js` that returns normalized `{ type, provider, externalId, title, year, image, description }`.
2. Register it in a content service.
3. Wire `/api/search` and `/api/<type>/...` without changing list/review/social UIs.

# Filmbox — Frontend

Letterboxd-style film app (Vite + React). Connects to your backend for auth.

## Avoid setup errors

**Run from a folder outside OneDrive** (e.g. copy the whole `Film App` to `C:\Projects\Film App`). Then run all commands from that copy to avoid the esbuild/EFTYPE error.

## Run

1. **Start the backend** (from `Backend/`):
   ```bash
   npm install
   npm run dev
   ```
   Backend must run on **http://localhost:5000**.

2. **Start the frontend** (from this `Frontend/` folder):
   ```bash
   npm install
   npm run dev
   ```
   App opens at **http://localhost:5173**.

The frontend proxies `/api` to the backend (`vite.config.js`), so there are no CORS issues in development.

## Included

- **Auth**: Sign up, sign in, sign out — uses `/api/auth` and `/api/user`.
- **Pages**: Home, Films, Lists, Profile (protected).
- **Theme**: Dark Letterboxd-style (green accent, poster cards).

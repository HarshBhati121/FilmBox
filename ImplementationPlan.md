# FilmBox — Letterboxd Clone: Implementation Plan

## Overview

Build a full-featured Letterboxd-style movie tracking + social platform on top of the existing Node/Express/MongoDB backend and React/Vite frontend scaffolding. Auth (signup, login, JWT middleware) and a basic user GET/PUT endpoint already exist. Everything else — TMDB integration, reviews, watchlists, social features, activity feed, lists, and the full UI — is to be built.

---

## What Already Exists ✅

| Layer | Done |
|---|---|
| Backend server (`server.js`, `app.js`, `cors`, `express.json`) | ✅ |
| Auth routes + controller (`/api/auth/register`, `/api/auth/login`) | ✅ |
| JWT auth middleware (`authMiddleware.js`) | ✅ |
| User model (username, email, password) | ✅ |
| User routes (`GET /api/user/me`, `PUT /api/user/me`) | ✅ |
| Frontend Vite + React setup with routing | ✅ |
| AuthContext (login, register, logout, `useAuth`) | ✅ |
| API client (`api()` fetch wrapper, `authApi`, `userApi`) | ✅ |
| Dark theme CSS design tokens + base styles | ✅ |
| Basic page shells (Home, Login, Register, Profile, Films, Lists) | ✅ |

---

## Proposed Changes

### Phase 1 — Backend: Extended Models

---

#### [MODIFY] [User.js](file:///c:/Users/Lenovo/OneDrive/Desktop/Film/Backend/src/models/User.js)
Extend with: `bio`, `avatar` (URL string, using default avatars conceptually, no file upload), `followers` (array of User refs), `following` (array of User refs).

#### [NEW] `src/models/Review.js`
Fields: `userId` (ref User), `movieId` (TMDB id, Number), `rating` (Number, 0.5–5, step 0.5), `reviewText` (String), `likes` (array of User refs), `comments` (array of `{ userId, text, createdAt }`), timestamps.

#### [NEW] `src/models/Watchlist.js`
Fields: `userId` (ref User), `movieId` (Number), `status` (enum: `'watchlist' | 'watched'`), `addedAt` (Date). Compound unique index on `[userId, movieId]`.

#### [NEW] `src/models/List.js`
Fields: `userId` (ref User), `name` (String), `description` (String), `movies` (array of Numbers — TMDB IDs), `isPublic` (Boolean, default true), timestamps.

#### [NEW] `src/models/Activity.js`
Fields: `userId` (ref User), `type` (enum: `'rated'|'reviewed'|'watchlisted'|'watched'|'followed'|'listed'`), `movieId` (Number, optional), `targetUserId` (ref User, optional), `listId` (ref List, optional), `meta` (String — e.g. rating value), timestamps. Index on `userId` + `createdAt`.

---

### Phase 2 — Backend: TMDB Proxy

---

#### [NEW] `src/config/tmdb.js`
Helper that wraps `fetch` calls to `https://api.themoviedb.org/3/...` with the `TMDB_API_KEY` env var. Exports: `tmdbGet(path, params)`.

#### [NEW] `src/routes/movieRoutes.js` + `src/controllers/movieController.js`
TMDB proxy endpoints (all public, no auth required):

| Method | Path | TMDB passthrough |
|---|---|---|
| GET | `/api/movies/search?query=&page=` | `/search/movie` |
| GET | `/api/movies/trending` | `/trending/movie/week` |
| GET | `/api/movies/:id` | `/movie/:id?append_to_response=credits,videos` |
| GET | `/api/movies/:id/cast` | `/movie/:id/credits` |
| GET | `/api/movies/genre/:id` | `/discover/movie?with_genres=` |

---

### Phase 3 — Backend: Reviews, Watchlist, Lists, Social, Feed

---

#### [NEW] `src/routes/reviewRoutes.js` + `src/controllers/reviewController.js`

| Method | Path | Auth | Action |
|---|---|---|---|
| POST | `/api/reviews` | ✅ | Create/update review for a movie |
| GET | `/api/reviews/movie/:movieId` | ❌ | All reviews for a movie (+ avg rating) |
| GET | `/api/reviews/user/:userId` | ❌ | All reviews by a user |
| DELETE | `/api/reviews/:id` | ✅ | Delete own review |
| POST | `/api/reviews/:id/like` | ✅ | Toggle like on review |
| POST | `/api/reviews/:id/comment` | ✅ | Add comment to review |
| DELETE | `/api/reviews/:id/comment/:commentId` | ✅ | Delete own comment |

#### [NEW] `src/routes/watchlistRoutes.js` + `src/controllers/watchlistController.js`

| Method | Path | Auth | Action |
|---|---|---|---|
| GET | `/api/watchlist` | ✅ | Get my watchlist + watched movies |
| POST | `/api/watchlist` | ✅ | Add movie (body: `{ movieId, status }`) |
| PUT | `/api/watchlist/:movieId` | ✅ | Toggle status (watchlist ↔ watched) |
| DELETE | `/api/watchlist/:movieId` | ✅ | Remove movie |
| GET | `/api/watchlist/status/:movieId` | ✅ | Get status of a single movie |

#### [NEW] `src/routes/listRoutes.js` + `src/controllers/listController.js`

| Method | Path | Auth | Action |
|---|---|---|---|
| GET | `/api/lists/me` | ✅ | My lists |
| GET | `/api/lists/user/:userId` | ❌ | Public lists of a user |
| GET | `/api/lists/:id` | ❌ | Single list details |
| POST | `/api/lists` | ✅ | Create list |
| PUT | `/api/lists/:id` | ✅ | Update list metadata |
| DELETE | `/api/lists/:id` | ✅ | Delete list |
| POST | `/api/lists/:id/movies` | ✅ | Add movie to list (body: `{ movieId }`) |
| DELETE | `/api/lists/:id/movies/:movieId` | ✅ | Remove movie from list |

#### [MODIFY] [userController.js](file:///c:/Users/Lenovo/OneDrive/Desktop/Film/Backend/src/controllers/userController.js)  
Add: `getProfile(username)`, `followUser(targetId)`, `unfollowUser(targetId)`, `getFollowers(userId)`, `getFollowing(userId)`, `searchUsers(query)`.

#### [MODIFY] [userRoutes.js](file:///c:/Users/Lenovo/OneDrive/Desktop/Film/Backend/src/routes/userRoutes.js)
Add routes for follow/unfollow, profile by username, user search.

#### [NEW] `src/routes/activityRoutes.js` + `src/controllers/activityController.js`

| Method | Path | Auth | Action |
|---|---|---|---|
| GET | `/api/activity/feed` | ✅ | Feed from followed users (paginated) |
| GET | `/api/activity/user/:userId` | ❌ | Activity for a specific user |

#### [MODIFY] [app.js](file:///c:/Users/Lenovo/OneDrive/Desktop/Film/Backend/src/app.js)
Register all new route modules. Add `TMDB_API_KEY` to the `.env` docs.

---

### Phase 4 — Backend: `.env` Update

---

#### [MODIFY] `Backend/.env`
Add `TMDB_API_KEY` and update DB URI to include database name.

---

### Phase 5 — Frontend: New Dependencies

---

Only install `react-hot-toast`.

#### [MODIFY] [vite.config.js](file:///c:/Users/Lenovo/OneDrive/Desktop/Film/Frontend/vite.config.js)
Confirm proxy exists: `{ '/api': 'http://localhost:5000' }`. Add VITE env var for TMDB image base.

#### [NEW] `Frontend/.env`  
```
VITE_API_BASE=/api
VITE_TMDB_IMAGE_BASE=https://image.tmdb.org/t/p/w500
```

---

### Phase 6 — Frontend: API Service Layer

---

#### [MODIFY] [client.js](file:///c:/Users/Lenovo/OneDrive/Desktop/Film/Frontend/src/api/client.js)
Add new service objects:
`movieApi`, `reviewApi`, `watchlistApi`, `listApi`, `userApi` (extend), `activityApi`.

---

### Phase 7 — Frontend: Custom Hooks

---

#### [NEW] `src/hooks/useMovie.js` — Fetch + cache single movie details
#### [NEW] `src/hooks/useSearch.js` — Debounced TMDB search (300ms)
#### [NEW] `src/hooks/useWatchlist.js` — Watchlist state + optimistic updates
#### [NEW] `src/hooks/useInfiniteScroll.js` — Intersection Observer for infinite scroll (feed)

---

### Phase 8 — Frontend: Components

---

#### [NEW] `src/components/MovieCard.jsx`
#### [NEW] `src/components/StarRating.jsx`
#### [NEW] `src/components/ReviewCard.jsx`
#### [NEW] `src/components/WatchlistButton.jsx`
#### [NEW] `src/components/ActivityItem.jsx`
#### [NEW] `src/components/UserCard.jsx`
#### [NEW] `src/components/SearchBar.jsx`
#### [NEW] `src/components/ListCard.jsx`
#### [MODIFY] [Header.jsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Film/Frontend/src/components/Header.jsx)
#### [MODIFY] [ProtectedRoute.jsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Film/Frontend/src/components/ProtectedRoute.jsx)

---

### Phase 9 — Frontend: Pages

---

#### [MODIFY] [Home.jsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Film/Frontend/src/pages/Home.jsx)
#### [MODIFY] [Films.jsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Film/Frontend/src/pages/Films.jsx)
#### [NEW] `src/pages/FilmDetail.jsx`
#### [MODIFY] [Profile.jsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Film/Frontend/src/pages/Profile.jsx)
#### [MODIFY] [Lists.jsx](file:///c:/Users/Lenovo\OneDrive\Desktop\Film\Frontend\src\pages\Lists.jsx)
#### [NEW] `src/pages/ListDetail.jsx`
#### [NEW] `src/pages/Members.jsx`
#### [MODIFY] [Login.jsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Film/Frontend/src/pages/Login.jsx)
#### [MODIFY] [Register.jsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Film/Frontend/src/pages/Register.jsx)

---

### Phase 10 — Frontend: Routing Update

---

#### [MODIFY] [App.jsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Film/Frontend/src/App.jsx)

---

### Phase 11 — Frontend: Design Polish

---

#### [MODIFY] [index.css](file:///c:/Users/Lenovo/OneDrive/Desktop/Film/Frontend/src/index.css)

---

## Build Sequence (Execution Order)

```
Phase 1  → Backend models (User extend, Review, Watchlist, List, Activity)
Phase 2  → TMDB proxy config + movieRoutes
Phase 3  → reviewRoutes, watchlistRoutes, listRoutes, social userRoutes, activityRoutes
Phase 4  → .env update + app.js registration
Phase 5  → Frontend vite.config + .env
Phase 6  → client.js API service layer
Phase 7  → Custom hooks
Phase 8  → Shared components (MovieCard, StarRating, ReviewCard, etc.)
Phase 9  → Pages (FilmDetail, Profile, Lists, Members, Home updates)
Phase 10 → App.jsx routing
Phase 11 → CSS polish
```

---

## Verification Plan

### Automated (via browser subagent)
1. Start both servers (`npm run dev` in Frontend, `npm run dev` in Backend)
2. Register a new user → verify JWT returned and stored
3. Search a movie → verify TMDB results appear
4. Rate + review a movie → verify stored in DB and shown on film detail page
5. Add movie to watchlist → verify status changes
6. Follow a user → verify activity feed updates

### Manual
- Check mobile layout at 375px viewport
- Verify `.env` placeholder instructions in README
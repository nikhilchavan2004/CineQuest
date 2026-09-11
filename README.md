# Movie Discovery App

A full-stack movie discovery application built with React + Vite, Node.js + Express, TMDB, and MongoDB-backed anonymous wishlist persistence.

## Architecture

React → Express → TMDB
              ↓
           MongoDB

The frontend never calls TMDB directly. It sends all movie requests through the Express API at `/api/movies`, and the Express backend calls TMDB through a centralized `tmdbService` abstraction. This keeps the TMDB API key in the backend environment and avoids leaking external credentials to the browser.

MongoDB is used for persistent wishlist data because the wishlist needs durable, cross-refresh, cross-session storage per anonymous browser user. The frontend uses a stable anonymous user ID generated in the browser via `localStorage` and sends it with wishlist requests; no authentication, passwords, JWT, sessions, or OAuth are introduced.

## Setup

1. Copy `.env.example` to `.env` in the repository root and fill the required values.
2. Start the backend:

```bash
cd backend
npm install
npm start
```

3. Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

4. Set `VITE_API_BASE_URL` in `frontend/.env` if the frontend is not running on the default backend URL.

## Approach

The app keeps a simple route-controller-service-model structure:

- `frontend/src/pages` contains route-level UI pages.
- `frontend/src/services/api.js` centralizes the backend API client.
- `backend/src/controllers` handles the HTTP contract.
- `backend/src/services/tmdbService.js` normalizes TMDB data and provides the TMDB layer.
- `backend/src/models/WishlistItem.js` stores anonymous wishlist records.

## Search, sorting, and pagination

Search requests are sent to `GET /api/movies/search?q=<term>&page=<page>&sort=<sort>` via the frontend API service. The page and search term stay in the URL as query parameters, and the sort option is reflected in the URL as `sort=popularity|rating|releaseDate|title`. A short debounced URL update avoids unnecessary route churn while the input changes, and `AbortController` cancels stale requests to avoid race conditions.

Pagination is backend-driven through the TMDB search response payload and reflected in the frontend response `pagination` object.

## Sorting options

Search results support sorting by:

- popularity
- rating
- releaseDate
- title

The backend service supports these choices by whitelisting them in the controller and applying them in the TMDB normalization and ordering pipeline.

## TMDB normalization

TMDB responses are normalized into application-friendly fields such as:

- `id`
- `title`
- `overview`
- `posterUrl`
- `backdropUrl`
- `releaseDate`
- `rating`
- `voteCount`
- `genres`
- `language`
- `runtime`

This keeps the frontend UI stable even when TMDB returns incomplete or missing fields.

## Error and timeout handling

The backend uses axios request timeouts and catches both client/server and TMDB errors, returning useful HTTP errors to the frontend. The frontend uses the shared `getApiErrorMessage()` helper to show user-facing fallback errors while keeping the system stable.

## Caching strategy

The backend uses a lightweight in-memory TTL cache for read-only TMDB category endpoints (`trending`, `popular`, `top-rated`, `upcoming`) to reduce repeated unnecessary requests without introducing Redis or a database cache. Cached entries are kept for a short window and removed on failure. This cache is simple, local, an# CineQuest — Movie Discovery Application

CineQuest is a full-stack movie discovery application built with React, Node.js, Express, MongoDB, and the TMDB API.

The application allows users to discover movies through curated categories, search for titles, sort and paginate results, view movie details, and maintain a persistent anonymous wishlist.

The system is designed with a dedicated backend abstraction layer between the React frontend and TMDB. Movie data is normalized by the backend before being returned to the client, while wishlist data is persisted in MongoDB.

---

## 1. Key Features

### Movie Discovery

- Trending movies
- Popular movies
- Top-rated movies
- Upcoming movies
- Responsive movie grid
- Movie posters, ratings, release dates, and metadata

### Search

- Movie title search
- Debounced search input
- URL-based search state
- Request cancellation for stale searches
- Loading, empty, and error states

### Sorting

Search results can be ordered by:

- Popularity
- Rating
- Release date
- Title

The selected sorting option is preserved in the URL.

### Pagination

- Backend-driven pagination
- Previous and next navigation
- Current page information
- Search, sorting, and pagination state represented in the URL

### Movie Details

The movie details page provides:

- Title
- Poster
- Backdrop
- Overview
- Rating
- Vote count
- Release date
- Runtime
- Genres
- Original language
- Wishlist action

### Wishlist

Users can add and remove movies from a persistent wishlist.

Wishlist data:

- Is stored in MongoDB
- Persists across page refreshes
- Persists across browser sessions
- Is scoped to an anonymous browser user
- Prevents duplicate movie entries
- Supports adding and removing movies

No authentication system is required for the anonymous wishlist implementation.

---

# 2. Architecture

```text
                    React + Vite
                         |
                         | HTTP/REST
                         v
                  Node.js + Express
                    /           \
                   /             \
                  v               v
             TMDB Service      MongoDB
                  |
                  v
                 TMDBd easy to explain in an interview.

## Wishlist design

Wishlist persistence is handled through MongoDB with a compound unique index on `{ anonymousUserId, movieId }`. Duplicate requests are prevented and mapped to a `409` conflict. Deletion uses `DELETE /api/wishlist/:movieId` with `anonymousUserId` passed as a query parameter.

## Request reliability

The app performs request cancellation and rapid-request protection in the browser by using `AbortController` and a short debounce window for search input. TMDB timeout and error branches are normalized in the service layer.

## Important limitations

- The app uses a lightweight in-memory cache that lives only in the server process and resets when the backend restarts.
- Search uses TMDB-backed server-side sorting and pagination, not a locally stored search index.
- No authentication is added because the assignment requires anonymous wishlist behavior only.

## AI usage

This project used AI-assisted development tools for a few appropriate purposes, including project setup support, debugging, API research, code review assistance, and boilerplate generation. The final implementation decisions and architecture were reviewed and understood by the developer.

## What would be improved with more time

- Add richer UI polish and mobile-first search result refinements.
- Expand automated frontend tests beyond the current build and lint verification.
- Harden the shared cache with route-aware invalidation and optional persistent caching.
- Add a more complete README and production deployment guide.

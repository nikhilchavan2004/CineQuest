# Implementation Notes

## Current architecture
- Frontend: React + Vite foundation implemented
- Backend: Node.js + Express
- Database: MongoDB + Mongoose for wishlist persistence
- External API: TMDB, accessed only through the backend

## Phase 4 frontend foundation
- React + Vite app created in the frontend directory
- React Router installed and configured for Home, Search, Movie Details, and Wishlist routes
- Centralized API service added in frontend/src/services/api.js using VITE_API_BASE_URL
- Anonymous user ID strategy implemented using localStorage persistence with a reusable hook
- Simple global wishlist context created to store shared wishlist state without adding Redux
- Responsive app shell created with a mobile-friendly navbar and container layout
- Reusable UI primitives created for buttons and empty/loading/error states

## Phase 5 real movie data integration
- HomePage now loads trending, popular, top-rated, and upcoming movies through the backend API
- MovieCard displays normalized poster, title, release year, rating, fallback imagery, and wishlist action
- SearchPage reads q and page from the URL and calls the backend search endpoint
- Search input updates are debounced and requests are cancelled with AbortController to prevent stale results
- MovieDetailPage loads normalized movie data by route ID with backdrop, poster, overview, metadata, and wishlist controls
- WishlistContext now loads and mutates wishlist records through MongoDB-backed backend routes
- WishlistPage displays backend-persisted movies and supports navigation to movie details and removal through MovieCard
- Loading, retryable error, missing movie, no-query, no-results, and empty wishlist states are implemented

## Phase 5 frontend/backend data flow
- Home/search/detail React screens call the centralized Axios service
- Axios calls the Node/Express API under VITE_API_BASE_URL
- Node controllers call the TMDB service and return normalized movie data
- Wishlist calls send anonymousUserId and normalized movie fields to Node/Express
- MongoDB remains the source of truth for wishlist data; localStorage stores only anonymousUserId

## Phase 5 API endpoints used
- GET /api/movies/trending?page=1
- GET /api/movies/popular?page=1
- GET /api/movies/top-rated?page=1
- GET /api/movies/upcoming?page=1
- GET /api/movies/search?q=<term>&page=<page>
- GET /api/movies/:id
- GET /api/wishlist?anonymousUserId=<id>
- POST /api/wishlist
- DELETE /api/wishlist/:movieId?anonymousUserId=<id>

## Phase 5 request and state decisions
- Home requests are issued once on mount for the four intentional discovery sections
- Search waits 450ms after typing before updating URL state and does not request for an empty query
- AbortController cancels the previous search or detail request when route/query state changes
- Wishlist mutations update React state only after successful backend responses
- Backend and TMDB implementation details are converted into safe user-facing error messages
- Search submission synchronizes the controlled input before updating URL state so debounce cannot clear a submitted query
- Movie card wishlist controls are siblings of the detail link, preventing nested interactive elements and accidental navigation
- Local development CORS accepts the configured client URL and the active localhost Vite ports

## Frontend architecture
- Routing: AppRoutes defines the main screens inside a shared MainLayout shell
- Layout: Navbar, responsive mobile menu, and page container are centralized in the layout folder
- Shared state: WishlistContext keeps the wishlist and anonymousUserId available to screens without over-engineering
- API communication: all frontend requests go through the backend through a single axios instance
- Styling: Tailwind CSS is used for the app shell and responsive design foundation

## Routing
- / -> HomePage
- /search -> SearchPage
- /movie/:id -> MovieDetailPage
- /wishlist -> WishlistPage

## Anonymous user ID strategy
- A browser-generated anonymousUserId is created once per browser profile
- It is stored in localStorage under a stable key to persist across app restarts
- This value is used on wishlist requests without authentication or personal data exposure
- No sensitive data or secrets are stored in the anonymous identifier

## API communication approach
- Frontend uses a single Axios instance in frontend/src/services/api.js
- Base URL is configured through VITE_API_BASE_URL
- Requests to /api/movies and /api/wishlist are aimed at the local backend only
- React never calls TMDB directly

## Environment configuration
- frontend/.env with VITE_API_BASE_URL=http://localhost:5000/api
- frontend/.env.example included for reuse

## Decisions made
- Frontend work is intentionally limited to foundation and infrastructure only
- Search, detail, and wishlist feature logic are left for later phases as required
- Global state is scoped to wishlist and anonymous identity only, avoiding Redux for this simple project
- Responsive layout and accessible controls are established at the foundation layer

## Phase 4 testing notes
- npm install executed successfully in the frontend folder
- Vite app scaffold created successfully
- Frontend build executed successfully via npm run build
- Dev server startup was verified for routing availability on the local browser environment
- Anonymous user ID generation and localStorage persistence were implemented and verified in code flow
- Mobile/desktop layout is set up responsively through the shared app shell and Tailwind utilities

## Known limitations
- Advanced filters, sorting, and refined pagination remain future work
- No production deployment or environment hardening was performed in this foundation phase

## Remaining future work
- Phase 5: implement actual movie search UI and API-driven home/search flows
- Phase 5: complete movie detail and wishlist interactions with backend integration
- Phase 5: polish visual states for loading, empty, and error experiences

## Completed features
### Phase 1
- Backend project scaffold created
- Environment configuration template added
- Express app foundation added
- Basic middleware configured
- Centralized error handling implemented
- Health endpoint added
- MongoDB connection setup prepared behind environment configuration
- Git ignore and environment template added early

### Phase 2
- TMDB service created as a dedicated backend-only service
- Movie routes added for trending, popular, top-rated, upcoming, search, and detail endpoints
- Response normalization added to keep frontend payloads consistent
- Missing TMDB API key handling added to avoid leaking or misconfiguring credentials
- Error-handling flow centralized through the backend app error middleware

### Phase 3
- MongoDB wishlist persistence implemented
- Wishlist schema includes anonymousUserId and a compound unique index on anonymousUserId + movieId
- Wishlist controller validates request payloads and scopes reads/writes per anonymous user
- Duplicate prevention is enforced both in logic and at the database level
- Wishlist routes are added for list, add, and delete operations

## API endpoints
- GET /api/health
- GET /api/movies/trending
- GET /api/movies/popular
- GET /api/movies/top-rated
- GET /api/movies/upcoming
- GET /api/movies/search?q=<term>&page=<page>
- GET /api/movies/:id
- GET /api/wishlist?anonymousUserId=<id>
- POST /api/wishlist
- DELETE /api/wishlist/:movieId?anonymousUserId=<id>
- 404 handler for unknown routes

## Anonymous wishlist architecture
- Authentication is intentionally not implemented.
- Each wishlist is scoped to an anonymousUserId so different browsers/devices do not share the same wishlist.
- The backend expects an anonymousUserId in all wishlist operations and rejects requests missing it with a 400 error.
- This is a deliberate safety decision: silently falling back to a shared global wishlist would leak one user's data to another user and violates the assignment requirement.

## Wishlist schema
{
  anonymousUserId,
  movieId,
  title,
  posterUrl,
  releaseDate,
  rating,
  addedAt,
  createdAt,
  updatedAt
}

The database enforces uniqueness on the compound key anonymousUserId + movieId.

## Normalized movie structure
{
  id,
  title,
  overview,
  posterUrl,
  backdropUrl,
  releaseDate,
  rating,
  voteCount,
  genres,
  language,
  runtime
}

## TMDB integration approach
- TMDB requests are routed through a dedicated backend service
- Secrets remain server-side only
- The service normalizes raw TMDB results into a smaller application-friendly payload
- Request timeouts and API failures are handled centrally

## Data flow
- Route -> Controller -> TMDB service -> TMDB API -> normalized result -> controller -> JSON response
- Wishlist route -> controller -> Mongoose model -> MongoDB -> controller -> JSON response

## Environment variables
- PORT
- CLIENT_URL
- MONGODB_URI
- TMDB_API_KEY

## Error handling decisions
- Missing TMDB credentials return a clear backend error without exposing secrets
- Missing anonymousUserId on wishlist operations returns 400 to avoid data leakage
- Duplicate wishlist entries return 409 at both application and database levels
- Invalid page and invalid movie IDs return 400 responses
- TMDB timeout and unavailable service conditions return 504/502 style application errors
- Generic app-level errors pass through centralized middleware

## Assumptions
- TMDB is the chosen external movie API
- Authentication is not required for this assessment
- A browser-generated anonymous identifier will be supplied by the frontend in a later phase
- Each anonymous user gets their own wishlist scope in MongoDB

## Known limitations
- MongoDB data must be available locally for wishlist persistence checks
- Advanced filters, sorting, and refined pagination remain future work

## Remaining work
- Frontend foundation for anonymous ID generation and wishlist UI
- Frontend search and discovery screens
- Final documentation and polish after all backend phases are complete

## Phase 2 testing notes
- Unit test passed for movie normalization logic
- Runtime verification confirmed the backend starts successfully
- Live TMDB API verification remains pending because TMDB_API_KEY is currently empty in the local environment

## Phase 3 testing notes
- Wishlist validation tests passed in the Node test suite
- MongoDB connection validated successfully when the backend started with MONGODB_URI configured
- Live anonymous-user wishlist persistence checks are performed when the backend is running locally

## Phase 5 testing notes
- Frontend production build passed with Vite
- Backend Node test suite passed: 5 tests, 0 failures
- Backend started successfully at http://localhost:5000 and connected to MongoDB
- Frontend started successfully on the active local Vite port
- All required movie GET endpoints returned HTTP 200 through the backend with TMDB enabled
- Browser verified Home rendered Trending, Popular, Top Rated, and Upcoming sections with 80 live movie cards
- Browser verified real searches for inception, batman, and the broad term the
- Browser verified empty search clearing, URL query/page state, pagination from page 1 to page 2, and no-query state
- Browser verified movie details for Inception, including overview, poster, backdrop, rating, votes, genres, language, and runtime
- Browser verified Back returned from details to /search?q=inception&page=1
- Browser verified wishlist add, immediate removal, refresh persistence behavior, and empty state
- Browser verified malformed movie IDs are rejected client-side with a clear message
- Browser verified mobile, tablet, and desktop widths without horizontal overflow
- CORS verification passed for http://localhost:5173
- TMDB_API_KEY was never printed or exposed during verification

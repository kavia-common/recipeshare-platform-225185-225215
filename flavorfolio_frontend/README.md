# FlavorFolio Frontend (React)

Modern, lightweight React frontend for the FlavorFolio recipe sharing app. This build integrates:
- Real API calls to your backend (Express) with Authorization header from Supabase
- Supabase authentication (email/password) with session persistence
- Multipart form uploads for recipe image and fields
- Ocean Professional theme via `src/theme.css`

## Requirements

- Node.js 18+
- Backend running locally at http://localhost:3001 (or set `REACT_APP_BACKEND_URL`)
- Supabase project (required for real auth; optional fallback login for local demo exists)

## Environment Setup

1) Copy `.env.example` to `.env`
2) Set the following variables (defaults shown for local dev):

- REACT_APP_BACKEND_URL=http://localhost:3001
  - Express backend base URL. Must allow CORS from the frontend.
- REACT_APP_FRONTEND_URL=http://localhost:3000
  - Public URL for this frontend. Used for redirects and should be allowed in backend CORS.
- REACT_APP_SITE_URL=http://localhost:3000
  - Used by Supabase for email redirect after sign-up/confirmation. Typically same as FRONTEND_URL.
- REACT_APP_SUPABASE_URL=https://<your-project>.supabase.co
  - From your Supabase project settings (Project URL).
- REACT_APP_SUPABASE_KEY=<anon-public-key>
  - From your Supabase project settings (anon public key, NOT the service role key).

Notes:
- Do not commit actual secrets. Use environment variables in deployment platforms.
- In production hosting, also configure these variables in the host’s environment (e.g., Vercel).

## Running locally

- Install dependencies: `npm install`
- Start dev server: `npm start`
- Open http://localhost:3000

The API client resolves base URL in this order:
1) `REACT_APP_BACKEND_URL`
2) `REACT_APP_API_BASE` (legacy fallback)
3) `window.location.origin` with 3000 → 3001 fallback

## Supabase Authentication (Sign In / Sign Up)

- Email/password login and signup via `src/pages/SignIn.jsx`
- Session is tracked with `src/context/AuthContext.jsx` using `supabase.auth.onAuthStateChange`
- Authorization header is attached automatically by `src/lib/api.js` using the Supabase access token
- For signup, ensure:
  - `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_KEY` are set
  - `REACT_APP_SITE_URL` is set (e.g., http://localhost:3000)
  - In Supabase Authentication settings:
    - Enable Email provider
    - Add your site URL to Redirect URLs: `http://localhost:3000/signin` (and your production URL)
- After signup, confirm email then sign in. The app will redirect back to `/signin`.

## Confirm API Connectivity

To verify the frontend can talk to the backend:
- Ensure backend is running and accessible at `REACT_APP_BACKEND_URL` (default http://localhost:3001)
- From the app (Home/Search pages), ensure lists load without errors
- Open browser devtools Network tab and confirm requests to:
  - GET `${REACT_APP_BACKEND_URL}/api/recipes`
  - GET `${REACT_APP_BACKEND_URL}/api/recipes/search?q=...`
- If you see CORS errors, update backend CORS settings to allow `REACT_APP_FRONTEND_URL` (http://localhost:3000).

## API Contract (Backend)

Expected endpoints (based on backend OpenAPI):
- GET `/api/recipes`
- GET `/api/recipes/search?q=...`
- GET `/api/recipes/:id`
- POST `/api/recipes` (multipart form: image optional/required per backend)
- PATCH `/api/recipes/:id` (multipart form)
- DELETE `/api/recipes/:id`
- POST `/api/recipes/:id/favorite`
- POST `/api/recipes/:id/unfavorite`

Optional (if implemented):
- GET `/api/users/me/recipes`
- GET `/api/users/me/favorites`

If user endpoints are missing, the frontend falls back to client-side filtering using the recipes list.

## Pages wired to API

- Home: loads list via `api.recipes.getAll()`
- Search: searches via `api.recipes.search(q)`
- RecipeDetail: loads by id, supports delete and favorite
- CreateRecipe: sends FormData, includes `image` file if selected
- EditRecipe: similar to create, multipart update
- Profile: uses `api.auth.getCurrentUser()` and `api.users.getMyRecipes()` / `getMyFavorites()`

## Troubleshooting

- CORS errors:
  - Allow `REACT_APP_FRONTEND_URL` in backend CORS config
  - Use full, correct protocol (http vs https) and ports
- 400 on create/edit:
  - Ensure all fields are valid; if backend requires image, upload a file or provide `imageUrl`
- Missing auth token:
  - Confirm Supabase env variables and that you are signed in
- Wrong API base:
  - Verify `REACT_APP_BACKEND_URL` and reload dev server if .env changed

## Scripts

- `npm start` - start dev server
- `npm test` - run tests
- `npm run build` - build for production

Security notes:
- No secrets in code. Use .env variables.
- Tokens are not logged.
- Inputs validated client-side; backend must enforce server-side validation.

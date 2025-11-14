# FlavorFolio Frontend (React)

Modern, lightweight React frontend for the FlavorFolio recipe sharing app. This build integrates:
- Real API calls to your backend (Express) with Authorization header from Supabase
- Supabase authentication (email/password) with session persistence
- Multipart form uploads for recipe image and fields
- Ocean Professional theme via `src/theme.css`

## Requirements

- Node.js 18+
- Backend running locally at http://localhost:3001 (or set `REACT_APP_BACKEND_URL`)
- Supabase project (optional for mock-less local dev; required for real auth)

## Environment

Copy `.env.example` to `.env` and set values:

- REACT_APP_BACKEND_URL: http://localhost:3001
- REACT_APP_FRONTEND_URL: http://localhost:3000
- REACT_APP_SITE_URL: http://localhost:3000 (used by Supabase email redirect)
- REACT_APP_SUPABASE_URL: https://<your-project>.supabase.co
- REACT_APP_SUPABASE_KEY: <anon key> (never the service role key)

Do not commit actual secrets. Use environment variables in deployment.

## Running locally

- Install dependencies: `npm install`
- Start dev server: `npm start`
- Open http://localhost:3000

The API client resolves base URL in this order:
1) `REACT_APP_BACKEND_URL`
2) `REACT_APP_API_BASE`
3) `window.location.origin` with 3000 → 3001 fallback

## Supabase Authentication

- Email/password Login and Signup via `src/pages/SignIn.jsx`
- Session is tracked with `src/context/AuthContext.jsx` using `supabase.auth.onAuthStateChange`
- Authorization header is attached automatically by `src/lib/api.js` using the Supabase access token
- For signup, ensure `REACT_APP_SITE_URL` is set so Supabase can redirect back to `/signin` after email confirmation

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

- CORS errors: enable CORS on backend for http://localhost:3000
- 400 on create/edit: ensure all fields are valid; if backend requires image, upload a file or provide `imageUrl`
- Missing auth token: confirm Supabase env variables and that you are signed in

## Scripts

- `npm start` - start dev server
- `npm test` - run tests
- `npm run build` - build for production

Security notes:
- No secrets in code. Use .env variables.
- Tokens are not logged.
- Inputs validated client-side; backend must enforce server-side validation.

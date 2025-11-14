# FlavorFolio Frontend Deployment (Vercel)

This guide covers deploying the FlavorFolio React (CRA) frontend to Vercel and wiring it to your backend.

Prereqs
- GitHub repository with this frontend code
- Backend API URL available (e.g., Render/Fly.io/Heroku/your server)
- Node 18+ locally

1) Push to GitHub
- Initialize repo if needed:
  git init
  git add .
  git commit -m "FlavorFolio frontend"
  git branch -M main
  git remote add origin <your GitHub repo url>
  git push -u origin main

2) Provision a Postgres database (Neon via Vercel)
- In Vercel dashboard: Storage > Postgres > Create Database (Neon)
- Copy DATABASE_URL

3) Backend configuration (summary)
- Ensure your backend uses DATABASE_URL
- Set up auth/session/Cloudinary/Supabase as needed
- Run migrations (e.g., npx prisma db push) against your database
- Expose your API at a public URL (https)

4) Environment variables (Vercel Project Settings -> Environment Variables)
For frontend (React CRA):
- REACT_APP_BACKEND_URL = https://your-backend-host
- REACT_APP_FRONTEND_URL = https://your-frontend-url
- REACT_APP_SITE_URL = https://your-frontend-url  (used by Supabase email redirects)
- REACT_APP_SUPABASE_URL = https://<your-project>.supabase.co
- REACT_APP_SUPABASE_KEY = <anon public key>

Optional third-party:
- REACT_APP_CLOUDINARY_CLOUD_NAME

For backend (documented in backend project):
- DATABASE_URL = <from Neon or your DB provider>
- NEXTAUTH_SECRET = <generate a strong random string if using NextAuth>
- NEXTAUTH_URL = https://your-frontend-url
- CLOUDINARY_* (if used)
- SUPABASE_* (if used)

Note: Do not hardcode secrets. Always use environment variables.

5) Connect GitHub repo to Vercel
- Import your repository into Vercel
- Framework Preset: Other
- Build Command: npm run build
- Output Directory: build
- Install Command: npm ci (Vercel default is fine)

6) Build and deploy
- On push to main, Vercel will build:
  - react-scripts build
- Confirm deployment URL works

7) Post-deploy checks
- Verify Home page loads and lists recipes
- Try searching: /search?q=salmon
- Open a recipe detail page
- Log in (stubbed in this template) and try Create/Edit/Delete
- Favorites toggle works (ensure backend endpoints /favorite and /unfavorite are live)
- Check responsive UI on mobile breakpoints

8) Troubleshooting
- Blank page or errors: Open browser console; check network calls to REACT_APP_BACKEND_URL
- CORS errors: Enable CORS on your backend for your frontend domain
- 404 on refresh: Ensure Vercel uses SPA fallback (CRA) — Vercel handles this automatically for single-page apps
- Environment variable not applied: Redeploy after updating variables

9) Database migrations (backend)
- Run: npx prisma db push (or prisma migrate) on your backend against DATABASE_URL
- Confirm tables exist before creating recipes from the frontend

10) Rollbacks and branches
- Use Vercel preview deployments for PRs
- Promote/demote by merging or reverting PRs

Security and Compliance
- Never commit secrets to git
- Mask PII in logs; avoid logging tokens
- Prefer HTTPS for all endpoints
- Validate/sanitize inputs server-side

Checklist
- [ ] Repo pushed to GitHub
- [ ] Backend deployed and reachable
- [ ] Vercel project created and linked
- [ ] REACT_APP_BACKEND_URL set in Vercel
- [ ] Build and deploy succeed
- [ ] Search, detail, create/edit, favorites work
- [ ] Mobile responsive verified

# recipeshare-platform-225185-225215

Quick start (frontend):
- cd flavorfolio_frontend
- cp .env.example .env
- Edit .env to set:
  - REACT_APP_BACKEND_URL=http://localhost:3001
  - REACT_APP_FRONTEND_URL=http://localhost:3000
  - REACT_APP_SUPABASE_URL=your-supabase-url
  - REACT_APP_SUPABASE_KEY=your-supabase-anon-key
- npm install && npm start

See flavorfolio_frontend/README.md for detailed setup, Supabase sign-in, and API connectivity checks.
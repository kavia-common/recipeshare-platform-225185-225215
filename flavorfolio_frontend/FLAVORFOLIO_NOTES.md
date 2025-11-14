# FlavorFolio Frontend Structure (Next.js-style in CRA)

This frontend uses Create React App but follows a Next.js-inspired structure:

- src/pages/*: Route components (Home, RecipeDetail, CreateRecipe, EditRecipe, Profile)
- src/components/*: Reusable UI (Layout, Navbar, RecipeCard)
- src/context/AuthContext.jsx: Stub auth context (replace with NextAuth later)
- src/lib/api.js: Minimal API layer simulating server/Prisma using localStorage

Theme: Ocean Professional with warm accents (amber/emerald). Styles live in src/theme.css.

Cloudinary: Upload widget is stubbed as an "Upload" button prompting for an image URL. Replace with Cloudinary widget integration later.

Data: Local storage mock seeds a few demo recipes. All CRUD and favorite operations occur locally.

Next steps to integrate a real backend:
- Replace functions in src/lib/api.js with fetch() calls to your backend.
- Wire auth to NextAuth (session provider) and remove AuthContext stub.
- When using Cloudinary, ensure CLOUDINARY_CLOUD_NAME and upload preset are provided via environment variables (do not hardcode secrets).

# Checklist (React + Vite + Supabase + Netlify PWA)

Production-ready checklist app with offline support, realtime sync, and keyboard-accessible UI.

## Stack
- React + TypeScript + Vite + Tailwind
- TanStack Query + Zustand
- Supabase (Auth, Postgres, Realtime, RLS)
- Netlify (hosting + Functions)
- PWA via VitePWA, IndexedDB offline queue
- Vitest + Testing Library + Playwright

## Setup

1. Create a Supabase project and run the SQL in `supabase.sql`.
2. Copy `.env.example` to `.env` and set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. For the Netlify Function (optional export), set env vars in Netlify:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (read-only policy; **never expose in client**).

### Local Dev
```bash
npm i
npm run dev
```

### Build
```bash
npm run build && npm run preview
```

### Tests
```bash
npm test
npx playwright install
npm run e2e
```

### Deploy to Netlify
- Connect the repo
- Build command: `npm run build`
- Publish dir: `dist`
- Functions dir: `netlify/functions`

## PWA & Offline
- App shell cached with Workbox via vite-plugin-pwa
- API calls use NetworkFirst; offline mutations queued in IndexedDB and replayed on reconnect (Background Sync is used if available).

## Accessibility
- Focus outlines, keyboard operations for reorder (↑/↓), ARIA-friendly semantics in components.

## Export
- CSV export via Netlify Function: `/.netlify/functions/export-project?projectId=...`

## Notes
- Realtime: you can subscribe to changes with Supabase channel on `items` table and invalidate React Query cache on broadcast.

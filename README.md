# Nuxt SSR / SPA Hybrid Starter

Nuxt starter with SSR enabled globally, SPA-only route rules for selected pages, and Tailwind CSS v4 through the official Vite plugin.

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Rendering Modes

- `/` renders with Nuxt SSR and fetches `/api/health` from the Nitro server.
- `/spa` uses `routeRules` with `ssr: false`, so it behaves as a client-side SPA route.
- `/api/health` is a Nitro server endpoint for runtime verification.

## Project Shape

- `app/pages` contains routed Vue pages.
- `app/layouts` contains shared shells.
- `app/components` contains reusable UI.
- `app/composables` contains shared state/helpers.
- `app/middleware` contains route middleware.
- `app/plugins` contains Nuxt plugins.
- `server/api` contains Nitro API routes.

# Nuxt SSR/SPA Hybrid Tailwind Starter Design

## Context

The workspace root is empty and is not a Git repository. The project will be created directly in the root directory.

## Goal

Create a current Nuxt project that demonstrates SSR by default, route-level SPA rendering where appropriate, Tailwind CSS styling, a practical project structure, and a running development server.

## Architecture

Nuxt runs with `ssr: true` as the global default. Hybrid behavior is implemented through `routeRules`, where `/spa/**` disables SSR and renders as a client-side SPA section. The starter includes a server API route so SSR pages and client pages can verify the Nitro server layer.

## Files And Responsibilities

- `nuxt.config.ts` configures SSR, Tailwind's Vite plugin, global CSS, app metadata, devtools, and hybrid route rules.
- `app/app.vue` wraps routed pages in the default layout.
- `app/layouts/default.vue` provides shared navigation and shell styling.
- `app/pages/index.vue` is the SSR landing page and calls `/api/health`.
- `app/pages/spa/index.vue` is the SPA-only route that proves route-level `ssr: false`.
- `app/components/AppHero.vue` contains the reusable hero presentation.
- `app/composables/useAppMeta.ts` centralizes app metadata.
- `app/middleware/route-mode.global.ts` annotates each navigation with the expected render mode.
- `app/plugins/client-ready.client.ts` provides a tiny client-only readiness flag.
- `app/assets/css/main.css` imports Tailwind CSS and defines base theme styles.
- `server/api/health.get.ts` returns API health and runtime metadata.

## Verification

Use the smallest commands that prove the scaffold:

1. `npm install` installs current package versions from npm.
2. `npm run build` verifies Nuxt, TypeScript, Nitro, Vue SFCs, route rules, and Tailwind integration.
3. `npm run dev` starts the requested development server.

## Constraints

No commit is required because the workspace is not a Git repository. The feature state remains tracked in `feature_list.json`, and meaningful session work is appended to `progress.md`.

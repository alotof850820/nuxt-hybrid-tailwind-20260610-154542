# Nuxt SSR/SPA Hybrid Tailwind Starter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a root-level Nuxt starter with SSR defaults, SPA route rules, Tailwind CSS v4 through Vite, representative app folders, verification, and a running dev server.

**Architecture:** Nuxt uses SSR globally and disables SSR only for `/spa/**` through `routeRules`. Tailwind is integrated through `@tailwindcss/vite`, with global CSS loaded from `app/assets/css/main.css`. The starter includes one SSR page, one SPA-only page, a composable, middleware, client plugin, reusable component, and Nitro API route.

**Tech Stack:** Nuxt, Vue, TypeScript, Nitro, Vite, Tailwind CSS, npm.

---

## File Structure

- Create: `package.json` — npm metadata, Nuxt scripts, and current dependency ranges.
- Create: `.gitignore` — excludes dependencies, Nuxt build output, and environment files.
- Create: `README.md` — explains commands and hybrid rendering.
- Create: `nuxt.config.ts` — Nuxt SSR, Tailwind Vite plugin, global CSS, metadata, and route rules.
- Create: `tsconfig.json` — extends generated Nuxt TypeScript config.
- Create: `app/app.vue` — layout and page outlet.
- Create: `app/assets/css/main.css` — Tailwind import and base styles.
- Create: `app/layouts/default.vue` — shared shell and navigation.
- Create: `app/components/AppHero.vue` — reusable landing hero.
- Create: `app/composables/useAppMeta.ts` — reusable metadata object.
- Create: `app/middleware/route-mode.global.ts` — route render-mode annotation.
- Create: `app/plugins/client-ready.client.ts` — client-only ready state.
- Create: `app/pages/index.vue` — SSR example page.
- Create: `app/pages/spa/index.vue` — SPA-only example page.
- Create: `server/api/health.get.ts` — Nitro health endpoint.
- Modify: `feature_list.json` — keep one in-progress feature.
- Modify: `progress.md` — append implementation progress before stopping.

### Task 1: Project Manifest

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `README.md`
- Create: `tsconfig.json`

- [ ] **Step 1: Create npm metadata and scripts**

Write `package.json` with Nuxt scripts and latest-compatible dependency ranges:

```json
{
  "name": "nuxt-ssr-spa-hybrid-tailwind",
  "type": "module",
  "private": true,
  "scripts": {
    "build": "nuxt build",
    "dev": "nuxt dev --host 0.0.0.0",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare"
  },
  "dependencies": {
    "@tailwindcss/vite": "latest",
    "nuxt": "latest",
    "tailwindcss": "latest",
    "vue": "latest",
    "vue-router": "latest"
  },
  "devDependencies": {
    "typescript": "latest"
  }
}
```

- [ ] **Step 2: Add ignore rules**

Write `.gitignore`:

```gitignore
node_modules
.nuxt
.output
.data
dist
.env
.env.*
!.env.example
npm-debug.log*
pnpm-debug.log*
yarn-debug.log*
```

- [ ] **Step 3: Add README commands**

Write `README.md` with installation, development, build, and hybrid-rendering notes.

- [ ] **Step 4: Add TypeScript config**

Write `tsconfig.json`:

```json
{
  "extends": "./.nuxt/tsconfig.json"
}
```

### Task 2: Nuxt And Tailwind Configuration

**Files:**
- Create: `nuxt.config.ts`
- Create: `app/assets/css/main.css`

- [ ] **Step 1: Configure Nuxt**

Write `nuxt.config.ts`:

```ts
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: true,
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Nuxt SSR / SPA Hybrid',
      meta: [
        {
          name: 'description',
          content: 'A Nuxt starter with SSR defaults, SPA route rules, and Tailwind CSS.',
        },
      ],
    },
  },
  routeRules: {
    '/': { ssr: true },
    '/spa/**': { ssr: false },
    '/api/**': { cors: true },
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
```

- [ ] **Step 2: Configure Tailwind CSS entry**

Write `app/assets/css/main.css` with Tailwind import, CSS variables, and base body styling.

### Task 3: App Shell And Shared Units

**Files:**
- Create: `app/app.vue`
- Create: `app/layouts/default.vue`
- Create: `app/components/AppHero.vue`
- Create: `app/composables/useAppMeta.ts`
- Create: `app/middleware/route-mode.global.ts`
- Create: `app/plugins/client-ready.client.ts`

- [ ] **Step 1: Create root app outlet**

Write `app/app.vue`:

```vue
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

- [ ] **Step 2: Create layout navigation**

Write `app/layouts/default.vue` with links to `/` and `/spa`, Tailwind styling, and `<slot />`.

- [ ] **Step 3: Create reusable hero**

Write `app/components/AppHero.vue` with props for eyebrow, title, description, and badge.

- [ ] **Step 4: Create metadata composable**

Write `app/composables/useAppMeta.ts` returning app name, description, stack list, and routes.

- [ ] **Step 5: Create route-mode middleware**

Write `app/middleware/route-mode.global.ts` to set `to.meta.renderMode` to `spa` for `/spa` routes and `ssr` otherwise.

- [ ] **Step 6: Create client plugin**

Write `app/plugins/client-ready.client.ts` to provide `clientReady` as a `ref(true)`.

### Task 4: Pages And API

**Files:**
- Create: `app/pages/index.vue`
- Create: `app/pages/spa/index.vue`
- Create: `server/api/health.get.ts`

- [ ] **Step 1: Create SSR homepage**

Write `app/pages/index.vue` with `useFetch('/api/health')`, `useHead`, `AppHero`, stack cards, and health output.

- [ ] **Step 2: Create SPA-only page**

Write `app/pages/spa/index.vue` with client-only state, route meta display, and interactive counter.

- [ ] **Step 3: Create health API**

Write `server/api/health.get.ts` returning `{ ok, mode, timestamp, runtime }`.

### Task 5: Install And Verify

**Files:**
- Modify: `package-lock.json`
- Modify: `.nuxt/*`
- Modify: `progress.md`

- [ ] **Step 1: Install dependencies**

Run: `npm install`

Expected: dependencies install and `nuxt prepare` generates `.nuxt`.

- [ ] **Step 2: Build project**

Run: `npm run build`

Expected: Nuxt build completes successfully and Nitro output is generated in `.output`.

- [ ] **Step 3: Append progress**

Append `progress.md` with completed work, verification commands, and dev-server status.

- [ ] **Step 4: Start dev server**

Run: `npm run dev`

Expected: Nuxt dev server starts and prints a local URL.

## Self-Review

- Spec coverage: The plan covers root setup, Nuxt config, Tailwind config, SSR page, SPA page, API route, verification, and dev startup.
- Placeholder scan: The plan contains no TBD/TODO placeholders.
- Type consistency: File paths and provided identifiers match across tasks.

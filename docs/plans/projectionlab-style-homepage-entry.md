# ProjectionLab-Style Homepage Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a ProjectionLab-inspired PlanLab landing page at `/`, and move the current financial planning dashboard to `/dashboard` so `Start planning` enters the existing app.

**Architecture:** Keep the existing Nuxt app and financial logic unchanged. Route `/` will opt out of the default sidebar layout and render a standalone landing page; route `/dashboard` will contain the current dashboard UI inside the existing app shell. A focused Playwright smoke test will prove the CTA and route split.

**Tech Stack:** Nuxt, Vue 3 `<script setup>`, Tailwind CSS v4 utility classes, existing CSS component classes, Chart.js through the existing `AssetTrendChart` component, Playwright via `@playwright/test`.

---

This plan follows the canonical project plan location described in `C:\Users\User\.codex\docs\PLANS.md`, because this repository does not currently include a local `docs/PLANS.md`.

## Purpose / Big Picture

Today, visiting `/` opens the working dashboard directly. After this change, a user first sees a polished public PlanLab homepage inspired by ProjectionLab's dark hero and product-preview composition. Pressing `Start planning` takes the user to `/dashboard`, where the existing interactive planning functionality still works.

## Progress

- [x] (2026-06-17 13:55 +08:00) Approved option A: standalone landing page at `/`, current app at `/dashboard`.
- [x] (2026-06-17 14:03 +08:00) Wrote product spec at `docs/specs/2026-06-17-projectionlab-homepage-entry-design.md`.
- [x] (2026-06-17 14:08 +08:00) Confirmed active branch is `dev`, not `main` or `master`.
- [x] (2026-06-17 14:04 +08:00) Write focused failing homepage-entry test.
- [x] (2026-06-17 14:11 +08:00) Move current dashboard page to `/dashboard`.
- [x] (2026-06-17 14:14 +08:00) Replace `/` with standalone ProjectionLab-style landing page.
- [x] (2026-06-17 14:15 +08:00) Update sidebar route and metadata.
- [x] (2026-06-17 14:22 +08:00) Run focused test, build, and runtime smoke checks.
- [x] (2026-06-17 14:23 +08:00) Update progress and feature state after verification.

## Surprises & Discoveries

- Observation: The browser companion server could not bind to localhost inside the sandbox.
  Evidence: Foreground server startup failed with `listen EACCES: permission denied 127.0.0.1:52555`; an escalated hidden Node process served the mockup successfully at `http://localhost:53951`.
- Observation: Existing ports `3000` and `3001` are not clean verification targets during planning.
  Evidence: `Invoke-WebRequest` to both ports timed out, so runtime checks should use a newly started explicit port.
- Observation: The focused homepage-entry test produced a valid RED result before app code changed.
  Evidence: `$env:TARGET_URL='http://127.0.0.1:3100'; npm run test:homepage-entry` failed with `waiting for getByRole('link', { name: 'Start planning' }).first() to be visible`.
- Observation: The focused homepage-entry test passed after the route split and landing page implementation.
  Evidence: `$env:TARGET_URL='http://127.0.0.1:3100'; npm run test:homepage-entry` exited 0.
- Observation: Existing `test:home-trend` needed to follow the moved dashboard route.
  Evidence: Before updating the test, `$env:TARGET_URL='http://127.0.0.1:3100'; npm run test:home-trend` failed waiting for `.period-tabs .ptab` on `/`; after changing the test to `/dashboard`, it exited 0.
- Observation: The new landing page introduced three low-contrast preview labels.
  Evidence: `npm run audit:contrast` reported three 4.34/4.5 failures on `Total assets`, `FI path`, and `Home plan`; after darkening preview label text, `Contrast failures: 0`.

## Decision Log

- Decision: Use `/dashboard` as the app entry route.
  Rationale: It preserves `/` as a public landing page while keeping the existing app shell and current dashboard behavior available through a clear product route.
  Date/Author: 2026-06-17 / Codex.
- Decision: Use native CSS/HTML shapes for the hero product preview instead of ProjectionLab screenshots.
  Rationale: The user asked to reference the UI layout, not copy proprietary assets. Native shapes keep the page editable, local, and branded as PlanLab.
  Date/Author: 2026-06-17 / Codex.
- Decision: Execute on the current `dev` branch rather than creating a linked worktree.
  Rationale: The current checkout is already on a non-production branch and contains the approved spec/state edits for this WIP; splitting into a new worktree would separate the plan from the active state.
  Date/Author: 2026-06-17 / Codex.

## Outcomes & Retrospective

Completed. `/` now renders the standalone ProjectionLab-style PlanLab landing page. `Start planning` links enter `/dashboard`, where the existing dashboard functionality now lives. `/stocks`, `/house`, `/details`, and `/settings` continue to load inside the app shell. Verification passed with focused Playwright tests, contrast audit, production build, screenshot sanity checks, and HTTP marker smoke checks.

## Context and Orientation

This repository is a Nuxt application. `app/app.vue` wraps every route in `<NuxtLayout><NuxtPage /></NuxtLayout>`. `app/layouts/default.vue` defines the existing app shell: sidebar, topbar, footer, and navigation links. `app/pages/index.vue` currently contains the dashboard page with total assets, asset trend, and allocation. Other app pages are `app/pages/stocks.vue`, `app/pages/house.vue`, `app/pages/details.vue`, and `app/pages/settings.vue`.

Nuxt supports route-level layout control from a page by calling `definePageMeta({ layout: false })` inside `<script setup>`. This lets `/` render a full landing page without the default sidebar. A new file `app/pages/dashboard.vue` will use the current dashboard content so it continues to render inside the default layout.

Existing verification scripts live in `scripts/`. They use Playwright with Microsoft Edge through `@playwright/test`. Add one focused script, `scripts/test-homepage-entry.mjs`, and expose it through `package.json` as `test:homepage-entry`.

## Plan of Work

First, create the focused Playwright script. It should visit `/`, require `Start planning`, ensure the CTA link points to `/dashboard`, click it, and require dashboard text after navigation. It should also check `/stocks`, `/house`, `/details`, and `/settings` still load. Run it before production code changes against a fresh Nuxt dev server and expect it to fail because `/` is still the dashboard and `/dashboard` does not exist.

Second, copy the current `app/pages/index.vue` dashboard implementation into `app/pages/dashboard.vue`. Change only the `useHead` title from `首頁 | PlanLab` to `Dashboard | PlanLab` or `儀表板 | PlanLab`.

Third, replace `app/pages/index.vue` with a standalone landing page. The page should call `definePageMeta({ layout: false })`, render a dark first viewport, include top navigation, a centered hero, `Start planning` as a `NuxtLink` to `/dashboard`, and a native product-preview visual that resembles the existing dashboard without copying ProjectionLab assets.

Fourth, update `app/layouts/default.vue` so the sidebar "首頁" item points to `/dashboard`. Leave other app routes unchanged.

Fifth, run the focused test again and expect it to pass. Then run `npm run build`. Finally, start or reuse a clean server and verify the representative routes return expected text.

## Concrete Steps

### Task 1: Add Failing Homepage-Entry Test

**Files:**
- Create: `scripts/test-homepage-entry.mjs`
- Modify: `package.json`

- [ ] **Step 1: Create `scripts/test-homepage-entry.mjs`.**

  Add a Playwright script that uses `TARGET_URL` or defaults to `http://127.0.0.1:3000`. The script should:

      import { chromium } from '@playwright/test'

      const baseUrl = process.env.TARGET_URL ?? 'http://127.0.0.1:3000'

      const browser = await chromium.launch({
        channel: process.env.PLAYWRIGHT_CHANNEL ?? 'msedge',
        headless: true,
      })

      const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

      const fail = async (message) => {
        await browser.close()
        throw new Error(message)
      }

      await page.goto(new URL('/', baseUrl).toString(), { waitUntil: 'networkidle' })

      const cta = page.getByRole('link', { name: 'Start planning' }).first()
      await cta.waitFor({ state: 'visible' })

      const href = await cta.getAttribute('href')
      if (href !== '/dashboard') {
        await fail(`Expected Start planning href to be /dashboard, got ${href}`)
      }

      await cta.click()
      await page.waitForURL('**/dashboard')

      for (const text of ['財務成果總覽', '總資產', '資產變化趨勢', '資產配置']) {
        await page.getByText(text, { exact: false }).first().waitFor({ state: 'visible' })
      }

      const expectedRoutes = [
        ['/', 'Build Financial Plans You Love'],
        ['/dashboard', '財務成果總覽'],
        ['/stocks', '投資基本設定'],
        ['/house', '買房規劃'],
        ['/details', '年度收支明細'],
        ['/settings', '本金設定'],
      ]

      for (const [route, marker] of expectedRoutes) {
        await page.goto(new URL(route, baseUrl).toString(), { waitUntil: 'networkidle' })
        await page.getByText(marker, { exact: false }).first().waitFor({ state: 'visible' })
      }

      await browser.close()

- [ ] **Step 2: Add the package script.**

  In `package.json`, add:

      "test:homepage-entry": "node scripts/test-homepage-entry.mjs"

- [ ] **Step 3: Run the new test before production code changes.**

  Start a clean Nuxt dev server on an explicit port, for example 3100, then run:

      $env:TARGET_URL='http://127.0.0.1:3100'; npm run test:homepage-entry

  Expected RED result: the test fails because `Start planning` is not visible on `/`, or `/dashboard` cannot show the dashboard yet. This failure proves the test covers the new behavior.

### Task 2: Move Current Dashboard To `/dashboard`

**Files:**
- Create: `app/pages/dashboard.vue`

- [ ] **Step 1: Copy the current dashboard page.**

  Copy the full current contents of `app/pages/index.vue` into `app/pages/dashboard.vue`.

- [ ] **Step 2: Update the page title in the copied file.**

  In `app/pages/dashboard.vue`, set:

      useHead({
        title: '儀表板 | PlanLab',
      })

  Leave the template markers `財務成果總覽`, `總資產`, `資產變化趨勢`, and `資產配置` intact.

### Task 3: Build Standalone Landing Page At `/`

**Files:**
- Modify: `app/pages/index.vue`

- [ ] **Step 1: Replace the dashboard page with a standalone landing page.**

  The new page must call:

      definePageMeta({
        layout: false,
      })

  It must render:

  - A top navigation with `PlanLab`, `Features`, `Planning`, `Resources`, and `Start planning`.
  - A centered hero headline: `Build Financial Plans You Love`.
  - Supporting copy for PlanLab's investing, home planning, and long-term projection use case.
  - A primary `NuxtLink` to `/dashboard` with visible text `Start planning`.
  - A native dashboard-preview visual with chart bars, metric cards, and planning markers.

- [ ] **Step 2: Keep landing styles local.**

  Add a `<style scoped>` block in `app/pages/index.vue` for the landing-specific preview shapes and responsive layout. Do not change financial projection logic or global dashboard CSS for this task.

### Task 4: Update App Navigation

**Files:**
- Modify: `app/layouts/default.vue`

- [ ] **Step 1: Change the sidebar home route.**

  In `navItems`, change:

      { to: '/', label: '首頁', icon: IconLayoutDashboard },

  to:

      { to: '/dashboard', label: '首頁', icon: IconLayoutDashboard },

  Keep `/stocks`, `/house`, `/details`, and `/settings` unchanged.

### Task 5: Verify And Close Out

**Files:**
- Modify: `docs/plans/projectionlab-style-homepage-entry.md`
- Modify: `docs/progress.md`
- Modify: `docs/feature_list.json`

- [ ] **Step 1: Run focused verification.**

  With a clean server available at `http://127.0.0.1:3100`, run:

      $env:TARGET_URL='http://127.0.0.1:3100'; npm run test:homepage-entry

  Expected GREEN result: the command exits 0.

- [ ] **Step 2: Run the build.**

  Run:

      npm run build

  Expected result: Nuxt build completes successfully. Existing Nuxt/Tailwind sourcemap warnings are acceptable if the build exits 0.

- [ ] **Step 3: Run runtime content checks.**

  Request `/`, `/dashboard`, `/stocks`, `/house`, `/details`, and `/settings` from the clean server. Expected markers are:

      /          -> Build Financial Plans You Love, Start planning
      /dashboard -> 財務成果總覽, 總資產, 資產變化趨勢, 資產配置
      /stocks    -> 投資基本設定
      /house     -> 買房規劃
      /details   -> 年度收支明細
      /settings  -> 本金設定

- [ ] **Step 4: Update workflow state.**

  Append `docs/progress.md` with the implementation, verification commands, and exact pass/fail results. Mark `projectionlab-style-homepage-entry` completed in `docs/feature_list.json` only after verification passes.

## Validation and Acceptance

Acceptance is user-visible. Opening `/` should show the landing homepage, not the app sidebar. Clicking `Start planning` should navigate to `/dashboard`. Opening `/dashboard` should show the same dashboard functionality that previously lived on `/`. Existing routes `/stocks`, `/house`, `/details`, and `/settings` should continue to load inside the app shell.

The required commands are:

    $env:TARGET_URL='http://127.0.0.1:3100'; npm run test:homepage-entry
    npm run build

The required runtime checks are HTTP 200 responses and expected text markers for `/`, `/dashboard`, `/stocks`, `/house`, `/details`, and `/settings`.

## Idempotence and Recovery

The page move is additive first: `app/pages/dashboard.vue` is created before replacing `app/pages/index.vue`. If the landing page replacement fails, restore `app/pages/index.vue` from `app/pages/dashboard.vue` and retry the landing edit. The new test script is safe to rerun. If port 3100 is occupied, start Nuxt on another free port and set `TARGET_URL` to that port.

## Artifacts and Notes

The approved spec is `docs/specs/2026-06-17-projectionlab-homepage-entry-design.md`. The active feature id is `projectionlab-style-homepage-entry`.

Verification evidence:

    $env:TARGET_URL='http://127.0.0.1:3100'; npm run test:homepage-entry
    Result: passed.

    $env:TARGET_URL='http://127.0.0.1:3100'; npm run test:home-trend
    Result: passed.

    $env:TARGET_URL='http://127.0.0.1:3100'; npm run audit:contrast
    Result: passed with Contrast failures: 0.

    npm run build
    Result: passed outside the sandbox. The sandboxed build failed with `EPERM: operation not permitted, readlink 'C:\Users\User'`, which is the known OneDrive/sandbox path issue.

    Runtime HTTP marker check against http://127.0.0.1:3100
    Result: `/`, `/dashboard`, `/stocks`, `/house`, `/details`, and `/settings` returned HTTP 200 with expected text markers.

    Playwright screenshot sanity check
    Result: desktop and mobile screenshots showed brand, CTA, product preview, no horizontal overflow, and no Nuxt DevTools overlay.

## Interfaces and Dependencies

No new dependencies are required. Use Nuxt's existing `NuxtLink`, `definePageMeta`, and `useHead`. Use existing `AssetTrendChart` only in `app/pages/dashboard.vue` through the copied dashboard implementation. The landing page product preview should be static HTML/CSS and should not depend on Chart.js.

## Revision Notes

- 2026-06-17 / Codex: Updated the plan during execution to record RED/GREEN test evidence, route-test maintenance, contrast findings, final verification results, and completed workflow state.

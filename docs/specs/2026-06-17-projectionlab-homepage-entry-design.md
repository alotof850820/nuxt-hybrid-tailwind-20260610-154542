# ProjectionLab-Style Homepage Entry Design

## Goal

Create a public-facing PlanLab homepage inspired by the structure and visual rhythm of ProjectionLab's homepage, while keeping PlanLab's existing financial-planning dashboard intact.

## Approved Approach

Use the approved "Marketing landing + app route" approach:

- `/` becomes a standalone landing page with a dark hero, top navigation, strong headline, supporting copy, primary `Start planning` call to action, and a product-preview visual.
- `Start planning` routes to `/dashboard`.
- The current homepage functionality moves to `/dashboard` and remains inside the existing app shell with sidebar, topbar, footer, total assets, asset trend, and allocation sections.

This matches the user's selected option A from the visual companion mockup.

## Reference Direction

Reference: `https://projectionlab.com/`, reviewed on 2026-06-17.

Use ProjectionLab as a layout and hierarchy reference, not as a brand or asset source. The relevant patterns are:

- A dark, high-contrast first viewport.
- A compact top navigation with brand, navigation links, and a prominent CTA.
- Centered hero copy with a short value proposition.
- A product-preview/dashboard visual below the CTA.
- A direct path from homepage CTA into the planning product.

## User Experience

The landing page should make PlanLab feel like a polished financial-planning product before the user enters the tool. The first screen should clearly show:

- Brand: `PlanLab`.
- Main headline: a PlanLab-specific financial planning promise.
- Supporting text describing simulation, investing, home planning, and long-term asset projection.
- Primary CTA: `Start planning`.
- Secondary cue that no external account linking is required.
- Product visual using native CSS/HTML shapes that resembles the existing PlanLab dashboard, with chart bars, small cards, and financial metrics.

Clicking `Start planning` should navigate immediately to `/dashboard`, where the existing interactive planning functionality appears.

## Routing And Layout

- Add a route-level layout choice so `/` can render without the existing app sidebar shell.
- Add `/dashboard` for the current dashboard page.
- Update the app sidebar home item to point to `/dashboard`.
- Keep `/stocks`, `/house`, `/details`, and `/settings` unchanged.
- Ensure active navigation still resolves correctly when the user is inside app routes.

## Visual System

- Landing background: deep near-black with subtle blue and violet accents.
- Surfaces: glassy dark cards and light dashboard preview surfaces.
- Accent colors: blue for primary action, teal/cyan for growth bars, violet for projected planning, amber for milestones.
- Border radius: keep cards and controls at 8px or less where practical.
- Typography: hero-scale type only in the landing hero; existing dense dashboard type remains in the app shell.
- Avoid using ProjectionLab logos, screenshots, or proprietary assets.

## Accessibility And Responsiveness

- CTA must be keyboard reachable and have clear focus states.
- Hero text and CTA must maintain strong contrast against the dark background.
- The page must work on mobile by stacking navigation and preview content without overlapping text.
- Product preview should be decorative where appropriate and not block screen-reader access to the CTA.

## Verification

After implementation:

- Run `npm run build`.
- Verify `/` returns HTTP 200 and contains landing text plus `Start planning`.
- Verify `/dashboard` returns HTTP 200 and contains the current dashboard markers: `財務成果總覽`, `總資產`, `資產變化趨勢`, and `資產配置`.
- Verify `/stocks`, `/house`, `/details`, and `/settings` continue to return HTTP 200.

## Non-Goals

- Do not implement a full multi-section marketing site.
- Do not change financial projection formulas.
- Do not copy ProjectionLab branding, images, copy, or private UI assets.
- Do not add authentication or account creation.

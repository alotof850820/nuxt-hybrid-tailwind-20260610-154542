# PlanLab UI Style Refresh Design

## Goal

Match the local Nuxt dashboard UI to the provided `planlab_dashboard_v3.html` reference while preserving the existing page architecture and financial logic.

## Scope

- Use Tabler-style icons for sidebar navigation, topbar breadcrumb, notification control, and KPI deltas.
- Keep the dark compact sidebar, 50px topbar, 36px footer, white cards, subtle borders, and low-saturation slate text from the reference.
- Use shared CSS component classes for page headers, KPI cards, cards, period tabs, Chart.js chart area, allocation bars, tables, tags, and range fields.
- Update the home page to use a compact total-assets KPI, reference-style period tabs, a shorter Chart.js trend chart, and segmented asset allocation.
- Update the stocks page to use the reference KPI row, stock table, and rating tag colors.
- Apply the same shared visual system to settings, house planning, and annual details pages.

## Non-Goals

- Do not change financial projection formulas.
- Do not change the existing sidebar route structure.
- Do not embed the raw HTML reference into Nuxt.

## Implementation Notes

- `@tabler/icons-vue` is used because the reference HTML uses `ti ti-*` Tabler icon semantics.
- Icons are imported through individual ESM icon files to avoid bundling or transforming the entire icon set.
- Chart.js remains the chart engine; its styling is adjusted to match the reference line chart: no legend, thin blue stroke, small points, light Y grid, and compact tick labels.

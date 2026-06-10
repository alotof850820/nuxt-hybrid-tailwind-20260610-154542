# ProjectionLab-Style Dashboard Layout Design

## Goal

Create a new Figma design file that presents a financial-planning dashboard layout framework inspired by ProjectionLab's product structure, without copying brand assets or exact proprietary UI.

## Selected Direction

Use a dashboard workbench layout:

- Persistent dark left navigation for major planning areas.
- Thin top toolbar for plan context, scenario selection, range, currency, and primary actions.
- Chart-first main canvas for net worth and progress projection.
- Compact KPI row for current financial state.
- Right summary rail for current finances, account breakdown, assumptions, and milestones.
- Bottom module cards for income, expenses, investments, and goals.

This direction best fits a financial projection product because it keeps the timeline/chart as the primary planning surface while leaving room for editable assumptions and scenario modules.

## Visual Structure

The Figma file contains one desktop frame at 1440 by 1024:

- Sidebar: Dashboard, Current Finances, Plans, Goals, Milestones, Reports, Help Center, Settings, Integrations.
- Topbar: breadcrumb, base plan selector, projection range, currency, and Add Plan action.
- Main area: title, subtitle, four KPI cards, large projection chart with event markers and hover detail.
- Right rail: current finances rings, accounts list, assumptions, and milestone list.
- Lower modules: Income, Expenses, Investments, Goals.
- Token note frame: color swatches and structural handoff notes.

## Style Notes

- Use a neutral white and light-gray workspace with thin borders.
- Use dark blue-gray only for persistent navigation.
- Use teal for progress, blue for assets, purple for projection, and amber for events or liabilities.
- Keep card radius at 8px.
- Keep typography dense and dashboard-oriented rather than marketing-oriented.

## Figma Output

File: https://www.figma.com/design/uV2OZXmmHEkDZFDSWfRD3g

Primary page: `ProjectionLab-style Layout Final`

Primary frame: `Desktop Dashboard - ProjectionLab-style Layout`

## Verification

- Created a new Figma design file in the `practice` plan.
- Searched available Figma design-system assets; no reusable local components, variables, or styles were returned.
- Wrote the dashboard layout with editable Figma text, shape, vector, and frame layers.
- Corrected failed Figma API attempts caused by text alignment and non-string text values, then recreated a clean final page.

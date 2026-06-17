<script setup lang="ts">
definePageMeta({
  layout: false,
})

useHead({
  title: 'PlanLab | Financial Planning',
  meta: [
    {
      name: 'description',
      content: 'PlanLab helps you model investments, home planning, and long-term asset projections.',
    },
  ],
})

const previewBars = [28, 36, 46, 58, 72, 88, 104, 126, 148, 174, 202, 232]
const milestoneDots = [
  { left: '16%', bottom: '29%', color: '#f59e0b' },
  { left: '34%', bottom: '43%', color: '#8b5cf6' },
  { left: '55%', bottom: '58%', color: '#22c55e' },
  { left: '75%', bottom: '74%', color: '#38bdf8' },
]
</script>

<template>
  <main class="landing-page">
    <nav class="landing-nav" aria-label="PlanLab">
      <NuxtLink class="brand" to="/" aria-label="PlanLab homepage">
        <span class="brand-mark">P</span>
        <span>PlanLab</span>
      </NuxtLink>

      <div class="nav-links" aria-label="Landing sections">
        <a href="#features">Features</a>
        <a href="#planning">Planning</a>
        <a href="#resources">Resources</a>
      </div>

      <NuxtLink class="nav-cta" to="/dashboard">Start planning</NuxtLink>
    </nav>

    <section class="hero-section" aria-labelledby="hero-title">
      <p class="eyebrow">Personal finance simulator</p>
      <h1 id="hero-title">Build Financial Plans You Love</h1>
      <p class="hero-copy">
        Simulate investments, home milestones, and long-term asset paths in one calm planning workspace.
      </p>

      <div class="hero-actions">
        <NuxtLink class="primary-cta" to="/dashboard">Start planning</NuxtLink>
        <span class="privacy-note">No account linking required</span>
      </div>

      <section class="product-preview" aria-label="PlanLab dashboard preview">
        <div class="preview-sidebar" aria-hidden="true">
          <span class="mini-logo">P</span>
          <span class="side-line active" />
          <span class="side-line" />
          <span class="side-line" />
          <span class="side-line short" />
        </div>

        <div class="preview-main">
          <div class="preview-topbar">
            <span>Current Plan</span>
            <span>42Y projection</span>
          </div>

          <div class="preview-summary">
            <article>
              <span>Total assets</span>
              <strong>8,420 萬</strong>
            </article>
            <article>
              <span>FI path</span>
              <strong>87%</strong>
            </article>
            <article>
              <span>Home plan</span>
              <strong>Year 8</strong>
            </article>
          </div>

          <div class="preview-chart">
            <div class="axis y" />
            <div class="axis x" />
            <span
              v-for="dot in milestoneDots"
              :key="`${dot.left}-${dot.bottom}`"
              class="milestone-dot"
              :style="{ left: dot.left, bottom: dot.bottom, background: dot.color }"
            />
            <span
              v-for="(bar, index) in previewBars"
              :key="index"
              class="preview-bar"
              :style="{ height: `${bar}px` }"
            />
          </div>
        </div>

        <aside class="preview-ledger">
          <div class="ledger-header">
            <span>Today</span>
            <strong>Snapshot</strong>
          </div>
          <div class="ledger-row">
            <span>Stocks</span>
            <strong>64%</strong>
          </div>
          <div class="ledger-row">
            <span>House</span>
            <strong>23%</strong>
          </div>
          <div class="ledger-row">
            <span>Cash flow</span>
            <strong>+12%</strong>
          </div>
          <div class="ledger-total">
            <span>Confidence</span>
            <strong>High</strong>
          </div>
        </aside>
      </section>
    </section>

    <section id="features" class="feature-strip" aria-label="PlanLab planning areas">
      <div>
        <span class="strip-kicker">Investing</span>
        <strong>Stock projections</strong>
      </div>
      <div id="planning">
        <span class="strip-kicker">Milestones</span>
        <strong>Home planning</strong>
      </div>
      <div id="resources">
        <span class="strip-kicker">Details</span>
        <strong>Annual cash flow</strong>
      </div>
    </section>
  </main>
</template>

<style scoped>
.landing-page {
  min-height: 100vh;
  overflow-x: hidden;
  background:
    linear-gradient(180deg, #06080f 0%, #0b101a 56%, #10141d 100%),
    #06080f;
  color: #f8fafc;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

.landing-nav {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  width: min(1160px, calc(100% - 32px));
  margin: 0 auto;
  padding: 22px 0 10px;
}

.brand,
.nav-links a,
.nav-cta,
.primary-cta {
  color: inherit;
  text-decoration: none;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  width: max-content;
  font-size: 15px;
  font-weight: 700;
}

.brand-mark,
.mini-logo {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: #4f46e5;
  color: #fff;
  font-size: 13px;
  font-weight: 800;
  box-shadow: 0 0 0 1px rgb(255 255 255 / 0.1);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 26px;
  color: #aab6ca;
  font-size: 13px;
}

.nav-links a {
  transition: color 0.16s ease;
}

.nav-links a:hover,
.nav-links a:focus-visible {
  color: #f8fafc;
}

.nav-cta {
  justify-self: end;
  border: 1px solid rgb(255 255 255 / 0.14);
  border-radius: 999px;
  padding: 9px 15px;
  background: #eef4ff;
  color: #0f172a;
  font-size: 13px;
  font-weight: 800;
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease;
}

.hero-section {
  position: relative;
  width: min(1160px, calc(100% - 32px));
  min-height: calc(100vh - 72px);
  margin: 0 auto;
  padding: 64px 0 34px;
  text-align: center;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  margin: 0;
  border: 1px solid rgb(93 135 255 / 0.34);
  border-radius: 999px;
  padding: 5px 12px;
  background: rgb(30 41 59 / 0.72);
  color: #a8c7ff;
  font-size: 12px;
  font-weight: 700;
}

h1 {
  max-width: 760px;
  margin: 18px auto 0;
  color: #ffffff;
  font-size: clamp(44px, 8vw, 92px);
  font-weight: 850;
  line-height: 0.96;
  letter-spacing: 0;
}

.hero-copy {
  max-width: 620px;
  margin: 20px auto 0;
  color: #c2cbe0;
  font-size: 18px;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 26px;
}

.primary-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  border-radius: 999px;
  padding: 0 22px;
  background: #f8fafc;
  color: #0b1020;
  font-size: 14px;
  font-weight: 850;
  box-shadow: 0 18px 42px rgb(56 189 248 / 0.2);
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease;
}

.primary-cta:hover,
.primary-cta:focus-visible,
.nav-cta:hover,
.nav-cta:focus-visible {
  transform: translateY(-1px);
  box-shadow: 0 18px 44px rgb(59 130 246 / 0.26);
  outline: none;
}

.primary-cta:focus-visible,
.nav-cta:focus-visible,
.brand:focus-visible {
  outline: 3px solid rgb(56 189 248 / 0.45);
  outline-offset: 3px;
}

.privacy-note {
  color: #9aa8bd;
  font-size: 13px;
}

.product-preview {
  position: relative;
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr) 224px;
  width: min(980px, 100%);
  min-height: 392px;
  margin: 52px auto 0;
  overflow: hidden;
  border: 1px solid rgb(148 163 184 / 0.24);
  border-radius: 8px;
  background: #f8fbff;
  box-shadow:
    0 34px 80px rgb(15 23 42 / 0.56),
    0 0 0 1px rgb(255 255 255 / 0.06);
  color: #0f172a;
  text-align: left;
}

.preview-sidebar {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
  padding: 20px 14px;
  background: #162033;
}

.side-line {
  display: block;
  width: 38px;
  height: 7px;
  border-radius: 999px;
  background: #536178;
}

.side-line.active {
  background: #8db7ff;
}

.side-line.short {
  width: 24px;
  margin-top: auto;
}

.preview-main {
  min-width: 0;
  padding: 18px;
  background: #eef4ff;
}

.preview-topbar,
.preview-summary,
.preview-chart,
.preview-ledger {
  border: 1px solid #d6deed;
  border-radius: 8px;
  background: #ffffff;
}

.preview-topbar {
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  color: #64748b;
  font-size: 12px;
}

.preview-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 12px;
  padding: 12px;
}

.preview-summary article {
  border-radius: 6px;
  background: #f1f5f9;
  padding: 10px;
}

.preview-summary span,
.ledger-row span,
.ledger-header span,
.ledger-total span {
  display: block;
  color: #475569;
  font-size: 11px;
  font-weight: 700;
}

.preview-summary strong,
.ledger-row strong,
.ledger-header strong,
.ledger-total strong {
  display: block;
  margin-top: 4px;
  color: #0f172a;
  font-size: 15px;
}

.preview-chart {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 224px;
  margin-top: 12px;
  padding: 22px 18px 24px 28px;
}

.preview-chart::before {
  position: absolute;
  inset: 24px 18px 34px 28px;
  content: "";
  background-image:
    linear-gradient(#dbe4f0 1px, transparent 1px),
    linear-gradient(90deg, #dbe4f0 1px, transparent 1px);
  background-size: 100% 42px, 54px 100%;
}

.axis {
  position: absolute;
  background: #94a3b8;
}

.axis.y {
  top: 24px;
  bottom: 34px;
  left: 28px;
  width: 1px;
}

.axis.x {
  right: 18px;
  bottom: 34px;
  left: 28px;
  height: 1px;
}

.preview-bar {
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 10px;
  border-radius: 5px 5px 0 0;
  background: linear-gradient(180deg, #22d3ee 0%, #3b82f6 56%, #8b5cf6 100%);
}

.milestone-dot {
  position: absolute;
  z-index: 2;
  width: 11px;
  height: 11px;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 3px 10px rgb(15 23 42 / 0.18);
}

.preview-ledger {
  margin: 18px 18px 18px 0;
  padding: 14px;
}

.ledger-header {
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.ledger-row,
.ledger-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 0;
  border-bottom: 1px solid #edf2f7;
}

.ledger-row strong,
.ledger-total strong {
  margin-top: 0;
}

.ledger-total {
  border-bottom: 0;
}

.feature-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  width: min(1160px, calc(100% - 32px));
  margin: 0 auto;
  padding: 0 0 40px;
}

.feature-strip div {
  min-height: 104px;
  border: 1px solid rgb(148 163 184 / 0.18);
  background: rgb(15 23 42 / 0.52);
  padding: 18px;
}

.feature-strip div:first-child {
  border-radius: 8px 0 0 8px;
}

.feature-strip div:last-child {
  border-radius: 0 8px 8px 0;
}

.strip-kicker {
  display: block;
  color: #8db7ff;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.feature-strip strong {
  display: block;
  margin-top: 8px;
  color: #f8fafc;
  font-size: 16px;
}

@media (max-width: 880px) {
  .landing-nav {
    grid-template-columns: 1fr auto;
    row-gap: 16px;
  }

  .nav-links {
    grid-row: 2;
    grid-column: 1 / -1;
    justify-content: center;
    gap: 18px;
  }

  .hero-section {
    min-height: auto;
    padding-top: 42px;
  }

  h1 {
    font-size: clamp(42px, 13vw, 64px);
  }

  .hero-copy {
    font-size: 16px;
  }

  .product-preview {
    grid-template-columns: 58px minmax(0, 1fr);
  }

  .preview-ledger {
    grid-column: 1 / -1;
    margin: 0 18px 18px;
  }

  .preview-summary {
    grid-template-columns: 1fr;
  }

  .feature-strip {
    grid-template-columns: 1fr;
  }

  .feature-strip div,
  .feature-strip div:first-child,
  .feature-strip div:last-child {
    border-radius: 8px;
  }
}

@media (max-width: 560px) {
  .landing-nav {
    width: min(100% - 24px, 1160px);
  }

  .nav-cta {
    padding: 8px 11px;
    font-size: 12px;
  }

  .nav-links {
    overflow-x: auto;
    justify-content: flex-start;
    padding-bottom: 2px;
  }

  .hero-section {
    width: min(100% - 24px, 1160px);
    padding-top: 32px;
  }

  .hero-actions {
    flex-direction: column;
    gap: 10px;
  }

  .primary-cta {
    width: 100%;
  }

  .product-preview {
    grid-template-columns: 1fr;
    margin-top: 36px;
  }

  .preview-sidebar {
    display: none;
  }

  .preview-main {
    padding: 12px;
  }

  .preview-chart {
    height: 190px;
    gap: 5px;
    padding-left: 20px;
  }

  .preview-chart::before {
    left: 20px;
  }

  .axis.y {
    left: 20px;
  }

  .axis.x {
    left: 20px;
  }
}
</style>

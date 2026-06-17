<script setup lang="ts">
import IconArrowUpRight from '@tabler/icons-vue/dist/esm/icons/IconArrowUpRight.mjs'

const plan = useFinancialPlan()

const periodLabel = computed(() => `${plan.totalYears.value}Y`)
const chartRows = computed(() => plan.yearlyData.value)

const allocationTotal = computed(() => plan.finalValue.value)
const allocationPercentBase = computed(() => Math.max(allocationTotal.value, 1))
const allocationItems = computed(() => plan.stockAssetBreakdown.value)

const allocationPercent = (value: number) => Math.round((value / allocationPercentBase.value) * 100)
const allocationAmount = (value: number) => `${plan.formatWan(value)} 萬`

useHead({
  title: '儀表板 | PlanLab',
})
</script>

<template>
  <div class="page-shell space-y-4">
    <header class="mb-[18px]">
      <h1 class="page-title">財務成果總覽</h1>
      <p class="page-sub">2026年6月11日 · 即時更新</p>
    </header>

    <section class="kpi-grid grid-cols-1">
      <article class="kpi">
        <p class="kpi-label">總資產</p>
        <p class="kpi-value">{{ plan.formatWan(plan.finalValue.value) }} 萬</p>
        <p class="kpi-delta up">
          <IconArrowUpRight class="size-3" :stroke="2" aria-hidden="true" />
          規劃 {{ plan.totalYears.value }} 年後
        </p>
      </article>
    </section>

    <section class="card">
      <div class="card-hd">
        <h2 class="card-title">資產變化趨勢</h2>
        <div class="period-tabs" aria-label="圖表期間">
          <button
            :aria-label="`股票頁規劃年數 ${plan.totalYears.value} 年`"
            aria-current="true"
            class="ptab active"
            disabled
            type="button"
          >
            {{ periodLabel }}
          </button>
        </div>
      </div>

      <div class="chart-area">
        <AssetTrendChart :rows="chartRows" />
      </div>
    </section>

    <section class="card alloc-card">
      <div class="card-hd">
        <h2 class="card-title">資產配置</h2>
        <p class="alloc-total-label">配置總額 {{ allocationAmount(allocationTotal) }}</p>
      </div>

      <div class="alloc-visual">
        <div class="alloc-chart-wrap">
          <AssetAllocationChart
            :items="allocationItems"
            :total="allocationTotal"
          />
        </div>

        <div class="alloc-list">
          <div v-for="item in allocationItems" :key="item.label" class="alloc-item">
            <span class="alloc-dot" :style="{ background: item.color }" />
            <span class="alloc-name">{{ item.label }}</span>
            <span class="alloc-amount">{{ allocationAmount(item.value) }}</span>
            <span class="alloc-track">
              <span
                class="alloc-fill block"
                :style="{ width: `${allocationPercent(item.value)}%`, background: item.color }"
              />
            </span>
            <span class="alloc-pct">{{ allocationPercent(item.value) }}%</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

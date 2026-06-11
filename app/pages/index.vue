<script setup lang="ts">
import IconArrowUpRight from '@tabler/icons-vue/dist/esm/icons/IconArrowUpRight.mjs'

const plan = useFinancialPlan()

const periodOptions = [
  { label: '10Y', value: 10 },
  { label: '20Y', value: 20 },
  { label: '30Y', value: 30 },
  { label: '全部', value: 0 },
]

const selectedPeriod = ref(0)

const chartRows = computed(() => {
  if (!selectedPeriod.value) return plan.yearlyData.value
  return plan.yearlyData.value.filter((row) => row.year <= selectedPeriod.value)
})

const stockAllocation = computed(() => Math.max(plan.finalValue.value, 0))
const houseAllocation = computed(() => (plan.buyHouse.value ? Math.max(plan.totalHouseExpense.value, 0) : 0))
const allocationTotal = computed(() => Math.max(stockAllocation.value + houseAllocation.value, 1))

const allocationItems = computed(() => [
  {
    label: '股票',
    value: stockAllocation.value,
    color: '#3b82f6',
  },
  {
    label: '買房',
    value: houseAllocation.value,
    color: '#f59e0b',
  },
])

const allocationPercent = (value: number) => Math.round((value / allocationTotal.value) * 100)

useHead({
  title: '首頁 | PlanLab',
})
</script>

<template>
  <div class="page-shell space-y-4">
    <header class="mb-[18px]">
      <h1 class="page-title">財務成果總覽</h1>
      <p class="page-sub">總資產、資產變化趨勢與資產配置</p>
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
            v-for="period in periodOptions"
            :key="period.label"
            class="ptab"
            :class="{ active: selectedPeriod === period.value }"
            type="button"
            @click="selectedPeriod = period.value"
          >
            {{ period.label }}
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
      </div>

      <div class="seg-row">
        <span
          v-for="item in allocationItems"
          :key="item.label"
          class="seg-bar"
          :style="{ width: `${allocationPercent(item.value)}%`, background: item.color }"
        />
      </div>

      <div class="alloc-list">
        <div v-for="item in allocationItems" :key="item.label" class="alloc-item">
          <span class="alloc-dot" :style="{ background: item.color }" />
          <span class="alloc-name">{{ item.label }}</span>
          <span class="alloc-track">
            <span
              class="alloc-fill block"
              :style="{ width: `${allocationPercent(item.value)}%`, background: item.color }"
            />
          </span>
          <span class="alloc-pct">{{ allocationPercent(item.value) }}%</span>
        </div>
      </div>
    </section>
  </div>
</template>

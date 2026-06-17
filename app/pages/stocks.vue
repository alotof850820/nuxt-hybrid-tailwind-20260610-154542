<script setup lang="ts">
import IconArrowUpRight from '@tabler/icons-vue/dist/esm/icons/IconArrowUpRight.mjs'

const plan = useFinancialPlan()

const stockDetailItems = computed(() => plan.stockAssetBreakdown.value)
const stockDetailTotal = computed(() => plan.finalValue.value)
const stockDetailPercentBase = computed(() => Math.max(stockDetailTotal.value, 1))
const activeStockDetailLabel = ref<string | null>(null)

const stockDetailPercent = (value: number) => Math.round((value / stockDetailPercentBase.value) * 100)
const stockDetailAmount = (value: number) => `${plan.formatWan(value)} 萬`

const stockMetrics = computed(() => [
  {
    key: 'capital-gain',
    label: '資本利得',
    value: plan.stockCapitalGain.value,
    unit: '萬',
    signed: true,
    detail: `投入成本 ${plan.formatWan(plan.stockContributedCapital.value)} 萬`,
    tone: plan.stockCapitalGain.value >= 0 ? 'up' : 'dn',
    changeTone: plan.stockCapitalGain.value >= 0 ? 'positive' : 'expense',
  },
  {
    key: 'return-rate',
    label: '年化報酬',
    value: plan.returnRate.value,
    suffix: '%',
    detail: `vs 規劃基準 ${Math.max(plan.returnRate.value - 2, 0)}%`,
    tone: 'up',
    changeTone: 'positive',
  },
  {
    key: 'monthly-return',
    label: '本月回報',
    value: 6.1,
    suffix: '%',
    signed: true,
    decimals: 1,
    detail: '上月 +5.2%',
    tone: 'muted',
    changeTone: 'neutral',
  },
])

useHead({
  title: '股票 | PlanLab',
})
</script>

<template>
  <div class="page-shell space-y-4">
    <header class="mb-[18px]">
      <h1 class="page-title">股票</h1>
      <p class="page-sub">追蹤中的股票與 ETF</p>
    </header>

    <section class="kpi-grid grid-cols-1 md:grid-cols-3">
      <AnimatedKpiCard
        v-for="metric in stockMetrics"
        :key="metric.label"
        :change-tone="metric.changeTone"
        :decimals="metric.decimals ?? 0"
        :detail-tone="metric.tone"
        :kpi-key="metric.key"
        :label="metric.label"
        :signed="metric.signed ?? false"
        :suffix="metric.suffix ?? ''"
        :unit="metric.unit ?? ''"
        :value="metric.value"
        :value-tone="metric.tone === 'dn' ? 'dn' : metric.tone === 'muted' ? 'muted' : undefined"
      >
        <template #delta>
          <IconArrowUpRight v-if="metric.tone === 'up'" class="size-3" :stroke="2" aria-hidden="true" />
          {{ metric.detail }}
        </template>
      </AnimatedKpiCard>
    </section>

    <section class="card alloc-card">
      <div class="card-hd">
        <h2 class="card-title">股票資產細節</h2>
        <p class="alloc-total-label">股票總額 {{ stockDetailAmount(stockDetailTotal) }}</p>
      </div>

      <div class="alloc-visual">
        <div class="alloc-chart-wrap">
          <AssetAllocationChart
            :items="stockDetailItems"
            title="股票資產細節圓餅圖"
            :total="stockDetailTotal"
            @hover:item="activeStockDetailLabel = $event"
          />
        </div>

        <div class="alloc-list">
          <div
            v-for="item in stockDetailItems"
            :key="item.label"
            class="alloc-item"
            :class="{ 'is-active': activeStockDetailLabel === item.label }"
          >
            <span class="alloc-dot" :style="{ background: item.color }" />
            <span class="alloc-name">{{ item.label }}</span>
            <span class="alloc-amount">{{ stockDetailAmount(item.value) }}</span>
            <span class="alloc-track">
              <span
                class="alloc-fill block"
                :style="{ width: `${stockDetailPercent(item.value)}%`, background: item.color }"
              />
            </span>
            <span class="alloc-pct">{{ stockDetailPercent(item.value) }}%</span>
          </div>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="card-hd">
        <h2 class="card-title">投資基本設定</h2>
      </div>
      <div class="grid gap-4 lg:grid-cols-3">
        <label class="range-field">
          <span>月投入：{{ plan.monthlyInput.value }} 萬（年投 {{ plan.annualInput.value }} 萬）</span>
          <input v-model.number="plan.monthlyInput.value" class="w-full" type="range" min="0" max="25" step="0.5">
        </label>
        <label class="range-field">
          <span>年化報酬：{{ plan.returnRate.value }}%</span>
          <input v-model.number="plan.returnRate.value" class="w-full" type="range" min="0" max="20" step="1">
        </label>
        <label class="range-field">
          <span>規劃年數：{{ plan.totalYears.value }} 年</span>
          <input v-model.number="plan.totalYears.value" class="w-full" type="range" min="10" max="50" step="1">
        </label>
      </div>
    </section>

    <section class="card">
      <div class="card-hd">
        <h2 class="card-title">投入與提領規劃</h2>
      </div>
      <div class="grid gap-4 lg:grid-cols-2">
        <label class="range-field">
          <span>
            {{ plan.stopInputYear.value > plan.totalYears.value ? '持續投入到最後' : `第 ${plan.stopInputYear.value} 年後停止投入` }}
          </span>
          <input v-model.number="plan.stopInputYear.value" class="w-full" type="range" min="0" :max="plan.totalYears.value + 1" step="1">
        </label>
        <label class="range-field">
          <span>每年提領：{{ plan.withdrawalAmount.value }} 萬</span>
          <input v-model.number="plan.withdrawalAmount.value" class="w-full" type="range" min="0" max="200" step="10">
        </label>
        <label class="range-field lg:col-span-2">
          <span>
            {{ plan.startWithdrawalYear.value > plan.totalYears.value ? '不提領' : `第 ${plan.startWithdrawalYear.value} 年開始提領` }}
          </span>
          <input v-model.number="plan.startWithdrawalYear.value" class="w-full" type="range" min="1" :max="plan.totalYears.value + 1" step="1">
        </label>
      </div>
    </section>
  </div>
</template>

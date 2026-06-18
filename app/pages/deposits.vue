<script setup lang="ts">
const plan = useFinancialPlan()

const depositItems = computed(() => plan.depositBreakdown.value)
const depositTotal = computed(() => plan.depositFinalValue.value)
const depositPercentBase = computed(() => Math.max(depositTotal.value, 1))
const activeDepositLabel = ref<string | null>(null)
const depositDetailChanging = ref(false)
let depositDetailTimer: ReturnType<typeof setTimeout> | null = null

const depositPercent = (value: number) => Math.round((value / depositPercentBase.value) * 100)
const depositAmount = (value: number) => `${plan.formatWan(value)} 萬`
const pulseDepositDetail = () => {
  depositDetailChanging.value = true
  if (depositDetailTimer) clearTimeout(depositDetailTimer)
  depositDetailTimer = setTimeout(() => {
    depositDetailChanging.value = false
  }, 720)
}

const depositMetrics = computed(() => {
  const metrics = [
    {
      key: 'deposit-total',
      label: '存款總額',
      value: plan.depositFinalValue.value,
      unit: '萬',
      detail: `規劃至 ${plan.ageAtYear(plan.demandDepositYears.value)} 歲`,
      changeTone: 'positive',
    },
    {
      key: 'demand-deposit-total',
      label: '活存',
      value: plan.demandDepositPlannedValue.value,
      unit: '萬',
      detail: `活存規劃至 ${plan.ageAtYear(plan.demandDepositYears.value)} 歲`,
      changeTone: 'positive',
    },
    {
      key: 'demand-interest',
      label: '活存利息',
      value: plan.demandDepositInterest.value,
      unit: '萬',
      detail: `年利率 ${plan.demandDepositRate.value}%`,
      changeTone: 'positive',
    },
  ]

  if (plan.fixedDepositEnabled.value) {
    metrics.push({
      key: 'fixed-deposit-maturity',
      label: '定存到期',
      value: plan.fixedDepositMaturityValue.value,
      unit: '萬',
      detail: `${plan.ageAtYear(plan.fixedDepositMaturityYear.value)} 歲`,
      changeTone: 'positive',
    })
  }

  return metrics
})

watch(
  () => [
    plan.demandDepositAmount.value,
    plan.demandDepositRate.value,
    plan.demandDepositYears.value,
    plan.fixedDepositEnabled.value,
    plan.fixedDepositAmount.value,
    plan.fixedDepositRate.value,
    plan.fixedDepositMaturityYear.value,
  ],
  () => pulseDepositDetail(),
)

useHead({
  title: '存款 | PlanLab',
})

onBeforeUnmount(() => {
  if (depositDetailTimer) clearTimeout(depositDetailTimer)
})
</script>

<template>
  <div class="page-shell space-y-4">
    <header class="mb-[18px]">
      <h1 class="page-title">存款</h1>
      <p class="page-sub">活存、定存與利息事件</p>
    </header>

    <section class="kpi-grid md:grid-cols-2 xl:grid-cols-4">
      <AnimatedKpiCard
        v-for="metric in depositMetrics"
        :key="metric.key"
        :change-tone="metric.changeTone"
        :detail="metric.detail"
        detail-tone="muted"
        :kpi-key="metric.key"
        :label="metric.label"
        :unit="metric.unit"
        :value="metric.value"
      />
    </section>

    <section
      class="card alloc-card impact-card"
      :class="{ 'is-changing': depositDetailChanging }"
      data-impact-card="deposit-detail"
    >
      <div class="card-hd">
        <h2 class="card-title">存款資產細節</h2>
        <p class="alloc-total-label">存款總額 {{ depositAmount(depositTotal) }}</p>
      </div>

      <div class="alloc-visual">
        <div class="alloc-chart-wrap">
          <AssetAllocationChart
            :items="depositItems"
            title="存款資產細節圓餅圖"
            :total="depositTotal"
            @hover:item="activeDepositLabel = $event"
          />
        </div>

        <div class="alloc-list">
          <div
            v-for="item in depositItems"
            :key="item.label"
            class="alloc-item"
            :class="{ 'is-active': activeDepositLabel === item.label }"
          >
            <span class="alloc-dot" :style="{ background: item.color }" />
            <span class="alloc-name">{{ item.label }}</span>
            <span class="alloc-amount">{{ depositAmount(item.value) }}</span>
            <span class="alloc-track">
              <span
                class="alloc-fill block"
                :style="{ width: `${depositPercent(item.value)}%`, background: item.color }"
              />
            </span>
            <span class="alloc-pct">{{ depositPercent(item.value) }}%</span>
          </div>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="card-hd">
        <h2 class="card-title">存款設定</h2>
      </div>
      <div class="grid gap-4 lg:grid-cols-3">
        <label class="range-field">
          <span>活存本金：{{ plan.formatWan(plan.demandDepositAmount.value) }} 萬</span>
          <input v-model.number="plan.demandDepositAmount.value" class="w-full" type="range" min="0" max="1000" step="10">
        </label>
        <label class="range-field">
          <span>活存年利率：{{ plan.demandDepositRate.value }}%</span>
          <input v-model.number="plan.demandDepositRate.value" class="w-full" type="range" min="0" max="5" step="0.1">
        </label>
        <label class="range-field">
          <span>活存規劃年數：{{ plan.demandDepositYears.value }} 年，活存規劃至 {{ plan.ageAtYear(plan.demandDepositYears.value) }} 歲</span>
          <input v-model.number="plan.demandDepositYears.value" class="w-full" type="range" min="10" :max="plan.globalMaxYears.value" step="1">
        </label>
        <label class="toggle-label flex items-center gap-2 text-sm font-medium lg:col-span-3">
          <input v-model="plan.fixedDepositEnabled.value" aria-label="啟用定存" class="size-4" type="checkbox">
          <span>啟用定存</span>
        </label>
        <label v-if="plan.fixedDepositEnabled.value" class="range-field">
          <span>定存：{{ plan.formatWan(plan.fixedDepositAmount.value) }} 萬</span>
          <input v-model.number="plan.fixedDepositAmount.value" class="w-full" type="range" min="0" max="1000" step="10">
        </label>
        <label v-if="plan.fixedDepositEnabled.value" class="range-field">
          <span>定存年利率：{{ plan.fixedDepositRate.value }}%</span>
          <input v-model.number="plan.fixedDepositRate.value" class="w-full" type="range" min="0" max="8" step="0.1">
        </label>
        <label v-if="plan.fixedDepositEnabled.value" class="range-field">
          <span>{{ plan.ageAtYear(plan.fixedDepositMaturityYear.value) }} 歲定存到期</span>
          <input
            v-model.number="plan.fixedDepositMaturityYear.value"
            class="w-full"
            type="range"
            min="1"
            :max="plan.globalMaxYears.value"
            step="1"
          >
        </label>
      </div>
    </section>
  </div>
</template>



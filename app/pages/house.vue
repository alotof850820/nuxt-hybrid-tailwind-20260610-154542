<script setup lang="ts">
const plan = useFinancialPlan()

const yearlyMortgage = computed(() => plan.monthlyPayment.value * 12)
const houseMetrics = computed(() => [
  {
    label: '買房支出',
    value: `${plan.formatWan(plan.buyHouse.value ? plan.totalHouseExpense.value : 0)} 萬`,
    detail: plan.buyHouse.value ? `第 ${plan.houseYear.value} 年開始` : '尚未啟用買房規劃',
  },
  {
    label: '頭期款',
    value: `${plan.formatWan(plan.buyHouse.value ? plan.downPayment.value : 0)} 萬`,
    detail: '一次性支出',
  },
  {
    label: '年房貸支出',
    value: `${plan.formatWan(plan.buyHouse.value ? yearlyMortgage.value : 0)} 萬`,
    detail: `月付 ${plan.monthlyPayment.value} 萬`,
  },
  {
    label: '貸款期間',
    value: plan.buyHouse.value ? `${plan.loanYears.value} 年` : '未設定',
    detail: plan.buyHouse.value ? `影響第 ${plan.houseYear.value} 年後現金流` : '啟用後可計算',
  },
])

useHead({
  title: '買房規劃 | PlanLab',
})
</script>

<template>
  <div class="page-shell space-y-4">
    <header class="mb-[18px]">
      <h1 class="page-title">買房規劃</h1>
      <p class="page-sub">頭期款、月付與貸款年限對資產曲線的影響</p>
    </header>

    <section class="kpi-grid md:grid-cols-2 xl:grid-cols-4">
      <article v-for="metric in houseMetrics" :key="metric.label" class="kpi">
        <p class="kpi-label">{{ metric.label }}</p>
        <p class="kpi-value">{{ metric.value }}</p>
        <p class="kpi-delta text-slate-500">{{ metric.detail }}</p>
      </article>
    </section>

    <section class="card">
      <div class="card-hd">
        <h2 class="card-title">買房參數</h2>
        <label class="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input v-model="plan.buyHouse.value" class="size-4" type="checkbox">
          啟用買房規劃
        </label>
      </div>

      <div v-if="plan.buyHouse.value" class="grid gap-4 lg:grid-cols-4">
        <label class="range-field">
          <span>第 {{ plan.houseYear.value }} 年買房</span>
          <input v-model.number="plan.houseYear.value" class="w-full" type="range" min="1" :max="plan.totalYears.value" step="1">
        </label>
        <label class="range-field">
          <span>頭期款：{{ plan.downPayment.value }} 萬</span>
          <input v-model.number="plan.downPayment.value" class="w-full" type="range" min="0" max="1000" step="50">
        </label>
        <label class="range-field">
          <span>月付：{{ plan.monthlyPayment.value }} 萬（年付 {{ plan.monthlyPayment.value * 12 }} 萬）</span>
          <input v-model.number="plan.monthlyPayment.value" class="w-full" type="range" min="0" max="10" step="0.5">
        </label>
        <label class="range-field">
          <span>貸款年限：{{ plan.loanYears.value }} 年</span>
          <input v-model.number="plan.loanYears.value" class="w-full" type="range" min="5" max="40" step="1">
        </label>
      </div>
      <p v-else class="text-sm text-slate-500">啟用後可設定買房年度、頭期款、月付與貸款年限。</p>
    </section>
  </div>
</template>

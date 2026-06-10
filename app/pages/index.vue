<script setup lang="ts">
const plan = useFinancialPlan()

const summaryCards = computed(() => [
  { label: '累積投入', value: plan.totalInput.value, unit: '萬元', tone: 'blue' },
  { label: '買房支出', value: plan.totalHouseExpense.value, unit: '萬元', tone: 'red' },
  { label: '其他支出', value: plan.totalOtherExpense.value, unit: '萬元', tone: 'orange' },
  { label: '定期提領', value: plan.totalWithdrawal.value, unit: '萬元', tone: 'purple' },
  { label: '最終資產', value: plan.finalValue.value, unit: '萬元', tone: 'green' },
  { label: '淨獲利', value: plan.netProfit.value, unit: '萬元', tone: 'amber' },
])

const chartPoints = computed(() => {
  const values = plan.yearlyData.value.map((row) => row.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(max - min, 1)

  return values.map((value, index) => {
    const x = 10 + (index / (values.length - 1 || 1)) * 780
    const y = 260 - ((value - min) / range) * 220
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
})

const chartLine = computed(() => chartPoints.value.join(' '))
const chartArea = computed(() => {
  const points = chartPoints.value
  return `M ${points[0]} L ${points.slice(1).join(' L ')} L 790,280 L 10,280 Z`
})

const toneClass = (tone: string) => {
  const classes: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700',
    red: 'bg-red-50 text-red-700',
    orange: 'bg-orange-50 text-orange-700',
    purple: 'bg-purple-50 text-purple-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
  }

  return classes[tone] ?? classes.blue
}

useHead({
  title: '首頁 | PlanLab',
})
</script>

<template>
  <div class="page-shell space-y-5">
    <header>
      <h1 class="text-[17px] font-medium text-slate-900">財務成果總覽</h1>
      <p class="mt-1 text-xs text-slate-500">依目前投資、提領與買房設定即時計算</p>
    </header>

    <section class="card">
      <div class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <article
          v-for="card in summaryCards"
          :key="card.label"
          class="rounded-lg p-4"
          :class="toneClass(card.tone)"
        >
          <p class="mb-1 text-xs text-slate-600">{{ card.label }}</p>
          <p class="text-xl font-bold">{{ plan.formatWan(card.value) }}</p>
          <p class="text-xs text-slate-500">{{ card.unit }}</p>
        </article>
      </div>
    </section>

    <section class="card">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h2 class="text-[15px] font-medium text-slate-900">資產變化趨勢</h2>
          <p class="mt-1 text-xs text-slate-500">總資產、投資增值與年度支出的長期走勢</p>
        </div>
        <span class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
          {{ plan.totalYears.value }} 年
        </span>
      </div>

      <div class="h-[340px]">
        <svg class="h-full w-full" viewBox="0 0 800 300" role="img" aria-label="資產變化趨勢">
          <line
            v-for="y in [60, 115, 170, 225, 280]"
            :key="y"
            x1="10"
            :y1="y"
            x2="790"
            :y2="y"
            stroke="#e2e8f0"
            stroke-width="1"
          />
          <path :d="chartArea" fill="#3b82f6" opacity="0.08" />
          <polyline :points="chartLine" fill="none" stroke="#3b82f6" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" />
        </svg>
      </div>
    </section>
  </div>
</template>

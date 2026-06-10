<script setup lang="ts">
const plan = useFinancialPlan()

const stockAllocation = computed(() => Math.max(plan.finalValue.value, 0))
const houseAllocation = computed(() => (plan.buyHouse.value ? Math.max(plan.totalHouseExpense.value, 0) : 0))
const allocationTotal = computed(() => Math.max(stockAllocation.value + houseAllocation.value, 1))

const allocationItems = computed(() => [
  {
    label: '股票',
    value: stockAllocation.value,
    color: 'bg-blue-500',
    text: 'text-blue-700',
  },
  {
    label: '買房',
    value: houseAllocation.value,
    color: 'bg-amber-500',
    text: 'text-amber-700',
  },
])

const allocationPercent = (value: number) => Math.round((value / allocationTotal.value) * 100)

useHead({
  title: '首頁 | PlanLab',
})
</script>

<template>
  <div class="page-shell space-y-5">
    <header>
      <h1 class="text-[17px] font-medium text-slate-900">首頁</h1>
      <p class="mt-1 text-xs text-slate-500">總資產、資產變化趨勢與資產配置</p>
    </header>

    <section class="card bg-gradient-to-br from-white to-slate-50">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-xs font-medium uppercase text-slate-500">總資產</p>
          <p class="mt-1 text-3xl font-semibold text-slate-950">{{ plan.formatWan(plan.finalValue.value) }} 萬</p>
        </div>
        <div class="rounded-lg bg-blue-50 px-3 py-2 text-right">
          <p class="text-[11px] text-slate-500">規劃期間</p>
          <p class="text-sm font-semibold text-blue-700">{{ plan.totalYears.value }} 年後</p>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h2 class="text-[15px] font-medium text-slate-900">資產變化趨勢</h2>
          <p class="mt-1 text-xs text-slate-500">滑鼠移上圖表可查看各年度總資產</p>
        </div>
        <span class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
          {{ plan.totalYears.value }} 年
        </span>
      </div>

      <div class="h-[340px]">
        <AssetTrendChart :rows="plan.yearlyData.value" />
      </div>
    </section>

    <section class="card">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h2 class="text-[15px] font-medium text-slate-900">資產配置</h2>
          <p class="mt-1 text-xs text-slate-500">目前分類：股票、買房</p>
        </div>
        <span class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">2 類</span>
      </div>

      <div class="mb-4 flex h-2 overflow-hidden rounded-full bg-slate-100">
        <span
          v-for="item in allocationItems"
          :key="item.label"
          class="h-full"
          :class="item.color"
          :style="{ width: `${allocationPercent(item.value)}%` }"
        />
      </div>

      <div class="grid gap-3 md:grid-cols-2">
        <article
          v-for="item in allocationItems"
          :key="item.label"
          class="rounded-lg border border-slate-200 bg-slate-50 p-4"
        >
          <div class="mb-3 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="size-2.5 rounded-full" :class="item.color" />
              <span class="text-sm font-medium text-slate-700">{{ item.label }}</span>
            </div>
            <span class="text-sm font-semibold" :class="item.text">{{ allocationPercent(item.value) }}%</span>
          </div>
          <p class="text-2xl font-semibold text-slate-950">{{ plan.formatWan(item.value) }} 萬</p>
        </article>
      </div>
    </section>
  </div>
</template>

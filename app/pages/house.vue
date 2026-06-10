<script setup lang="ts">
const plan = useFinancialPlan()

useHead({
  title: '買房規劃 | PlanLab',
})
</script>

<template>
  <div class="page-shell space-y-5">
    <header>
      <h1 class="text-[17px] font-medium text-slate-900">買房規劃</h1>
      <p class="mt-1 text-xs text-slate-500">頭期款、月付與貸款年限對資產曲線的影響</p>
    </header>

    <section class="card">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-[15px] font-medium text-slate-900">買房參數</h2>
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

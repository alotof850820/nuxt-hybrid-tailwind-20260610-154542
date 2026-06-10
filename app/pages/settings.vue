<script setup lang="ts">
const plan = useFinancialPlan()

useHead({
  title: '設定 | PlanLab',
})
</script>

<template>
  <div class="page-shell space-y-5">
    <header>
      <h1 class="text-[17px] font-medium text-slate-900">設定</h1>
      <p class="mt-1 text-xs text-slate-500">投資基本設定中的本金設定</p>
    </header>

    <section class="card">
      <h2 class="mb-4 text-[15px] font-medium text-slate-900">本金設定</h2>
      <label class="range-field">
        <span>初始本金：{{ plan.initialAmount.value }} 萬</span>
        <input v-model.number="plan.initialAmount.value" class="w-full" type="range" min="0" max="1000" step="50">
      </label>
    </section>
  </div>
</template>

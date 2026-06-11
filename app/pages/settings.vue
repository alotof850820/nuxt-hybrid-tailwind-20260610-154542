<script setup lang="ts">
const plan = useFinancialPlan()

useHead({
  title: '設定 | PlanLab',
})
</script>

<template>
  <div class="page-shell space-y-4">
    <header class="mb-[18px]">
      <h1 class="page-title">設定</h1>
      <p class="page-sub">投資基本設定中的本金設定</p>
    </header>

    <section class="card">
      <div class="card-hd">
        <h2 class="card-title">本金設定</h2>
      </div>
      <label class="range-field">
        <span>初始本金：{{ plan.initialAmount.value }} 萬</span>
        <input v-model.number="plan.initialAmount.value" class="w-full" type="range" min="0" max="1000" step="50">
      </label>
    </section>
  </div>
</template>

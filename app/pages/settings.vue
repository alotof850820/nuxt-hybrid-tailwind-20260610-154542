<script setup lang="ts">
const plan = useFinancialPlan()

useHead({
  title: '設定 | PlanLab',
})
</script>

<template>
  <div class="page-shell space-y-4">
    <header class="mb-[18px]">
      <h1 class="page-title">全域設定</h1>
      <p class="page-sub">年齡、年數與跨資產目標事件</p>
    </header>

    <section class="card">
      <div class="card-hd">
        <h2 class="card-title">人生目標</h2>
      </div>
      <div class="grid gap-4 lg:grid-cols-3">
        <label class="range-field">
          <span>目前年齡：{{ plan.currentAge.value }} 歲</span>
          <input v-model.number="plan.currentAge.value" class="w-full" type="range" min="18" max="80" step="1">
        </label>
        <label class="range-field">
          <span>年數：{{ plan.dashboardTrendYears.value }} 年</span>
          <input v-model.number="plan.dashboardTrendYears.value" class="w-full" type="range" min="10" max="50" step="1">
        </label>
        <label class="range-field">
          <span>目標金額：{{ plan.formatWan(plan.targetAmount.value) }} 萬</span>
          <input v-model.number="plan.targetAmount.value" class="w-full" type="range" min="0" max="20000" step="100">
        </label>
      </div>
      <p class="muted mt-4 text-sm">
        <template v-if="plan.dashboardTargetAmountReachedRow.value">
          預計 {{ plan.dashboardTargetAmountReachedAge.value }} 歲達成目標。
        </template>
        <template v-else>
          目前規劃期間尚未達成目標金額。
        </template>
      </p>
    </section>
  </div>
</template>

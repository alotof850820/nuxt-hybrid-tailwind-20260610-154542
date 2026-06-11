<script setup lang="ts">
const plan = useFinancialPlan()

const detailRows = computed(() => {
  return plan.yearlyData.value.slice(1).map((row, index) => {
    const previous = plan.yearlyData.value[index]
    const displayInput =
      plan.stopInputYear.value > plan.totalYears.value || row.year <= plan.stopInputYear.value
        ? plan.annualInput.value
        : 0

    return {
      ...row,
      previousValue: previous.value,
      displayInput,
    }
  })
})

useHead({
  title: '明細 | PlanLab',
})
</script>

<template>
  <div class="page-shell space-y-4">
    <header class="mb-[18px]">
      <h1 class="page-title">年度收支明細</h1>
      <p class="page-sub">逐年檢視投入、房貸、增值、頭期與提領</p>
    </header>

    <section class="card max-h-[calc(100vh-160px)] overflow-auto p-0">
      <table class="w-full min-w-[900px] border-collapse text-xs">
        <thead class="sticky top-0 bg-slate-50">
          <tr>
            <th class="table-th">年份</th>
            <th class="table-th text-right">期初</th>
            <th class="table-th text-right">投入</th>
            <th class="table-th text-right">房貸</th>
            <th class="table-th text-right">增值</th>
            <th class="table-th text-right">頭期</th>
            <th class="table-th text-right">其他</th>
            <th class="table-th text-right">提領</th>
            <th class="table-th text-right">期末</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in detailRows" :key="row.year">
            <td class="table-td font-medium">第 {{ row.year }} 年</td>
            <td class="table-td text-right text-slate-500">{{ row.previousValue.toLocaleString() }}</td>
            <td class="table-td text-right text-blue-600">{{ row.displayInput > 0 ? `+${row.displayInput.toLocaleString()}` : '-' }}</td>
            <td class="table-td text-right text-pink-600">{{ row.houseLoan > 0 ? `-${row.houseLoan.toLocaleString()}` : '-' }}</td>
            <td class="table-td text-right text-green-600">+{{ row.growth.toLocaleString() }}</td>
            <td class="table-td text-right text-red-600">{{ row.downPayment > 0 ? `-${row.downPayment.toLocaleString()}` : '-' }}</td>
            <td class="table-td text-right text-orange-600">-</td>
            <td class="table-td text-right text-purple-600">{{ row.withdrawal > 0 ? `-${row.withdrawal.toLocaleString()}` : '-' }}</td>
            <td class="table-td text-right font-bold text-slate-800">{{ row.value.toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

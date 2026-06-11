<script setup lang="ts">
import IconArrowUpRight from '@tabler/icons-vue/dist/esm/icons/IconArrowUpRight.mjs'

const plan = useFinancialPlan()

const stockMetrics = computed(() => [
  {
    label: '未實現損益',
    value: `${plan.netProfit.value >= 0 ? '+' : ''}${plan.formatWan(plan.netProfit.value)} 萬`,
    detail: '總資產扣除投入與提領',
    tone: plan.netProfit.value >= 0 ? 'up' : 'dn',
  },
  {
    label: '年化報酬',
    value: `${plan.returnRate.value}%`,
    detail: `vs 規劃基準 ${Math.max(plan.returnRate.value - 2, 0)}%`,
    tone: 'up',
  },
  {
    label: '本月回報',
    value: '+6.1%',
    detail: '上月 +5.2%',
    tone: 'text-slate-500',
  },
])

const stocks = [
  { sym: 'TSMC', name: '台積電', price: '$156.40', change: '+3.2%', up: true, cap: '$809B', rating: 'buy' },
  { sym: 'NVDA', name: 'Nvidia', price: '$1,048', change: '+1.8%', up: true, cap: '$2.58T', rating: 'buy' },
  { sym: 'AAPL', name: 'Apple', price: '$178.20', change: '-0.4%', up: false, cap: '$2.77T', rating: 'hold' },
  { sym: 'QQQ', name: 'Nasdaq ETF', price: '$462.10', change: '+0.9%', up: true, cap: 'ETF', rating: 'hold' },
  { sym: 'MSFT', name: 'Microsoft', price: '$415.30', change: '+2.1%', up: true, cap: '$3.09T', rating: 'buy' },
  { sym: 'META', name: 'Meta', price: '$512.60', change: '-1.2%', up: false, cap: '$1.31T', rating: 'watch' },
]

const ratingClass = (rating: string) => {
  if (rating === 'buy') return 'tag-buy'
  if (rating === 'hold') return 'tag-hold'
  return 'tag-watch'
}

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
      <article v-for="metric in stockMetrics" :key="metric.label" class="kpi">
        <p class="kpi-label">{{ metric.label }}</p>
        <p class="kpi-value" :class="metric.tone === 'dn' ? 'text-red-600' : metric.tone === 'up' ? 'text-slate-900' : metric.tone">
          {{ metric.value }}
        </p>
        <p class="kpi-delta" :class="metric.tone">
          <IconArrowUpRight v-if="metric.tone === 'up'" class="size-3" :stroke="2" aria-hidden="true" />
          {{ metric.detail }}
        </p>
      </article>
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

    <section class="card overflow-hidden p-0">
      <table class="w-full table-fixed border-collapse text-[13px]">
        <thead>
          <tr>
            <th class="w-[15%] table-th">代號</th>
            <th class="w-[22%] table-th">名稱</th>
            <th class="w-[15%] table-th">現價</th>
            <th class="w-[13%] table-th">漲跌</th>
            <th class="w-[18%] table-th">市值</th>
            <th class="w-[17%] table-th">評級</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="stock in stocks" :key="stock.sym">
            <td class="table-td font-medium text-slate-900">{{ stock.sym }}</td>
            <td class="table-td text-slate-500">{{ stock.name }}</td>
            <td class="table-td text-slate-900">{{ stock.price }}</td>
            <td class="table-td" :class="stock.up ? 'text-green-600' : 'text-red-600'">{{ stock.change }}</td>
            <td class="table-td text-slate-500">{{ stock.cap }}</td>
            <td class="table-td">
              <span class="tag" :class="ratingClass(stock.rating)">
                {{ stock.rating }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

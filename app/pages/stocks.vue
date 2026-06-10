<script setup lang="ts">
const kpis = [
  { label: '未實現損益', value: '+$34K', delta: '+2.8%', tone: 'up' },
  { label: '年化報酬', value: '14.2%', delta: 'vs 標指 11.3%', tone: 'up' },
  { label: '本月回報', value: '+6.1%', delta: '上月 +5.2%', tone: 'muted' },
]

const stocks = [
  { sym: 'TSMC', name: '台積電', price: '$156.40', change: '+3.2%', up: true, cap: '$809B', rating: 'buy' },
  { sym: 'NVDA', name: 'Nvidia', price: '$1,048', change: '+1.8%', up: true, cap: '$2.58T', rating: 'buy' },
  { sym: 'AAPL', name: 'Apple', price: '$178.20', change: '-0.4%', up: false, cap: '$2.77T', rating: 'hold' },
  { sym: 'QQQ', name: 'Nasdaq ETF', price: '$462.10', change: '+0.9%', up: true, cap: 'ETF', rating: 'hold' },
  { sym: 'MSFT', name: 'Microsoft', price: '$415.30', change: '+2.1%', up: true, cap: '$3.09T', rating: 'buy' },
  { sym: 'META', name: 'Meta', price: '$512.60', change: '-1.2%', up: false, cap: '$1.31T', rating: 'watch' },
]

const ratingClass = (rating: string) => {
  if (rating === 'buy') return 'bg-green-500/10 text-green-700'
  if (rating === 'hold') return 'bg-blue-500/10 text-blue-700'
  return 'bg-yellow-500/10 text-yellow-700'
}

useHead({
  title: '股票 | PlanLab',
})
</script>

<template>
  <div class="page-shell">
    <header class="mb-[18px]">
      <h1 class="text-[17px] font-medium text-slate-900">股票</h1>
      <p class="mt-1 text-xs text-slate-500">追蹤中的股票與 ETF</p>
    </header>

    <section class="mb-4 grid grid-cols-3 gap-2.5">
      <article v-for="kpi in kpis" :key="kpi.label" class="rounded-md bg-slate-50 px-3.5 py-3">
        <p class="mb-1 text-[11px] font-medium uppercase tracking-[0.05em] text-slate-500">
          {{ kpi.label }}
        </p>
        <p class="text-xl font-medium text-slate-900">{{ kpi.value }}</p>
        <p class="mt-1 text-[11px]" :class="kpi.tone === 'up' ? 'text-green-600' : 'text-slate-500'">
          {{ kpi.delta }}
        </p>
      </article>
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
          <tr v-for="stock in stocks" :key="stock.sym" class="group">
            <td class="table-td font-medium text-slate-900">{{ stock.sym }}</td>
            <td class="table-td text-slate-500">{{ stock.name }}</td>
            <td class="table-td text-slate-900">{{ stock.price }}</td>
            <td class="table-td" :class="stock.up ? 'text-green-600' : 'text-red-600'">
              {{ stock.change }}
            </td>
            <td class="table-td text-slate-500">{{ stock.cap }}</td>
            <td class="table-td">
              <span class="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium" :class="ratingClass(stock.rating)">
                {{ stock.rating }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

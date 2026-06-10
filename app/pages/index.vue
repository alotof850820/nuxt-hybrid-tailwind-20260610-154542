<script setup lang="ts">
type Period = '1m' | '3m' | '6m' | '1y'

const periods: Array<{ id: Period; label: string }> = [
  { id: '1m', label: '1M' },
  { id: '3m', label: '3M' },
  { id: '6m', label: '6M' },
  { id: '1y', label: '1Y' },
]

const datasets: Record<Period, { labels: string[]; data: number[] }> = {
  '1m': {
    labels: ['5/12', '5/17', '5/22', '5/27', '6/1', '6/5', '6/10'],
    data: [1160, 1172, 1168, 1185, 1200, 1220, 1240],
  },
  '3m': {
    labels: ['3月', '4月', '4/15', '4/30', '5/15', '5/30', '6/10'],
    data: [1080, 1105, 1095, 1130, 1175, 1215, 1240],
  },
  '6m': {
    labels: ['1月', '2月', '3月', '4月', '5月', '6月', '今日'],
    data: [980, 1020, 1040, 1105, 1160, 1215, 1240],
  },
  '1y': {
    labels: ['6/25', '8/25', '10/25', '12/25', '2/26', '4/26', '6/26'],
    data: [860, 900, 950, 1010, 1080, 1160, 1240],
  },
}

const allocation = [
  { name: '科技股', pct: 50, color: '#3b82f6' },
  { name: 'ETF', pct: 25, color: '#16a34a' },
  { name: '金融股', pct: 16, color: '#f59e0b' },
  { name: '現金', pct: 9, color: '#94a3b8' },
]

const selectedPeriod = ref<Period>('1m')

const activeDataset = computed(() => datasets[selectedPeriod.value])

const chartPoints = computed(() => {
  const values = activeDataset.value.data
  const min = Math.min(...values) - 20
  const max = Math.max(...values) + 20
  return values.map((value, index) => {
    const x = 8 + (index / (values.length - 1)) * 584
    const y = 136 - ((value - min) / (max - min)) * 112
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
})

const chartLine = computed(() => chartPoints.value.join(' '))
const chartArea = computed(() => {
  const points = chartPoints.value
  return `M ${points[0]} L ${points.slice(1).join(' L ')} L 592,152 L 8,152 Z`
})

useHead({
  title: '首頁 | PlanLab',
})
</script>

<template>
  <div class="page-shell">
    <header class="mb-[18px]">
      <h1 class="text-[17px] font-medium text-slate-900">財務成果總覽</h1>
      <p class="mt-1 text-xs text-slate-500">2026年6月10日 · 即時更新</p>
    </header>

    <section class="mb-4 grid grid-cols-1 gap-2.5">
      <article class="rounded-md bg-slate-50 px-3.5 py-3">
        <p class="mb-1 text-[11px] font-medium uppercase tracking-[0.05em] text-slate-500">
          總資產
        </p>
        <p class="text-xl font-medium text-slate-900">$1.24M</p>
        <p class="mt-1 text-[11px] text-green-600">+2.4% 今日</p>
      </article>
    </section>

    <section class="card mb-3.5">
      <div class="mb-3.5 flex items-center justify-between">
        <h2 class="text-[13px] font-medium text-slate-900">資產變化趨勢</h2>
        <div class="flex gap-1">
          <button
            v-for="period in periods"
            :key="period.id"
            class="rounded-[5px] border px-2.5 py-1 text-[11px] transition"
            :class="period.id === selectedPeriod ? 'border-slate-300 bg-slate-50 text-slate-900' : 'border-transparent text-slate-500 hover:border-slate-200 hover:text-slate-900'"
            type="button"
            @click="selectedPeriod = period.id"
          >
            {{ period.label }}
          </button>
        </div>
      </div>

      <div class="h-40">
        <svg class="h-full w-full" viewBox="0 0 600 160" role="img" aria-label="資產變化趨勢圖">
          <line
            v-for="y in [32, 64, 96, 128]"
            :key="y"
            x1="8"
            :y1="y"
            x2="592"
            :y2="y"
            stroke="#e2e8f0"
            stroke-width="1"
          />
          <path :d="chartArea" fill="#3b82f6" opacity="0.08" />
          <polyline :points="chartLine" fill="none" stroke="#3b82f6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
          <circle
            v-for="point in chartPoints"
            :key="point"
            :cx="Number(point.split(',')[0])"
            :cy="Number(point.split(',')[1])"
            r="3"
            fill="#3b82f6"
          />
        </svg>
      </div>

      <div class="mt-2 grid grid-cols-7 text-center text-[11px] text-slate-400">
        <span v-for="label in activeDataset.labels" :key="label">{{ label }}</span>
      </div>
    </section>

    <section class="card">
      <div class="mb-3.5 flex items-center justify-between">
        <h2 class="text-[13px] font-medium text-slate-900">資產配置</h2>
      </div>

      <div class="mb-2.5 flex gap-1">
        <div
          v-for="item in allocation"
          :key="item.name"
          class="h-1.5 rounded"
          :style="{ width: `${item.pct}%`, backgroundColor: item.color }"
        />
      </div>

      <div class="flex flex-col gap-2">
        <div v-for="item in allocation" :key="item.name" class="flex items-center gap-2 text-xs">
          <span class="size-2 rounded-full" :style="{ backgroundColor: item.color }" />
          <span class="flex-1 text-slate-500">{{ item.name }}</span>
          <span class="h-[3px] flex-1 overflow-hidden rounded bg-slate-200">
            <span class="block h-full rounded" :style="{ width: `${item.pct}%`, backgroundColor: item.color }" />
          </span>
          <span class="min-w-7 text-right font-medium text-slate-900">{{ item.pct }}%</span>
        </div>
      </div>
    </section>
  </div>
</template>

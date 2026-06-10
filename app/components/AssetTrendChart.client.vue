<script setup lang="ts">
import {
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartConfiguration,
} from 'chart.js'

type TrendRow = {
  year: number
  value: number
}

const props = defineProps<{
  rows: TrendRow[]
}>()

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend)

const canvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart<'line'> | null = null

const formatWan = (value: number) => `${Math.round(value).toLocaleString()} 萬`

const createConfig = (): ChartConfiguration<'line'> => ({
  type: 'line',
  data: {
    labels: props.rows.map((row) => `第 ${row.year} 年`),
    datasets: [
      {
        label: '總資產',
        data: props.rows.map((row) => Math.round(row.value)),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        borderWidth: 2,
        fill: true,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#2563eb',
        pointBorderWidth: 2,
        pointHoverRadius: 5,
        pointRadius: 3,
        tension: 0.35,
      },
    ],
  },
  options: {
    animation: false,
    maintainAspectRatio: false,
    responsive: true,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        align: 'end',
        labels: {
          boxHeight: 8,
          boxWidth: 18,
          color: '#475569',
          font: {
            size: 12,
          },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        bodyColor: '#f8fafc',
        borderColor: 'rgba(148, 163, 184, 0.25)',
        borderWidth: 1,
        callbacks: {
          label: (context) => `總資產：${formatWan(Number(context.parsed.y ?? 0))}`,
          title: (items) => items[0]?.label ?? '',
        },
        displayColors: false,
        padding: 10,
        titleColor: '#cbd5e1',
      },
    },
    scales: {
      x: {
        border: {
          color: '#cbd5e1',
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.7)',
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11,
          },
          maxRotation: 0,
        },
        title: {
          color: '#64748b',
          display: true,
          font: {
            size: 11,
          },
          text: '規劃年度',
        },
      },
      y: {
        border: {
          color: '#cbd5e1',
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.9)',
        },
        ticks: {
          callback: (value) => formatWan(Number(value)),
          color: '#64748b',
          font: {
            size: 11,
          },
        },
        title: {
          color: '#64748b',
          display: true,
          font: {
            size: 11,
          },
          text: '資產金額',
        },
      },
    },
  },
})

const renderChart = () => {
  if (!canvas.value) return

  if (chart) {
    chart.data.labels = props.rows.map((row) => `第 ${row.year} 年`)
    chart.data.datasets[0].data = props.rows.map((row) => Math.round(row.value))
    chart.update()
    return
  }

  chart = new Chart(canvas.value, createConfig())
}

onMounted(renderChart)
watch(() => props.rows, renderChart, { deep: true })
onBeforeUnmount(() => chart?.destroy())
</script>

<template>
  <canvas ref="canvas" aria-label="資產變化趨勢" role="img" />
</template>

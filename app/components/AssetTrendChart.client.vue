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
        borderColor: '#3b82f6',
        borderWidth: 1.5,
        fill: false,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#3b82f6',
        pointBorderWidth: 1,
        pointHoverRadius: 4,
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
        display: false,
      },
      tooltip: {
        backgroundColor: '#0f172a',
        bodyColor: '#f8fafc',
        borderColor: 'rgba(148, 163, 184, 0.25)',
        borderWidth: 1,
        callbacks: {
          label: (context) => `總資產 ${formatWan(Number(context.parsed.y ?? 0))}`,
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
          display: false,
        },
        grid: {
          display: false,
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 11,
          },
          maxRotation: 0,
        },
        title: {
          display: false,
        },
      },
      y: {
        border: {
          display: false,
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        ticks: {
          callback: (value) => formatWan(Number(value)),
          color: '#94a3b8',
          font: {
            size: 11,
          },
        },
        title: {
          display: false,
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

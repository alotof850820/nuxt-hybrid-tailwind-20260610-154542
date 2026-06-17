<script setup lang="ts">
import {
  ArcElement,
  Chart,
  DoughnutController,
  Legend,
  Tooltip,
  type ChartConfiguration,
  type Plugin,
} from 'chart.js'

type AllocationItem = {
  label: string
  value: number
  color: string
  details?: {
    label: string
    value: number
  }[]
}

const props = defineProps<{
  items: AllocationItem[]
  title?: string
  total: number
}>()

Chart.register(DoughnutController, ArcElement, Tooltip, Legend)

const canvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart<'doughnut'> | null = null

const formatWan = (value: number) => `${Math.round(value).toLocaleString()} 萬`

const centerTextPlugin: Plugin<'doughnut'> = {
  id: 'assetAllocationCenterText',
  beforeDraw: (chartInstance) => {
    const { ctx, chartArea } = chartInstance
    if (!chartArea) return

    const centerX = (chartArea.left + chartArea.right) / 2
    const centerY = (chartArea.top + chartArea.bottom) / 2

    ctx.save()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#c1cad8'
    ctx.font = '11px Inter, ui-sans-serif, system-ui, sans-serif'
    ctx.fillText('總額', centerX, centerY - 10)
    ctx.fillStyle = '#f8fafc'
    ctx.font = '600 17px Inter, ui-sans-serif, system-ui, sans-serif'
    ctx.fillText(formatWan(props.total), centerX, centerY + 11)
    ctx.restore()
  },
}

const chartData = () => ({
  labels: props.items.map((item) => item.label),
  datasets: [
    {
      data: props.items.map((item) => Math.max(item.value, 0)),
      backgroundColor: props.items.map((item) => item.color),
      borderColor: '#272826',
      borderRadius: 6,
      borderWidth: 4,
      hoverBorderColor: '#f8fafc',
      hoverOffset: 4,
      spacing: 2,
    },
  ],
})

const createConfig = (): ChartConfiguration<'doughnut'> => ({
  type: 'doughnut',
  data: chartData(),
  options: {
    animation: false,
    cutout: '68%',
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1d1e1b',
        bodyColor: '#f8fafc',
        borderColor: 'rgba(193, 202, 216, 0.34)',
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const value = Number(context.parsed ?? 0)
            const pct = props.total > 0 ? Math.round((value / props.total) * 100) : 0
            const item = props.items[context.dataIndex]
            const lines = [`${context.label}: ${formatWan(value)} (${pct}%)`]

            if (item?.details?.length) {
              const detailBase = Math.max(
                item.details.reduce((sum, detail) => sum + Math.max(detail.value, 0), 0),
                value,
                1,
              )

              for (const detail of item.details) {
                const detailPct = Math.round((detail.value / detailBase) * 100)
                lines.push(`${detail.label}: ${formatWan(detail.value)} (${detailPct}%)`)
              }
            }

            return lines
          },
        },
        displayColors: true,
        padding: 10,
        titleColor: '#e2e8f0',
      },
    },
  },
  plugins: [centerTextPlugin],
})

const renderChart = () => {
  if (!canvas.value) return

  if (chart) {
    const nextData = chartData()
    chart.data.labels = nextData.labels
    chart.data.datasets[0].data = nextData.datasets[0].data
    chart.data.datasets[0].backgroundColor = nextData.datasets[0].backgroundColor
    chart.update()
    return
  }

  chart = new Chart(canvas.value, createConfig())
}

const scheduleRenderChart = async () => {
  await nextTick()
  requestAnimationFrame(renderChart)
}

onMounted(scheduleRenderChart)
const allocationLabel = computed(() => {
  const itemLabels = props.items
    .map((item) => {
      const pct = props.total > 0 ? Math.round((item.value / props.total) * 100) : 0
      const details =
        item.details?.length
          ? `，${item.label}細節 ${item.details
              .map((detail, _, details) => {
                const detailBase = Math.max(
                  details.reduce((sum, current) => sum + Math.max(current.value, 0), 0),
                  item.value,
                  1,
                )
                const detailPct = Math.round((detail.value / detailBase) * 100)
                return `${detail.label} ${formatWan(detail.value)} ${detailPct}%`
              })
              .join('，')}`
          : ''

      return `${item.label} ${formatWan(item.value)} ${pct}%${details}`
    })
    .join('，')

  return `${props.title ?? '資產配置圓餅圖'}，總額 ${formatWan(props.total)}，${itemLabels}`
})

watch(() => [props.items, props.total], scheduleRenderChart, { deep: true, flush: 'post' })
onBeforeUnmount(() => chart?.destroy())
</script>

<template>
  <canvas ref="canvas" :aria-label="allocationLabel" role="img" />
</template>

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
  type Plugin,
} from 'chart.js'

type TrendRow = {
  year: number
  value: number
}

type TrendEvent = {
  year: number
  label: string
  amount: number
  detail: string
}

type EventHitbox = {
  x: number
  y: number
  width: number
  height: number
  label: string
  year: number
}

const props = defineProps<{
  rows: TrendRow[]
  events?: TrendEvent[]
}>()

const emit = defineEmits<{
  'update:event-year': [year: number]
}>()

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend)

const canvas = ref<HTMLCanvasElement | null>(null)
const isDraggingEvent = ref(false)
const isPointerOverEventTag = ref(false)
const eventLineProgress = ref(1)
let chart: Chart<'line'> | null = null
let eventHitboxes: EventHitbox[] = []
let eventLineAnimationFrame = 0

const formatWan = (value: number) => `${Math.round(value).toLocaleString()} 萬`
const minDraggableYear = computed(() => Math.max(props.rows[1]?.year ?? 1, 1))
const maxDraggableYear = computed(() => props.rows.at(-1)?.year ?? 1)

const trendLabel = computed(() => {
  const eventText = props.events?.length
    ? `，${props.events.map((event) => `${event.label} 第 ${event.year} 年 ${event.detail}`).join('，')}`
    : ''

  return `資產變化趨勢${eventText}`
})

const houseEventPlugin: Plugin<'line'> = {
  id: 'houseEventMarker',
  afterDatasetsDraw: (chartInstance) => {
    const events = props.events ?? []
    if (!events.length) {
      eventHitboxes = []
      return
    }

    const { ctx, chartArea, scales } = chartInstance
    const xScale = scales.x
    const yScale = scales.y
    if (!chartArea || !xScale || !yScale) {
      eventHitboxes = []
      return
    }

    const nextHitboxes: EventHitbox[] = []

    for (const event of events) {
      const rowIndex = props.rows.findIndex((row) => row.year === event.year)
      if (rowIndex < 0) continue

      const row = props.rows[rowIndex]
      const x = xScale.getPixelForValue(rowIndex)
      const y = yScale.getPixelForValue(row.value)

      ctx.save()
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.82)'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(x, chartArea.top)
      ctx.lineTo(x, chartArea.top + (chartArea.bottom - chartArea.top) * eventLineProgress.value)
      ctx.stroke()
      ctx.setLineDash([])

      ctx.fillStyle = '#f59e0b'
      ctx.strokeStyle = '#272826'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      const label = event.label
      ctx.font = '600 11px Inter, ui-sans-serif, system-ui, sans-serif'
      const labelWidth = ctx.measureText(label).width + 14
      const labelX = Math.min(Math.max(x - labelWidth / 2, chartArea.left), chartArea.right - labelWidth)
      const labelY = Math.max(chartArea.top + 6, y - 34)
      const labelHeight = 22
      nextHitboxes.push({
        x: labelX,
        y: labelY,
        width: labelWidth,
        height: labelHeight,
        label: event.label,
        year: event.year,
      })
      ctx.fillStyle = '#1d1e1b'
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(labelX, labelY, labelWidth, labelHeight, 6)
      ctx.fill()
      ctx.stroke()
      ctx.fillStyle = '#fde68a'
      ctx.fillText(label, labelX + 7, labelY + 14)
      ctx.restore()
    }

    eventHitboxes = nextHitboxes
  },
}

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
    animation: {
      duration: 420,
      easing: 'easeOutQuart',
    },
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
        backgroundColor: '#1d1e1b',
        bodyColor: '#f8fafc',
        borderColor: 'rgba(193, 202, 216, 0.34)',
        borderWidth: 1,
        callbacks: {
          afterBody: (items) => {
            const rowIndex = items[0]?.dataIndex
            if (rowIndex == null) return []

            const row = props.rows[rowIndex]
            const events = props.events?.filter((event) => event.year === row?.year) ?? []
            return events.map((event) => `${event.label}: ${event.detail}`)
          },
          label: (context) => `總資產 ${formatWan(Number(context.parsed.y ?? 0))}`,
          title: (items) => items[0]?.label ?? '',
        },
        displayColors: false,
        padding: 10,
        titleColor: '#e2e8f0',
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
          color: '#c1cad8',
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
          color: 'rgba(193, 202, 216, 0.2)',
        },
        ticks: {
          callback: (value) => formatWan(Number(value)),
          color: '#c1cad8',
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
  plugins: [houseEventPlugin],
})

const renderChart = () => {
  if (!canvas.value) return

  if (chart) {
    chart.data.labels = props.rows.map((row) => `第 ${row.year} 年`)
    chart.data.datasets[0].data = props.rows.map((row) => Math.round(row.value))
    chart.update(isDraggingEvent.value ? 'none' : undefined)
    return
  }

  chart = new Chart(canvas.value, createConfig())
}

const yearFromPointerEvent = (event: PointerEvent) => {
  if (!chart || !canvas.value) return null

  const xScale = chart.scales.x
  if (!xScale) return null

  const bounds = canvas.value.getBoundingClientRect()
  const canvasX = event.clientX - bounds.left
  const rawIndex = Number(xScale.getValueForPixel(canvasX))
  if (!Number.isFinite(rawIndex)) return null

  const rowIndex = Math.min(Math.max(Math.round(rawIndex), minDraggableYear.value), maxDraggableYear.value)
  return props.rows[rowIndex]?.year ?? rowIndex
}

const pointerPosition = (event: PointerEvent) => {
  if (!canvas.value) return null

  const bounds = canvas.value.getBoundingClientRect()
  return {
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top,
  }
}

const hitboxFromPointerEvent = (event: PointerEvent) => {
  const pointer = pointerPosition(event)
  if (!pointer) return null

  return eventHitboxes.find((hitbox) => {
    return (
      pointer.x >= hitbox.x &&
      pointer.x <= hitbox.x + hitbox.width &&
      pointer.y >= hitbox.y &&
      pointer.y <= hitbox.y + hitbox.height
    )
  }) ?? null
}

const updateEventYearFromPointer = (event: PointerEvent) => {
  const nextYear = yearFromPointerEvent(event)
  if (nextYear == null) return

  emit('update:event-year', nextYear)
}

const handlePointerDown = (event: PointerEvent) => {
  if (!hitboxFromPointerEvent(event)) return

  isDraggingEvent.value = true
  isPointerOverEventTag.value = true
  canvas.value?.setPointerCapture(event.pointerId)
  updateEventYearFromPointer(event)
}

const handlePointerMove = (event: PointerEvent) => {
  if (!isDraggingEvent.value) {
    isPointerOverEventTag.value = Boolean(hitboxFromPointerEvent(event))
    return
  }

  updateEventYearFromPointer(event)
}

const handlePointerUp = (event: PointerEvent) => {
  if (!isDraggingEvent.value) return

  updateEventYearFromPointer(event)
  isDraggingEvent.value = false
  isPointerOverEventTag.value = Boolean(hitboxFromPointerEvent(event))
  canvas.value?.releasePointerCapture(event.pointerId)
}

const animateEventLineIn = () => {
  cancelAnimationFrame(eventLineAnimationFrame)
  eventLineProgress.value = 0
  const startedAt = performance.now()
  const duration = 360

  const tick = (timestamp: number) => {
    const progress = Math.min((timestamp - startedAt) / duration, 1)
    eventLineProgress.value = 1 - Math.pow(1 - progress, 3)
    chart?.draw()

    if (progress < 1) {
      eventLineAnimationFrame = requestAnimationFrame(tick)
      return
    }

    eventLineProgress.value = 1
    chart?.draw()
  }

  eventLineAnimationFrame = requestAnimationFrame(tick)
}

const scheduleRenderChart = async () => {
  await nextTick()
  requestAnimationFrame(renderChart)
}

onMounted(scheduleRenderChart)
watch(() => [props.rows, props.events], scheduleRenderChart, { deep: true, flush: 'post' })
watch(
  () => props.events?.length ?? 0,
  (eventCount, previousCount) => {
    if (eventCount > 0 && previousCount === 0) animateEventLineIn()
    if (eventCount === 0) eventLineProgress.value = 1
  },
)
onBeforeUnmount(() => {
  cancelAnimationFrame(eventLineAnimationFrame)
  chart?.destroy()
})
</script>

<template>
  <canvas
    ref="canvas"
    :aria-label="trendLabel"
    data-trend-animation="smooth-event"
    :style="{ cursor: isDraggingEvent ? 'grabbing' : isPointerOverEventTag ? 'grab' : 'default' }"
    role="img"
    @pointerdown="handlePointerDown"
    @pointerleave="handlePointerUp"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
  />
</template>

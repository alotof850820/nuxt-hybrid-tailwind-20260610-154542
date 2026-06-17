<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    changeTone?: 'positive' | 'expense' | 'neutral'
    decimals?: number
    detail?: string
    detailTone?: 'up' | 'dn' | 'muted'
    kpiKey: string
    label: string
    prefix?: string
    signed?: boolean
    suffix?: string
    unit?: string
    value: number
    valueTone?: 'up' | 'dn' | 'muted'
  }>(),
  {
    changeTone: 'neutral',
    decimals: 0,
    detail: '',
    detailTone: 'muted',
    prefix: '',
    signed: false,
    suffix: '',
    unit: '',
    valueTone: undefined,
  },
)

const displayValue = ref(props.value)
const isChanging = ref(false)
let animationFrame = 0
let changeTimer: ReturnType<typeof setTimeout> | null = null

const formatNumber = (value: number) => {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: props.decimals,
    minimumFractionDigits: props.decimals,
  })
}

const formattedValue = computed(() => {
  const sign = props.signed && displayValue.value > 0 ? '+' : ''
  const unit = props.unit ? ` ${props.unit}` : ''
  return `${props.prefix}${sign}${formatNumber(displayValue.value)}${props.suffix}${unit}`
})

const pulseChange = () => {
  isChanging.value = true
  if (changeTimer) clearTimeout(changeTimer)
  changeTimer = setTimeout(() => {
    isChanging.value = false
  }, 720)
}

const animateTo = (nextValue: number) => {
  cancelAnimationFrame(animationFrame)

  const shouldReduceMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (shouldReduceMotion) {
    displayValue.value = nextValue
    pulseChange()
    return
  }

  const startValue = displayValue.value
  const startedAt = performance.now()
  const duration = 520
  pulseChange()

  const tick = (timestamp: number) => {
    const progress = Math.min((timestamp - startedAt) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 4)
    displayValue.value = startValue + (nextValue - startValue) * eased

    if (progress < 1) {
      animationFrame = requestAnimationFrame(tick)
      return
    }

    displayValue.value = nextValue
  }

  animationFrame = requestAnimationFrame(tick)
}

watch(
  () => props.value,
  (nextValue, previousValue) => {
    if (nextValue === previousValue) return
    animateTo(nextValue)
  },
)

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrame)
  if (changeTimer) clearTimeout(changeTimer)
})
</script>

<template>
  <article
    class="kpi"
    :class="{ 'is-changing': isChanging }"
    :data-change-tone="changeTone"
    :data-kpi="kpiKey"
  >
    <p class="kpi-label">{{ label }}</p>
    <p class="kpi-value" :class="valueTone" data-count-up="true">{{ formattedValue }}</p>
    <p class="kpi-delta" :class="detailTone">
      <slot name="delta">{{ detail }}</slot>
    </p>
  </article>
</template>

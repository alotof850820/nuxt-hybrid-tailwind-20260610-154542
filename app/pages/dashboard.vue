<script setup lang="ts">
import IconArrowUpRight from '@tabler/icons-vue/dist/esm/icons/IconArrowUpRight.mjs'

const plan = useFinancialPlan()

const periodLabel = computed(() => `${plan.dashboardTrendYears.value}Y`)
const chartRows = computed(() => plan.dashboardYearlyData.value)
const trendEvents = computed(() => plan.dashboardPlanEvents.value)

const stockAllocation = computed(() => Math.max(plan.stockFinalValue.value, 0))
const depositAllocation = computed(() => Math.max(plan.depositFinalValue.value, 0))
const allocationTotal = computed(() => stockAllocation.value + depositAllocation.value)
const allocationPercentBase = computed(() => Math.max(allocationTotal.value, 1))
const allocationItems = computed(() => [
  {
    label: '股票',
    value: stockAllocation.value,
    color: '#3b82f6',
    details: plan.stockAssetBreakdown.value.map(({ label, value }) => ({ label, value })),
  },
  {
    label: '存款',
    value: depositAllocation.value,
    color: '#14b8a6',
    details: plan.depositBreakdown.value.map(({ label, value }) => ({ label, value })),
  },
])

const allocationPercent = (value: number) => Math.round((value / allocationPercentBase.value) * 100)
const allocationAmount = (value: number) => `${plan.formatWan(value)} 萬`
const debtTotal = computed(() => plan.totalMortgageLiability.value)
const debtPercentBase = computed(() => Math.max(debtTotal.value, 1))
const debtItems = computed(() => [
  {
    label: '剩餘房貸',
    value: plan.dashboardRemainingMortgageLiability.value,
    color: '#ef4444',
  },
  {
    label: '已支付房貸',
    value: plan.dashboardPaidMortgageLiability.value,
    color: '#f59e0b',
  },
])
const debtPercent = (value: number) => Math.round((value / debtPercentBase.value) * 100)
const activeAllocationLabel = ref<string | null>(null)
const activeDebtLabel = ref<string | null>(null)
const pulsingEventKey = ref<string | null>(null)
let pulseTimer: ReturnType<typeof setTimeout> | null = null

const movableEventIds = new Set(['house-purchase', 'fixed-deposit'])
const isMovableEvent = (eventId: string) => movableEventIds.has(eventId)

const applyEventYear = (eventId: string, year: number) => {
  const nextYear = plan.clampToGlobalYears(year)
  if (eventId === 'house-purchase') {
    plan.houseYear.value = nextYear
    return true
  }

  if (eventId === 'fixed-deposit') {
    plan.fixedDepositMaturityYear.value = nextYear
    return true
  }

  return false
}

const nearestOpenEventYear = (preferredYear: number, occupiedYears: Set<number>) => {
  const maxYear = plan.globalMaxYears.value
  for (let offset = 1; offset <= maxYear; offset += 1) {
    const laterYear = preferredYear + offset
    if (laterYear <= maxYear && !occupiedYears.has(laterYear)) return laterYear

    const earlierYear = preferredYear - offset
    if (earlierYear >= 1 && !occupiedYears.has(earlierYear)) return earlierYear
  }

  return null
}

const planEventYearChanges = (draggedEventId: string, year: number) => {
  if (!isMovableEvent(draggedEventId)) return null

  const draggedYear = plan.clampToGlobalYears(year)
  const occupiedYears = new Set<number>()
  const changes = new Map<string, number>()
  const otherMovableEvents: Array<{ id: string, year: number }> = []

  for (const trendEvent of trendEvents.value) {
    const currentYear = plan.clampToGlobalYears(trendEvent.year)
    if (trendEvent.id === draggedEventId) continue

    if (isMovableEvent(trendEvent.id)) {
      otherMovableEvents.push({ id: trendEvent.id, year: currentYear })
      continue
    }

    occupiedYears.add(currentYear)
  }

  if (occupiedYears.has(draggedYear)) return null

  changes.set(draggedEventId, draggedYear)
  occupiedYears.add(draggedYear)

  for (const otherEvent of otherMovableEvents) {
    if (!occupiedYears.has(otherEvent.year)) {
      changes.set(otherEvent.id, otherEvent.year)
      occupiedYears.add(otherEvent.year)
      continue
    }

    const nextYear = nearestOpenEventYear(otherEvent.year, occupiedYears)
    if (nextYear == null) return null

    changes.set(otherEvent.id, nextYear)
    occupiedYears.add(nextYear)
  }

  return changes
}

const applyEventYearChanges = (changes: Map<string, number>) => {
  for (const [eventId, year] of changes) {
    if (!applyEventYear(eventId, year)) return false
  }

  return true
}
const updatePlanEventYear = (event: { id: string, year: number }) => {
  const changes = planEventYearChanges(event.id, event.year)
  if (!changes || !applyEventYearChanges(changes)) return

  const domainYear = changes.get(event.id) ?? plan.clampToGlobalYears(event.year)
  pulsingEventKey.value = `${event.id}-${domainYear}`
  if (pulseTimer) clearTimeout(pulseTimer)
  pulseTimer = setTimeout(() => {
    pulsingEventKey.value = null
  }, 760)
}

useHead({
  title: '儀表板 | PlanLab',
})

onBeforeUnmount(() => {
  if (pulseTimer) clearTimeout(pulseTimer)
})
</script>

<template>
  <div class="page-shell space-y-4">
    <header class="mb-[18px]">
      <h1 class="page-title">財務成果總覽</h1>
      <p class="page-sub">2026年6月11日 · 即時更新</p>
    </header>

    <section class="kpi-grid grid-cols-1">
      <AnimatedKpiCard
        change-tone="positive"
        detail-tone="up"
        kpi-key="total-assets"
        label="總資產"
        unit="萬"
        :value="plan.dashboardFinalValue.value"
      >
        <template #delta>
          <IconArrowUpRight class="size-3" :stroke="2" aria-hidden="true" />
          {{ plan.ageAtYear(plan.dashboardTrendYears.value) }} 歲
        </template>
      </AnimatedKpiCard>
    </section>

    <section class="card">
      <div class="card-hd">
        <h2 class="card-title">資產變化趨勢</h2>
        <div class="period-tabs" aria-label="圖表期間">
          <button
            :aria-label="`年數 ${plan.dashboardTrendYears.value} 年`"
            aria-current="true"
            class="ptab active"
            disabled
            type="button"
          >
            {{ periodLabel }}
          </button>
        </div>
      </div>

      <div class="chart-area">
        <AssetTrendChart
          :current-age="plan.currentAge.value"
          :events="trendEvents"
          :rows="chartRows"
          @update:event-year="updatePlanEventYear"
        />
      </div>
      <Transition name="impact-reveal">
        <div v-if="trendEvents.length" class="event-list">
          <div
            v-for="event in trendEvents"
            :key="event.id"
            class="event-chip"
            :class="{ 'is-pulsing': pulsingEventKey === `${event.id}-${event.year}` }"
          >
            <span class="event-dot" :style="{ background: event.color ?? '#f59e0b' }" />
            <span class="event-title">{{ event.label }}</span>
            <span class="event-meta">{{ plan.ageAtYear(event.year) }} 歲 · {{ event.detail }}</span>
          </div>
        </div>
      </Transition>
    </section>

    <section class="card alloc-card">
      <div class="card-hd">
        <h2 class="card-title">資產配置</h2>
        <p class="alloc-total-label">配置總額 {{ allocationAmount(allocationTotal) }}</p>
      </div>

      <div class="alloc-visual">
        <div class="alloc-chart-wrap">
          <AssetAllocationChart
            :items="allocationItems"
            :total="allocationTotal"
            @hover:item="activeAllocationLabel = $event"
          />
        </div>

        <div class="alloc-list">
          <div
            v-for="item in allocationItems"
            :key="item.label"
            class="alloc-item"
            :class="{ 'is-active': activeAllocationLabel === item.label }"
          >
            <span class="alloc-dot" :style="{ background: item.color }" />
            <span class="alloc-name">{{ item.label }}</span>
            <span class="alloc-amount">{{ allocationAmount(item.value) }}</span>
            <span class="alloc-track">
              <span
                class="alloc-fill block"
                :style="{ width: `${allocationPercent(item.value)}%`, background: item.color }"
              />
            </span>
            <span class="alloc-pct">{{ allocationPercent(item.value) }}%</span>
          </div>
        </div>
      </div>
    </section>

    <Transition name="impact-reveal">
      <section v-if="plan.buyHouse.value && debtTotal > 0" class="card alloc-card">
        <div class="card-hd">
          <h2 class="card-title">負債配置</h2>
          <p class="alloc-total-label">房貸總額 {{ allocationAmount(debtTotal) }}</p>
        </div>

        <div class="alloc-visual">
          <div class="alloc-chart-wrap">
            <AssetAllocationChart
              :items="debtItems"
              title="負債配置圓餅圖"
              :total="debtTotal"
              @hover:item="activeDebtLabel = $event"
            />
          </div>

          <div class="alloc-list">
            <div
              v-for="item in debtItems"
              :key="item.label"
              class="alloc-item"
              :class="{ 'is-active': activeDebtLabel === item.label }"
            >
              <span class="alloc-dot" :style="{ background: item.color }" />
              <span class="alloc-name">{{ item.label }}</span>
              <span class="alloc-amount">{{ allocationAmount(item.value) }}</span>
              <span class="alloc-track">
                <span
                  class="alloc-fill block"
                  :style="{ width: `${debtPercent(item.value)}%`, background: item.color }"
                />
              </span>
              <span class="alloc-pct">{{ debtPercent(item.value) }}%</span>
            </div>
          </div>
        </div>
      </section>
    </Transition>
  </div>
</template>


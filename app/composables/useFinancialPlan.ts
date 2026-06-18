type YearlyPlanRow = {
  year: number
  value: number
  stockValue: number
  depositValue: number
  cashBalance: number
  demandDepositBalance: number
  fixedDepositBalance: number
  depositInterest: number
  input: number
  withdrawal: number
  downPayment: number
  otherExpense: number
  growth: number
  totalExpense: number
  houseLoan: number
}

type PlanEvent = {
  id: string
  year: number
  label: string
  amount: number
  detail: string
  color?: string
  draggable?: boolean
}

type AllocationBreakdownItem = {
  label: string
  value: number
  color: string
}

const roundWan = (value: number) => Math.round(value * 10) / 10

export const useFinancialPlan = () => {
  const normalizeYears = (value: unknown) => {
    const parsed = Number(value)
    if (!Number.isFinite(parsed)) return 30
    return Math.min(50, Math.max(10, Math.round(parsed)))
  }
  const normalizeEventYear = (value: unknown, maxYear: number) => {
    const parsed = Number(value)
    if (!Number.isFinite(parsed)) return 1
    return Math.min(Math.max(Math.round(parsed), 1), Math.max(maxYear, 1))
  }
  const persistedTotalYears = useCookie('planlab-total-years', {
    default: () => 10,
    sameSite: 'lax',
  })
  const persistedDashboardTrendYears = useCookie('planlab-global-years', {
    default: () => 15,
    sameSite: 'lax',
  })

  const initialAmount = useState('financial-plan:initial-amount', () => 400)
  const monthlyInput = useState('financial-plan:monthly-input', () => 4)
  const returnRate = useState('financial-plan:return-rate', () => 10)
  const totalYears = useState('financial-plan:total-years', () => normalizeYears(persistedTotalYears.value))
  const dashboardTrendYears = useState('financial-plan:global-years', () => normalizeYears(persistedDashboardTrendYears.value))
  const stopInputYear = useState('financial-plan:stop-input-year', () => 30)
  const withdrawalAmount = useState('financial-plan:withdrawal-amount', () => 0)
  const startWithdrawalYear = useState('financial-plan:start-withdrawal-year', () => 31)

  const buyHouse = useState('financial-plan:buy-house', () => true)
  const houseYear = useState('financial-plan:house-year', () => 5)
  const downPayment = useState('financial-plan:down-payment', () => 300)
  const monthlyPayment = useState('financial-plan:monthly-payment', () => 3)
  const loanYears = useState('financial-plan:loan-years', () => 20)

  const cashAmount = useState('financial-plan:cash-amount', () => 0)
  const demandDepositAmount = useState('financial-plan:demand-deposit-amount', () => 200)
  const demandDepositRate = useState('financial-plan:demand-deposit-rate', () => 1.2)
  const demandDepositYears = useState('financial-plan:demand-deposit-years', () => 15)
  const fixedDepositEnabled = useState('financial-plan:fixed-deposit-enabled', () => true)
  const fixedDepositAmount = useState('financial-plan:fixed-deposit-amount', () => 200)
  const fixedDepositRate = useState('financial-plan:fixed-deposit-rate', () => 2)
  const fixedDepositMaturityYear = useState('financial-plan:fixed-deposit-maturity-year', () => 3)
  const currentAge = useState('financial-plan:current-age', () => 30)
  const targetAmount = useState('financial-plan:target-amount', () => 2000)
  const globalMaxYears = computed(() => normalizeYears(dashboardTrendYears.value))
  const clampToGlobalYears = (value: unknown) => normalizeEventYear(value, globalMaxYears.value)
  const ageAtYear = (year: number) => currentAge.value + year

  watch(
    totalYears,
    (value) => {
      persistedTotalYears.value = Math.min(normalizeYears(value), globalMaxYears.value)
    },
    { immediate: true },
  )

  watch(
    dashboardTrendYears,
    (value) => {
      persistedDashboardTrendYears.value = normalizeYears(value)
    },
    { immediate: true },
  )

  watch(
    () => [
      globalMaxYears.value,
      totalYears.value,
      demandDepositYears.value,
      fixedDepositMaturityYear.value,
      houseYear.value,
      loanYears.value,
      stopInputYear.value,
      startWithdrawalYear.value,
    ],
    () => {
      const maxYears = globalMaxYears.value
      const clampedTotalYears = Math.min(normalizeYears(totalYears.value), maxYears)
      if (totalYears.value !== clampedTotalYears) totalYears.value = clampedTotalYears

      const clampedDemandYears = Math.min(normalizeYears(demandDepositYears.value), maxYears)
      if (demandDepositYears.value !== clampedDemandYears) demandDepositYears.value = clampedDemandYears

      const clampedFixedYear = normalizeEventYear(fixedDepositMaturityYear.value, maxYears)
      if (fixedDepositMaturityYear.value !== clampedFixedYear) fixedDepositMaturityYear.value = clampedFixedYear

      const clampedHouseYear = normalizeEventYear(houseYear.value, maxYears)
      if (houseYear.value !== clampedHouseYear) houseYear.value = clampedHouseYear

      const parsedLoanYears = Math.round(Number(loanYears.value))
      const clampedLoanYears = Math.min(Math.max(Number.isFinite(parsedLoanYears) ? parsedLoanYears : 5, 5), maxYears)
      if (loanYears.value !== clampedLoanYears) loanYears.value = clampedLoanYears

      const parsedStopInputYear = Math.round(Number(stopInputYear.value))
      const clampedStopInputYear = Math.min(Math.max(Number.isFinite(parsedStopInputYear) ? parsedStopInputYear : 0, 0), maxYears + 1)
      if (stopInputYear.value !== clampedStopInputYear) stopInputYear.value = clampedStopInputYear

      const parsedStartWithdrawalYear = Math.round(Number(startWithdrawalYear.value))
      const clampedStartWithdrawalYear = Math.min(Math.max(Number.isFinite(parsedStartWithdrawalYear) ? parsedStartWithdrawalYear : 1, 1), maxYears + 1)
      if (startWithdrawalYear.value !== clampedStartWithdrawalYear) startWithdrawalYear.value = clampedStartWithdrawalYear
    },
    { immediate: true },
  )

  const buildYearlyRows = (projectionYears: number, options: { includeHouseEffects?: boolean } = {}): YearlyPlanRow[] => {
    const years = normalizeYears(projectionYears)
    const rows: YearlyPlanRow[] = []
    const includeHouseEffects = options.includeHouseEffects ?? true
    let currentStockValue = initialAmount.value
    const annualRate = returnRate.value / 100
    const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1
    const demandPrincipal = Math.max(demandDepositAmount.value, 0)
    const demandRate = Math.max(demandDepositRate.value, 0) / 100
    const fixedPrincipal = fixedDepositEnabled.value ? Math.max(fixedDepositAmount.value, 0) : 0
    const fixedRate = Math.max(fixedDepositRate.value, 0) / 100
    const fixedMaturityYear = normalizeEventYear(fixedDepositMaturityYear.value, globalMaxYears.value)

    const depositSnapshot = (year: number) => {
      const cashBalance = 0
      const demandGrowthYears = Math.min(year, normalizeYears(demandDepositYears.value))
      const previousDemandGrowthYears = year > 0 ? Math.min(year - 1, normalizeYears(demandDepositYears.value)) : 0
      const demandDepositBalance = demandPrincipal * Math.pow(1 + demandRate, demandGrowthYears)
      const fixedGrowthYears = Math.min(year, fixedMaturityYear)
      const fixedDepositBalance = fixedPrincipal * Math.pow(1 + fixedRate, fixedGrowthYears)
      const previousDemandDepositBalance =
        year > 0 ? demandPrincipal * Math.pow(1 + demandRate, previousDemandGrowthYears) : demandPrincipal
      const previousFixedDepositBalance =
        year > 0 ? fixedPrincipal * Math.pow(1 + fixedRate, Math.min(year - 1, fixedMaturityYear)) : fixedPrincipal
      const depositInterest =
        year > 0
          ? demandDepositBalance - previousDemandDepositBalance + fixedDepositBalance - previousFixedDepositBalance
          : 0

      return {
        cashBalance: roundWan(cashBalance),
        demandDepositBalance: roundWan(demandDepositBalance),
        fixedDepositBalance: roundWan(fixedDepositBalance),
        depositInterest: roundWan(depositInterest),
        depositValue: roundWan(cashBalance + demandDepositBalance + fixedDepositBalance),
      }
    }

    for (let year = 0; year <= years; year += 1) {
      const deposit = depositSnapshot(year)

      if (year === 0) {
        rows.push({
          year: 0,
          value: roundWan(initialAmount.value + deposit.depositValue),
          stockValue: roundWan(initialAmount.value),
          depositValue: deposit.depositValue,
          cashBalance: deposit.cashBalance,
          demandDepositBalance: deposit.demandDepositBalance,
          fixedDepositBalance: deposit.fixedDepositBalance,
          depositInterest: 0,
          input: 0,
          withdrawal: 0,
          downPayment: 0,
          otherExpense: 0,
          growth: 0,
          totalExpense: 0,
          houseLoan: 0,
        })
        continue
      }

      const yearStartStockValue = currentStockValue
      let totalYearInput = 0
      const houseMonthlyExpense =
        includeHouseEffects && buyHouse.value && year >= houseYear.value && year < houseYear.value + loanYears.value
          ? monthlyPayment.value * 12
          : 0
      const shouldInvest = stopInputYear.value > years || year <= stopInputYear.value

      for (let month = 1; month <= 12; month += 1) {
        currentStockValue += currentStockValue * monthlyRate

        if (shouldInvest) {
          const monthInvest = monthlyInput.value - houseMonthlyExpense / 12
          currentStockValue += monthInvest
          totalYearInput += monthInvest
        }
      }

      const downPaymentExpense = includeHouseEffects && buyHouse.value && year === houseYear.value ? downPayment.value : 0
      const yearWithdrawal =
        year >= startWithdrawalYear.value &&
        startWithdrawalYear.value <= years &&
        withdrawalAmount.value > 0
          ? withdrawalAmount.value
          : 0

      currentStockValue -= downPaymentExpense + yearWithdrawal
      if (currentStockValue < 0) currentStockValue = 0

      const stockValue = roundWan(currentStockValue)
      rows.push({
        year,
        value: roundWan(stockValue + deposit.depositValue),
        stockValue,
        depositValue: deposit.depositValue,
        cashBalance: deposit.cashBalance,
        demandDepositBalance: deposit.demandDepositBalance,
        fixedDepositBalance: deposit.fixedDepositBalance,
        depositInterest: deposit.depositInterest,
        input: roundWan(totalYearInput),
        withdrawal: yearWithdrawal,
        downPayment: roundWan(downPaymentExpense),
        otherExpense: 0,
        growth: roundWan(yearStartStockValue * annualRate),
        totalExpense: roundWan(yearWithdrawal),
        houseLoan: roundWan(houseMonthlyExpense),
      })
    }

    return rows
  }

  const yearlyData = computed<YearlyPlanRow[]>(() => buildYearlyRows(totalYears.value, { includeHouseEffects: false }))
  const depositYearlyData = computed<YearlyPlanRow[]>(() => buildYearlyRows(demandDepositYears.value, { includeHouseEffects: false }))
  const dashboardYearlyData = computed<YearlyPlanRow[]>(() => buildYearlyRows(dashboardTrendYears.value, { includeHouseEffects: true }))

  const annualInput = computed(() => monthlyInput.value * 12)
  const totalInput = computed(() => {
    return initialAmount.value + annualInput.value * Math.min(stopInputYear.value, totalYears.value)
  })
  const contributedCapitalForRows = (rows: YearlyPlanRow[]) => {
    const positiveInputs = rows.reduce((sum, row) => sum + Math.max(row.input, 0), 0)
    return roundWan(initialAmount.value + positiveInputs)
  }
  const stockContributedCapital = computed(() => contributedCapitalForRows(yearlyData.value))
  const dashboardStockContributedCapital = computed(() => contributedCapitalForRows(dashboardYearlyData.value))
  const totalWithdrawal = computed(() => yearlyData.value.reduce((sum, row) => sum + row.withdrawal, 0))
  const houseExpenseForYears = (years: number) => {
    if (!buyHouse.value) return 0

    const normalizedYears = normalizeYears(years)
    const paidYears = Math.min(Math.max(normalizedYears - houseYear.value + 1, 0), loanYears.value)
    const downPaymentExpense = houseYear.value <= normalizedYears ? downPayment.value : 0
    return roundWan(downPaymentExpense + monthlyPayment.value * 12 * paidYears)
  }
  const totalHouseExpense = computed(() => houseExpenseForYears(totalYears.value))
  const totalOtherExpense = computed(() => 0)
  const totalMortgageLiability = computed(() => {
    return buyHouse.value ? roundWan(monthlyPayment.value * 12 * loanYears.value) : 0
  })
  const paidMortgageLiabilityForYears = (years: number) => {
    if (!buyHouse.value) return 0

    const paidYears = Math.min(Math.max(years - houseYear.value + 1, 0), loanYears.value)
    return roundWan(monthlyPayment.value * 12 * paidYears)
  }
  const paidMortgageLiability = computed(() => paidMortgageLiabilityForYears(totalYears.value))
  const remainingMortgageLiability = computed(() => {
    return roundWan(Math.max(totalMortgageLiability.value - paidMortgageLiability.value, 0))
  })
  const dashboardPaidMortgageLiability = computed(() => paidMortgageLiabilityForYears(dashboardTrendYears.value))
  const dashboardRemainingMortgageLiability = computed(() => {
    return roundWan(Math.max(totalMortgageLiability.value - dashboardPaidMortgageLiability.value, 0))
  })
  const formatWan = (value: number) => Math.round(value).toLocaleString()

  const stockFinalValue = computed(() => yearlyData.value.at(-1)?.stockValue ?? initialAmount.value)
  const dashboardStockFinalValue = computed(() => dashboardYearlyData.value.at(-1)?.stockValue ?? initialAmount.value)
  const depositPrincipal = computed(() => {
    return Math.max(demandDepositAmount.value, 0) + (fixedDepositEnabled.value ? Math.max(fixedDepositAmount.value, 0) : 0)
  })
  const depositFinalValue = computed(() => depositYearlyData.value.at(-1)?.depositValue ?? depositPrincipal.value)
  const dashboardDepositFinalValue = computed(() => dashboardYearlyData.value.at(-1)?.depositValue ?? depositPrincipal.value)
  const demandDepositFinalValue = computed(() => depositYearlyData.value.at(-1)?.demandDepositBalance ?? demandDepositAmount.value)
  const demandDepositPlannedValue = computed(() => {
    return roundWan(
      Math.max(demandDepositAmount.value, 0) *
        Math.pow(1 + Math.max(demandDepositRate.value, 0) / 100, normalizeYears(demandDepositYears.value)),
    )
  })
  const demandDepositInterest = computed(() => roundWan(Math.max(demandDepositPlannedValue.value - demandDepositAmount.value, 0)))
  const fixedDepositMaturityValue = computed(() => {
    if (!fixedDepositEnabled.value) return 0

    const maturityYear = normalizeEventYear(fixedDepositMaturityYear.value, globalMaxYears.value)
    return roundWan(Math.max(fixedDepositAmount.value, 0) * Math.pow(1 + Math.max(fixedDepositRate.value, 0) / 100, maturityYear))
  })
  const fixedDepositInterest = computed(() => {
    return roundWan(Math.max(fixedDepositMaturityValue.value - Math.max(fixedDepositAmount.value, 0), 0))
  })
  const totalDepositInterest = computed(() => roundWan(Math.max(depositFinalValue.value - depositPrincipal.value, 0)))
  const depositBreakdownForRow = (finalRow?: YearlyPlanRow): AllocationBreakdownItem[] => {
    const items = [
      {
        label: '活存',
        value: finalRow?.demandDepositBalance ?? demandDepositAmount.value,
        color: '#14b8a6',
      },
    ]

    if (fixedDepositEnabled.value) {
      items.push({
        label: '定存',
        value: finalRow?.fixedDepositBalance ?? fixedDepositAmount.value,
        color: '#a855f7',
      })
    }

    return items
  }
  const depositBreakdown = computed<AllocationBreakdownItem[]>(() => depositBreakdownForRow(depositYearlyData.value.at(-1)))
  const dashboardDepositBreakdown = computed<AllocationBreakdownItem[]>(() => depositBreakdownForRow(dashboardYearlyData.value.at(-1)))
  const housePlanEvents = computed<PlanEvent[]>(() => {
    if (!buyHouse.value) return []

    return [
      {
        id: 'house-purchase',
        year: houseYear.value,
        label: '買房事件',
        amount: downPayment.value,
        detail: `頭期款 ${formatWan(downPayment.value)} 萬，年房貸 ${formatWan(monthlyPayment.value * 12)} 萬`,
        color: '#f59e0b',
        draggable: true,
      },
    ]
  })
  const fixedDepositEvents = computed<PlanEvent[]>(() => {
    if (!fixedDepositEnabled.value || fixedDepositAmount.value <= 0) return []

    return [
      {
        id: 'fixed-deposit',
        year: normalizeEventYear(fixedDepositMaturityYear.value, globalMaxYears.value),
        label: '定存事件',
        amount: fixedDepositMaturityValue.value,
        detail: `定存到期 ${formatWan(fixedDepositMaturityValue.value)} 萬，利息 ${formatWan(fixedDepositInterest.value)} 萬`,
        color: '#a855f7',
        draggable: true,
      },
    ]
  })
  const targetAmountReachedRowForRows = (rows: YearlyPlanRow[]) => {
    if (targetAmount.value <= 0) return null
    return rows.find((row) => row.year > 0 && row.value >= targetAmount.value) ?? null
  }
  const targetAmountReachedRow = computed(() => targetAmountReachedRowForRows(yearlyData.value))
  const dashboardTargetAmountReachedRow = computed(() => targetAmountReachedRowForRows(dashboardYearlyData.value))
  const targetAmountReachedAge = computed(() => {
    return targetAmountReachedRow.value ? currentAge.value + targetAmountReachedRow.value.year : null
  })
  const dashboardTargetAmountReachedAge = computed(() => {
    return dashboardTargetAmountReachedRow.value ? currentAge.value + dashboardTargetAmountReachedRow.value.year : null
  })
  const targetAmountEventForRow = (reachedRow: YearlyPlanRow | null, reachedAge: number | null): PlanEvent[] => {
    if (!reachedRow) return []

    return [
      {
        id: 'target-amount',
        year: reachedRow.year,
        label: '目標金額事件',
        amount: targetAmount.value,
        detail: `目標 ${formatWan(targetAmount.value)} 萬，預計年齡 ${reachedAge} 歲`,
        color: '#22c55e',
        draggable: false,
      },
    ]
  }
  const targetAmountEvents = computed<PlanEvent[]>(() => targetAmountEventForRow(targetAmountReachedRow.value, targetAmountReachedAge.value))
  const dashboardTargetAmountEvents = computed<PlanEvent[]>(() => {
    return targetAmountEventForRow(dashboardTargetAmountReachedRow.value, dashboardTargetAmountReachedAge.value)
  })
  const planEvents = computed<PlanEvent[]>(() => [
    ...housePlanEvents.value,
    ...fixedDepositEvents.value,
    ...targetAmountEvents.value,
  ])
  const dashboardPlanEvents = computed<PlanEvent[]>(() => [
    ...housePlanEvents.value,
    ...fixedDepositEvents.value,
    ...dashboardTargetAmountEvents.value,
  ].filter((event) => event.year <= dashboardTrendYears.value))
  const finalValue = computed(() => yearlyData.value.at(-1)?.value ?? initialAmount.value + depositPrincipal.value)
  const dashboardFinalValue = computed(() => dashboardYearlyData.value.at(-1)?.value ?? initialAmount.value + depositPrincipal.value)
  const stockInvestedAssetValue = computed(() => {
    return Math.min(stockContributedCapital.value, stockFinalValue.value)
  })
  const stockCapitalGain = computed(() => {
    return roundWan(Math.max(stockFinalValue.value - stockContributedCapital.value, 0))
  })
  const stockAssetBreakdownForValues = (finalStockValue: number, contributedCapital: number): AllocationBreakdownItem[] => {
    const principalAssetValue = Math.min(initialAmount.value, finalStockValue)
    const availableValue = Math.max(finalStockValue - principalAssetValue, 0)
    const additionalCapital = Math.max(contributedCapital - initialAmount.value, 0)
    const additionalInvestedAssetValue = Math.min(additionalCapital, availableValue)
    const capitalGain = roundWan(Math.max(finalStockValue - contributedCapital, 0))

    return [
      {
        label: '本金',
        value: principalAssetValue,
        color: '#22c55e',
      },
      {
        label: '投入成本',
        value: additionalInvestedAssetValue,
        color: '#f59e0b',
      },
      {
        label: '資本利得',
        value: capitalGain,
        color: '#3b82f6',
      },
    ]
  }
  const stockAssetBreakdown = computed<AllocationBreakdownItem[]>(() => {
    return stockAssetBreakdownForValues(stockFinalValue.value, stockContributedCapital.value)
  })
  const dashboardStockAssetBreakdown = computed<AllocationBreakdownItem[]>(() => {
    return stockAssetBreakdownForValues(dashboardStockFinalValue.value, dashboardStockContributedCapital.value)
  })
  const netProfit = computed(() => {
    return finalValue.value + totalWithdrawal.value + totalHouseExpense.value - totalInput.value - depositPrincipal.value
  })

  return {
    initialAmount,
    monthlyInput,
    returnRate,
    totalYears,
    dashboardTrendYears,
    stopInputYear,
    withdrawalAmount,
    startWithdrawalYear,
    buyHouse,
    houseYear,
    downPayment,
    monthlyPayment,
    loanYears,
    cashAmount,
    demandDepositAmount,
    demandDepositRate,
    demandDepositYears,
    fixedDepositEnabled,
    fixedDepositAmount,
    fixedDepositRate,
    fixedDepositMaturityYear,
    currentAge,
    targetAmount,
    yearlyData,
    depositYearlyData,
    dashboardYearlyData,
    annualInput,
    totalInput,
    stockContributedCapital,
    dashboardStockContributedCapital,
    stockFinalValue,
    dashboardStockFinalValue,
    stockInvestedAssetValue,
    stockCapitalGain,
    stockAssetBreakdown,
    dashboardStockAssetBreakdown,
    depositPrincipal,
    depositFinalValue,
    dashboardDepositFinalValue,
    demandDepositFinalValue,
    demandDepositPlannedValue,
    demandDepositInterest,
    fixedDepositMaturityValue,
    fixedDepositInterest,
    totalDepositInterest,
    depositBreakdown,
    dashboardDepositBreakdown,
    totalWithdrawal,
    totalHouseExpense,
    totalOtherExpense,
    totalMortgageLiability,
    paidMortgageLiability,
    remainingMortgageLiability,
    dashboardPaidMortgageLiability,
    dashboardRemainingMortgageLiability,
    housePlanEvents,
    fixedDepositEvents,
    targetAmountReachedRow,
    targetAmountReachedAge,
    targetAmountEvents,
    dashboardTargetAmountReachedRow,
    dashboardTargetAmountReachedAge,
    dashboardTargetAmountEvents,
    planEvents,
    dashboardPlanEvents,
    finalValue,
    dashboardFinalValue,
    netProfit,
    formatWan,
    ageAtYear,
    globalMaxYears,
    clampToGlobalYears,
  }
}





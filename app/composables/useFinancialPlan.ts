type YearlyPlanRow = {
  year: number
  value: number
  input: number
  withdrawal: number
  downPayment: number
  otherExpense: number
  growth: number
  totalExpense: number
  houseLoan: number
}

type PlanEvent = {
  year: number
  label: string
  amount: number
  detail: string
}

export const useFinancialPlan = () => {
  const normalizeYears = (value: unknown) => {
    const parsed = Number(value)
    if (!Number.isFinite(parsed)) return 30
    return Math.min(50, Math.max(10, Math.round(parsed)))
  }
  const persistedTotalYears = useCookie('planlab-total-years', {
    default: () => 30,
    sameSite: 'lax',
  })

  const initialAmount = useState('financial-plan:initial-amount', () => 400)
  const monthlyInput = useState('financial-plan:monthly-input', () => 4)
  const returnRate = useState('financial-plan:return-rate', () => 10)
  const totalYears = useState('financial-plan:total-years', () => normalizeYears(persistedTotalYears.value))
  const stopInputYear = useState('financial-plan:stop-input-year', () => 30)
  const withdrawalAmount = useState('financial-plan:withdrawal-amount', () => 0)
  const startWithdrawalYear = useState('financial-plan:start-withdrawal-year', () => 31)

  const buyHouse = useState('financial-plan:buy-house', () => false)
  const houseYear = useState('financial-plan:house-year', () => 5)
  const downPayment = useState('financial-plan:down-payment', () => 300)
  const monthlyPayment = useState('financial-plan:monthly-payment', () => 3)
  const loanYears = useState('financial-plan:loan-years', () => 20)

  watch(
    totalYears,
    (value) => {
      persistedTotalYears.value = normalizeYears(value)
    },
    { immediate: true },
  )

  const yearlyData = computed<YearlyPlanRow[]>(() => {
    const rows: YearlyPlanRow[] = []
    let currentValue = initialAmount.value
    const annualRate = returnRate.value / 100
    const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1

    for (let year = 0; year <= totalYears.value; year += 1) {
      if (year === 0) {
        rows.push({
          year: 0,
          value: initialAmount.value,
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

      const yearStartValue = currentValue
      let totalYearInput = 0
      const houseMonthlyExpense =
        buyHouse.value && year >= houseYear.value && year < houseYear.value + loanYears.value
          ? monthlyPayment.value * 12
          : 0
      const shouldInvest = stopInputYear.value > totalYears.value || year <= stopInputYear.value

      for (let month = 1; month <= 12; month += 1) {
        currentValue += currentValue * monthlyRate

        if (shouldInvest) {
          const monthInvest = monthlyInput.value - houseMonthlyExpense / 12
          currentValue += monthInvest
          totalYearInput += monthInvest
        }
      }

      const downPaymentExpense = buyHouse.value && year === houseYear.value ? downPayment.value : 0
      const yearWithdrawal =
        year >= startWithdrawalYear.value &&
        startWithdrawalYear.value <= totalYears.value &&
        withdrawalAmount.value > 0
          ? withdrawalAmount.value
          : 0

      currentValue -= downPaymentExpense + yearWithdrawal
      if (currentValue < 0) currentValue = 0

      rows.push({
        year,
        value: Math.round(currentValue * 10) / 10,
        input: Math.round(totalYearInput * 10) / 10,
        withdrawal: yearWithdrawal,
        downPayment: Math.round(downPaymentExpense * 10) / 10,
        otherExpense: 0,
        growth: Math.round(yearStartValue * annualRate * 10) / 10,
        totalExpense: Math.round(yearWithdrawal * 10) / 10,
        houseLoan: Math.round(houseMonthlyExpense * 10) / 10,
      })
    }

    return rows
  })

  const annualInput = computed(() => monthlyInput.value * 12)
  const totalInput = computed(() => {
    return initialAmount.value + annualInput.value * Math.min(stopInputYear.value, totalYears.value)
  })
  const stockContributedCapital = computed(() => {
    const positiveInputs = yearlyData.value.reduce((sum, row) => sum + Math.max(row.input, 0), 0)
    return Math.round((initialAmount.value + positiveInputs) * 10) / 10
  })
  const totalWithdrawal = computed(() => yearlyData.value.reduce((sum, row) => sum + row.withdrawal, 0))
  const totalHouseExpense = computed(() => {
    return yearlyData.value.reduce((sum, row) => sum + row.downPayment + row.houseLoan, 0)
  })
  const totalOtherExpense = computed(() => 0)
  const totalMortgageLiability = computed(() => {
    return buyHouse.value ? Math.round(monthlyPayment.value * 12 * loanYears.value * 10) / 10 : 0
  })
  const paidMortgageLiability = computed(() => {
    if (!buyHouse.value) return 0

    const paidYears = Math.min(Math.max(totalYears.value - houseYear.value + 1, 0), loanYears.value)
    return Math.round(monthlyPayment.value * 12 * paidYears * 10) / 10
  })
  const remainingMortgageLiability = computed(() => {
    return Math.round(Math.max(totalMortgageLiability.value - paidMortgageLiability.value, 0) * 10) / 10
  })
  const housePlanEvents = computed<PlanEvent[]>(() => {
    if (!buyHouse.value) return []

    return [
      {
        year: houseYear.value,
        label: '買房事件',
        amount: downPayment.value,
        detail: `頭期款 ${formatWan(downPayment.value)} 萬，年房貸 ${formatWan(monthlyPayment.value * 12)} 萬`,
      },
    ]
  })
  const finalValue = computed(() => yearlyData.value.at(-1)?.value ?? initialAmount.value)
  const stockPrincipalAssetValue = computed(() => Math.min(initialAmount.value, finalValue.value))
  const stockAdditionalInvestedAssetValue = computed(() => {
    const availableValue = Math.max(finalValue.value - stockPrincipalAssetValue.value, 0)
    const additionalCapital = Math.max(stockContributedCapital.value - initialAmount.value, 0)
    return Math.min(additionalCapital, availableValue)
  })
  const stockInvestedAssetValue = computed(() => {
    return Math.min(stockContributedCapital.value, finalValue.value)
  })
  const stockCapitalGain = computed(() => {
    return Math.round(Math.max(finalValue.value - stockContributedCapital.value, 0) * 10) / 10
  })
  const stockAssetBreakdown = computed(() => [
    {
      label: '本金',
      value: stockPrincipalAssetValue.value,
      color: '#22c55e',
    },
    {
      label: '投入成本',
      value: stockAdditionalInvestedAssetValue.value,
      color: '#f59e0b',
    },
    {
      label: '資本利得',
      value: stockCapitalGain.value,
      color: '#3b82f6',
    },
  ])
  const netProfit = computed(() => {
    return finalValue.value + totalWithdrawal.value + totalHouseExpense.value - totalInput.value
  })
  const formatWan = (value: number) => Math.round(value).toLocaleString()

  return {
    initialAmount,
    monthlyInput,
    returnRate,
    totalYears,
    stopInputYear,
    withdrawalAmount,
    startWithdrawalYear,
    buyHouse,
    houseYear,
    downPayment,
    monthlyPayment,
    loanYears,
    yearlyData,
    annualInput,
    totalInput,
    stockContributedCapital,
    stockInvestedAssetValue,
    stockCapitalGain,
    stockAssetBreakdown,
    totalWithdrawal,
    totalHouseExpense,
    totalOtherExpense,
    totalMortgageLiability,
    paidMortgageLiability,
    remainingMortgageLiability,
    housePlanEvents,
    finalValue,
    netProfit,
    formatWan,
  }
}

import { chromium } from '@playwright/test'

const baseUrl = process.env.TARGET_URL ?? 'http://127.0.0.1:3000'

const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL ?? 'msedge',
  headless: true,
})

const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

const fail = async (message) => {
  await browser.close()
  throw new Error(message)
}

const setRangeValue = async (locator, value) => {
  await locator.evaluate((input, nextValue) => {
    input.value = String(nextValue)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
  }, value)
}

const goTo = async (name) => {
  await page.getByRole('link', { name }).click()
}

const parseWan = (text) => {
  const match = text?.replace(/,/g, '').match(/([0-9]+(?:\.[0-9]+)?)\s*萬/)
  return match ? Number(match[1]) : NaN
}

const dashboardAllocationAmount = async (label) => {
  const item = page.locator('.alloc-item').filter({ has: page.locator('.alloc-name', { hasText: label }) }).first()
  const amountText = await item.locator('.alloc-amount').textContent()
  const amount = parseWan(amountText)
  if (!Number.isFinite(amount)) await fail(`Expected dashboard ${label} allocation amount, got: ${amountText}`)
  return amount
}

await page.goto(new URL('/settings', baseUrl).toString(), { waitUntil: 'networkidle' })
const globalYearsInput = page.locator('label.range-field').filter({ hasText: '年數' }).locator('input[type="range"]')
await setRangeValue(globalYearsInput, 15)

await goTo(/股票/)
const stockYearsInput = page.locator('label.range-field').filter({ hasText: '規劃年數' }).locator('input[type="range"]')
await setRangeValue(stockYearsInput, 10)
await page.getByText('規劃年數：10 年', { exact: false }).first().waitFor({ state: 'visible' })
const stockTotalText = await page.locator('.alloc-total-label').filter({ hasText: '股票總額' }).first().textContent()
const tenYearStockTotal = parseWan(stockTotalText)
if (!Number.isFinite(tenYearStockTotal)) await fail(`Expected 10-year stock total, got: ${stockTotalText}`)

await goTo(/存款/)
const demandAmountInput = page.locator('label.range-field').filter({ hasText: '活存本金' }).locator('input[type="range"]')
const demandRateInput = page.locator('label.range-field').filter({ hasText: '活存年利率' }).locator('input[type="range"]')
const demandYearsInput = page.locator('label.range-field').filter({ hasText: '活存規劃年數' }).locator('input[type="range"]')
await setRangeValue(demandAmountInput, 1000)
await setRangeValue(demandRateInput, 5)
await setRangeValue(demandYearsInput, 10)
await page.getByText('活存規劃年數：10 年', { exact: false }).first().waitFor({ state: 'visible' })
const depositTotalAt10Text = await page.locator('.alloc-total-label').filter({ hasText: '存款總額' }).first().textContent()
const depositTotalAt10 = parseWan(depositTotalAt10Text)
if (!Number.isFinite(depositTotalAt10)) await fail(`Expected 10-year deposit detail total, got: ${depositTotalAt10Text}`)

await setRangeValue(demandYearsInput, 15)
await page.getByText('活存規劃年數：15 年', { exact: false }).first().waitFor({ state: 'visible' })
const depositTotalAt15Text = await page.locator('.alloc-total-label').filter({ hasText: '存款總額' }).first().textContent()
const depositTotalAt15 = parseWan(depositTotalAt15Text)
if (!Number.isFinite(depositTotalAt15)) await fail(`Expected 15-year deposit detail total, got: ${depositTotalAt15Text}`)
if (depositTotalAt15 <= depositTotalAt10) {
  await fail(`Expected deposit detail total to increase when demand-deposit years increase, got ${depositTotalAt10} -> ${depositTotalAt15}.`)
}

await goTo(/首頁/)
await page.getByText('資產配置', { exact: false }).first().waitFor({ state: 'visible' })
const dashboardStockAmount = await dashboardAllocationAmount('股票')
if (dashboardStockAmount !== tenYearStockTotal) {
  await fail(`Expected dashboard stock allocation to use 10-year stock total ${tenYearStockTotal} 萬, got ${dashboardStockAmount} 萬.`)
}

await browser.close()


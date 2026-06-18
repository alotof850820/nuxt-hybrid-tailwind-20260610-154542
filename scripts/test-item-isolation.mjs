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

const stockSnapshot = async () => {
  await goTo(/股票/)
  await page.getByText('股票資產細節', { exact: false }).first().waitFor({ state: 'visible' })
  const totalText = (await page.locator('.alloc-total-label').first().textContent())?.replace(/\s/g, '') ?? ''
  const capitalGainText = (await page.locator('[data-kpi="capital-gain"] .kpi-value').first().textContent())?.replace(/\s/g, '') ?? ''
  const chartLabel = await page.locator('canvas[aria-label*="股票資產細節圓餅圖"]').getAttribute('aria-label')

  if (!totalText.includes('股票總額')) await fail(`Expected stock total text, got: ${totalText}`)
  if (!capitalGainText.includes('萬')) await fail(`Expected stock capital gain text, got: ${capitalGainText}`)
  if (!chartLabel?.includes('股票資產細節圓餅圖')) await fail(`Expected stock detail chart label, got: ${chartLabel}`)

  return { totalText, capitalGainText, chartLabel }
}

const dashboardTotal = async () => {
  await goTo(/首頁/)
  await page.getByText('總資產', { exact: false }).first().waitFor({ state: 'visible' })
  return (await page.locator('.kpi').filter({ hasText: '總資產' }).locator('.kpi-value').first().textContent())?.replace(/\s/g, '') ?? ''
}

const configureHouse = async ({ enabled }) => {
  await goTo(/買房規劃/)
  const checkbox = page.getByLabel('啟用買房規劃')
  if (enabled) {
    await checkbox.check()
    await setRangeValue(page.locator('label.range-field').filter({ hasText: '買房' }).locator('input[type="range"]'), 1)
    await setRangeValue(page.locator('label.range-field').filter({ hasText: '頭期款' }).locator('input[type="range"]'), 1000)
    await setRangeValue(page.locator('label.range-field').filter({ hasText: '月付' }).locator('input[type="range"]'), 10)
    await setRangeValue(page.locator('label.range-field').filter({ hasText: '貸款年限' }).locator('input[type="range"]'), 40)
  } else {
    await checkbox.uncheck()
  }
}

await page.goto(new URL('/dashboard', baseUrl).toString(), { waitUntil: 'networkidle' })
await page.getByRole('link', { name: /股票/ }).waitFor({ state: 'visible' })

await configureHouse({ enabled: false })
const stockWithoutHouse = await stockSnapshot()
const dashboardWithoutHouse = await dashboardTotal()

await configureHouse({ enabled: true })
const stockWithHouse = await stockSnapshot()
const dashboardWithHouse = await dashboardTotal()

if (stockWithHouse.totalText !== stockWithoutHouse.totalText) {
  await fail(`Expected stock page total to ignore house planning, got ${stockWithoutHouse.totalText} without house and ${stockWithHouse.totalText} with house.`)
}

if (stockWithHouse.capitalGainText !== stockWithoutHouse.capitalGainText) {
  await fail(`Expected stock capital gain to ignore house planning, got ${stockWithoutHouse.capitalGainText} without house and ${stockWithHouse.capitalGainText} with house.`)
}

if (stockWithHouse.chartLabel !== stockWithoutHouse.chartLabel) {
  await fail(`Expected stock detail chart label to ignore house planning, got ${stockWithoutHouse.chartLabel} without house and ${stockWithHouse.chartLabel} with house.`)
}

if (dashboardWithHouse === dashboardWithoutHouse) {
  await fail(`Expected dashboard total assets to integrate house planning, but both scenarios showed ${dashboardWithHouse}.`)
}

await page.getByText('買房事件', { exact: false }).first().waitFor({ state: 'visible' })
await page.getByText('負債配置', { exact: false }).first().waitFor({ state: 'visible' })

await browser.close()

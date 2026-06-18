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

await page.goto(new URL('/settings', baseUrl).toString(), { waitUntil: 'networkidle' })

for (const text of ['全域設定', '年齡', '目前年齡', '目標金額']) {
  await page.getByText(text, { exact: false }).first().waitFor({ state: 'visible' })
}

for (const text of ['本金設定', '初始本金']) {
  const count = await page.getByText(text, { exact: false }).count()
  if (count > 0) await fail(`Expected settings page not to include ${text}.`)
}

const currentAgeInput = page
  .locator('label.range-field')
  .filter({ hasText: '目前年齡' })
  .locator('input[type="range"]')
const targetAmountInput = page
  .locator('label.range-field')
  .filter({ hasText: '目標金額' })
  .locator('input[type="range"]')

await setRangeValue(currentAgeInput, 35)
await setRangeValue(targetAmountInput, 1200)

await page.getByRole('link', { name: /股票/ }).click()

for (const text of ['本金設定', '初始本金', '投資基本設定']) {
  await page.getByText(text, { exact: false }).first().waitFor({ state: 'visible' })
}

const initialAmountInput = page
  .locator('label.range-field')
  .filter({ hasText: '初始本金' })
  .locator('input[type="range"]')

await setRangeValue(initialAmountInput, 600)

await page.getByRole('link', { name: /首頁/ }).click()

for (const text of ['目標金額事件', '目標 1,200 萬', '預計年齡']) {
  await page.getByText(text, { exact: false }).first().waitFor({ state: 'visible' })
}

const allocationCanvas = page.locator('canvas[aria-label*="資產配置圓餅圖"]')
await allocationCanvas.waitFor({ state: 'visible' })
const allocationLabel = await allocationCanvas.getAttribute('aria-label')
if (!allocationLabel?.includes('本金 600 萬')) {
  await fail(`Expected allocation chart to reflect stock principal 600 萬, got: ${allocationLabel}`)
}

const trendCanvas = page.locator('canvas[aria-label*="目標金額事件"]')
await trendCanvas.waitFor({ state: 'visible' })
const trendLabel = await trendCanvas.getAttribute('aria-label')
for (const text of ['目標金額事件', '目標 1,200 萬', '預計年齡']) {
  if (!trendLabel?.includes(text)) {
    await fail(`Expected trend chart label to include ${text}, got: ${trendLabel}`)
  }
}

await page.getByRole('link', { name: /明細/ }).click()
await page.waitForURL(/\/details$/, { timeout: 3000 })

for (const text of ['年齡', '目標金額事件']) {
  await page.getByText(text, { exact: false }).first().waitFor({ state: 'visible' })
}

const targetEventRows = await page.locator('[data-event-row="target-amount"]').count()
if (targetEventRows !== 1) {
  await fail(`Expected one target amount event row, got ${targetEventRows}`)
}

await browser.close()

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

await page.goto(new URL('/deposits', baseUrl).toString(), { waitUntil: 'networkidle' })

for (const text of ['存款', '活存', '定存', '啟用定存', '活存年利率', '活存規劃年數', '定存年利率', '定存到期']) {
  await page.getByText(text, { exact: false }).first().waitFor({ state: 'visible' })
}

const bodyText = await page.locator('body').innerText()
if (bodyText.includes('現金')) {
  await fail('Expected cash to be merged into demand deposits and removed as a separate visible deposit item.')
}

const fixedDepositToggle = page.getByLabel('啟用定存')
if (!(await fixedDepositToggle.isChecked())) {
  await fail('Expected fixed deposit settings to be enabled through a checked checkbox by default.')
}

await fixedDepositToggle.uncheck()
await page.getByRole('link', { name: /首頁/ }).click()
const disabledFixedEvents = await page.getByText('定存事件', { exact: false }).count()
if (disabledFixedEvents > 0) {
  await fail('Expected fixed deposit events to disappear when fixed deposits are disabled.')
}

await page.getByRole('link', { name: /存款/ }).click()
await page.getByLabel('啟用定存').check()

const demandDepositYearsInput = page
  .locator('label.range-field')
  .filter({ hasText: '活存規劃年數' })
  .locator('input[type="range"]')
await setRangeValue(demandDepositYearsInput, 12)

await page.getByText('活存規劃至 42 歲', { exact: false }).first().waitFor({ state: 'visible' })

const fixedDepositYearInput = page
  .locator('label.range-field')
  .filter({ hasText: '定存到期' })
  .locator('input[type="range"]')

await setRangeValue(fixedDepositYearInput, 8)

await page.getByRole('link', { name: /首頁/ }).click()

for (const text of ['資產配置', '存款', '定存事件', '38 歲']) {
  await page.getByText(text, { exact: false }).first().waitFor({ state: 'visible' })
}

const allocationCanvas = page.locator('canvas[aria-label*="資產配置圓餅圖"]')
await allocationCanvas.waitFor({ state: 'visible' })
const allocationLabel = await allocationCanvas.getAttribute('aria-label')

for (const text of ['存款', '存款細節', '活存', '定存']) {
  if (!allocationLabel?.includes(text)) {
    await fail(`Expected dashboard allocation chart label to include ${text}, got: ${allocationLabel}`)
  }
}
if (allocationLabel?.includes('現金')) {
  await fail(`Expected dashboard allocation chart to merge cash into demand deposits, got: ${allocationLabel}`)
}

const trendCanvas = page.locator('canvas[aria-label*="定存事件 38 歲"]')
await trendCanvas.waitFor({ state: 'visible' })

const trendLabel = await trendCanvas.getAttribute('aria-label')
for (const text of ['定存事件', '定存到期', '利息']) {
  if (!trendLabel?.includes(text)) {
    await fail(`Expected dashboard trend chart label to include ${text}, got: ${trendLabel}`)
  }
}

await page.getByRole('link', { name: /明細/ }).click()

for (const text of ['存款利息', '定存事件']) {
  await page.getByText(text, { exact: false }).first().waitFor({ state: 'visible' })
}

const fixedDepositEventRows = await page.locator('[data-event-row="fixed-deposit"]').count()
if (fixedDepositEventRows !== 1) {
  await fail(`Expected one fixed deposit event row, got ${fixedDepositEventRows}`)
}

await page.getByRole('link', { name: /股票/ }).click()
const stockDetailCanvas = page.locator('canvas[aria-label*="股票資產細節圓餅圖"]')
await stockDetailCanvas.waitFor({ state: 'visible' })
const stockDetailLabel = await stockDetailCanvas.getAttribute('aria-label')
if (stockDetailLabel?.includes('存款')) {
  await fail(`Expected stock detail chart to remain stock-only, got: ${stockDetailLabel}`)
}

await browser.close()

import { chromium } from '@playwright/test'

const baseUrl = process.env.TARGET_URL ?? 'http://127.0.0.1:3000'

const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL ?? 'msedge',
  headless: true,
})

const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
const targetOrigin = new URL(baseUrl)

await page.context().addCookies([
  {
    name: 'planlab-dashboard-trend-years',
    value: '10',
    domain: targetOrigin.hostname,
    path: '/',
  },
])

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

const expectCanvasPainted = async () => {
  const painted = await page.locator('canvas[aria-label*="資產變化趨勢"]').evaluate((canvas) => {
    const context = canvas.getContext('2d')
    if (!context || canvas.width === 0 || canvas.height === 0) return false

    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
    for (let index = 3; index < pixels.length; index += 4) {
      if (pixels[index] > 0) return true
    }
    return false
  })

  if (!painted) await fail('Asset trend chart canvas is blank.')
}

await page.goto(new URL('/settings', baseUrl).toString(), { waitUntil: 'networkidle' })

await page.getByText('年數', { exact: false }).first().waitFor({ state: 'visible' })

const legacyHomepageYearsCount = await page.getByText('首頁年份', { exact: false }).count()
if (legacyHomepageYearsCount > 0) {
  await fail('Expected global settings to use 年數 instead of 首頁年份.')
}

for (const text of ['目前年齡：30 歲', '年數：15 年', '目標金額：2,000 萬']) {
  await page.getByText(text, { exact: false }).first().waitFor({ state: 'visible' })
}

const dashboardYearsInput = page
  .locator('label.range-field')
  .filter({ hasText: '年數' })
  .locator('input[type="range"]')

await setRangeValue(dashboardYearsInput, 42)

await page.goto(new URL('/stocks', baseUrl).toString(), { waitUntil: 'networkidle' })

const totalYearsInput = page
  .locator('label.range-field')
  .filter({ hasText: '規劃年數' })
  .locator('input[type="range"]')

await setRangeValue(totalYearsInput, 18)
await page.goto(new URL('/dashboard', baseUrl).toString(), { waitUntil: 'networkidle' })

const tabs = page.locator('.period-tabs .ptab')
await tabs.first().waitFor({ state: 'visible' })

const tabTexts = await tabs.allTextContents()
if (tabTexts.length !== 1 || tabTexts[0].trim() !== '42Y') {
  await fail(`Expected dashboard trend tab to follow the global dashboard year setting as 42Y, got: ${tabTexts.join(', ')}`)
}

const tabAriaLabel = await tabs.first().getAttribute('aria-label')
if (!tabAriaLabel?.includes('年數 42 年')) {
  await fail(`Expected dashboard trend tab aria label to describe the global dashboard year setting, got: ${tabAriaLabel}`)
}

await expectCanvasPainted()

const trendCanvas = page.locator('canvas[aria-label*="資產變化趨勢"]')
const trendLabel = await trendCanvas.getAttribute('aria-label')
for (const text of ['年齡軸', '30 歲', '72 歲']) {
  if (!trendLabel?.includes(text)) {
    await fail(`Expected trend chart aria label to include age-axis text ${text}, got: ${trendLabel}`)
  }
}

await page.getByRole('link', { name: /明細/ }).click()
await page.waitForURL(/\/details$/, { timeout: 3000 })

const detailRows = await page.locator('tbody .detail-row').count()
if (detailRows !== 42) {
  await fail(`Expected annual detail rows to follow the global year count 42, got ${detailRows}.`)
}

for (const text of ['31 歲', '72 歲']) {
  await page.getByText(text, { exact: false }).first().waitFor({ state: 'visible' })
}

const legacyYearRowLabels = await page.locator('tbody .detail-row').filter({ hasText: /第 \d+ 年/ }).count()
if (legacyYearRowLabels > 0) {
  await fail('Expected annual detail row labels to display ages instead of 第 N 年.')
}

await page.goto(new URL('/dashboard', baseUrl).toString(), { waitUntil: 'networkidle' })

await page.reload({ waitUntil: 'networkidle' })

const reloadedTabTexts = await tabs.allTextContents()
if (reloadedTabTexts.length !== 1 || reloadedTabTexts[0].trim() !== '42Y') {
  await fail(`Expected reloaded dashboard trend tab to remain 42Y, got: ${reloadedTabTexts.join(', ')}`)
}

await expectCanvasPainted()
await browser.close()

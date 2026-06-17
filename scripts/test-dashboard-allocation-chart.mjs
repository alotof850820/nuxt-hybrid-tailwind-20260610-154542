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

await page.goto(new URL('/dashboard', baseUrl).toString(), { waitUntil: 'networkidle' })

for (const text of ['資產配置', '配置總額', '本金', '股票']) {
  await page.getByText(text, { exact: false }).first().waitFor({ state: 'visible' })
}

const chartCanvas = page.locator('canvas[aria-label*="資產配置圓餅圖"]')
await chartCanvas.waitFor({ state: 'visible' })

const totalAssetsText = await page.locator('.kpi').filter({ hasText: '總資產' }).locator('.kpi-value').first().textContent()
const allocationTotalText = await page.locator('.alloc-total-label').first().textContent()

const totalAssetsAmount = totalAssetsText?.replace(/\s/g, '')
const allocationTotalAmount = allocationTotalText?.replace('配置總額', '').replace(/\s/g, '')
if (totalAssetsAmount !== allocationTotalAmount) {
  await fail(`Expected total assets and allocation total to match, got ${totalAssetsAmount} and ${allocationTotalAmount}`)
}

const chartLabel = await chartCanvas.getAttribute('aria-label')
for (const text of ['總額', '本金', '股票', '股票細節', '投入成本', '資本利得']) {
  if (!chartLabel?.includes(text)) {
    await fail(`Expected allocation chart label to include ${text}, got: ${chartLabel}`)
  }
}

const outsidePrincipalSummary = await page.locator('.alloc-summary').count()
if (outsidePrincipalSummary > 0) {
  await fail('Expected principal to be displayed inside the doughnut chart, not as an external allocation summary row.')
}

const painted = await chartCanvas.evaluate((canvas) => {
  const context = canvas.getContext('2d')
  if (!context || canvas.width === 0 || canvas.height === 0) return false

  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
  for (let index = 3; index < pixels.length; index += 4) {
    if (pixels[index] > 0) return true
  }
  return false
})

if (!painted) await fail('Asset allocation doughnut chart canvas is blank.')

const percentages = await page.locator('.alloc-pct').allTextContents()
if (!percentages.some((text) => text.trim().endsWith('%'))) {
  await fail(`Expected allocation percentages, got: ${percentages.join(', ')}`)
}

await page.goto(new URL('/stocks', baseUrl).toString(), { waitUntil: 'networkidle' })

for (const text of ['股票資產細節', '投入成本', '資本利得']) {
  await page.getByText(text, { exact: false }).first().waitFor({ state: 'visible' })
}

const stockDetailCanvas = page.locator('canvas[aria-label*="股票資產細節圓餅圖"]')
await stockDetailCanvas.waitFor({ state: 'visible' })

const stockDetailLabel = await stockDetailCanvas.getAttribute('aria-label')
for (const text of ['總額', '投入成本', '資本利得']) {
  if (!stockDetailLabel?.includes(text)) {
    await fail(`Expected stock detail chart label to include ${text}, got: ${stockDetailLabel}`)
  }
}

await page.getByRole('link', { name: /買房規劃/ }).click()
await page.getByLabel('啟用買房規劃').check()
await page.getByRole('link', { name: /首頁/ }).click()

for (const text of ['買房事件', '頭期款', '負債配置', '剩餘房貸', '已支付房貸']) {
  await page.getByText(text, { exact: false }).first().waitFor({ state: 'visible' })
}

const trendCanvasWithHouseEvent = page.locator('canvas[aria-label*="買房事件"]')
await trendCanvasWithHouseEvent.waitFor({ state: 'visible' })
await page.getByText('第 5 年', { exact: false }).first().waitFor({ state: 'visible' })

const trendCanvasBox = await trendCanvasWithHouseEvent.boundingBox()
if (!trendCanvasBox) await fail('Expected trend chart canvas bounding box for dragging house event.')

const dragStartX = trendCanvasBox.x + trendCanvasBox.width * (5 / 30)
const dragTargetX = trendCanvasBox.x + trendCanvasBox.width * (11 / 30)
const dragY = trendCanvasBox.y + trendCanvasBox.height / 2
await page.mouse.move(dragStartX, dragY)
await page.mouse.down()
await page.mouse.move(dragTargetX, dragY, { steps: 8 })
await page.mouse.up()

await page.getByText('第 10 年', { exact: false }).first().waitFor({ state: 'visible' })
const draggedTrendLabel = await trendCanvasWithHouseEvent.getAttribute('aria-label')
if (!draggedTrendLabel?.includes('買房事件 第 10 年')) {
  await fail(`Expected dragging house event to update the trend chart label to year 10, got: ${draggedTrendLabel}`)
}

const debtChartCanvas = page.locator('canvas[aria-label*="負債配置圓餅圖"]')
await debtChartCanvas.waitFor({ state: 'visible' })

const debtChartLabel = await debtChartCanvas.getAttribute('aria-label')
for (const text of ['總額', '剩餘房貸', '已支付房貸']) {
  if (!debtChartLabel?.includes(text)) {
    await fail(`Expected debt chart label to include ${text}, got: ${debtChartLabel}`)
  }
}

await browser.close()

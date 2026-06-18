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

const parseWan = (text) => {
  const match = text?.replace(/,/g, '').match(/([0-9]+(?:\.[0-9]+)?)\s*萬/)
  return match ? Number(match[1]) : NaN
}

await page.goto(new URL('/dashboard', baseUrl).toString(), { waitUntil: 'networkidle' })

for (const text of ['資產配置', '配置總額', '股票', '存款']) {
  await page.getByText(text, { exact: false }).first().waitFor({ state: 'visible' })
}

const assetAllocationCard = page.locator('section.alloc-card').filter({ hasText: '資產配置' }).first()
const allocationMainNames = (await assetAllocationCard.locator('.alloc-name').allTextContents()).map((text) => text.trim())
for (const text of ['股票', '存款']) {
  if (!allocationMainNames.includes(text)) {
    await fail(`Expected ${text} as a main allocation slice, got: ${allocationMainNames.join(', ')}`)
  }
}
if (allocationMainNames.includes('本金')) {
  await fail(`Expected principal to be merged into the stock allocation slice, got: ${allocationMainNames.join(', ')}`)
}

const chartCanvas = page.locator('canvas[aria-label*="資產配置圓餅圖"]')
await chartCanvas.waitFor({ state: 'visible' })

const allocationTotalText = await page.locator('.alloc-total-label').first().textContent()
const allocationTotalAmount = parseWan(allocationTotalText)
const allocationSliceAmounts = await assetAllocationCard.locator('.alloc-item > .alloc-amount').allTextContents()
const allocationSliceTotal = allocationSliceAmounts.reduce((sum, text) => sum + parseWan(text), 0)
if (allocationTotalAmount !== allocationSliceTotal) {
  await fail(`Expected allocation total to equal the allocation item sum, got ${allocationTotalAmount} and ${allocationSliceTotal}`)
}

const chartLabel = await chartCanvas.getAttribute('aria-label')
for (const text of ['總額', '股票', '股票細節 本金', '投入成本', '資本利得', '存款']) {
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

const monthlyReturnCount = await page.getByText('本月回報', { exact: false }).count()
if (monthlyReturnCount > 0) {
  await fail('Expected the stocks page to remove the monthly return KPI.')
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
if ((await trendCanvasWithHouseEvent.getAttribute('data-trend-animation')) !== 'smooth-event') {
  await fail('Expected asset trend chart to declare smooth event animation behavior.')
}
await page.getByText('35 歲', { exact: false }).first().waitFor({ state: 'visible' })

const trendCanvasBox = await trendCanvasWithHouseEvent.boundingBox()
if (!trendCanvasBox) await fail('Expected trend chart canvas bounding box for dragging house event.')

const periodText = await page.locator('.period-tabs .ptab').first().textContent()
const totalYears = Number(periodText?.replace(/\D/g, '')) || 30
const dragStartYear = 5
const dragTargetYear = Math.min(10, totalYears)
const dragStartX = trendCanvasBox.x + trendCanvasBox.width * (dragStartYear / totalYears)
const dragTargetX = trendCanvasBox.x + trendCanvasBox.width * (dragTargetYear / totalYears)
const dragY = trendCanvasBox.y + trendCanvasBox.height / 2
const blankX = trendCanvasBox.x + trendCanvasBox.width - 8
const blankY = trendCanvasBox.y + trendCanvasBox.height - 8

await page.mouse.move(blankX, blankY)
const outsideCursor = await trendCanvasWithHouseEvent.evaluate((canvas) => getComputedStyle(canvas).cursor)
if (outsideCursor !== 'default') {
  await fail(`Expected cursor outside the house event tag to be default, got: ${outsideCursor}`)
}

await page.mouse.move(blankX, blankY)
const chartBodyCursor = await trendCanvasWithHouseEvent.evaluate((canvas) => getComputedStyle(canvas).cursor)
if (chartBodyCursor !== 'default') {
  await fail(`Expected cursor away from the house event tag to be default, got: ${chartBodyCursor}`)
}
await page.mouse.down()
await page.mouse.move(dragTargetX, blankY, { steps: 8 })
await page.mouse.up()
await page.waitForTimeout(120)

const nonTagDraggedTrendLabel = await trendCanvasWithHouseEvent.getAttribute('aria-label')
if (!nonTagDraggedTrendLabel?.includes('買房事件 35 歲')) {
  await fail(`Expected dragging outside the house event tag to keep year 5, got: ${nonTagDraggedTrendLabel}`)
}

let tagPoint = null
for (const yRatio of [0.08, 0.14, 0.2, 0.26, 0.32, 0.38, 0.44, 0.5, 0.58, 0.64, 0.7, 0.76]) {
  for (const xOffset of [-65, -52, -39, -26, -13, 0, 13, 26, 39, 52, 65, 78]) {
    const x = dragStartX + xOffset
    const y = trendCanvasBox.y + trendCanvasBox.height * yRatio
    await page.mouse.move(x, y)
    const cursor = await trendCanvasWithHouseEvent.evaluate((canvas) => getComputedStyle(canvas).cursor)
    if (cursor === 'grab') {
      tagPoint = { x, y }
      break
    }
  }
  if (tagPoint) break
}

if (!tagPoint) {
  await fail('Expected cursor to become grab inside the house event tag hitbox.')
}

await page.mouse.move(tagPoint.x, tagPoint.y)
await page.mouse.down()
let draggedTrendLabel = null
for (let index = 1; index <= 24; index += 1) {
  const x = trendCanvasBox.x + trendCanvasBox.width * (index / 25)
  await page.mouse.move(x, tagPoint.y, { steps: 2 })
  await page.waitForTimeout(24)
  draggedTrendLabel = await trendCanvasWithHouseEvent.getAttribute('aria-label')
  if (draggedTrendLabel?.includes(`買房事件 ${30 + dragTargetYear} 歲`)) break
}
await page.mouse.up()

await page.getByText(`${30 + dragTargetYear} 歲`, { exact: false }).first().waitFor({ state: 'visible' })
await page.locator('.event-chip.is-pulsing').first().waitFor({ state: 'visible' })
draggedTrendLabel = await trendCanvasWithHouseEvent.getAttribute('aria-label')
if (!draggedTrendLabel?.includes(`買房事件 ${30 + dragTargetYear} 歲`)) {
  await fail(`Expected dragging house event to update the trend chart label to year ${dragTargetYear}, got: ${draggedTrendLabel}`)
}

const debtChartCanvas = page.locator('canvas[aria-label*="負債配置圓餅圖"]')
await debtChartCanvas.waitFor({ state: 'visible' })
if ((await debtChartCanvas.getAttribute('data-count-up')) !== 'true') {
  await fail('Expected debt allocation chart center total to use count-up animation.')
}

const debtChartLabel = await debtChartCanvas.getAttribute('aria-label')
for (const text of ['總額', '剩餘房貸', '已支付房貸']) {
  if (!debtChartLabel?.includes(text)) {
    await fail(`Expected debt chart label to include ${text}, got: ${debtChartLabel}`)
  }
}

const allocationChartBox = await chartCanvas.boundingBox()
if (!allocationChartBox) await fail('Expected asset allocation chart bounding box for hover highlight.')
await page.mouse.move(allocationChartBox.x + allocationChartBox.width * 0.86, allocationChartBox.y + allocationChartBox.height / 2)
await page.locator('.alloc-item.is-active').first().waitFor({ state: 'visible' })

await browser.close()

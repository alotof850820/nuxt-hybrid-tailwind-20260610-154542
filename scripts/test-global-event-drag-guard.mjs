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

const findGrabCursorNearYear = async (canvas, year, totalYears) => {
  const box = await canvas.boundingBox()
  if (!box) await fail('Expected trend chart canvas bounding box.')

  const xCenter = box.x + box.width * (year / totalYears)
  for (const yRatio of [0.06, 0.1, 0.14, 0.18, 0.24, 0.3, 0.36, 0.44, 0.52, 0.6, 0.68, 0.76]) {
    for (const xOffset of [-36, -24, -12, 0, 12, 24, 36]) {
      const x = xCenter + xOffset
      const y = box.y + box.height * yRatio
      await page.mouse.move(x, y)
      const cursor = await canvas.evaluate((element) => getComputedStyle(element).cursor)
      if (cursor === 'grab') return { x, y, box }
    }
  }

  return null
}

await page.goto(new URL('/settings', baseUrl).toString(), { waitUntil: 'networkidle' })
const globalYearsInput = page.locator('label.range-field').filter({ hasText: '年數' }).locator('input[type="range"]')
await setRangeValue(globalYearsInput, 12)
const targetAmountInput = page.locator('label.range-field').filter({ hasText: '目標金額' }).locator('input[type="range"]')
await setRangeValue(targetAmountInput, 1200)
await page.getByText('目標金額：1,200 萬', { exact: false }).first().waitFor({ state: 'visible' })

await goTo(/存款/)
const fixedYearInput = page.locator('label.range-field').filter({ hasText: '定存到期' }).locator('input[type="range"]')
await setRangeValue(fixedYearInput, 9)

await goTo(/首頁/)
const trendCanvas = page.locator('canvas[aria-label*="目標金額事件"]')
await trendCanvas.waitFor({ state: 'visible' })
const initialLabel = await trendCanvas.getAttribute('aria-label')
const targetAge = Number(initialLabel?.match(/目標金額事件 (\d+) 歲/)?.[1])
if (!Number.isFinite(targetAge)) await fail(`Expected target amount event in trend label, got: ${initialLabel}`)
const targetYear = targetAge - 30

const targetGrabPoint = await findGrabCursorNearYear(trendCanvas, targetYear, 12)
if (targetGrabPoint) {
  await fail(`Expected global target amount event to be non-draggable, but cursor became grab near year ${targetYear}.`)
}

const fixedGrabPoint = await findGrabCursorNearYear(trendCanvas, 9, 12)
if (!fixedGrabPoint) await fail('Expected fixed deposit item event to remain draggable.')

await page.mouse.move(fixedGrabPoint.x, fixedGrabPoint.y)
await page.mouse.down()
await page.mouse.move(fixedGrabPoint.box.x + fixedGrabPoint.box.width * (targetYear / 12), fixedGrabPoint.y, { steps: 12 })
await page.mouse.up()
await page.waitForTimeout(160)

const blockedDragLabel = await trendCanvas.getAttribute('aria-label')
if (blockedDragLabel?.includes(`定存事件 ${targetAge} 歲`)) {
  await fail(`Expected fixed deposit drag onto global target event to be rejected, got: ${blockedDragLabel}`)
}
if (!blockedDragLabel?.includes('目標 1,200 萬')) {
  await fail(`Expected dragging item events not to change global target amount, got: ${blockedDragLabel}`)
}

await goTo(/設定/)
await page.getByText('目標金額：1,200 萬', { exact: false }).first().waitFor({ state: 'visible' })

await browser.close()





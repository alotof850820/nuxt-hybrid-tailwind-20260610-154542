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

const expectRangeMax = async (locator, expected, label) => {
  const actual = await locator.getAttribute('max')
  if (actual !== String(expected)) await fail(`Expected ${label} max to be ${expected}, got ${actual}.`)
}

const findEventTagPoint = async (canvas, year, totalYears) => {
  const box = await canvas.boundingBox()
  if (!box) await fail('Expected trend chart canvas bounding box.')

  const xCenter = box.x + box.width * (year / totalYears)
  for (const yRatio of [0.06, 0.1, 0.14, 0.18, 0.24, 0.3, 0.36, 0.44, 0.52, 0.6, 0.68, 0.76]) {
    for (const xOffset of [-90, -72, -54, -36, -18, 0, 18, 36, 54, 72, 90]) {
      const x = xCenter + xOffset
      const y = box.y + box.height * yRatio
      await page.mouse.move(x, y)
      const cursor = await canvas.evaluate((element) => getComputedStyle(element).cursor)
      if (cursor === 'grab') return { x, y, box }
    }
  }

  await fail(`Expected event tag at year ${year} to be draggable.`)
}

await page.goto(new URL('/settings', baseUrl).toString(), { waitUntil: 'networkidle' })
const globalYearsInput = page.locator('label.range-field').filter({ hasText: '年數' }).locator('input[type="range"]')
await setRangeValue(globalYearsInput, 12)

await goTo(/股票/)
const stockYearsInput = page.locator('label.range-field').filter({ hasText: '規劃年數' }).locator('input[type="range"]')
await expectRangeMax(stockYearsInput, 12, 'stock planning years')
await setRangeValue(stockYearsInput, 50)
await page.getByText('規劃年數：12 年', { exact: false }).first().waitFor({ state: 'visible' })

await goTo(/存款/)
const demandYearsInput = page.locator('label.range-field').filter({ hasText: '活存規劃年數' }).locator('input[type="range"]')
await expectRangeMax(demandYearsInput, 12, 'demand deposit planning years')
await setRangeValue(demandYearsInput, 50)
await page.getByText('活存規劃年數：12 年', { exact: false }).first().waitFor({ state: 'visible' })

const fixedYearInput = page.locator('label.range-field').filter({ hasText: '定存到期' }).locator('input[type="range"]')
await expectRangeMax(fixedYearInput, 12, 'fixed deposit maturity year')
await setRangeValue(fixedYearInput, 3)

await goTo(/買房規劃/)
await page.getByLabel('啟用買房規劃').check()
const houseYearInput = page.locator('label.range-field').filter({ hasText: '買房' }).locator('input[type="range"]')
await expectRangeMax(houseYearInput, 12, 'house purchase year')
await setRangeValue(houseYearInput, 5)
const loanYearsInput = page.locator('label.range-field').filter({ hasText: '貸款年限' }).locator('input[type="range"]')
await expectRangeMax(loanYearsInput, 12, 'loan years')

await goTo(/首頁/)
for (const text of ['定存事件', '33 歲', '買房事件', '35 歲']) {
  await page.getByText(text, { exact: false }).first().waitFor({ state: 'visible' })
}

const trendCanvas = page.locator('canvas[aria-label*="定存事件"]')
await trendCanvas.waitFor({ state: 'visible' })
const fixedTag = await findEventTagPoint(trendCanvas, 3, 12)
const targetX = fixedTag.box.x + fixedTag.box.width * (5 / 12)

await page.mouse.move(fixedTag.x, fixedTag.y)
await page.mouse.down()
await page.mouse.move(targetX, fixedTag.y, { steps: 8 })
await page.mouse.up()

await page.getByText('定存事件', { exact: false }).first().waitFor({ state: 'visible' })
await page.getByText('買房事件', { exact: false }).first().waitFor({ state: 'visible' })
const trendLabel = await trendCanvas.getAttribute('aria-label')
if (!trendLabel?.includes('定存事件 35 歲')) {
  await fail(`Expected dragged fixed deposit event to move to 35 歲, got: ${trendLabel}`)
}
if (!trendLabel?.includes('買房事件 36 歲')) {
  await fail(`Expected house event to shift to 36 歲 after fixed deposit was dragged onto its year, got: ${trendLabel}`)
}

await goTo(/存款/)
await page.getByText('35 歲定存到期', { exact: false }).first().waitFor({ state: 'visible' })
await goTo(/買房規劃/)
await page.getByText('36 歲買房', { exact: false }).first().waitFor({ state: 'visible' })

await browser.close()

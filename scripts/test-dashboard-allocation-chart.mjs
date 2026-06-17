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

const chartLabel = await chartCanvas.getAttribute('aria-label')
for (const text of ['總額', '本金', '股票', '股票內含', '投入成本', '資本利得']) {
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

await browser.close()

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

const expectCanvasPainted = async () => {
  const painted = await page.locator('canvas[aria-label="資產變化趨勢"]').evaluate((canvas) => {
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

await page.goto(new URL('/stocks', baseUrl).toString(), { waitUntil: 'networkidle' })

const totalYearsInput = page
  .locator('label.range-field')
  .filter({ hasText: '規劃年數' })
  .locator('input[type="range"]')

await setRangeValue(totalYearsInput, 42)
await page.goto(new URL('/dashboard', baseUrl).toString(), { waitUntil: 'networkidle' })

const tabs = page.locator('.period-tabs .ptab')
await tabs.first().waitFor({ state: 'visible' })

const tabTexts = await tabs.allTextContents()
if (tabTexts.length !== 1 || tabTexts[0].trim() !== '42Y') {
  await fail(`Expected dashboard trend tab to follow the stock page year setting as 42Y, got: ${tabTexts.join(', ')}`)
}

await expectCanvasPainted()

await page.reload({ waitUntil: 'networkidle' })

const reloadedTabTexts = await tabs.allTextContents()
if (reloadedTabTexts.length !== 1 || reloadedTabTexts[0].trim() !== '42Y') {
  await fail(`Expected reloaded dashboard trend tab to remain 42Y, got: ${reloadedTabTexts.join(', ')}`)
}

await expectCanvasPainted()
await browser.close()

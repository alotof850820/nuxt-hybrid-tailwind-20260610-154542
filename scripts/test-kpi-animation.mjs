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

const expectAnimatedKpi = async (key, tone = null) => {
  const card = page.locator(`[data-kpi="${key}"]`)
  await card.waitFor({ state: 'visible' })

  const value = card.locator('[data-count-up="true"]')
  await value.waitFor({ state: 'visible' })

  if (tone) {
    const actualTone = await card.getAttribute('data-change-tone')
    if (actualTone !== tone) {
      await fail(`Expected KPI ${key} to use change tone ${tone}, got ${actualTone}`)
    }
  }
}

await page.goto(new URL('/dashboard', baseUrl).toString(), { waitUntil: 'networkidle' })
await expectAnimatedKpi('total-assets', 'positive')

await page.goto(new URL('/stocks', baseUrl).toString(), { waitUntil: 'networkidle' })
await expectAnimatedKpi('capital-gain', 'positive')
await expectAnimatedKpi('return-rate', 'positive')

const monthlyInput = page
  .locator('label.range-field')
  .filter({ hasText: '月投入' })
  .locator('input[type="range"]')
await setRangeValue(monthlyInput, 12)
await page.locator('[data-kpi="capital-gain"].is-changing').waitFor({ state: 'visible' })

await page.goto(new URL('/house', baseUrl).toString(), { waitUntil: 'networkidle' })
await page.getByLabel('啟用買房規劃').check()
await expectAnimatedKpi('house-expense', 'expense')
await expectAnimatedKpi('mortgage-expense', 'expense')

const downPayment = page
  .locator('label.range-field')
  .filter({ hasText: '頭期款' })
  .locator('input[type="range"]')
await setRangeValue(downPayment, 600)
await page.locator('[data-kpi="house-expense"].is-changing').waitFor({ state: 'visible' })

await browser.close()

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

await page.goto(new URL('/', baseUrl).toString(), { waitUntil: 'networkidle' })

const planningLinks = page.getByRole('link', { name: 'Start planning' })
await planningLinks.first().waitFor({ state: 'visible' })

const hrefs = await planningLinks.evaluateAll((links) => links.map((link) => link.getAttribute('href')))
const unexpectedHref = hrefs.find((href) => href !== '/dashboard')
if (unexpectedHref) {
  await fail(`Expected every Start planning href to be /dashboard, got ${hrefs.join(', ')}`)
}

await Promise.all([
  page.waitForURL('**/dashboard'),
  page.locator('.primary-cta').click(),
])
await page.waitForLoadState('networkidle')

for (const text of ['財務成果總覽', '總資產', '資產變化趨勢', '資產配置']) {
  await page.getByText(text, { exact: false }).first().waitFor({ state: 'visible' })
}

const expectedRoutes = [
  ['/', 'Build Financial Plans You Love'],
  ['/dashboard', '財務成果總覽'],
  ['/stocks', '投資基本設定'],
  ['/house', '買房規劃'],
  ['/details', '年度收支明細'],
  ['/settings', '本金設定'],
]

for (const [route, marker] of expectedRoutes) {
  await page.goto(new URL(route, baseUrl).toString(), { waitUntil: 'networkidle' })
  await page.getByText(marker, { exact: false }).first().waitFor({ state: 'visible' })
}

await browser.close()

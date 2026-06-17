import { chromium } from '@playwright/test'

const baseUrl = process.env.TARGET_URL ?? 'http://127.0.0.1:3000'
const routes = ['/', '/dashboard', '/stocks', '/house', '/details', '/settings']
const maxFailures = Number(process.env.CONTRAST_MAX_FAILURES ?? '0')

const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL ?? 'msedge',
  headless: true,
})

const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
const allFailures = []

for (const route of routes) {
  await page.goto(new URL(route, baseUrl).toString(), { waitUntil: 'networkidle' })

  const failures = await page.evaluate(() => {
    const parseColor = (value) => {
      const oklchMatch = value.match(/oklch\(([^)]+)\)/)
      if (oklchMatch) {
        const parts = oklchMatch[1].split(/\s+/).filter(Boolean)
        const lightness = Number.parseFloat(parts[0])
        const chroma = Number.parseFloat(parts[1])
        const hue = Number.parseFloat(parts[2])
        if ([lightness, chroma, hue].some((part) => Number.isNaN(part))) return null

        const hueRadians = (hue * Math.PI) / 180
        const okA = chroma * Math.cos(hueRadians)
        const okB = chroma * Math.sin(hueRadians)
        const lPrime = lightness + 0.3963377774 * okA + 0.2158037573 * okB
        const mPrime = lightness - 0.1055613458 * okA - 0.0638541728 * okB
        const sPrime = lightness - 0.0894841775 * okA - 1.291485548 * okB
        const l = lPrime ** 3
        const m = mPrime ** 3
        const s = sPrime ** 3
        const linearRgb = {
          r: +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
          g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
          b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
        }
        const toSrgb = (channel) => {
          const value = channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055
          return Math.min(255, Math.max(0, value * 255))
        }

        return {
          r: toSrgb(linearRgb.r),
          g: toSrgb(linearRgb.g),
          b: toSrgb(linearRgb.b),
          a: 1,
        }
      }

      const match = value.match(/rgba?\(([^)]+)\)/)
      if (!match) return null

      const parts = match[1]
        .split(',')
        .map((part) => part.trim())
        .map(Number)

      if (parts.length < 3 || parts.some((part) => Number.isNaN(part))) return null

      return {
        r: parts[0],
        g: parts[1],
        b: parts[2],
        a: parts.length >= 4 ? parts[3] : 1,
      }
    }

    const composite = (top, bottom) => {
      const alpha = top.a + bottom.a * (1 - top.a)
      if (alpha <= 0) return { r: 0, g: 0, b: 0, a: 0 }

      return {
        r: (top.r * top.a + bottom.r * bottom.a * (1 - top.a)) / alpha,
        g: (top.g * top.a + bottom.g * bottom.a * (1 - top.a)) / alpha,
        b: (top.b * top.a + bottom.b * bottom.a * (1 - top.a)) / alpha,
        a: alpha,
      }
    }

    const linearize = (channel) => {
      const value = channel / 255
      return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    }

    const luminance = (color) =>
      0.2126 * linearize(color.r) + 0.7152 * linearize(color.g) + 0.0722 * linearize(color.b)

    const contrastRatio = (fg, bg) => {
      const lighter = Math.max(luminance(fg), luminance(bg))
      const darker = Math.min(luminance(fg), luminance(bg))
      return (lighter + 0.05) / (darker + 0.05)
    }

    const effectiveBackground = (element) => {
      const chain = []
      let node = element
      while (node && node.nodeType === Node.ELEMENT_NODE) {
        chain.unshift(node)
        node = node.parentElement
      }

      return chain.reduce(
        (acc, item) => {
          const color = parseColor(getComputedStyle(item).backgroundColor)
          if (!color || color.a <= 0.01) return acc
          return composite(color, acc)
        },
        { r: 255, g: 255, b: 255, a: 1 },
      )
    }

    const selectorFor = (element) => {
      const parts = []
      let node = element
      while (node && node.nodeType === Node.ELEMENT_NODE && parts.length < 5) {
        let part = node.tagName.toLowerCase()
        if (node.id) {
          part += `#${node.id}`
          parts.unshift(part)
          break
        }

        const classNames = Array.from(node.classList).slice(0, 3)
        if (classNames.length) part += `.${classNames.join('.')}`

        if (node.parentElement) {
          const siblings = Array.from(node.parentElement.children).filter((child) => child.tagName === node.tagName)
          if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(node) + 1})`
        }

        parts.unshift(part)
        node = node.parentElement
      }

      return parts.join(' > ')
    }

    const directText = (element) =>
      Array.from(element.childNodes)
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent.trim())
        .filter(Boolean)
        .join(' ')

    return Array.from(document.body.querySelectorAll('*'))
      .filter((element) => {
        const style = getComputedStyle(element)
        const rect = element.getBoundingClientRect()
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          style.visibility !== 'hidden' &&
          style.display !== 'none' &&
          !['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'CANVAS'].includes(element.tagName)
        )
      })
      .map((element) => {
        const text = directText(element)
        if (!text) return null

        const style = getComputedStyle(element)
        const foreground = parseColor(style.color)
        if (!foreground || foreground.a <= 0.01) return null

        const background = effectiveBackground(element)
        const ratio = contrastRatio(foreground, background)
        const fontSize = Number.parseFloat(style.fontSize)
        const fontWeight = Number.parseInt(style.fontWeight, 10)
        const largeText = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700)
        const minimum = largeText ? 3 : 4.5

        return {
          background: `rgb(${Math.round(background.r)}, ${Math.round(background.g)}, ${Math.round(background.b)})`,
          foreground: style.color,
          minimum,
          ratio: Number(ratio.toFixed(2)),
          selector: selectorFor(element),
          text: text.replace(/\s+/g, ' ').slice(0, 60),
        }
      })
      .filter((item) => item && item.ratio < item.minimum)
      .sort((a, b) => a.ratio - b.ratio)
  })

  allFailures.push(...failures.map((failure) => ({ route, ...failure })))
}

await browser.close()

if (allFailures.length) {
  console.log(`Contrast failures: ${allFailures.length}`)
  for (const failure of allFailures.slice(0, 30)) {
    console.log(
      `${failure.route} ${failure.ratio}/${failure.minimum} ${failure.foreground} on ${failure.background} ` +
        `${failure.selector} "${failure.text}"`,
    )
  }
} else {
  console.log('Contrast failures: 0')
}

if (allFailures.length > maxFailures) {
  process.exit(1)
}

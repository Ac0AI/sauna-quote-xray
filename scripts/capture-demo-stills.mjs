import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const liveUrl = 'https://sauna.guide/tools/sauna-quote-xray'
const outputDir = path.resolve('video/public/stills')

await mkdir(outputDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  viewport: { width: 1440, height: 810 },
  deviceScaleFactor: 1,
})
const page = await context.newPage()

await page.addInitScript(() => {
  const tools = {}

  Object.defineProperty(window, '__quoteXrayTools', {
    configurable: true,
    value: tools,
  })

  Object.defineProperty(document, 'modelContext', {
    configurable: true,
    value: {
      registerTool: async (tool) => {
        tools[tool.name] = tool
      },
    },
  })
})

const callTool = async (name, input = {}) => page.evaluate(
  async ({ toolName, toolInput }) => window.__quoteXrayTools[toolName].execute(toolInput),
  { toolName: name, toolInput: input },
)

const save = async (name) => {
  await page.screenshot({
    path: path.join(outputDir, `${name}.png`),
    animations: 'disabled',
  })
}

await page.goto(liveUrl, { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)
await save('hero')

await callTool('load_demo_sauna_quote', { fixtureId: 'backyard-barrel' })
await page.waitForTimeout(400)
await page.getByTestId('quoted-total').scrollIntoViewIfNeeded()
await page.evaluate(() => window.scrollBy(0, -150))
await page.waitForTimeout(250)
await save('quote-loaded')

await callTool('set_sauna_quote_scope', {
  updates: [
    {
      scopeId: 'electrical',
      status: 'excluded',
      note: 'Requires a licensed electrician.',
    },
    {
      scopeId: 'foundation',
      status: 'unclear',
      note: 'Pad preparation is not priced.',
    },
  ],
})
await page.waitForTimeout(400)
await page.getByRole('heading', { name: 'Scope X-Ray' }).scrollIntoViewIfNeeded()
await page.evaluate(() => window.scrollBy(0, -135))
await page.waitForTimeout(250)
await save('scope-risks')

await callTool('build_sauna_contractor_questions')
await page.waitForTimeout(400)
await page.locator('#contractor-questions').scrollIntoViewIfNeeded()
await page.evaluate(() => window.scrollBy(0, -120))
await page.waitForTimeout(250)
await save('questions')

await page.evaluate(() => window.scrollTo(0, 0))
await page.waitForTimeout(250)
await page.evaluate(() => {
  const header = document.querySelector('header')
  if (header instanceof HTMLElement) {
    header.style.position = 'relative'
    header.style.top = 'auto'
  }
})
await page.screenshot({
  path: path.join(outputDir, 'full-page.png'),
  fullPage: true,
  animations: 'disabled',
})

await browser.close()
console.log(outputDir)

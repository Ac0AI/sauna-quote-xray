import { chromium } from '@playwright/test'
import { mkdir, rename, rm } from 'node:fs/promises'
import path from 'node:path'

const liveUrl = 'https://sauna-quote-xray.vercel.app/tools/sauna-quote-xray'
const outputDir = path.resolve('demo')
const rawDir = path.join(outputDir, 'raw')
const outputPath = path.join(outputDir, 'sauna-quote-xray-demo-visual.webm')

await mkdir(rawDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: rawDir, size: { width: 1440, height: 900 } },
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

const showAgentCall = async (title, detail) => {
  await page.evaluate(({ titleText, detailText }) => {
    document.querySelector('#demo-agent-call')?.remove()
    const card = document.createElement('div')
    card.id = 'demo-agent-call'
    card.style.cssText = [
      'position:fixed',
      'left:50%',
      'bottom:28px',
      'z-index:999999',
      'width:min(680px,calc(100vw - 48px))',
      'transform:translateX(-50%)',
      'padding:18px 22px',
      'border:1px solid rgba(255,255,255,.2)',
      'border-radius:18px',
      'background:rgba(20,18,16,.94)',
      'box-shadow:0 18px 60px rgba(0,0,0,.35)',
      'color:#fff',
      'font:16px/1.45 ui-sans-serif,system-ui,-apple-system,sans-serif',
      'backdrop-filter:blur(16px)',
    ].join(';')
    card.innerHTML = `<div style="color:#d9aa72;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase">${titleText}</div><div style="margin-top:7px">${detailText}</div>`
    document.body.append(card)
  }, { titleText: title, detailText: detail })
}

await page.goto(liveUrl, { waitUntil: 'networkidle' })
await page.waitForTimeout(3500)

await showAgentCall(
  'ChatGPT calls load_demo_sauna_quote',
  'Load the safe backyard barrel quote into our shared canvas.',
)
await page.waitForTimeout(1800)
await callTool('load_demo_sauna_quote', { fixtureId: 'backyard-barrel' })
await page.waitForTimeout(4200)

await page.getByTestId('quoted-total').scrollIntoViewIfNeeded()
await page.waitForTimeout(5000)

await showAgentCall(
  'ChatGPT calls set_sauna_quote_scope',
  'Mark electrical as excluded and the foundation as unclear. Contact nobody.',
)
await page.waitForTimeout(1800)
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
await page.waitForTimeout(4500)

await page.getByRole('heading', { name: 'Scope X-Ray' }).scrollIntoViewIfNeeded()
await page.waitForTimeout(5500)

await showAgentCall(
  'ChatGPT calls build_sauna_contractor_questions',
  'Turn every unresolved scope item into a question the buyer can ask before signing.',
)
await page.waitForTimeout(1800)
await callTool('build_sauna_contractor_questions')
await page.waitForTimeout(4000)

await page.locator('#contractor-questions').scrollIntoViewIfNeeded()
await page.waitForTimeout(7500)

await page.getByRole('heading', { name: 'Shared activity' }).scrollIntoViewIfNeeded()
await page.waitForTimeout(7000)

await showAgentCall(
  'Human stays in control',
  'Every agent change is visible and reversible. Nothing is uploaded, stored, emailed, or sent to a seller.',
)
await page.waitForTimeout(6500)

await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
await page.waitForTimeout(4000)
await showAgentCall(
  'Sauna Quote X-Ray',
  'One live decision surface for the buyer and the agent, powered by eight narrow WebMCP tools.',
)
await page.waitForTimeout(5000)

const video = page.video()
await context.close()
await browser.close()

const recordedPath = await video.path()
await rm(outputPath, { force: true })
await rename(recordedPath, outputPath)

console.log(outputPath)

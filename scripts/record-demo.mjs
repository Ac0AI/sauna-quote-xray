import { chromium } from '@playwright/test'
import { mkdir, rename, rm } from 'node:fs/promises'
import path from 'node:path'

const liveUrl = 'https://sauna.guide/tools/sauna-quote-xray'
const outputDir = path.resolve('demo')
const rawDir = path.join(outputDir, 'raw-v3')
const outputPath = path.join(outputDir, 'sauna-quote-xray-demo-visual-v3.webm')

await mkdir(rawDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  viewport: { width: 1440, height: 810 },
  recordVideo: { dir: rawDir, size: { width: 1440, height: 810 } },
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

const showAgentCall = async (toolName, detail, label = 'WebMCP tool call') => {
  await page.evaluate(({ toolNameText, detailText, labelText }) => {
    document.querySelector('#demo-agent-call')?.remove()
    const card = document.createElement('div')
    card.id = 'demo-agent-call'
    card.style.cssText = [
      'position:fixed',
      'left:50%',
      'bottom:28px',
      'z-index:999999',
      'width:min(760px,calc(100vw - 48px))',
      'transform:translateX(-50%)',
      'padding:20px 24px',
      'border:1px solid rgba(255,255,255,.2)',
      'border-radius:16px',
      'background:rgba(20,18,16,.97)',
      'box-shadow:0 18px 60px rgba(0,0,0,.35)',
      'color:#f8f3ea',
      'font:18px/1.45 ui-sans-serif,system-ui,-apple-system,sans-serif',
    ].join(';')
    card.innerHTML = `<div style="display:flex;align-items:center;gap:10px;color:#d9aa72;font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase"><span style="width:8px;height:8px;border-radius:999px;background:#6ebf83;box-shadow:0 0 0 5px rgba(110,191,131,.14)"></span>${labelText}</div><div style="margin-top:8px;font-size:20px;font-weight:700">${toolNameText}</div><div style="margin-top:5px;color:#e5ddd2">${detailText}</div>`
    document.body.append(card)
  }, { toolNameText: toolName, detailText: detail, labelText: label })
}

const clearOverlay = async () => page.evaluate(() => {
  document.querySelector('#demo-agent-call')?.remove()
  document.querySelectorAll('[data-demo-highlight]').forEach((element) => {
    element.removeAttribute('data-demo-highlight')
    element.style.removeProperty('outline')
    element.style.removeProperty('outline-offset')
    element.style.removeProperty('box-shadow')
  })
})

const highlight = async (selector) => page.evaluate((targetSelector) => {
  document.querySelectorAll('[data-demo-highlight]').forEach((element) => {
    element.removeAttribute('data-demo-highlight')
    element.style.removeProperty('outline')
    element.style.removeProperty('outline-offset')
    element.style.removeProperty('box-shadow')
  })
  const element = document.querySelector(targetSelector)
  if (!element) return
  element.setAttribute('data-demo-highlight', 'true')
  element.style.outline = '3px solid #d9aa72'
  element.style.outlineOffset = '8px'
  element.style.boxShadow = '0 0 0 14px rgba(217,170,114,.16)'
}, selector)

const showEndCard = async () => page.evaluate(() => {
  document.querySelector('#demo-agent-call')?.remove()
  const card = document.createElement('div')
  card.id = 'demo-end-card'
  card.style.cssText = [
    'position:fixed',
    'inset:0',
    'z-index:999999',
    'display:grid',
    'place-items:center',
    'padding:64px',
    'background:#171411',
    'color:#f8f3ea',
    'font-family:ui-sans-serif,system-ui,-apple-system,sans-serif',
  ].join(';')
  card.innerHTML = `<div style="width:min(980px,100%);text-align:left"><div style="color:#d9aa72;font-size:14px;font-weight:800;letter-spacing:.16em;text-transform:uppercase">Sauna Quote X-Ray · WebMCP Challenge</div><div style="margin-top:24px;font-family:Georgia,serif;font-size:72px;line-height:.98;letter-spacing:-.04em">Make the hidden<br>number visible.</div><div style="display:flex;align-items:flex-end;justify-content:space-between;gap:48px;margin-top:48px;padding-top:28px;border-top:1px solid rgba(248,243,234,.24)"><div><div style="font-size:18px;color:#cfc4b8">Try the live product</div><div style="margin-top:8px;font-size:28px;font-weight:800">sauna.guide/tools/sauna-quote-xray</div></div><div style="max-width:360px;font-size:18px;line-height:1.5;color:#cfc4b8">Eight narrow tools. One shared decision surface. No lead sent without consent.</div></div></div>`
  document.body.append(card)
})

await page.goto(liveUrl, { waitUntil: 'networkidle' })
await page.waitForTimeout(2200)

await showAgentCall(
  '$11,750 quote → up to $18,650 landed cost',
  'The signed number is only the start. The missing scope is where the budget breaks.',
  'Buyer problem',
)
await page.waitForTimeout(3500)

await showAgentCall(
  'load_demo_sauna_quote',
  'Load the safe backyard barrel quote into the visible decision canvas.',
)
await page.waitForTimeout(900)
await callTool('load_demo_sauna_quote', { fixtureId: 'backyard-barrel' })
await page.waitForTimeout(3000)

await page.getByTestId('quoted-total').scrollIntoViewIfNeeded()
await page.waitForTimeout(4800)

await showAgentCall(
  '8 page-scoped tools connected',
  'The agent reads and changes the same state the buyer sees. Every action remains visible and reversible.',
  'Live WebMCP contract',
)
await page.waitForTimeout(5000)

await clearOverlay()
await highlight('[data-testid="quoted-total"]')
await page.waitForTimeout(11000)

await showAgentCall(
  'set_sauna_quote_scope',
  'Mark electrical as excluded and the foundation as unclear. Contact nobody.',
)
await page.waitForTimeout(900)
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
await page.waitForTimeout(2800)

await page.getByRole('heading', { name: 'Scope X-Ray' }).scrollIntoViewIfNeeded()
await page.waitForTimeout(4500)

await page.getByTestId('projected-total').scrollIntoViewIfNeeded()
await clearOverlay()
await highlight('[data-testid="projected-total"]')
await page.waitForTimeout(7000)

await page.getByTestId('risk-findings').scrollIntoViewIfNeeded()
await highlight('[data-testid="risk-findings"]')
await page.waitForTimeout(5500)

await showAgentCall(
  'build_sauna_contractor_questions',
  'Turn every unresolved scope item into a question the buyer can ask before signing.',
)
await page.waitForTimeout(900)
await callTool('build_sauna_contractor_questions')
await page.waitForTimeout(2200)

await page.locator('#contractor-questions').scrollIntoViewIfNeeded()
await clearOverlay()
await highlight('#contractor-questions')
await page.waitForTimeout(6000)

await page.getByRole('heading', { name: 'Shared activity' }).scrollIntoViewIfNeeded()
await highlight('[data-testid="quote-xray-summary"]')
await page.waitForTimeout(4000)

await clearOverlay()
await showEndCard()
await page.waitForTimeout(10000)

const video = page.video()
await context.close()
await browser.close()

const recordedPath = await video.path()
await rm(outputPath, { force: true })
await rename(recordedPath, outputPath)

console.log(outputPath)

import { expect, test } from '@playwright/test'

type RegisteredTool = {
  execute: (input: unknown) => Promise<unknown>
}

async function installWebMcpHarness(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    const tools: Record<string, RegisteredTool> = {}
    Object.defineProperty(window, '__quoteXrayTools', { value: tools, configurable: true })
    Object.defineProperty(document, 'modelContext', {
      configurable: true,
      value: {
        registerTool: async (tool: RegisteredTool & { name: string }) => {
          tools[tool.name] = tool
        },
      },
    })
  })
}

async function callTool(page: import('@playwright/test').Page, name: string, input: unknown = {}) {
  return page.evaluate(async ({ toolName, toolInput }) => {
    const tools = (window as unknown as { __quoteXrayTools: Record<string, RegisteredTool> }).__quoteXrayTools
    return tools[toolName].execute(toolInput)
  }, { toolName: name, toolInput: input }) as Promise<Record<string, unknown>>
}

test('live URL completes the synthetic reviewer journey in a fresh browser', async ({ page, context }) => {
  expect(await context.cookies()).toEqual([])

  await installWebMcpHarness(page)
  await page.goto('/tools/sauna-quote-xray', { waitUntil: 'networkidle' })

  await expect(page).toHaveURL('https://sauna.guide/tools/sauna-quote-xray')
  await expect(page.getByText('This browser can give its AI access to the quote.')).toBeVisible()

  await expect.poll(() => page.evaluate(() => Object.keys(
    (window as unknown as { __quoteXrayTools: Record<string, RegisteredTool> }).__quoteXrayTools,
  ).length)).toBe(8)

  const toolNames = await page.evaluate(() => Object.keys(
    (window as unknown as { __quoteXrayTools: Record<string, RegisteredTool> }).__quoteXrayTools,
  ))
  expect(toolNames).toHaveLength(8)

  const loaded = await callTool(page, 'load_demo_sauna_quote', { fixtureId: 'backyard-barrel' })
  expect(loaded).toMatchObject({ ok: true, quotedTotal: 11750, persistedOrSent: false })
  await expect(page.getByTestId('quoted-total')).toHaveText('$11,750')

  const scoped = await callTool(page, 'set_sauna_quote_scope', {
    updates: [
      { scopeId: 'electrical', status: 'excluded', note: 'Synthetic reviewer check.' },
      { scopeId: 'foundation', status: 'unclear', note: 'Synthetic reviewer check.' },
    ],
  })
  expect(scoped).toMatchObject({ ok: true, persistedOrSent: false })

  const questions = await callTool(page, 'build_sauna_contractor_questions')
  expect(questions).toMatchObject({ ok: true, persistedOrSent: false })
  await expect(page.locator('#contractor-questions li').first()).toBeVisible()
})

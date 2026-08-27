import { expect, test } from '@playwright/test'

type ToolResult = {
  ok?: boolean
  error?: string
  quotedTotal?: number
  projectedTotal?: { low: number; high: number }
  questions?: string[]
}

async function installWebMcpHarness(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    const tools: Record<string, { execute: (input: unknown) => Promise<unknown>; annotations?: Record<string, unknown> }> = {}
    Object.defineProperty(window, '__quoteXrayTools', { value: tools, configurable: true })
    Object.defineProperty(document, 'modelContext', {
      configurable: true,
      value: {
        registerTool: async (tool: { name: string; execute: (input: unknown) => Promise<unknown> }) => {
          tools[tool.name] = tool
        },
      },
    })
  })
}

async function callTool(page: import('@playwright/test').Page, name: string, input: unknown = {}) {
  return page.evaluate(async ({ toolName, toolInput }) => {
    const tools = (window as unknown as {
      __quoteXrayTools: Record<string, { execute: (input: unknown) => Promise<unknown> }>
    }).__quoteXrayTools
    return tools[toolName].execute(toolInput)
  }, { toolName: name, toolInput: input }) as Promise<ToolResult>
}

test.describe('Sauna Quote X-Ray WebMCP canvas', () => {
  test.beforeEach(async ({ page }) => {
    await installWebMcpHarness(page)
    await page.goto('/tools/sauna-quote-xray')
    await expect(page.getByText('Agent tools connected')).toBeVisible()
  })

  test('registers narrow, page-scoped tools with the state reader marked untrusted', async ({ page }) => {
    const tools = await page.evaluate(() => {
      const registered = (window as unknown as {
        __quoteXrayTools: Record<string, { annotations?: Record<string, unknown> }>
      }).__quoteXrayTools
      return Object.entries(registered).map(([name, tool]) => ({ name, annotations: tool.annotations }))
    })

    expect(tools.map((tool) => tool.name)).toEqual([
      'load_demo_sauna_quote',
      'get_sauna_quote_xray_state',
      'set_sauna_project_context',
      'upsert_sauna_quote_line_item',
      'remove_sauna_quote_line_item',
      'set_sauna_quote_scope',
      'build_sauna_contractor_questions',
      'start_sauna_quote_xray',
    ])
    expect(tools.find((tool) => tool.name === 'get_sauna_quote_xray_state')?.annotations).toMatchObject({
      readOnlyHint: true,
      untrustedContentHint: true,
    })
  })

  test('keeps agent changes synchronized with the visible human canvas', async ({ page }) => {
    const loaded = await callTool(page, 'load_demo_sauna_quote', { fixtureId: 'backyard-barrel' })
    expect(loaded).toMatchObject({ ok: true, quotedTotal: 11750 })
    await expect(page.getByTestId('quoted-total')).toHaveText('$11,750')

    const scope = await callTool(page, 'set_sauna_quote_scope', {
      updates: [
        { scopeId: 'electrical', status: 'included', note: 'Dedicated circuit confirmed.' },
        { scopeId: 'foundation', status: 'included', note: 'Pad included in signed scope.' },
      ],
    })
    expect(scope.ok).toBe(true)
    await expect(page.getByLabel('Dedicated electrical circuit status')).toHaveValue('included')

    const questions = await callTool(page, 'build_sauna_contractor_questions')
    expect(questions.questions?.length).toBeGreaterThan(0)
    await expect(page.locator('#contractor-questions li').first()).toBeVisible()
    await expect(page.getByText(/Agent resolved 2 quote-scope items/)).toBeVisible()
  })

  test('starts clean, validates tool inputs, and supports correction without stale rows', async ({ page }) => {
    const blank = await callTool(page, 'start_sauna_quote_xray')
    expect(blank).toMatchObject({ ok: true, quotedTotal: 0 })
    await expect(page.getByText('No priced line items yet.')).toBeVisible()

    const shortContext = await callTool(page, 'set_sauna_project_context', { title: 'X' })
    expect(shortContext).toMatchObject({ ok: false })

    const shortLine = await callTool(page, 'upsert_sauna_quote_line_item', {
      id: 'x1', label: 'X', amount: 100, category: 'other',
    })
    expect(shortLine).toMatchObject({ ok: false })

    const added = await callTool(page, 'upsert_sauna_quote_line_item', {
      id: 'cabin-package', label: 'Cabin package', amount: 10000, category: 'sauna',
    })
    expect(added).toMatchObject({ ok: true, quotedTotal: 10000 })
    await expect(page.getByText('Cabin package', { exact: true })).toBeVisible()

    const removed = await callTool(page, 'remove_sauna_quote_line_item', { id: 'cabin-package' })
    expect(removed).toMatchObject({ ok: true, quotedTotal: 0 })
    await expect(page.getByText('No priced line items yet.')).toBeVisible()
  })
})

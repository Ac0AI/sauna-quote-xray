'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  QUOTE_XRAY_FIXTURE_IDS,
  QUOTE_XRAY_LINE_CATEGORIES,
  QUOTE_XRAY_PRODUCT_TYPES,
  QUOTE_XRAY_SCOPE_ITEMS,
  QUOTE_XRAY_SCOPE_STATUSES,
  QUOTE_XRAY_SIZE_CLASSES,
  addQuoteXrayActivity,
  buildQuoteXrayQuestions,
  createEmptyQuoteXrayState,
  getQuoteXrayFixture,
  summarizeQuoteXray,
  type QuoteXrayFixtureId,
  type QuoteXrayLineCategory,
  type QuoteXrayProductType,
  type QuoteXrayScopeId,
  type QuoteXrayScopeStatus,
  type QuoteXraySizeClass,
  type QuoteXrayState,
} from '@/lib/quote-xray'

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const PRODUCT_LABELS: Record<QuoteXrayProductType, string> = {
  'indoor-traditional': 'Indoor traditional',
  'outdoor-barrel': 'Outdoor barrel',
  infrared: 'Plug-in infrared',
}

const STATUS_LABELS: Record<QuoteXrayScopeStatus, string> = {
  included: 'Included',
  excluded: 'Excluded',
  unclear: 'Unclear',
  not_applicable: 'N/A',
}

const DEMO_LABELS: Record<QuoteXrayFixtureId, string> = {
  'basement-traditional': '$18.5K basement quote',
  'backyard-barrel': '$11.8K backyard quote',
  'plug-in-infrared': '$5.6K infrared quote',
}

const MAX_LINE_ITEMS = 30

function isOneOf<T extends readonly string[]>(values: T, value: unknown): value is T[number] {
  return typeof value === 'string' && values.includes(value as T[number])
}

function safeString(value: unknown, maxLength = 160) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function resultFor(state: QuoteXrayState, changed: string[]) {
  const summary = summarizeQuoteXray(state)
  return {
    ok: true,
    changed,
    quotedTotal: summary.quotedTotal,
    projectedTotal: { low: summary.projectedLow, high: summary.projectedHigh },
    scopeCompletenessPercent: summary.completeness,
    unresolvedScope: summary.findings.map((finding) => ({
      id: finding.scopeId,
      status: finding.status,
      exposureHigh: finding.exposureHigh,
    })),
    visibleOnPage: true,
    persistedOrSent: false,
  }
}

function downloadReview(state: QuoteXrayState) {
  const blob = new Blob([JSON.stringify({ state, summary: summarizeQuoteXray(state) }, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'sauna-quote-xray-review.json'
  anchor.click()
  URL.revokeObjectURL(url)
}

export default function QuoteXrayStudio() {
  const [studio, setStudio] = useState<QuoteXrayState>(() =>
    getQuoteXrayFixture('basement-traditional'),
  )
  const [siteToolsReady, setSiteToolsReady] = useState(false)
  const [newLine, setNewLine] = useState({ label: '', amount: '', category: 'other' as QuoteXrayLineCategory })
  const studioRef = useRef(studio)

  const summary = useMemo(() => summarizeQuoteXray(studio), [studio])
  const maxVisualTotal = Math.max(summary.projectedHigh, summary.quotedTotal, 1)

  function commit(next: QuoteXrayState, actor: 'human' | 'agent', message: string) {
    const withActivity = addQuoteXrayActivity(next, actor, message)
    studioRef.current = withActivity
    setStudio(withActivity)
    return withActivity
  }

  function updateHumanDraft(next: QuoteXrayState) {
    studioRef.current = next
    setStudio(next)
  }

  function updateScope(id: QuoteXrayScopeId, status: QuoteXrayScopeStatus, actor: 'human' | 'agent' = 'human', note?: string) {
    const current = studioRef.current
    return commit(
      {
        ...current,
        scope: { ...current.scope, [id]: { status, ...(note ? { note } : {}) } },
      },
      actor,
      `${actor === 'agent' ? 'Agent' : 'You'} marked ${QUOTE_XRAY_SCOPE_ITEMS.find((item) => item.id === id)?.label} as ${STATUS_LABELS[status].toLowerCase()}.`,
    )
  }

  useEffect(() => {
    if (!document.modelContext) return
    const controller = new AbortController()
    const registrations = [
      document.modelContext.registerTool({
        name: 'load_demo_sauna_quote',
        title: 'Load a synthetic sauna quote',
        description:
          'Load one safe synthetic quote into the visible Sauna Quote X-Ray canvas. This changes only page-local state and never stores data, sends email, or creates a customer lead.',
        inputSchema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            fixtureId: {
              type: 'string',
              enum: QUOTE_XRAY_FIXTURE_IDS,
              description: 'Synthetic quote scenario to load into the shared canvas.',
            },
          },
          required: ['fixtureId'],
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: async (input) => {
          const fixtureId = (input as { fixtureId?: unknown })?.fixtureId
          if (!isOneOf(QUOTE_XRAY_FIXTURE_IDS, fixtureId)) {
            return { ok: false, error: 'Choose one of the available synthetic fixture IDs.' }
          }
          const next = commit(getQuoteXrayFixture(fixtureId), 'agent', `Agent loaded ${DEMO_LABELS[fixtureId]}.`)
          return resultFor(next, ['fixture', 'lineItems', 'scope', 'questions'])
        },
      }, { signal: controller.signal }),
      document.modelContext.registerTool({
        name: 'get_sauna_quote_xray_state',
        title: 'Inspect the current quote canvas',
        description:
          'Read the exact quote line items, scope decisions, risk findings, projected total, and contractor questions currently visible in Sauna Quote X-Ray. This does not change the page.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: true, untrustedContentHint: true },
        execute: async () => ({
          ok: true,
          state: studioRef.current,
          summary: summarizeQuoteXray(studioRef.current),
          persistedOrSent: false,
        }),
      }, { signal: controller.signal }),
      document.modelContext.registerTool({
        name: 'set_sauna_project_context',
        title: 'Update the sauna project context',
        description:
          'Update the project type, quote title, size, or location shown on the shared canvas. This changes only page-local state and recalculates the visible benchmark and risk ranges.',
        inputSchema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            title: { type: 'string', minLength: 2, maxLength: 100 },
            location: { type: 'string', minLength: 2, maxLength: 100 },
            productType: { type: 'string', enum: QUOTE_XRAY_PRODUCT_TYPES },
            sizeClass: { type: 'string', enum: QUOTE_XRAY_SIZE_CLASSES },
          },
          minProperties: 1,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: async (input) => {
          const record = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
          const current = studioRef.current
          const title = 'title' in record ? safeString(record.title, 100) : current.title
          const location = 'location' in record ? safeString(record.location, 100) : current.location
          if (title.length < 2 || location.length < 2) return { ok: false, error: 'Title and location must contain at least two characters.' }
          if ('productType' in record && !isOneOf(QUOTE_XRAY_PRODUCT_TYPES, record.productType)) {
            return { ok: false, error: 'Choose a supported sauna project type.' }
          }
          if ('sizeClass' in record && !isOneOf(QUOTE_XRAY_SIZE_CLASSES, record.sizeClass)) {
            return { ok: false, error: 'Choose a supported sauna size class.' }
          }
          const next = commit({
            ...current,
            title,
            location,
            productType: isOneOf(QUOTE_XRAY_PRODUCT_TYPES, record.productType) ? record.productType : current.productType,
            sizeClass: isOneOf(QUOTE_XRAY_SIZE_CLASSES, record.sizeClass) ? record.sizeClass : current.sizeClass,
          }, 'agent', 'Agent updated the project context and recalculated the canvas.')
          return resultFor(next, Object.keys(record))
        },
      }, { signal: controller.signal }),
      document.modelContext.registerTool({
        name: 'upsert_sauna_quote_line_item',
        title: 'Add or update a quote line item',
        description:
          'Add a missing cost or revise an existing line on the visible quote canvas. Use stable IDs so later calls can update the same item. This is page-local analysis only and does not contact a seller.',
        inputSchema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            id: { type: 'string', pattern: '^[a-z0-9][a-z0-9-]{1,49}$' },
            label: { type: 'string', minLength: 2, maxLength: 100 },
            amount: { type: 'number', minimum: 0, maximum: 250000 },
            category: { type: 'string', enum: QUOTE_XRAY_LINE_CATEGORIES },
            note: { type: 'string', maxLength: 240 },
          },
          required: ['id', 'label', 'amount', 'category'],
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: async (input) => {
          const record = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
          const id = safeString(record.id, 50)
          const label = safeString(record.label, 100)
          const amount = typeof record.amount === 'number' ? record.amount : Number.NaN
          if (!/^[a-z0-9][a-z0-9-]{1,49}$/.test(id) || label.length < 2 || !Number.isFinite(amount) || amount < 0 || amount > 250000 || !isOneOf(QUOTE_XRAY_LINE_CATEGORIES, record.category)) {
            return { ok: false, error: 'Provide a valid stable ID, label, non-negative amount, and category.' }
          }
          const current = studioRef.current
          const line = { id, label, amount, category: record.category, ...(safeString(record.note, 240) ? { note: safeString(record.note, 240) } : {}) }
          const index = current.lineItems.findIndex((item) => item.id === id)
          if (index < 0 && current.lineItems.length >= MAX_LINE_ITEMS) {
            return { ok: false, error: `A quote can contain at most ${MAX_LINE_ITEMS} line items.` }
          }
          const lineItems = index >= 0
            ? current.lineItems.map((item, itemIndex) => itemIndex === index ? line : item)
            : [...current.lineItems, line]
          const next = commit({ ...current, lineItems }, 'agent', `Agent ${index >= 0 ? 'updated' : 'added'} ${label} at ${money.format(amount)}.`)
          return resultFor(next, [`lineItems.${id}`])
        },
      }, { signal: controller.signal }),
      document.modelContext.registerTool({
        name: 'remove_sauna_quote_line_item',
        title: 'Remove a quote line item',
        description:
          'Remove one mistaken or duplicate line from the visible quote canvas by stable ID. This changes only page-local state and does not delete stored records or contact anyone.',
        inputSchema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            id: { type: 'string', pattern: '^[a-z0-9][a-z0-9-]{1,49}$' },
          },
          required: ['id'],
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: async (input) => {
          const id = safeString((input as { id?: unknown })?.id, 50)
          if (!/^[a-z0-9][a-z0-9-]{1,49}$/.test(id)) {
            return { ok: false, error: 'Provide the stable ID of the quote line to remove.' }
          }
          const current = studioRef.current
          const existing = current.lineItems.find((item) => item.id === id)
          if (!existing) return { ok: false, error: 'That quote line is not on the current canvas.' }
          const next = commit(
            { ...current, lineItems: current.lineItems.filter((item) => item.id !== id) },
            'agent',
            `Agent removed ${existing.label}.`,
          )
          return resultFor(next, [`lineItems.${id}`])
        },
      }, { signal: controller.signal }),
      document.modelContext.registerTool({
        name: 'set_sauna_quote_scope',
        title: 'Resolve quote scope',
        description:
          'Mark one or more visible quote-scope items as included, excluded, unclear, or not applicable. This updates the risk cards and hidden-cost projection on the same page without storing or sending anything.',
        inputSchema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            updates: {
              type: 'array',
              minItems: 1,
              maxItems: 10,
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  scopeId: { type: 'string', enum: QUOTE_XRAY_SCOPE_ITEMS.map((item) => item.id) },
                  status: { type: 'string', enum: QUOTE_XRAY_SCOPE_STATUSES },
                  note: { type: 'string', maxLength: 240 },
                },
                required: ['scopeId', 'status'],
              },
            },
          },
          required: ['updates'],
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: async (input) => {
          const updates = (input as { updates?: unknown })?.updates
          if (!Array.isArray(updates) || updates.length < 1 || updates.length > 10) {
            return { ok: false, error: 'Provide between one and ten scope updates.' }
          }
          const current = studioRef.current
          const nextScope = { ...current.scope }
          const changed: string[] = []
          for (const candidate of updates) {
            if (!candidate || typeof candidate !== 'object') return { ok: false, error: 'Each update must be an object.' }
            const record = candidate as Record<string, unknown>
            const scopeId = record.scopeId
            const status = record.status
            if (!isOneOf(QUOTE_XRAY_SCOPE_ITEMS.map((item) => item.id), scopeId) || !isOneOf(QUOTE_XRAY_SCOPE_STATUSES, status)) {
              return { ok: false, error: 'Each update needs a supported scope ID and status.' }
            }
            nextScope[scopeId] = { status, ...(safeString(record.note, 240) ? { note: safeString(record.note, 240) } : {}) }
            changed.push(`scope.${scopeId}`)
          }
          const next = commit({ ...current, scope: nextScope }, 'agent', `Agent resolved ${changed.length} quote-scope item${changed.length === 1 ? '' : 's'}.`)
          return resultFor(next, changed)
        },
      }, { signal: controller.signal }),
      document.modelContext.registerTool({
        name: 'build_sauna_contractor_questions',
        title: 'Build contractor questions',
        description:
          'Create a visible, quote-specific checklist of questions for unresolved or excluded scope. Optionally focus on named scope IDs. The result stays on the page and is not sent to any contractor.',
        inputSchema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            focusScopeIds: {
              type: 'array',
              maxItems: 10,
              uniqueItems: true,
              items: { type: 'string', enum: QUOTE_XRAY_SCOPE_ITEMS.map((item) => item.id) },
            },
          },
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: async (input) => {
          const focus = (input as { focusScopeIds?: unknown })?.focusScopeIds
          if (focus !== undefined && (!Array.isArray(focus) || focus.some((id) => !isOneOf(QUOTE_XRAY_SCOPE_ITEMS.map((item) => item.id), id)))) {
            return { ok: false, error: 'Use only supported scope IDs.' }
          }
          const current = studioRef.current
          const questions = buildQuoteXrayQuestions(current, focus as QuoteXrayScopeId[] | undefined)
          const next = commit({ ...current, questions }, 'agent', `Agent built ${questions.length} contractor question${questions.length === 1 ? '' : 's'}.`)
          return { ...resultFor(next, ['questions']), questions }
        },
      }, { signal: controller.signal }),
      document.modelContext.registerTool({
        name: 'start_sauna_quote_xray',
        title: 'Start a blank quote review',
        description:
          'Clear the synthetic demo and start a blank, page-local Sauna Quote X-Ray canvas before structuring a different quote. Nothing is uploaded, persisted, emailed, or sent to a seller.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: async () => {
          const next = commit(createEmptyQuoteXrayState(), 'agent', 'Agent started a blank quote review.')
          return resultFor(next, ['title', 'location', 'lineItems', 'scope', 'questions'])
        },
      }, { signal: controller.signal }),
    ]

    Promise.all(registrations)
      .then(() => {
        if (!controller.signal.aborted) setSiteToolsReady(true)
      })
      .catch((error) => {
        if (!controller.signal.aborted) console.warn('Quote X-Ray site tools could not be registered:', error)
      })
    return () => controller.abort()
  }, [])

  function loadFixture(id: QuoteXrayFixtureId) {
    commit(getQuoteXrayFixture(id), 'human', `You loaded ${DEMO_LABELS[id]}.`)
  }

  function changeLineAmount(id: string, amount: number) {
    const current = studioRef.current
    const next = {
      ...current,
      lineItems: current.lineItems.map((item) => item.id === id ? { ...item, amount: Math.max(0, amount || 0) } : item),
    }
    commit(next, 'human', `You revised a quote line to ${money.format(Math.max(0, amount || 0))}.`)
  }

  function addHumanLine() {
    const label = newLine.label.trim()
    const amount = Number(newLine.amount)
    if (label.length < 2 || !Number.isFinite(amount) || amount < 0 || studioRef.current.lineItems.length >= MAX_LINE_ITEMS) return
    const current = studioRef.current
    const id = `manual-${Date.now()}`
    commit({
      ...current,
      lineItems: [...current.lineItems, { id, label, amount, category: newLine.category }],
    }, 'human', `You added ${label} at ${money.format(amount)}.`)
    setNewLine({ label: '', amount: '', category: 'other' })
  }

  function removeHumanLine(id: string) {
    const current = studioRef.current
    const existing = current.lineItems.find((item) => item.id === id)
    if (!existing) return
    commit(
      { ...current, lineItems: current.lineItems.filter((item) => item.id !== id) },
      'human',
      `You removed ${existing.label}.`,
    )
  }

  return (
    <>
      <section className="overflow-hidden border-b border-white/10 bg-surface-strong px-6 pb-14 pt-28 text-text-inverse md:pb-20 md:pt-36">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-sauna-glow/35 bg-sauna-glow/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sauna-glow">
              WebMCP Challenge
            </span>
            <span className={`flex items-center gap-2 text-sm ${siteToolsReady ? 'text-positive-bg' : 'text-text-inverse/60'}`}>
              <span className={`h-2 w-2 rounded-full ${siteToolsReady ? 'bg-green-400' : 'bg-sauna-stone'}`} />
              {siteToolsReady ? 'Agent tools connected' : 'Open in a WebMCP browser for agent tools'}
            </span>
          </div>
          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <p className="text-caption font-semibold uppercase tracking-[0.18em] text-sauna-sand">Before you sign an $18,500 quote</p>
              <h1 className="mt-4 max-w-4xl font-display text-5xl font-medium leading-[0.98] md:text-7xl">
                Make the hidden number visible.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-relaxed text-text-inverse/72 md:text-xl">
                Sauna Quote X-Ray gives you and your AI agent the same live decision canvas. The agent can structure the quote, expose missing scope, and build the questions. You keep control of every assumption.
              </p>
            </div>
            <div className="rounded-panel border border-white/12 bg-white/6 p-5 shadow-overlay">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sauna-sand">Try this with your agent</p>
              <p className="mt-3 text-sm leading-relaxed text-text-inverse/82">
                “Load the basement quote. Make the missing electrical work explicit, flag anything still unclear, and build five questions for the contractor. Contact nobody.”
              </p>
              <p className="mt-4 text-xs leading-relaxed text-text-inverse/52">Synthetic examples only. Nothing is uploaded, stored, emailed, or sent to a seller.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12" data-testid="quote-xray-studio">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-faint">Safe demo quotes</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {QUOTE_XRAY_FIXTURE_IDS.map((id) => (
                <button key={id} type="button" onClick={() => loadFixture(id)} className="min-h-11 rounded-control border border-border bg-surface px-4 text-sm font-medium text-text transition hover:border-action hover:text-action">
                  {DEMO_LABELS[id]}
                </button>
              ))}
            </div>
          </div>
          <button type="button" onClick={() => commit(createEmptyQuoteXrayState(), 'human', 'You cleared the canvas.')} className="min-h-11 rounded-control px-4 text-sm font-medium text-text-muted underline decoration-border-strong underline-offset-4 hover:text-text">
            Start from a blank quote
          </button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_410px]">
          <div className="space-y-6">
            <section className="rounded-panel border border-border bg-surface p-5 shadow-hairline md:p-7">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium text-text-muted">
                  Quote name
                  <input value={studio.title} minLength={2} maxLength={100} onChange={(event) => updateHumanDraft({ ...studioRef.current, title: event.target.value })} onBlur={() => commit(studioRef.current, 'human', 'You renamed the quote.')} className="mt-2 min-h-11 w-full rounded-control border border-border bg-canvas px-3 text-text outline-none focus:border-focus" />
                </label>
                <label className="text-sm font-medium text-text-muted">
                  Project location
                  <input value={studio.location} minLength={2} maxLength={100} onChange={(event) => updateHumanDraft({ ...studioRef.current, location: event.target.value })} onBlur={() => commit(studioRef.current, 'human', 'You changed the project location.')} className="mt-2 min-h-11 w-full rounded-control border border-border bg-canvas px-3 text-text outline-none focus:border-focus" />
                </label>
                <label className="text-sm font-medium text-text-muted">
                  Sauna type
                  <select value={studio.productType} onChange={(event) => commit({ ...studioRef.current, productType: event.target.value as QuoteXrayProductType }, 'human', 'You changed the sauna type and recalculated the review.')} className="mt-2 min-h-11 w-full rounded-control border border-border bg-canvas px-3 text-text outline-none focus:border-focus">
                    {QUOTE_XRAY_PRODUCT_TYPES.map((type) => <option key={type} value={type}>{PRODUCT_LABELS[type]}</option>)}
                  </select>
                </label>
                <label className="text-sm font-medium text-text-muted">
                  Capacity
                  <select value={studio.sizeClass} onChange={(event) => commit({ ...studioRef.current, sizeClass: event.target.value as QuoteXraySizeClass }, 'human', 'You changed capacity and recalculated the benchmark.')} className="mt-2 min-h-11 w-full rounded-control border border-border bg-canvas px-3 text-text outline-none focus:border-focus">
                    {QUOTE_XRAY_SIZE_CLASSES.map((size) => <option key={size} value={size}>{size === '5p-plus' ? '5+ people' : size.replace('p', ' people')}</option>)}
                  </select>
                </label>
              </div>
            </section>

            <section className="rounded-panel border border-border bg-surface p-5 shadow-hairline md:p-7">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-signal-strong">1 · What is priced</p>
                  <h2 className="mt-2 font-display text-3xl font-medium">Quote ledger</h2>
                </div>
                <p className="text-right text-sm text-text-muted">{studio.lineItems.length} priced items</p>
              </div>
              <div className="mt-6 overflow-hidden rounded-surface border border-border">
                {studio.lineItems.length === 0 ? (
                  <p className="p-5 text-sm text-text-muted">No priced line items yet.</p>
                ) : studio.lineItems.map((item, index) => (
                  <div key={item.id} className={`grid grid-cols-[minmax(0,1fr)_112px_auto] items-center gap-3 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_132px_auto] ${index ? 'border-t border-border' : ''}`}>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-text">{item.label}</p>
                      <p className="mt-0.5 text-xs uppercase tracking-[0.12em] text-text-faint">{item.category.replace('_', ' ')}</p>
                    </div>
                    <label className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-faint">$</span>
                      <input aria-label={`${item.label} amount`} type="number" min="0" value={item.amount} onChange={(event) => changeLineAmount(item.id, Number(event.target.value))} className="min-h-10 w-full rounded-control border border-border bg-canvas pl-7 pr-3 text-right font-medium text-text outline-none focus:border-focus" />
                    </label>
                    <button type="button" onClick={() => removeHumanLine(item.id)} aria-label={`Remove ${item.label}`} className="min-h-10 rounded-control px-2 text-xs font-semibold text-text-faint hover:bg-danger-bg hover:text-danger">Remove</button>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_128px_150px_auto]">
                <input aria-label="New line label" value={newLine.label} onChange={(event) => setNewLine((value) => ({ ...value, label: event.target.value }))} placeholder="Add a missing cost" className="min-h-11 rounded-control border border-border bg-canvas px-3 text-sm outline-none focus:border-focus" />
                <input aria-label="New line amount" type="number" min="0" value={newLine.amount} onChange={(event) => setNewLine((value) => ({ ...value, amount: event.target.value }))} placeholder="$ amount" className="min-h-11 rounded-control border border-border bg-canvas px-3 text-sm outline-none focus:border-focus" />
                <select aria-label="New line category" value={newLine.category} onChange={(event) => setNewLine((value) => ({ ...value, category: event.target.value as QuoteXrayLineCategory }))} className="min-h-11 rounded-control border border-border bg-canvas px-3 text-sm outline-none focus:border-focus">
                  {QUOTE_XRAY_LINE_CATEGORIES.map((category) => <option key={category} value={category}>{category.replace('_', ' ')}</option>)}
                </select>
                <button type="button" onClick={addHumanLine} className="min-h-11 rounded-control bg-action-strong px-4 text-sm font-semibold text-on-action-strong hover:bg-action-strong-hover">Add line</button>
              </div>
            </section>

            <section className="rounded-panel border border-border bg-surface p-5 shadow-hairline md:p-7">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-signal-strong">2 · What is missing</p>
                  <h2 className="mt-2 font-display text-3xl font-medium">Scope X-Ray</h2>
                </div>
                <p className="text-right text-sm font-medium text-text-muted">{summary.completeness}% explicit</p>
              </div>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {QUOTE_XRAY_SCOPE_ITEMS.map((item) => {
                  const value = studio.scope[item.id]
                  return (
                    <article key={item.id} className={`rounded-surface border p-4 ${value.status === 'excluded' ? 'border-danger/30 bg-danger-bg' : value.status === 'unclear' ? 'border-warning/30 bg-warning-bg' : 'border-border bg-canvas'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-medium text-text">{item.label}</h3>
                          {value.note && <p className="mt-1 text-xs leading-relaxed text-text-muted">{value.note}</p>}
                        </div>
                        <select aria-label={`${item.label} status`} value={value.status} onChange={(event) => updateScope(item.id, event.target.value as QuoteXrayScopeStatus)} className="min-h-9 rounded-control border border-border-strong bg-surface px-2 text-xs font-semibold text-text outline-none focus:border-focus">
                          {QUOTE_XRAY_SCOPE_STATUSES.map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}
                        </select>
                      </div>
                      <a href={item.sourceUrl} className="mt-3 inline-flex min-h-8 items-center text-xs font-medium text-signal-strong underline decoration-signal/40 underline-offset-3 hover:text-text">{item.sourceLabel}</a>
                    </article>
                  )
                })}
              </div>
            </section>

            <section className="rounded-panel border border-border bg-surface p-5 shadow-hairline md:p-7" id="contractor-questions">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-signal-strong">3 · What to ask next</p>
                  <h2 className="mt-2 font-display text-3xl font-medium">Contractor questions</h2>
                </div>
                <button type="button" onClick={() => commit({ ...studioRef.current, questions: buildQuoteXrayQuestions(studioRef.current) }, 'human', 'You built the contractor question list.')} className="min-h-11 rounded-control border border-border-strong bg-canvas px-4 text-sm font-semibold text-text hover:border-action">Build from unresolved scope</button>
              </div>
              {studio.questions.length ? (
                <ol className="mt-6 space-y-3">
                  {studio.questions.map((question, index) => (
                    <li key={`${question}-${index}`} className="flex gap-3 rounded-surface border border-border bg-canvas p-4 text-sm leading-relaxed">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-action-muted text-xs font-bold text-on-action">{index + 1}</span>
                      <span>{question}</span>
                    </li>
                  ))}
                </ol>
              ) : <p className="mt-5 text-sm text-text-muted">Ask your agent to build the list, or use the button after resolving the quote scope.</p>}
            </section>
          </div>

          <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
            <section className="overflow-hidden rounded-panel bg-surface-strong p-6 text-text-inverse shadow-raised" aria-live="polite" data-testid="quote-xray-summary">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sauna-sand">Live landed-cost view</p>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs">{summary.completeness}% explicit</span>
              </div>
              <p className="mt-7 text-sm text-text-inverse/58">Quoted total</p>
              <p className="mt-1 font-display text-5xl font-medium" data-testid="quoted-total">{money.format(summary.quotedTotal)}</p>
              <div className="mt-7 h-4 overflow-hidden rounded-full bg-white/10">
                <div className="flex h-full" style={{ width: `${Math.max(4, (summary.projectedHigh / maxVisualTotal) * 100)}%` }}>
                  <div className="h-full bg-sauna-glow" style={{ width: `${(summary.quotedTotal / summary.projectedHigh) * 100}%` }} />
                  {summary.pricedExposureHigh > 0 && <div className="h-full flex-1 bg-danger" />}
                </div>
              </div>
              <div className="mt-3 flex items-start justify-between gap-5 text-xs text-text-inverse/58">
                <span>What is priced</span>
                <span className="text-right">Known exposure</span>
              </div>
              <div className="mt-7 rounded-surface border border-white/10 bg-white/6 p-4">
                <p className="text-sm text-text-inverse/62">Current projected range</p>
                <p className="mt-1 text-2xl font-semibold" data-testid="projected-total">{money.format(summary.projectedLow)} to {money.format(summary.projectedHigh)}</p>
                <p className="mt-2 text-xs leading-relaxed text-text-inverse/52">
                  Adds only sourced ranges we can price. {summary.unpricedRiskCount ? `${summary.unpricedRiskCount} unresolved item${summary.unpricedRiskCount === 1 ? '' : 's'} still have no dollar amount.` : 'No unpriced scope remains.'}
                </p>
              </div>
              {summary.benchmark && (
                <div className="mt-4 border-t border-white/10 pt-4 text-xs leading-relaxed text-text-inverse/58">
                  Sourced sauna-package benchmark, before every local installation cost: {money.format(summary.benchmark.low)} to {money.format(summary.benchmark.high)}. {summary.benchmark.label}. {summary.benchmark.confidence === 'thin' ? 'Treat it as a starting range.' : ''}
                </div>
              )}
            </section>

            <section className="rounded-panel border border-border bg-surface p-5 shadow-hairline">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold">Risk findings</h2>
                <span className="text-sm text-text-faint">{summary.findings.length}</span>
              </div>
              <div className="mt-4 space-y-3" data-testid="risk-findings">
                {summary.findings.length ? summary.findings.map((finding) => (
                  <article key={finding.scopeId} className={`rounded-surface border p-3 ${finding.severity === 'danger' ? 'border-danger/25 bg-danger-bg' : 'border-warning/25 bg-warning-bg'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-text">{finding.label}</p>
                        <p className="mt-1 text-xs leading-relaxed text-text-muted">{finding.message}</p>
                      </div>
                      {finding.exposureHigh !== null && <span className="shrink-0 text-xs font-bold text-danger">up to {money.format(finding.exposureHigh)}</span>}
                    </div>
                  </article>
                )) : <p className="text-sm text-positive">Every applicable scope item is explicit.</p>}
              </div>
            </section>

            <section className="rounded-panel border border-border bg-surface p-5 shadow-hairline">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold">Shared activity</h2>
                <button type="button" onClick={() => downloadReview(studio)} className="text-xs font-semibold text-signal-strong underline underline-offset-3">Export review</button>
              </div>
              {studio.activity.length ? (
                <ol className="mt-4 space-y-3">
                  {studio.activity.slice(0, 5).map((entry) => (
                    <li key={entry.id} className="flex gap-3 text-xs leading-relaxed text-text-muted">
                      <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${entry.actor === 'agent' ? 'bg-action' : 'bg-positive'}`} />
                      {entry.message}
                    </li>
                  ))}
                </ol>
              ) : <p className="mt-3 text-xs leading-relaxed text-text-faint">Human and agent changes appear here so the review stays inspectable.</p>}
            </section>
          </aside>
        </div>
      </section>

      <section className="border-t border-border bg-surface-subtle px-6 py-12">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-signal-strong">Planning aid, not a contractor quote</p>
          <p className="mt-3 text-sm leading-relaxed text-text-muted">Amounts are sourced planning ranges, not guaranteed local prices. Electrical, structural, ventilation, and permit decisions need qualified local professionals. Sauna Quote X-Ray never sends your data or contacts a seller.</p>
        </div>
      </section>
    </>
  )
}

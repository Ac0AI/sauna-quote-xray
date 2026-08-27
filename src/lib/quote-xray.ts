import { estimatePublicPackageRange, installCostRange } from '#lib/quote-xray-costs'

export const QUOTE_XRAY_PRODUCT_TYPES = [
  'indoor-traditional',
  'outdoor-barrel',
  'infrared',
] as const

export const QUOTE_XRAY_SIZE_CLASSES = ['1-2p', '3-4p', '5p-plus'] as const
export const QUOTE_XRAY_SCOPE_STATUSES = [
  'included',
  'excluded',
  'unclear',
  'not_applicable',
] as const
export const QUOTE_XRAY_LINE_CATEGORIES = [
  'sauna',
  'heater',
  'site_work',
  'electrical',
  'delivery',
  'fees',
  'other',
] as const
export const QUOTE_XRAY_FIXTURE_IDS = [
  'basement-traditional',
  'backyard-barrel',
  'plug-in-infrared',
] as const

export type QuoteXrayProductType = (typeof QUOTE_XRAY_PRODUCT_TYPES)[number]
export type QuoteXraySizeClass = (typeof QUOTE_XRAY_SIZE_CLASSES)[number]
export type QuoteXrayScopeStatus = (typeof QUOTE_XRAY_SCOPE_STATUSES)[number]
export type QuoteXrayLineCategory = (typeof QUOTE_XRAY_LINE_CATEGORIES)[number]
export type QuoteXrayFixtureId = (typeof QUOTE_XRAY_FIXTURE_IDS)[number]

export interface QuoteXrayLineItem {
  id: string
  label: string
  amount: number
  category: QuoteXrayLineCategory
  note?: string
}

export interface QuoteXrayScopeValue {
  status: QuoteXrayScopeStatus
  note?: string
}

export interface QuoteXrayActivity {
  id: string
  actor: 'human' | 'agent'
  message: string
}

export interface QuoteXrayState {
  title: string
  productType: QuoteXrayProductType
  sizeClass: QuoteXraySizeClass
  location: string
  lineItems: QuoteXrayLineItem[]
  scope: Record<QuoteXrayScopeId, QuoteXrayScopeValue>
  questions: string[]
  activity: QuoteXrayActivity[]
}

export const QUOTE_XRAY_SCOPE_ITEMS = [
  {
    id: 'sauna-kit',
    label: 'Cabin or room package',
    question: 'What exact cabin, lumber, insulation, vapor barrier, and interior finish are included?',
    sourceLabel: 'Home sauna quote checklist',
    sourceUrl: 'https://sauna.guide/guides/home-sauna-quote-checklist',
  },
  {
    id: 'heater',
    label: 'Heater, stones, and controls',
    question: 'Please name the heater model, kW rating, control unit, stone load, and warranty for each.',
    sourceLabel: 'Heater size calculator',
    sourceUrl: 'https://sauna.guide/tools/sauna-heater-size-calculator',
  },
  {
    id: 'delivery',
    label: 'Freight and final placement',
    question: 'Is freight curbside or placed at the install location, and what access surcharges can still be added?',
    sourceLabel: 'True cost calculator',
    sourceUrl: 'https://sauna.guide/tools/what-a-sauna-costs',
    condition: 'delivery_not_included',
  },
  {
    id: 'assembly',
    label: 'Assembly and finish work',
    question: 'Does labor include assembly, trim, sealing, punch-list work, and debris removal?',
    sourceLabel: 'Installation checklist',
    sourceUrl: 'https://sauna.guide/guides/indoor-sauna-installation-checklist',
  },
  {
    id: 'electrical',
    label: 'Dedicated electrical circuit',
    question: 'Does the price include the dedicated circuit, wire run, disconnect, GFCI protection, and final electrician hookup?',
    sourceLabel: 'Electrical planning guide',
    sourceUrl: 'https://sauna.guide/guides/sauna-electrical-planning-guide',
    condition: 'electrical_not_included',
  },
  {
    id: 'panel',
    label: 'Panel capacity or upgrade',
    question: 'Has a licensed electrician confirmed spare panel capacity, and what happens to the price if an upgrade is required?',
    sourceLabel: 'What a sauna actually costs',
    sourceUrl: 'https://sauna.guide/tools/what-a-sauna-costs',
    condition: 'panel_upgrade_needed',
  },
  {
    id: 'foundation',
    label: 'Pad, base, or foundation',
    question: 'What base is required, who builds it, and is drainage or frost movement included in the scope?',
    sourceLabel: 'Outdoor sauna foundation guide',
    sourceUrl: 'https://sauna.guide/guides/outdoor-sauna-foundation-guide',
    condition: 'foundation_needed',
  },
  {
    id: 'permit',
    label: 'Permits and inspections',
    question: 'Who pulls the electrical and building permits, pays the fees, and handles failed inspections?',
    sourceLabel: 'Sauna permit guide',
    sourceUrl: 'https://sauna.guide/guides/sauna-permit-requirements-us',
    condition: 'permit_required',
  },
  {
    id: 'ventilation',
    label: 'Ventilation and drying',
    question: 'Show the intake, exhaust, and drying-vent plan and confirm who supplies and installs each opening or fan.',
    sourceLabel: 'Ventilation mistakes guide',
    sourceUrl: 'https://sauna.guide/guides/sauna-ventilation-mistakes',
  },
  {
    id: 'warranty',
    label: 'Warranty and service responsibility',
    question: 'List the separate cabin, heater, controls, labor, and shipping-damage warranty terms and who handles service locally.',
    sourceLabel: 'Home sauna quote checklist',
    sourceUrl: 'https://sauna.guide/guides/home-sauna-quote-checklist',
  },
] as const

export type QuoteXrayScopeId = (typeof QUOTE_XRAY_SCOPE_ITEMS)[number]['id']

const ALL_SCOPE_IDS = QUOTE_XRAY_SCOPE_ITEMS.map((item) => item.id)

function scope(overrides: Partial<Record<QuoteXrayScopeId, QuoteXrayScopeValue>>) {
  return Object.fromEntries(
    ALL_SCOPE_IDS.map((id) => [id, overrides[id] ?? { status: 'unclear' }]),
  ) as Record<QuoteXrayScopeId, QuoteXrayScopeValue>
}

const FIXTURES: Record<QuoteXrayFixtureId, QuoteXrayState> = {
  'basement-traditional': {
    title: 'Basement traditional sauna quote',
    productType: 'indoor-traditional',
    sizeClass: '3-4p',
    location: 'Minneapolis, MN',
    lineItems: [
      { id: 'cabin-package', label: 'Cedar cabin package', amount: 12900, category: 'sauna' },
      { id: 'heater-package', label: '8 kW heater and controls', amount: 2400, category: 'heater' },
      { id: 'assembly-labor', label: 'Assembly labor', amount: 2500, category: 'site_work' },
      { id: 'freight', label: 'Curbside freight', amount: 700, category: 'delivery' },
    ],
    scope: scope({
      'sauna-kit': { status: 'included', note: 'Cedar package named, insulation scope not itemized.' },
      heater: { status: 'included', note: '8 kW stated, model and stone load missing.' },
      delivery: { status: 'included', note: 'Curbside only.' },
      assembly: { status: 'included' },
      electrical: { status: 'excluded' },
      panel: { status: 'unclear' },
      foundation: { status: 'not_applicable' },
      permit: { status: 'unclear' },
      ventilation: { status: 'unclear' },
      warranty: { status: 'unclear' },
    }),
    questions: [],
    activity: [],
  },
  'backyard-barrel': {
    title: 'Backyard barrel sauna quote',
    productType: 'outdoor-barrel',
    sizeClass: '5p-plus',
    location: 'Bend, OR',
    lineItems: [
      { id: 'barrel-kit', label: 'Thermowood barrel kit', amount: 8950, category: 'sauna' },
      { id: 'heater', label: 'Electric heater package', amount: 1850, category: 'heater' },
      { id: 'delivery', label: 'Regional delivery', amount: 950, category: 'delivery' },
    ],
    scope: scope({
      'sauna-kit': { status: 'included' },
      heater: { status: 'included', note: 'kW and control model not named.' },
      delivery: { status: 'included' },
      assembly: { status: 'excluded' },
      electrical: { status: 'excluded' },
      panel: { status: 'unclear' },
      foundation: { status: 'excluded' },
      permit: { status: 'unclear' },
      ventilation: { status: 'unclear' },
      warranty: { status: 'included', note: 'Cabin headline only; heater warranty separate.' },
    }),
    questions: [],
    activity: [],
  },
  'plug-in-infrared': {
    title: 'Plug-in infrared cabin quote',
    productType: 'infrared',
    sizeClass: '1-2p',
    location: 'Austin, TX',
    lineItems: [
      { id: 'infrared-cabin', label: 'Two-person infrared cabin', amount: 4995, category: 'sauna' },
      { id: 'white-glove', label: 'White-glove delivery and setup', amount: 650, category: 'delivery' },
    ],
    scope: scope({
      'sauna-kit': { status: 'included' },
      heater: { status: 'included', note: 'Emitter coverage and electrical listing need confirmation.' },
      delivery: { status: 'included' },
      assembly: { status: 'included' },
      electrical: { status: 'not_applicable', note: 'Standard 120V plug-in cabin.' },
      panel: { status: 'not_applicable' },
      foundation: { status: 'not_applicable' },
      permit: { status: 'not_applicable' },
      ventilation: { status: 'not_applicable' },
      warranty: { status: 'unclear' },
    }),
    questions: [],
    activity: [],
  },
}

export function getQuoteXrayFixture(id: QuoteXrayFixtureId): QuoteXrayState {
  return structuredClone(FIXTURES[id])
}

export function createEmptyQuoteXrayState(): QuoteXrayState {
  return {
    title: 'Untitled sauna quote',
    productType: 'indoor-traditional',
    sizeClass: '3-4p',
    location: 'United States',
    lineItems: [],
    scope: scope({ foundation: { status: 'not_applicable' } }),
    questions: [],
    activity: [],
  }
}

function conditionRange(
  item: (typeof QUOTE_XRAY_SCOPE_ITEMS)[number],
  productType: QuoteXrayProductType,
) {
  if (!('condition' in item)) return null
  return installCostRange(item.condition, productType)
}

export function buildQuoteXrayQuestions(
  state: QuoteXrayState,
  focus?: QuoteXrayScopeId[],
): string[] {
  const focusSet = focus?.length ? new Set(focus) : null
  return QUOTE_XRAY_SCOPE_ITEMS
    .filter((item) => !focusSet || focusSet.has(item.id))
    .filter((item) => {
      const status = state.scope[item.id].status
      return status === 'excluded' || status === 'unclear'
    })
    .map((item) => item.question)
}

export interface QuoteXrayFinding {
  scopeId: QuoteXrayScopeId
  label: string
  status: QuoteXrayScopeStatus
  severity: 'warning' | 'danger'
  message: string
  exposureLow: number | null
  exposureHigh: number | null
  sourceLabel: string
  sourceUrl: string
}

export interface QuoteXraySummary {
  quotedTotal: number
  pricedExposureLow: number
  pricedExposureHigh: number
  projectedLow: number
  projectedHigh: number
  completeness: number
  findings: QuoteXrayFinding[]
  unpricedRiskCount: number
  benchmark: null | {
    low: number
    high: number
    label: string
    confidence: 'thin' | 'ok'
  }
}

export function summarizeQuoteXray(state: QuoteXrayState): QuoteXraySummary {
  const quotedTotal = state.lineItems.reduce((sum, item) => sum + item.amount, 0)
  let pricedExposureLow = 0
  let pricedExposureHigh = 0
  let unpricedRiskCount = 0

  const findings: QuoteXrayFinding[] = []
  for (const item of QUOTE_XRAY_SCOPE_ITEMS) {
    const value = state.scope[item.id]
    if (value.status !== 'excluded' && value.status !== 'unclear') continue

    const range = conditionRange(item, state.productType)
    const isExcluded = value.status === 'excluded'
    const low = range ? (isExcluded ? range.low : 0) : null
    const high = range?.high ?? null
    if (low !== null && high !== null) {
      pricedExposureLow += low
      pricedExposureHigh += high
    } else {
      unpricedRiskCount += 1
    }

    findings.push({
      scopeId: item.id,
      label: item.label,
      status: value.status,
      severity: isExcluded ? 'danger' : 'warning',
      message: isExcluded
        ? `${item.label} is outside the quoted scope.`
        : `${item.label} is not clear enough to treat as included.`,
      exposureLow: low,
      exposureHigh: high,
      sourceLabel: item.sourceLabel,
      sourceUrl: item.sourceUrl,
    })
  }

  const applicable = QUOTE_XRAY_SCOPE_ITEMS.filter(
    (item) => state.scope[item.id].status !== 'not_applicable',
  )
  const included = applicable.filter((item) => state.scope[item.id].status === 'included')
  const completeness = applicable.length ? Math.round((included.length / applicable.length) * 100) : 100

  const benchmark = estimatePublicPackageRange(state.productType, state.sizeClass)

  return {
    quotedTotal,
    pricedExposureLow,
    pricedExposureHigh,
    projectedLow: quotedTotal + pricedExposureLow,
    projectedHigh: quotedTotal + pricedExposureHigh,
    completeness,
    findings,
    unpricedRiskCount,
    benchmark,
  }
}

export function addQuoteXrayActivity(
  state: QuoteXrayState,
  actor: QuoteXrayActivity['actor'],
  message: string,
): QuoteXrayState {
  return {
    ...state,
    activity: [
      { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, actor, message },
      ...state.activity,
    ].slice(0, 8),
  }
}

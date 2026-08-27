export type QuoteXrayCostProductType = 'indoor-traditional' | 'outdoor-barrel' | 'infrared'
export type QuoteXrayCostSizeClass = '1-2p' | '3-4p' | '5p-plus'

interface PublicPricePoint {
  productType: QuoteXrayCostProductType
  sizeClass: QuoteXrayCostSizeClass
  priceUsd: number
  sourceUrl: string
}

// Public seller prices observed in August 2026. These are package prices with
// different scopes, not private customer quotes and not all-in project costs.
const PUBLIC_PRICE_POINTS: PublicPricePoint[] = [
  { productType: 'indoor-traditional', sizeClass: '1-2p', priceUsd: 4172, sourceUrl: 'https://almostheaven.com/products/logan-1-person-indoor-sauna' },
  { productType: 'indoor-traditional', sizeClass: '1-2p', priceUsd: 5299, sourceUrl: 'https://almostheaven.com/products/hillsboro-2-person-indoor-sauna' },
  { productType: 'indoor-traditional', sizeClass: '1-2p', priceUsd: 8998, sourceUrl: 'https://www.leisureconcepts.net/products/finnleo-northstar-4-x-4-indoor-sauna-kit' },
  { productType: 'indoor-traditional', sizeClass: '3-4p', priceUsd: 9499, sourceUrl: 'https://www.leisureconcepts.net/products/finnleo-northstar-4-x-6-indoor-sauna-kit' },
  { productType: 'indoor-traditional', sizeClass: '3-4p', priceUsd: 10990, sourceUrl: 'https://plunge.com/products/sauna' },
  { productType: 'indoor-traditional', sizeClass: '3-4p', priceUsd: 11099, sourceUrl: 'https://sunhomesaunas.com/products/nova-3-person-indoor-traditional-sauna' },
  { productType: 'indoor-traditional', sizeClass: '5p-plus', priceUsd: 8176, sourceUrl: 'https://almostheaven.com/products/titan-6-person-indoor-sauna' },
  { productType: 'indoor-traditional', sizeClass: '5p-plus', priceUsd: 15199, sourceUrl: 'https://sunhomesaunas.com/products/nova-5-person-indoor-traditional-sauna' },
  { productType: 'outdoor-barrel', sizeClass: '1-2p', priceUsd: 4037, sourceUrl: 'https://almostheaven.com/collections/barrel-saunas' },
  { productType: 'outdoor-barrel', sizeClass: '1-2p', priceUsd: 5184, sourceUrl: 'https://almostheaven.com/collections/barrel-saunas' },
  { productType: 'outdoor-barrel', sizeClass: '3-4p', priceUsd: 5303, sourceUrl: 'https://almostheaven.com/collections/barrel-saunas' },
  { productType: 'outdoor-barrel', sizeClass: '3-4p', priceUsd: 8548, sourceUrl: 'https://almostheaven.com/collections/barrel-saunas' },
  { productType: 'outdoor-barrel', sizeClass: '3-4p', priceUsd: 10650, sourceUrl: 'https://almostheaven.com/collections/barrel-saunas' },
  { productType: 'outdoor-barrel', sizeClass: '5p-plus', priceUsd: 6358, sourceUrl: 'https://almostheaven.com/collections/barrel-saunas' },
  { productType: 'outdoor-barrel', sizeClass: '5p-plus', priceUsd: 8932, sourceUrl: 'https://almostheaven.com/collections/barrel-saunas' },
  { productType: 'outdoor-barrel', sizeClass: '5p-plus', priceUsd: 16558, sourceUrl: 'https://almostheaven.com/collections/barrel-saunas' },
  { productType: 'infrared', sizeClass: '1-2p', priceUsd: 1922, sourceUrl: 'https://www.homedepot.com/p/DYNAMIC-SAUNAS-Barcelona-1-to-2-Person-Hemlock-Wood-Infrared-Sauna-For-Home-DYN-6106-01-HD/335123556' },
  { productType: 'infrared', sizeClass: '1-2p', priceUsd: 4999, sourceUrl: 'https://sunhomesaunas.com/collections/best-home-saunas' },
  { productType: 'infrared', sizeClass: '1-2p', priceUsd: 6999, sourceUrl: 'https://infraredsauna.com/pricelist/' },
  { productType: 'infrared', sizeClass: '3-4p', priceUsd: 5900, sourceUrl: 'https://healthmatesauna.com/product/enrich-3/' },
  { productType: 'infrared', sizeClass: '3-4p', priceUsd: 7199, sourceUrl: 'https://infraredsauna.com/pricelist/' },
  { productType: 'infrared', sizeClass: '3-4p', priceUsd: 7799, sourceUrl: 'https://sunhomesaunas.com/collections/best-home-saunas' },
]

const INSTALL_RANGES: Record<string, Partial<Record<QuoteXrayCostProductType, { low: number; high: number }>>> = {
  electrical_not_included: {
    'indoor-traditional': { low: 600, high: 1800 },
    'outdoor-barrel': { low: 500, high: 2000 },
  },
  panel_upgrade_needed: {
    'indoor-traditional': { low: 1500, high: 3000 },
    'outdoor-barrel': { low: 1500, high: 3000 },
  },
  foundation_needed: { 'outdoor-barrel': { low: 200, high: 1500 } },
  permit_required: {
    'indoor-traditional': { low: 75, high: 400 },
    'outdoor-barrel': { low: 75, high: 400 },
  },
  delivery_not_included: { 'outdoor-barrel': { low: 0, high: 800 } },
}

export function installCostRange(condition: string, productType: QuoteXrayCostProductType) {
  return INSTALL_RANGES[condition]?.[productType] ?? null
}

export function estimatePublicPackageRange(
  productType: QuoteXrayCostProductType,
  sizeClass: QuoteXrayCostSizeClass,
) {
  const typePoints = PUBLIC_PRICE_POINTS.filter((point) => point.productType === productType)
  const sizePoints = typePoints.filter((point) => point.sizeClass === sizeClass)
  const points = sizePoints.length >= 3 ? sizePoints : typePoints
  if (points.length < 2) return null
  const prices = points.map((point) => point.priceUsd).sort((a, b) => a - b)
  return {
    low: prices[0],
    high: prices[prices.length - 1],
    label: `${sizePoints.length >= 3 ? 'your size' : 'this sauna type'}, ${points.length} public seller prices observed August 2026`,
    confidence: points.length < 4 || sizePoints.length < 3 ? 'thin' as const : 'ok' as const,
  }
}

export function publicQuoteXraySources() {
  return [...new Set(PUBLIC_PRICE_POINTS.map((point) => point.sourceUrl))]
}

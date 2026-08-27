import type { Metadata } from 'next'
import QuoteXrayStudio from '@/components/QuoteXrayStudio'

const URL = 'https://sauna-quote-xray.vercel.app/tools/sauna-quote-xray'
const TITLE = 'Sauna Quote X-Ray: Find the Costs Your Quote Hides'
const DESCRIPTION = 'Review a sauna quote with an AI agent on the same live canvas. Expose missing electrical, permits, delivery, ventilation, warranty, and site-work scope before you sign.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Sauna Quote X-Ray',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web browser with WebMCP support',
  url: URL,
  codeRepository: 'https://github.com/Ac0AI/sauna-quote-xray',
  description: DESCRIPTION,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  featureList: ['Shared human-agent canvas', 'Hidden cost analysis', 'Scope checklist', 'Contractor question builder', 'Page-local data'],
}

export default function SaunaQuoteXrayPage() {
  return (
    <main className="min-h-screen bg-canvas text-text">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <QuoteXrayStudio />
      <footer className="border-t border-white/10 bg-surface-strong px-6 py-10 text-text-inverse">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 text-sm text-text-inverse/65 sm:flex-row">
          <p>Built by Sauna Guide for the 2026 WebMCP Challenge.</p>
          <div className="flex gap-5">
            <a href="https://sauna.guide/privacy" className="underline underline-offset-4">Privacy</a>
            <a href="mailto:hi@ac0.ai" className="underline underline-offset-4">Support</a>
            <a href="https://github.com/Ac0AI/sauna-quote-xray" className="underline underline-offset-4">MIT source</a>
          </div>
        </div>
      </footer>
    </main>
  )
}

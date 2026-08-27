import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

const siteUrl = 'https://sauna-quote-xray.vercel.app'
const originTrialToken = process.env.WEBMCP_ORIGIN_TRIAL_TOKEN?.trim()

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Sauna Quote X-Ray', template: '%s | Sauna Quote X-Ray' },
  description: 'A shared human-agent canvas that exposes the costs and scope a sauna quote leaves out.',
  icons: { icon: '/icon.svg' },
  openGraph: { siteName: 'Sauna Quote X-Ray', type: 'website' },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>{originTrialToken && <meta httpEquiv="origin-trial" content={originTrialToken} />}</head>
      <body className="bg-canvas font-body text-text antialiased">
        <header className="fixed inset-x-0 top-0 z-50 border-b border-black/8 bg-canvas/94 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6">
            <Link href="/tools/sauna-quote-xray" className="flex items-center gap-3 font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-strong text-sm text-sauna-glow">X</span>
              Sauna Quote X-Ray
            </Link>
            <a href="https://github.com/Ac0AI/sauna-quote-xray" className="text-sm font-medium text-text-muted underline decoration-border-strong underline-offset-4">Source code</a>
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}

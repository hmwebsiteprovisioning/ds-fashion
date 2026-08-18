import type { Metadata } from 'next'
import { DM_Serif_Display, Montserrat } from 'next/font/google'
import './globals.css'
import Providers from './providers'
import { STORE_NAME, DEFAULT_LOGO_PATH } from '@/lib/branding'

const serifDisplay = DM_Serif_Display({
  subsets: ['latin', 'latin-ext'],
  weight: '400',
  variable: '--font-serif',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
  display: 'swap',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ds-fashion.eu';
const OG_IMAGE = `${SITE_URL}${DEFAULT_LOGO_PATH}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${STORE_NAME} – Луксозна мода онлайн | Дрехи, обувки, аксесоари`,
    template: `%s | ${STORE_NAME}`,
  },
  description:
    `${STORE_NAME} – онлайн магазин за луксозна мода. Открийте изключителни дрехи, обувки и аксесоари за жени и мъже. Бърза доставка в България и Европа.`,
  keywords: [
    'мода', 'дрехи', 'обувки', 'аксесоари', 'луксозна мода', 'онлайн магазин',
    'мъжка мода', 'дамска мода', 'ds-fashion', 'fashion', 'clothes', 'shoes',
    'accessories', 'luxury fashion', 'Bulgaria', 'online shop',
  ],
  authors: [{ name: STORE_NAME, url: SITE_URL }],
  creator: STORE_NAME,
  publisher: STORE_NAME,
  category: 'fashion',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    locale: 'bg_BG',
    alternateLocale: 'en_US',
    url: SITE_URL,
    siteName: STORE_NAME,
    title: `${STORE_NAME} – Луксозна мода онлайн | Дрехи, обувки, аксесоари`,
    description:
      'Открийте изключителни дрехи, обувки и аксесоари за жени и мъже. Бърза доставка в България и Европа.',
    images: [
      {
        url: OG_IMAGE,
        width: 240,
        height: 48,
        alt: `${STORE_NAME} – луксозна мода`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${STORE_NAME} – Луксозна мода онлайн`,
    description:
      'Дрехи, обувки и аксесоари за жени и мъже. Бърза доставка в България.',
    images: [OG_IMAGE],
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      'bg': SITE_URL,
      'en': `${SITE_URL}/en`,
    },
  },
  icons: {
    icon: [
      { url: '/logo-no-bg.png' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/logo-no-bg.png',
    apple: '/logo-no-bg.png',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ClothingStore',
  name: STORE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}${DEFAULT_LOGO_PATH}`,
  image: OG_IMAGE,
  description:
    'Онлайн магазин за луксозна мода – дрехи, обувки и аксесоари за жени и мъже.',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'BG',
  },
  priceRange: '€€',
  currenciesAccepted: 'EUR, BGN',
  paymentAccepted: 'Credit Card',
  openingHours: 'Mo-Su 00:00-24:00',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLdScript = JSON.stringify(jsonLd)

  return (
    <html lang="bg" suppressHydrationWarning>
      <body className={`${serifDisplay.variable} ${montserrat.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript }}
          suppressHydrationWarning
        />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

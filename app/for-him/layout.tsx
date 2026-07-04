import type { Metadata } from 'next';
import { STORE_NAME } from '@/lib/branding';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ds-fashion.eu';

export const metadata: Metadata = {
  title: 'Мъжка мода – дрехи, обувки и аксесоари за мъже',
  description:
    `Открийте мъжката колекция на ${STORE_NAME} – луксозни дрехи, обувки и аксесоари за мъже. Бърза доставка в България.`,
  keywords: ['мъжка мода', 'дрехи за мъже', 'обувки за мъже', 'мъжки аксесоари', 'луксозна мъжка мода'],
  alternates: { canonical: `${SITE_URL}/for-him` },
  openGraph: {
    title: `Мъжка мода | ${STORE_NAME}`,
    description:
      `Луксозни дрехи, обувки и аксесоари за мъже от ${STORE_NAME}.`,
    images: [{ url: `${SITE_URL}/ds-fashion-logo.svg`, alt: `${STORE_NAME} – мъжка мода` }],
  },
};

export default function ForHimLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

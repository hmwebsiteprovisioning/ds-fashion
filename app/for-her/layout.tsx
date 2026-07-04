import type { Metadata } from 'next';
import { STORE_NAME } from '@/lib/branding';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ds-fashion.eu';

export const metadata: Metadata = {
  title: 'Дамска мода – дрехи, обувки и аксесоари за жени',
  description:
    `Открийте дамската колекция на ${STORE_NAME} – луксозни дрехи, обувки и аксесоари за жени. Бърза доставка в България.`,
  keywords: ['дамска мода', 'дрехи за жени', 'обувки за жени', 'дамски аксесоари', 'луксозна дамска мода'],
  alternates: { canonical: `${SITE_URL}/for-her` },
  openGraph: {
    title: `Дамска мода | ${STORE_NAME}`,
    description:
      `Луксозни дрехи, обувки и аксесоари за жени от ${STORE_NAME}.`,
    images: [{ url: `${SITE_URL}/ds-fashion-logo.svg`, alt: `${STORE_NAME} – дамска мода` }],
  },
};

export default function ForHerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

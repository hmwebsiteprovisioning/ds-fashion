import type { Metadata } from 'next';
import { STORE_NAME } from '@/lib/branding';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ds-fashion.eu';

export const metadata: Metadata = {
  title: 'Всички продукти – дрехи, обувки и аксесоари',
  description:
    `Разгледайте пълната колекция на ${STORE_NAME} – изключителни дрехи, обувки и аксесоари за жени и мъже на топ цени.`,
  alternates: { canonical: `${SITE_URL}/products` },
  openGraph: {
    title: `Всички продукти | ${STORE_NAME}`,
    description:
      `Пълната колекция от дрехи, обувки и аксесоари в ${STORE_NAME}.`,
    images: [{ url: `${SITE_URL}/ds-fashion-logo.svg`, alt: `${STORE_NAME} – колекция` }],
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

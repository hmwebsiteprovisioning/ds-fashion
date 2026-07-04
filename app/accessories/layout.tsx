import type { Metadata } from 'next';
import { STORE_NAME } from '@/lib/branding';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ds-fashion.eu';

export const metadata: Metadata = {
  title: 'Аксесоари – чанти, колани, шалове и още',
  description:
    `Луксозни аксесоари от ${STORE_NAME} – чанти, колани, шалове, бижута и още. Перфектното допълнение към всяка визия.`,
  keywords: ['аксесоари', 'чанти', 'колани', 'шалове', 'бижута', 'луксозни аксесоари', 'мода'],
  alternates: { canonical: `${SITE_URL}/accessories` },
  openGraph: {
    title: `Аксесоари | ${STORE_NAME}`,
    description:
      `Луксозни аксесоари – чанти, шалове, бижута и още от ${STORE_NAME}.`,
    images: [{ url: `${SITE_URL}/ds-fashion-logo.svg`, alt: `${STORE_NAME} – аксесоари` }],
  },
};

export default function AccessoriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

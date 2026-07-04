import type { Metadata } from 'next';
import { STORE_NAME } from '@/lib/branding';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ds-fashion.eu';

export const metadata: Metadata = {
  title: `За нас – ${STORE_NAME}`,
  description:
    `Научете повече за ${STORE_NAME} – вашият онлайн магазин за луксозна мода. Мисия, ценности и нашата история.`,
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: `За нас | ${STORE_NAME}`,
    description:
      `Научете повече за ${STORE_NAME} – луксозна мода за жени и мъже.`,
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

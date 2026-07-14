'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Facebook } from 'lucide-react';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import { getLogoUrl, STORE_NAME } from '@/lib/branding';

export default function Footer() {
  const { settings } = useStoreSettings();
  const logoUrl = getLogoUrl(settings?.logourl);
  const storeName = settings?.storename || STORE_NAME;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ds-section border-t border-ds-border-strong mt-16">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10 text-center lg:text-left">
          <div className="col-span-1 space-y-4 flex flex-col items-center lg:items-start">
            <Link href="/">
              <Image
                src={logoUrl}
                alt={storeName}
                width={160}
                height={54}
                className="h-12 w-auto object-contain mb-3"
              />
            </Link>
            <p className="text-[12px] text-ds-text-secondary leading-relaxed max-w-[180px]">
              Луксозен облик с внимание към детайла и страст към качеството.
            </p>
            <div className="flex items-center justify-center lg:justify-start gap-4 pt-1">
              <a href="#" aria-label="Instagram" className="text-ds-text-secondary hover:text-ds-gold transition-colors">
                <Instagram size={17} />
              </a>
              <a href="#" aria-label="Facebook" className="text-ds-text-secondary hover:text-ds-gold transition-colors">
                <Facebook size={17} />
              </a>
              <a href="#" aria-label="TikTok" className="text-ds-text-secondary hover:text-ds-gold transition-colors text-[15px] font-bold leading-none">
                ✦
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[11px] font-bold tracking-widest uppercase text-ds-text mb-4">ПАЗАРУВАЙ</h4>
            {['Жени', 'Мъже', 'Аксесоари', 'Всички продукти', 'Sale'].map(item => (
              <div key={item}>
                <Link href="/products" className="text-[12px] text-ds-text-secondary hover:text-ds-gold transition-colors block">{item}</Link>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h4 className="text-[11px] font-bold tracking-widest uppercase text-ds-text mb-4">ИНФОРМАЦИЯ</h4>
            {['За нас', 'Доставка', 'Връщания и замяна', 'Общи условия', 'Контакти'].map(item => (
              <div key={item}>
                <Link href="/about" className="text-[12px] text-ds-text-secondary hover:text-ds-gold transition-colors block">{item}</Link>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h4 className="text-[11px] font-bold tracking-widest uppercase text-ds-text mb-4">МОЯ СТРАНИЦА</h4>
            {['Моят профил', 'Моите поръчки', 'Любими', 'Карта на сайта'].map(item => (
              <div key={item}>
                <Link href="/user" className="text-[12px] text-ds-text-secondary hover:text-ds-gold transition-colors block">{item}</Link>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h4 className="text-[11px] font-bold tracking-widest uppercase text-ds-text mb-4">КЛИЕНТСКА ПОДДРЪЖКА</h4>
            <div className="space-y-2 flex flex-col items-center lg:items-start">
              {settings?.telephonenumber && (
                <a href={`tel:${settings.telephonenumber}`} className="text-[12px] text-ds-text-secondary hover:text-ds-gold transition-colors flex items-center justify-center lg:justify-start gap-2 block">
                  📞 {settings.telephonenumber}
                </a>
              )}
              {!settings?.telephonenumber && (
                <span className="text-[12px] text-ds-text-secondary flex items-center justify-center lg:justify-start gap-2 block">📞 0899 123 456</span>
              )}
              {settings?.email && (
                <a href={`mailto:${settings.email}`} className="text-[12px] text-ds-text-secondary hover:text-ds-gold transition-colors flex items-center justify-center lg:justify-start gap-2 block">
                  ✉ {settings.email}
                </a>
              )}
              <span className="text-[12px] text-ds-text-secondary flex items-center justify-center lg:justify-start gap-2 block">📍 София, България</span>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-ds-border-strong flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-ds-text-copyright">© {year} {storeName}. Всички права запазени.</p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="text-[11px] text-ds-text-copyright hover:text-ds-gold transition-colors">Общи условия</Link>
            <Link href="/about" className="text-[11px] text-ds-text-copyright hover:text-ds-gold transition-colors">Политика за поверителност</Link>
            <Link href="/about" className="text-[11px] text-ds-text-copyright hover:text-ds-gold transition-colors">Бисквитки</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

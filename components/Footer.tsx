'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Facebook, ChevronRight, Phone, Mail, MapPin } from 'lucide-react';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import { STORE_NAME } from '@/lib/branding';

type Section = 'shop' | 'info' | 'account' | 'support';

export default function Footer() {
  const { settings } = useStoreSettings();
  const logoUrl = '/logo-no-bg.png';
  const storeName = settings?.storename || STORE_NAME;
  const year = new Date().getFullYear();
  const [openSection, setOpenSection] = useState<Section | null>(null);

  const toggle = (section: Section) =>
    setOpenSection(prev => (prev === section ? null : section));

  const AccordionSection = ({
    id,
    title,
    children,
  }: {
    id: Section;
    title: string;
    children: React.ReactNode;
  }) => {
    const isOpen = openSection === id;
    return (
      <div className="border-b border-ds-border lg:border-none">
        {/* Mobile header — clickable */}
        <button
          className="lg:hidden w-full flex items-center justify-between py-3 text-center"
          onClick={() => toggle(id)}
          aria-expanded={isOpen}
        >
          <h4 className="flex-1 text-center text-[11px] font-bold tracking-widest uppercase text-ds-text">
            {title}
          </h4>
          <ChevronRight
            size={16}
            className={`text-ds-text transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}
          />
        </button>

        {/* Desktop header — always visible */}
        <h4 className="hidden lg:block text-[11px] font-bold tracking-widest uppercase text-ds-text mb-4">
          {title}
        </h4>

        {/* Mobile collapsible body */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? 'max-h-96 pb-3' : 'max-h-0'
          }`}
        >
          <div className="space-y-3 pt-1">{children}</div>
        </div>

        {/* Desktop always-visible body */}
        <div className="hidden lg:block space-y-3">{children}</div>
      </div>
    );
  };

  return (
    <footer className="bg-ds-section border-t border-ds-border-strong mt-16">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 lg:gap-10 text-center lg:text-left">

          {/* Brand column */}
          <div className="col-span-1 space-y-4 flex flex-col items-center lg:items-start pb-6 lg:pb-0 border-b border-ds-border lg:border-none mb-2 lg:mb-0">
            <Link href="/">
              <Image
                src={logoUrl}
                alt={storeName}
                width={220}
                height={74}
                className="h-24 md:h-20 w-auto object-contain mb-3"
              />
            </Link>
            <p className="text-[12px] text-ds-text-secondary leading-relaxed max-w-[180px]">
              Луксозен облик с внимание към детайла и страст към качеството.
            </p>
            <div className="flex items-center justify-start gap-4 pt-1">
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

          {/* Пазарувай */}
          <AccordionSection id="shop" title="ПАЗАРУВАЙ">
            {['Жени', 'Мъже', 'Аксесоари', 'Всички продукти', 'Sale'].map(item => (
              <div key={item}>
                <Link href="/products" className="text-[12px] text-ds-text-secondary hover:text-ds-gold transition-colors block">
                  {item}
                </Link>
              </div>
            ))}
          </AccordionSection>

          {/* Информация */}
          <AccordionSection id="info" title="ИНФОРМАЦИЯ">
            {['За нас', 'Доставка', 'Връщания и замяна', 'Общи условия', 'Контакти'].map(item => (
              <div key={item}>
                <Link href="/about" className="text-[12px] text-ds-text-secondary hover:text-ds-gold transition-colors block">
                  {item}
                </Link>
              </div>
            ))}
          </AccordionSection>

          {/* Моя страница */}
          <AccordionSection id="account" title="МОЯ СТРАНИЦА">
            {['Моят профил', 'Моите поръчки', 'Любими', 'Карта на сайта'].map(item => (
              <div key={item}>
                <Link href="/user" className="text-[12px] text-ds-text-secondary hover:text-ds-gold transition-colors block">
                  {item}
                </Link>
              </div>
            ))}
          </AccordionSection>

          {/* Клиентска поддръжка */}
          <AccordionSection id="support" title="КЛИЕНТСКА ПОДДРЪЖКА">
            <div className="space-y-2 flex flex-col items-center lg:items-start">
              {settings?.telephonenumber ? (
                <a
                  href={`tel:${settings.telephonenumber}`}
                  className="text-[12px] text-ds-text-secondary hover:text-ds-gold transition-colors flex items-center gap-2"
                >
                  <Phone size={13} className="text-ds-text shrink-0" />
                  {settings.telephonenumber}
                </a>
              ) : (
                <span className="text-[12px] text-ds-text-secondary flex items-center gap-2">
                  <Phone size={13} className="text-ds-text shrink-0" />
                  0899 123 456
                </span>
              )}
              {settings?.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="text-[12px] text-ds-text-secondary hover:text-ds-gold transition-colors flex items-center gap-2"
                >
                  <Mail size={13} className="text-ds-text shrink-0" />
                  {settings.email}
                </a>
              )}
              <span className="text-[12px] text-ds-text-secondary flex items-center gap-2">
                <MapPin size={13} className="text-ds-text shrink-0" />
                София, България
              </span>
            </div>
          </AccordionSection>

        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-ds-border-strong flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-ds-text-copyright">© {year} {storeName}. Всички права запазени.</p>

          {/* Attribution — centred on desktop between copyright and links */}
          <span className="hidden sm:block text-xs text-ds-text-copyright/50">
            Създаден от{' '}
            <a
              href="https://www.hmwspro.com/bg"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-ds-text-copyright/70 underline decoration-ds-text-copyright/30 transition hover:text-ds-gold hover:decoration-ds-gold/60"
            >
              H&amp;M WS Pro
            </a>
          </span>

          <div className="flex items-center gap-4">
            <Link href="/about" className="text-[11px] text-ds-text-copyright hover:text-ds-gold transition-colors">Общи условия</Link>
            <Link href="/about" className="text-[11px] text-ds-text-copyright hover:text-ds-gold transition-colors">Политика за поверителност</Link>
            <Link href="/about" className="text-[11px] text-ds-text-copyright hover:text-ds-gold transition-colors">Бисквитки</Link>
          </div>
        </div>

        {/* Attribution — mobile only, below the links row */}
        <div className="mt-3 text-center sm:hidden">
          <span className="text-xs text-ds-text-copyright/50">
            Създаден от{' '}
            <a
              href="https://www.hmwspro.com/bg"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-ds-text-copyright/70 underline decoration-ds-text-copyright/30 transition hover:text-ds-gold hover:decoration-ds-gold/60"
            >
              H&amp;M WS Pro
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

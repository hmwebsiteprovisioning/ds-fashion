'use client';

import { Truck, Shield, RotateCcw, Headphones } from 'lucide-react';

const ITEMS = [
  { icon: Truck, title: 'БЕЗПЛАТНА ДОСТАВКА', sub: 'над 100 лв.' },
  { icon: Shield, title: 'СИГУРНО ПЛАЩАНЕ', sub: '100% защита' },
  { icon: RotateCcw, title: 'ЛЕСНО ВРЪЩАНЕ', sub: 'до 14 дни' },
  { icon: Headphones, title: 'ПОДДРЪЖКА НА КЛИЕНТИ', sub: '0899 123 456' },
];

export default function TrustBar() {
  return (
    <section className="border-y border-ds-border bg-ds-card">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-7">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {ITEMS.map(item => (
            <div key={item.title} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-ds-main">
                <item.icon size={18} className="text-ds-gold" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[11px] font-bold tracking-wide text-ds-text">{item.title}</p>
                <p className="text-[11px] text-ds-text-muted">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

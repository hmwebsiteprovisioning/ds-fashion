'use client';

import { Truck, Shield, RotateCcw, Headphones } from 'lucide-react';

const TRUST_ITEMS = [
  { icon: Truck, label: 'Безплатна доставка над 100 лв.' },
  { icon: Shield, label: 'Сигурно плащане 100% защита' },
  { icon: RotateCcw, label: 'Лесно връщане до 14 дни' },
  { icon: Headphones, label: 'Поддръжка на клиенти 0899 123 456' },
];

export default function Banner() {
  return (
    <div className="w-full bg-[#f5f0eb] border-b border-[#e8e0d5]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        {/* Desktop: 4 columns */}
        <div className="hidden sm:grid sm:grid-cols-4 gap-2">
          {TRUST_ITEMS.map(item => (
            <div key={item.label} className="flex items-center justify-center gap-2">
              <item.icon size={13} className="text-[#c49a3c] shrink-0" strokeWidth={1.8} />
              <span className="text-[11px] text-[#4a4a4a] font-medium tracking-wide">{item.label}</span>
            </div>
          ))}
        </div>
        {/* Mobile: single rotating item */}
        <div className="sm:hidden flex items-center justify-center gap-2">
          <Truck size={13} className="text-[#c49a3c] shrink-0" strokeWidth={1.8} />
          <span className="text-[11px] text-[#4a4a4a] font-medium tracking-wide">Безплатна доставка над 100 лв.</span>
        </div>
      </div>
    </div>
  );
}

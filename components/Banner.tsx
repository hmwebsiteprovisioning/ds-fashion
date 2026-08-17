'use client';

import { useState, useEffect } from 'react';
import { Truck, Shield, RotateCcw, Headphones, Check } from 'lucide-react';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import { useLanguage } from '@/context/LanguageContext';

function getIconForText(text: string) {
  const lowercase = text.toLowerCase();
  if (lowercase.includes('доставка') || lowercase.includes('delivery') || lowercase.includes('shipping') || lowercase.includes('достави')) {
    return Truck;
  }
  if (lowercase.includes('плащане') || lowercase.includes('payment') || lowercase.includes('защита') || lowercase.includes('secure') || lowercase.includes('плати')) {
    return Shield;
  }
  if (lowercase.includes('връщане') || lowercase.includes('return') || lowercase.includes('refund') || lowercase.includes('върни')) {
    return RotateCcw;
  }
  if (lowercase.includes('поддръжка') || lowercase.includes('support') || lowercase.includes('клиент') || lowercase.includes('phone') || lowercase.includes('call') || lowercase.includes('0899') || lowercase.includes('телефон')) {
    return Headphones;
  }
  return Check;
}

export default function Banner() {
  const { settings } = useStoreSettings();
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const defaultItems = language === 'bg' ? [
    'Безплатна доставка над 50 EUR.',
    'Сигурно плащане 100% защита',
    'Лесно връщане до 14 дни',
    'Поддръжка на клиенти 0878918189'
  ] : [
    'Free delivery over 50 EUR.',
    'Secure payment 100% protection',
    'Easy return up to 14 days',
    'Customer support 0878918189'
  ];

  const rawText = settings?.bannertext;
  const items = rawText
    ? rawText.split('\n').map(l => l.trim()).filter(Boolean)
    : defaultItems;

  const duration = (settings?.bannerduration || 5) * 1000;

  useEffect(() => {
    if (items.length <= 1) return;

    const timer = setInterval(() => {
      // 1. Fade out
      setFade(false);

      // 2. Change content and fade in after transition (300ms)
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
        setFade(true);
      }, 300);

    }, duration);

    return () => clearInterval(timer);
  }, [items.length, duration]);

  if (items.length === 0) return null;

  const activeItem = items[currentIndex];
  const Icon = getIconForText(activeItem);

  return (
    <div className="w-full bg-ds-info border-b border-ds-border py-2.5 overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[16px]">
          <div
            className={`flex items-center justify-center gap-2 transition-all duration-300 ease-in-out ${
              fade ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
            }`}
          >
            <Icon size={14} className="text-black shrink-0" fill="currentColor" strokeWidth={1.5} />
            <span className="text-[11px] sm:text-[12px] text-black font-bold tracking-wide">
              {activeItem}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

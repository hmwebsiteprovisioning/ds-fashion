'use client';

import Link from 'next/link';
import { DS } from '@/lib/design-tokens';

export default function HomeHero() {
  return (
    <section
      className="relative overflow-hidden bg-ds-section"
      style={{ minHeight: '480px' }}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center min-h-[480px]">
        <div className="relative z-10 max-w-lg py-14">
          <h1 className="font-serif-display text-[2.5rem] sm:text-[3.5rem] lg:text-[4rem] leading-[1.05] text-ds-text mb-5">
            Луксът е в<br />детайлите.
          </h1>
          <p className="text-[15px] text-ds-text-secondary leading-relaxed mb-8 max-w-sm">
            Премиум материали, вечен дизайн и<br />
            безкомпромисно качество. Създадено за всеки ден.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/for-her"
              className="inline-flex items-center px-7 py-3.5 bg-ds-gold text-white text-[13px] font-bold tracking-widest uppercase hover:bg-ds-gold-dark transition-colors border border-ds-gold"
            >
              ПАЗАРУВАЙ НОВО
            </Link>
            <Link
              href="/collections"
              className="inline-flex items-center px-7 py-3.5 border border-ds-gold bg-ds-card text-ds-text text-[13px] font-bold tracking-widest uppercase hover:bg-ds-info hover:text-ds-gold-dark transition-colors"
            >
              РАЗГЛЕДАЙ КОЛЕКЦИИ
            </Link>
          </div>
        </div>

        <div className="hidden lg:block absolute right-0 top-0 h-full w-1/2">
          <img
            src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1000&q=85"
            alt="Luxury fashion collection"
            className="w-full h-full object-cover"
            style={{ objectPosition: '40% center' }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, ${DS.heroGradientFrom}, ${DS.heroGradientTo})`,
            }}
          />
        </div>
      </div>

      <div className="border-t border-ds-border bg-ds-info">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {[
              { icon: '🆕', label: 'НОВА КОЛЕКЦИЯ ПРОЛЕТ/ЛЯТО 2024' },
              { icon: '✨', label: 'ВИСОКОКАЧЕСТВЕНИ МАТЕРИАЛИ' },
              { icon: '🔍', label: 'ВНИМАНИЕ КЪМ ВСЕКИ ДЕТАЙЛ' },
              { icon: '💎', label: 'СЪЗДАДЕНО ДА ИЗДЪРЖА' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2 justify-center">
                <span className="text-[11px]">{item.icon}</span>
                <span className="text-[10px] sm:text-[11px] text-ds-text-secondary tracking-widest font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

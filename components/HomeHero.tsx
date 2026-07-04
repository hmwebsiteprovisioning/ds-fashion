'use client';

import Link from 'next/link';

export default function HomeHero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(to right, #f5f0eb 55%, #e8dfd3 100%)',
        minHeight: '480px',
      }}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center min-h-[480px]">
        {/* Text side */}
        <div className="relative z-10 max-w-lg py-14">
          <h1 className="font-serif-display text-[2.5rem] sm:text-[3.5rem] lg:text-[4rem] leading-[1.05] text-[#1a1a1a] mb-5">
            Луксът е в<br />детайлите.
          </h1>
          <p className="text-[15px] text-[#6b6b6b] leading-relaxed mb-8 max-w-sm">
            Премиум материали, вечен дизайн и<br />
            безкомпромисно качество. Създадено за всеки ден.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/for-her"
              className="inline-flex items-center px-7 py-3.5 bg-[#c49a3c] text-white text-[13px] font-bold tracking-widest uppercase hover:bg-[#a07c28] transition-colors"
            >
              ПАЗАРУВАЙ НОВО
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center px-7 py-3.5 border border-[#1a1a1a] text-[#1a1a1a] text-[13px] font-bold tracking-widest uppercase hover:bg-[#1a1a1a] hover:text-white transition-colors"
            >
              РАЗГЛЕДАЙ КОЛЕКЦИИ
            </Link>
          </div>
        </div>

        {/* Image side — fashion clothes on a rack */}
        <div className="hidden lg:block absolute right-0 top-0 h-full w-1/2">
          <img
            src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1000&q=85"
            alt="Luxury fashion collection"
            className="w-full h-full object-cover"
            style={{ objectPosition: '40% center' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#f5f0eb] via-[#f5f0eb]/30 to-transparent" />
        </div>
      </div>

      {/* Bottom strip: 4 micro trust items */}
      <div className="border-t border-[#e0d8cf] bg-[#f0ebe3]">
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
                <span className="text-[10px] sm:text-[11px] text-[#6b6b6b] tracking-widest font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PublicPageLayout from '@/components/PublicPageLayout';
import HomeHero from '@/components/HomeHero';
import CategoryTiles from '@/components/CategoryTiles';
import TrustBar from '@/components/TrustBar';
import NewsletterSection from '@/components/NewsletterSection';
import ProductCard from '@/components/ProductCard';
import { MOCK_TESTIMONIALS } from '@/lib/mock-data';
import { fetchStorefrontProducts } from '@/lib/storefront-products';
import type { StorefrontProduct } from '@/lib/storefront-products';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [featured, setFeatured] = useState<StorefrontProduct[]>([]);

  const handleSetIsAdmin = (v: boolean) => {
    setIsAdmin(v);
    localStorage.setItem('isAdmin', v.toString());
  };

  useEffect(() => {
    fetchStorefrontProducts({ isfeatured: true, limit: 6 })
      .then(setFeatured)
      .catch(() => setFeatured([]));
  }, []);

  return (
    <PublicPageLayout isAdmin={isAdmin} setIsAdmin={handleSetIsAdmin}>
      <HomeHero />
      <CategoryTiles />

      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="font-serif-display text-2xl sm:text-3xl text-center text-ds-text mb-8">
          Подбрани за теб
        </h2>
        {featured.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-center text-ds-text-muted text-[14px]">Няма подбрани продукти в момента.</p>
        )}
      </section>

      <TrustBar />

      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="relative overflow-hidden min-h-[360px] sm:min-h-[420px] flex items-center bg-[#2a2318]">
          <img
            src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1400&q=85"
            alt="Вдъхновение"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="relative z-10 px-8 sm:px-14 py-12 max-w-xl">
            <p className="text-[11px] font-bold tracking-widest uppercase text-ds-gold mb-3">ВДЪХНОВЕНИЕ</p>
            <h2 className="font-serif-display text-3xl sm:text-4xl text-white leading-[1.1] mb-4">
              Създадено за<br />модерен живот
            </h2>
            <p className="text-[13px] text-white/75 leading-relaxed mb-7 max-w-sm">
              Минималистичен дизайн, максимално въздействие.<br />
              Открий колекциите, които подчертават твоя стил.
            </p>
            <Link
              href="/products/inspiration"
              className="inline-flex items-center px-7 py-3.5 border border-white text-white text-[12px] font-bold tracking-widest uppercase hover:bg-ds-card hover:text-ds-text transition-colors"
            >
              РАЗГЛЕДАЙ КОЛЕКЦИЯТА
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="font-serif-display text-2xl sm:text-3xl text-center text-ds-text mb-8">
          Какво казват нашите клиенти
        </h2>
        <div className="hidden sm:grid sm:grid-cols-3 gap-6">
          {MOCK_TESTIMONIALS.map((t) => (
            <div key={t.id} className="bg-ds-card border border-ds-border shadow-ds-card p-6">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={14} fill="#B98236" stroke="none" />
                ))}
              </div>
              <p className="text-[13px] text-ds-text-secondary leading-relaxed mb-4 italic">&quot;{t.text}&quot;</p>
              <p className="text-[12px] font-semibold text-ds-text">{t.name}</p>
            </div>
          ))}
        </div>
        <div className="sm:hidden">
          <div className="bg-ds-card border border-ds-border shadow-ds-card p-6">
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: MOCK_TESTIMONIALS[testimonialIdx].rating }).map((_, i) => (
                <Star key={i} size={14} fill="#B98236" stroke="none" />
              ))}
            </div>
            <p className="text-[13px] text-ds-text-secondary leading-relaxed mb-4 italic">&quot;{MOCK_TESTIMONIALS[testimonialIdx].text}&quot;</p>
            <p className="text-[12px] font-semibold text-ds-text">{MOCK_TESTIMONIALS[testimonialIdx].name}</p>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={() => setTestimonialIdx((i) => (i - 1 + MOCK_TESTIMONIALS.length) % MOCK_TESTIMONIALS.length)}
              className="p-2 border border-ds-border hover:bg-ds-main transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setTestimonialIdx((i) => (i + 1) % MOCK_TESTIMONIALS.length)}
              className="p-2 border border-ds-border hover:bg-ds-main transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      <NewsletterSection />
    </PublicPageLayout>
  );
}

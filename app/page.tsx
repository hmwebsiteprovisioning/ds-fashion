'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PublicPageLayout from '@/components/PublicPageLayout';
import HomeHero from '@/components/HomeHero';
import CategoryTiles from '@/components/CategoryTiles';
import TrustBar from '@/components/TrustBar';
import ProductCard from '@/components/ProductCard';
import { MOCK_TESTIMONIALS } from '@/lib/mock-data';
import { fetchStorefrontProducts } from '@/lib/storefront-products';
import type { StorefrontProduct } from '@/lib/storefront-products';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [featured, setFeatured] = useState<StorefrontProduct[]>([]);
  const [indexCollections, setIndexCollections] = useState<any[]>([]);
  const [heroProducts, setHeroProducts] = useState<StorefrontProduct[]>([]);
  const [isHeroLoading, setIsHeroLoading] = useState(true);
  const { language } = useLanguage();

  const handleSetIsAdmin = (v: boolean) => {
    setIsAdmin(v);
    localStorage.setItem('isAdmin', v.toString());
  };

  useEffect(() => {
    // Force scroll to top on initial load
    window.scrollTo(0, 0);

    fetchStorefrontProducts({ isfeatured: true, limit: 6 })
      .then(setFeatured)
      .catch(() => setFeatured([]));

    fetchStorefrontProducts({ isfeatured: true, limit: 20 })
      .then((products) => {
        const filtered = products
          .filter((p) => p.hero_portrait_imageurl && p.hero_landscape_imageurl)
          .slice(0, 5);
        setHeroProducts(filtered);
      })
      .catch(() => setHeroProducts([]))
      .finally(() => setIsHeroLoading(false));

    fetch('/api/collections')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const visible = (data.collections || [])
            .filter((c: any) => c.isactive && c.showonindex)
            .sort((a: any, b: any) => (a.sortorder || 0) - (b.sortorder || 0))
            .slice(0, 3);
          setIndexCollections(visible);
        }
      })
      .catch(() => setIndexCollections([]));
  }, []);

  return (
    <>
      {isHeroLoading && (
        <div className="fixed inset-0 z-[9999] bg-ds-main flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ds-gold mb-4"></div>
          <p className="text-ds-gold font-serif-display tracking-widest uppercase text-sm">Зареждане...</p>
        </div>
      )}
      <PublicPageLayout isAdmin={isAdmin} setIsAdmin={handleSetIsAdmin}>
        <HomeHero products={heroProducts} isLoading={isHeroLoading} />
      <CategoryTiles />

      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="font-serif-display text-2xl sm:text-3xl text-center text-ds-text mb-8">
          Подбрани за теб
        </h2>
        {featured.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-center text-ds-text-muted text-[14px]">Няма подбрани продукти в момента.</p>
        )}
      </section>

      <TrustBar />

      {indexCollections.length > 0 ? (
        <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {indexCollections.length === 1 ? (
            <div className="relative overflow-hidden min-h-[360px] sm:min-h-[420px] flex items-center bg-[#2a2318] rounded-2xl">
              <img
                src={indexCollections[0].imageurl || "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1400&q=85"}
                alt={indexCollections[0].name}
                className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-700 hover:scale-[1.02]"
              />
              <div className="relative z-10 px-8 sm:px-14 py-12 max-w-xl">
                <p className="text-[11px] font-bold tracking-widest uppercase text-ds-gold mb-3">
                  {language === 'bg' ? 'СПЕЦИАЛНА КОЛЕКЦИЯ' : 'FEATURED COLLECTION'}
                </p>
                <h2 className="font-serif-display text-3xl sm:text-4xl text-white leading-[1.1] mb-4">
                  {indexCollections[0].name}
                </h2>
                {indexCollections[0].description && (
                  <p className="text-[13px] text-white/75 leading-relaxed mb-7 max-w-sm">
                    {indexCollections[0].description}
                  </p>
                )}
                <Link
                  href={`/collections/${indexCollections[0].slug}`}
                  className="inline-flex items-center px-7 py-3.5 border border-white text-white text-[12px] font-bold tracking-widest uppercase hover:bg-ds-card hover:text-ds-text transition-colors"
                >
                  {language === 'bg' ? 'РАЗГЛЕДАЙ КОЛЕКЦИЯТА' : 'EXPLORE COLLECTION'}
                </Link>
              </div>
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${indexCollections.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6`}>
              {indexCollections.map((col) => (
                <div key={col.collectionid} className="relative overflow-hidden min-h-[340px] sm:min-h-[380px] flex items-center bg-[#2a2318] rounded-2xl">
                  <img
                    src={col.imageurl || "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1400&q=85"}
                    alt={col.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-700 hover:scale-[1.02]"
                  />
                  <div className="relative z-10 px-6 sm:px-8 py-8 w-full">
                    <p className="text-[10px] font-bold tracking-widest uppercase text-ds-gold mb-2">
                      {language === 'bg' ? 'КОЛЕКЦИЯ' : 'COLLECTION'}
                    </p>
                    <h2 className="font-serif-display text-2xl text-white leading-[1.2] mb-3 text-left">
                      {col.name}
                    </h2>
                    {col.description && (
                      <p className="text-[12px] text-white/75 leading-relaxed mb-6 line-clamp-2 text-left">
                        {col.description}
                      </p>
                    )}
                    <div className="text-left">
                      <Link
                        href={`/collections/${col.slug}`}
                        className="inline-flex items-center px-5 py-2.5 border border-white text-white text-[11px] font-bold tracking-widest uppercase hover:bg-ds-card hover:text-ds-text transition-colors"
                      >
                        {language === 'bg' ? 'РАЗГЛЕДАЙ' : 'EXPLORE'}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="relative overflow-hidden min-h-[360px] sm:min-h-[420px] flex items-center bg-[#2a2318] rounded-2xl">
            <img
              src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1400&q=85"
              alt="Вдъхновение"
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            <div className="relative z-10 px-8 sm:px-14 py-12 max-w-xl">
              <p className="text-[11px] font-bold tracking-widest uppercase text-ds-gold mb-3">
                {language === 'bg' ? 'ВДЪХНОВЕНИЕ' : 'INSPIRATION'}
              </p>
              <h2 className="font-serif-display text-3xl sm:text-4xl text-white leading-[1.1] mb-4 text-left">
                {language === 'bg' ? <>Създадено за<br />модерен живот</> : <>Designed for<br />modern life</>}
              </h2>
              <p className="text-[13px] text-white/75 leading-relaxed mb-7 max-w-sm text-left">
                {language === 'bg' 
                  ? 'Минималистичен дизайн, максимално въздействие. Открий колекциите, които подчертават твоя стил.'
                  : 'Minimalistic design, maximum impact. Explore collections that highlight your style.'}
              </p>
              <div className="text-left">
                <Link
                  href="/products/inspiration"
                  className="inline-flex items-center px-7 py-3.5 border border-white text-white text-[12px] font-bold tracking-widest uppercase hover:bg-ds-card hover:text-ds-text transition-colors"
                >
                  {language === 'bg' ? 'РАЗГЛЕДАЙ КОЛЕКЦИЯТА' : 'EXPLORE COLLECTION'}
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

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
    </PublicPageLayout>
    </>
  );
}

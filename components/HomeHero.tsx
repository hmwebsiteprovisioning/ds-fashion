'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { StorefrontProduct } from '@/lib/storefront-products';

interface HomeHeroProps {
  products?: StorefrontProduct[];
  isLoading?: boolean;
}

export default function HomeHero({ products = [], isLoading = false }: HomeHeroProps) {
  const { language } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const slideDuration = 5000; // 5 seconds per slide
  const updateInterval = 50;  // Update progress every 50ms

  useEffect(() => {
    if (products.length === 0) return;

    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setActiveIndex((prevIdx) => (prevIdx + 1) % products.length);
            return 0;
          }
          return prev + (updateInterval / slideDuration) * 100;
        });
      }, updateInterval);
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying, activeIndex, products.length]);

  // Reset progress when index changes manually
  const handleIndexChange = (index: number) => {
    setActiveIndex(index);
    setProgress(0);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % products.length);
    setProgress(0);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + products.length) % products.length);
    setProgress(0);
  };

  if (isLoading) {
    return (
      <section className="relative overflow-hidden w-full h-[85dvh] min-h-[580px] bg-[#1a1610] animate-pulse">
        {/* Simple skeleton matching the general shape of the hero */}
        <div className="absolute inset-0 bg-black/40" />
      </section>
    );
  }

  // Fallback static hero if no products are passed in
  if (products.length === 0) {
    // Original static fallback Hero Section
    return (
      <section className="relative overflow-hidden bg-ds-section min-h-[480px]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center min-h-[480px]">
          <div className="relative z-10 max-w-lg py-14">
            <h1 className="font-serif-display text-[2.5rem] sm:text-[3.5rem] lg:text-[4rem] leading-[1.05] text-ds-text mb-5 text-left">
              {language === 'bg' ? <>Луксът е в<br />детайлите.</> : <>Luxury is in<br />the details.</>}
            </h1>
            <p className="text-[15px] text-ds-text-secondary leading-relaxed mb-8 max-w-sm text-left">
              {language === 'bg'
                ? 'Премиум материали, вечен дизайн и безкомпромисно качество. Създадено за всеки ден.'
                : 'Premium materials, timeless design and uncompromising quality. Made for every day.'}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/for-her"
                className="inline-flex items-center px-7 py-3.5 bg-ds-gold text-white text-[13px] font-bold tracking-widest uppercase hover:bg-ds-gold-dark transition-colors border border-ds-gold"
              >
                {language === 'bg' ? 'ПАЗАРУВАЙ НОВО' : 'SHOP NEW'}
              </Link>
              <Link
                href="/collections"
                className="inline-flex items-center px-7 py-3.5 border border-ds-gold bg-ds-card text-ds-text text-[13px] font-bold tracking-widest uppercase hover:bg-ds-info hover:text-ds-gold-dark transition-colors"
              >
                {language === 'bg' ? 'РАЗГЛЕДАЙ КОЛЕКЦИИ' : 'VIEW COLLECTIONS'}
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
          </div>
        </div>
      </section>
    );
  }

  const activeProduct = products[activeIndex];

  return (
    <section className="relative overflow-hidden w-full h-[85dvh] min-h-[580px] bg-black text-white">
      {/* Background Images - Portrait for Mobile, Landscape/Fitted-Portrait for Desktop */}
      <div className="absolute inset-0 w-full h-full">
        {/* Mobile View Background */}
        <div className="block md:hidden w-full h-full relative">
          <img
            src={activeProduct.hero_portrait_imageurl || activeProduct.images[0]}
            alt={activeProduct.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40" />
        </div>
        {/* Desktop View Background */}
        <div className="hidden md:block w-full h-full relative bg-[#0d0b09]">
          {activeProduct.hero_landscape_imageurl?.trim() ? (
            <>
              <img
                src={activeProduct.hero_landscape_imageurl.trim()}
                alt={activeProduct.name}
                className="w-full h-full object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/75" />
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 to-transparent" />
            </>
          ) : (
            <>
              {/* Subtle ambient blurred backdrop matching model colors */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={activeProduct.hero_portrait_imageurl || activeProduct.images[0]}
                  alt=""
                  aria-hidden="true"
                  className="w-full h-full object-cover blur-3xl opacity-30 scale-125 pointer-events-none"
                />
              </div>

              {/* Centered fitted portrait model image */}
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={activeProduct.hero_portrait_imageurl || activeProduct.images[0]}
                  alt={activeProduct.name}
                  className="h-full w-auto max-w-full object-contain mx-auto transition-transform duration-700 ease-out"
                />
              </div>

              {/* Lateral gradients on the sides to look completely flush */}
              <div className="absolute inset-y-0 left-0 w-2/5 max-w-2xl bg-gradient-to-r from-black via-black/85 via-45% to-transparent pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-2/5 max-w-2xl bg-gradient-to-l from-black via-black/85 via-45% to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70 pointer-events-none" />

              {/* Bottom & Top Gradients for seamless header/footer integration */}
              <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black via-black/75 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />
            </>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="relative z-10 w-full h-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col justify-between h-full">
        
        {/* TOP LAYER (Mobile-like segmented progress bar & play/pause button) */}
        <div className="w-full flex items-center justify-between gap-4 mt-2">
          {/* Timeline progress segments */}
          <div className="flex-1 flex gap-1.5 sm:gap-2">
            {products.map((_, idx) => {
              let segmentProgress = 0;
              if (idx < activeIndex) segmentProgress = 100;
              else if (idx === activeIndex) segmentProgress = progress;
              
              return (
                <button
                  key={idx}
                  onClick={() => handleIndexChange(idx)}
                  className="flex-1 h-1 bg-white/25 rounded-full overflow-hidden transition-all duration-300 hover:bg-white/40 group"
                  aria-label={`Go to slide ${idx + 1}`}
                >
                  <div 
                    className="h-full bg-white transition-all ease-linear"
                    style={{ 
                      width: `${segmentProgress}%`,
                      transitionDuration: idx === activeIndex && isPlaying ? `${updateInterval}ms` : '0ms'
                    }}
                  />
                </button>
              );
            })}
          </div>

          {/* Play / Pause Toggle Button */}
          <button 
            onClick={togglePlay}
            className="p-1.5 rounded-full bg-black/40 border border-white/20 text-white hover:bg-white/10 active:scale-95 transition-all"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={14} className="sm:w-[16px] sm:h-[16px]" /> : <Play size={14} className="sm:w-[16px] sm:h-[16px]" />}
          </button>
        </div>

        {/* MIDDLE LAYER (Title and Shop CTA) */}
        <div className="flex-1 flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 sm:pb-16 mt-8">
          
          {/* Product Left Metadata Info */}
          <div className="flex flex-col items-start text-left max-w-lg mt-auto">
            <span className="inline-block bg-ds-gold text-white text-[10px] font-bold tracking-widest px-2.5 py-1 uppercase rounded-full mb-3">
              {language === 'bg' ? 'ИЗБРАН МОДЕЛ' : 'FEATURED ITEM'}
            </span>
            <h1 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl text-white leading-tight font-medium mb-3">
              {activeProduct.name}
            </h1>
            {activeProduct.compareAtPrice && (
              <span className="text-ds-gold text-xs font-semibold uppercase tracking-wider mb-2 block">
                {language === 'bg' ? 'СПЕЦИАЛНА ОФЕРТА' : 'SPECIAL OFFER'}
              </span>
            )}
            {/* Desktop Only Subtitle */}
            <p className="hidden sm:block text-[14px] text-white/80 leading-relaxed max-w-md">
              {activeProduct.compareAtPrice 
                ? (language === 'bg' ? 'Изключително качество на специална цена.' : 'Exceptional quality at a special price.')
                : (language === 'bg' ? 'Модерен стил, създаден с прецизност и внимание.' : 'Modern style crafted with precision and care.')}
            </p>
          </div>

          {/* Desktop Right Side Product Card / Mobile Bottom Button */}
          <div className="w-full md:w-auto md:max-w-xs flex flex-col items-start gap-4 md:bg-black/60 md:backdrop-blur-md md:border md:border-white/15 md:p-6 md:rounded-xl text-left mt-auto">
            {/* Product description / Price (Desktop only) */}
            <div className="hidden md:block">
              <h3 className="font-serif-display text-lg text-white font-medium mb-1">
                {activeProduct.name}
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-white font-semibold text-[15px]">{activeProduct.price.toFixed(2)} лв.</span>
                {activeProduct.compareAtPrice && (
                  <span className="text-white/50 line-through text-xs">{activeProduct.compareAtPrice.toFixed(2)} лв.</span>
                )}
              </div>
              <p className="text-xs text-white/70 leading-relaxed line-clamp-3">
                {language === 'bg' 
                  ? 'Изработен от висококачествени премиум материали с внимание към детайла.' 
                  : 'Crafted from high-quality premium materials with attention to detail.'}
              </p>
            </div>

            {/* Link button to Shop Product page */}
            <div className="w-full">
              <Link
                href={`/products/${activeProduct.id}`}
                className="w-full inline-flex items-center justify-center px-6 py-3.5 bg-white text-black text-[12px] font-bold tracking-widest uppercase hover:bg-ds-gold hover:text-white transition-all duration-300 rounded-lg text-center"
              >
                {language === 'bg' ? `КУПИ ${activeProduct.name}` : `SHOP ${activeProduct.name}`}
              </Link>
            </div>
          </div>
        </div>

        {/* BOTTOM LAYER (Timeline & Navigation arrows) */}
        <div className="w-full border-t border-white/10 pt-4 flex items-center justify-between">
          {/* Timeline labels 01 / 02 / 03 ... */}
          <div className="flex items-center gap-6 text-[11px] font-medium tracking-widest text-white/50">
            {products.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleIndexChange(idx)}
                className={`transition-colors duration-300 ${idx === activeIndex ? 'text-white font-bold scale-110' : 'hover:text-white/85'}`}
              >
                {String(idx + 1).padStart(2, '0')}
              </button>
            ))}
          </div>

          {/* Left/Right manual navigation arrows */}
          <div className="flex gap-2">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full border border-white/10 text-white hover:bg-white/10 active:scale-95 transition-all"
              aria-label="Previous slide"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={nextSlide}
              className="p-2 rounded-full border border-white/10 text-white hover:bg-white/10 active:scale-95 transition-all"
              aria-label="Next slide"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}

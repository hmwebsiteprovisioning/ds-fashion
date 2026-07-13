'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, ChevronUp, ChevronDown } from 'lucide-react';
import ProductCard from './ProductCard';
import {
  fetchStorefrontProducts,
  type StorefrontFilterParams,
  type StorefrontProduct,
} from '@/lib/storefront-products';
import { PRESET_COLOR_SWATCHES, matchesColorFilter } from '@/lib/color-swatches';
import { useStoreSettings } from '@/context/StoreSettingsContext';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc';

export type StorePageConfig = {
  title: string;
  description: string;
  image: string;
  filter: StorefrontFilterParams;
  rfproducttypeid?: number;
};

interface StorePageProps {
  config: StorePageConfig;
}

function StorePageContent({ config }: StorePageProps) {
  const { settings } = useStoreSettings();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') || searchParams.get('producttypeid');
  const [products, setProducts] = useState<StorefrontProduct[]>([]);

  const pageTitle = useMemo(() => {
    const rfId = config.rfproducttypeid ?? config.filter.rfproducttypeid;
    if (rfId === 1 && settings?.forhimlabel) return settings.forhimlabel;
    if (rfId === 2 && settings?.forherlabel) return settings.forherlabel;
    if (rfId === 3 && settings?.accessorieslabel) return settings.accessorieslabel;
    if (config.filter.onsale === true && settings?.salelabel) return settings.salelabel;
    return config.title;
  }, [config, settings]);

  const pageImage = useMemo(() => {
    const rfId = config.rfproducttypeid ?? config.filter.rfproducttypeid;
    if (rfId === 1 && settings?.forhimimage) return settings.forhimimage;
    if (rfId === 2 && settings?.forherimage) return settings.forherimage;
    if (rfId === 3 && settings?.accessoriesimage) return settings.accessoriesimage;
    if (config.filter.onsale === true && settings?.saleimage) return settings.saleimage;
    return config.image;
  }, [config, settings]);
  const [loading, setLoading] = useState(true);
  const [productTypes, setProductTypes] = useState<Array<{ producttypeid: string; name: string; productsCount?: number }>>([]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedProductTypeId, setSelectedProductTypeId] = useState<string | null>(categoryParam || null);
  const [priceMax, setPriceMax] = useState(2000);
  const [filterOpen, setFilterOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(true);
  const [sizeOpen, setSizeOpen] = useState(true);
  const [colorOpen, setColorOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    if (categoryParam) {
      setSelectedProductTypeId(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    setLoading(true);
    setVisibleCount(8);
    fetchStorefrontProducts(config.filter)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [JSON.stringify(config.filter)]);

  useEffect(() => {
    const rfId = config.rfproducttypeid ?? config.filter.rfproducttypeid;
    if (!rfId) {
      setProductTypes([]);
      return;
    }
    fetch(`/api/product-types?rfproducttypeid=${rfId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setProductTypes(
            (data.productTypes || []).filter((pt: { isLeaf?: boolean }) => pt.isLeaf !== false)
          );
        }
      })
      .catch(() => setProductTypes([]));
  }, [config.rfproducttypeid, config.filter.rfproducttypeid]);

  const availableSizes = useMemo(() => {
    const sizes = new Set<string>();
    products.forEach((p) => p.sizes.forEach((s) => sizes.add(s)));
    return Array.from(sizes).sort();
  }, [products]);

  const availableColors = useMemo(() => {
    const map = new Map<string, { name: string; hex: string }>();
    PRESET_COLOR_SWATCHES.forEach((c) => map.set(c.name.toLowerCase(), c));
    products.forEach((p) => p.colors.forEach((c) => map.set(c.name.toLowerCase(), c)));
    return Array.from(map.values());
  }, [products]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (selectedProductTypeId) {
      list = list.filter((p) => p.producttypeid === selectedProductTypeId);
    }
    if (selectedSizes.length) {
      list = list.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)));
    }
    if (selectedColors.length) {
      list = list.filter((p) =>
        p.colors.some((c) => matchesColorFilter(c.name, selectedColors))
      );
    }
    if (priceMax < 2000) list = list.filter((p) => p.price <= priceMax);
    switch (sortBy) {
      case 'price-asc': list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'name-asc': list.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'newest':
      default:
        list.sort((a, b) => (b.createdat || '').localeCompare(a.createdat || ''));
    }
    return list;
  }, [products, sortBy, selectedSizes, selectedColors, selectedProductTypeId, priceMax]);

  const displayed = filtered.slice(0, visibleCount);

  const toggleSize = (s: string) =>
    setSelectedSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  const toggleColor = (c: string) =>
    setSelectedColors((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  const clearAll = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedProductTypeId(null);
    setPriceMax(2000);
  };

  const FilterContent = () => (
    <div className="space-y-0">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[12px] font-bold tracking-widest uppercase text-ds-text">Филтри</p>
        {(selectedSizes.length || selectedColors.length || selectedProductTypeId) ? (
          <button onClick={clearAll} className="text-[11px] text-ds-gold hover:underline tracking-wide">
            ИЗЧИСТИ ВСИЧКО
          </button>
        ) : null}
      </div>

      {productTypes.length > 0 && (
        <div className="border-t border-ds-border py-4">
          <button className="flex items-center justify-between w-full" onClick={() => setCatOpen(!catOpen)}>
            <span className="text-[12px] font-bold tracking-wide text-ds-text">Категория</span>
            {catOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {catOpen && (
            <div className="mt-3 space-y-2">
              {productTypes.map((cat) => (
                <button
                  key={cat.producttypeid}
                  onClick={() =>
                    setSelectedProductTypeId(
                      selectedProductTypeId === cat.producttypeid ? null : cat.producttypeid
                    )
                  }
                  className={`flex items-center justify-between w-full text-left text-[12px] transition-colors ${
                    selectedProductTypeId === cat.producttypeid
                      ? 'text-ds-gold font-medium'
                      : 'text-ds-text-secondary hover:text-ds-gold'
                  }`}
                >
                  <span>{cat.name}</span>
                  {cat.productsCount != null && (
                    <span className="text-[11px] text-ds-text-muted">{cat.productsCount}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {availableSizes.length > 0 && (
        <div className="border-t border-ds-border py-4">
          <button className="flex items-center justify-between w-full" onClick={() => setSizeOpen(!sizeOpen)}>
            <span className="text-[12px] font-bold tracking-wide text-ds-text">Размер</span>
            {sizeOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {sizeOpen && (
            <div className="flex flex-wrap gap-2 mt-3">
              {availableSizes.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSize(s)}
                  className={`text-[11px] px-3 py-1.5 border font-medium transition-colors ${
                    selectedSizes.includes(s)
                      ? 'border-ds-gold bg-ds-gold text-white'
                      : 'border-ds-border bg-ds-main text-ds-text-secondary hover:border-ds-gold'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="border-t border-ds-border py-4">
        <button className="flex items-center justify-between w-full" onClick={() => setColorOpen(!colorOpen)}>
          <span className="text-[12px] font-bold tracking-wide text-ds-text">Цвят</span>
          {colorOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {colorOpen && (
          <div className="flex flex-wrap gap-2.5 mt-3">
            {availableColors.map((c) => (
              <button
                key={c.hex + c.name}
                onClick={() => toggleColor(c.name)}
                title={c.name}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  selectedColors.includes(c.name)
                    ? 'border-ds-gold scale-110'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{
                  backgroundColor: c.hex,
                  boxShadow: c.hex === '#f5f5f5' ? '0 0 0 1px #E2D6C8' : undefined,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-ds-border py-4">
        <button className="flex items-center justify-between w-full" onClick={() => setPriceOpen(!priceOpen)}>
          <span className="text-[12px] font-bold tracking-wide text-ds-text">Цена</span>
          {priceOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {priceOpen && (
          <div className="mt-4">
            <input
              type="range"
              min={0}
              max={2000}
              step={10}
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="w-full accent-ds-gold"
            />
            <div className="flex justify-between text-[11px] text-ds-text-secondary mt-1">
              <span>0 € (0 лв.)</span>
              <span>
                {priceMax === 2000 ? '2000+ €' : `${priceMax} €`}{' '}
                ({Math.round(priceMax * 1.95583)} лв.)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-ds-main min-h-screen">
      <div className="bg-ds-section">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="font-serif-display text-3xl sm:text-4xl lg:text-[2.75rem] text-ds-text mb-4 leading-tight">
                {pageTitle}
              </h1>
              <p className="text-[13px] sm:text-[14px] text-ds-text-secondary leading-relaxed whitespace-pre-line">
                {config.description}
              </p>
            </div>
            <div className="relative aspect-[16/7] overflow-hidden">
              <img src={pageImage} alt={pageTitle} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 text-[12px] text-ds-text-muted mb-5">
          <Link href="/" className="hover:text-ds-gold transition-colors">Начало</Link>
          <span>/</span>
          <span className="text-ds-text">{pageTitle}</span>
        </div>

        <div className="flex items-center justify-between mb-6 gap-4">
          <p className="text-[12px] text-ds-text-secondary">
            {loading
              ? 'Зареждане...'
              : `Показани 1–${Math.min(visibleCount, filtered.length)} от ${filtered.length} продукта`}
          </p>
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden flex items-center gap-2 text-[12px] border border-ds-gold bg-ds-card px-4 py-2 text-ds-text transition-colors"
              onClick={() => setFilterOpen(true)}
            >
              <SlidersHorizontal size={14} />
              ФИЛТРИ
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-ds-text-secondary hidden sm:inline">Сортирай:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-[12px] border border-ds-border px-3 py-2 bg-ds-card text-ds-text outline-none cursor-pointer"
              >
                <option value="newest">Най-нови</option>
                <option value="price-asc">Цена ↑</option>
                <option value="price-desc">Цена ↓</option>
                <option value="name-asc">А-Я</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-[210px] shrink-0 bg-ds-card border border-ds-border p-4">
            <FilterContent />
          </aside>

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="text-center py-16 text-ds-text-muted text-[14px]">Зареждане на продукти...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-ds-text-muted text-[14px]">Няма намерени продукти</div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                  {displayed.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
                {visibleCount < filtered.length && (
                  <div className="text-center mt-10">
                    <button
                      onClick={() => setVisibleCount((n) => n + 8)}
                      className="px-10 py-3.5 border border-ds-gold text-[12px] font-bold tracking-widest uppercase text-ds-text hover:bg-ds-gold hover:text-white transition-colors"
                    >
                      ЗАРЕДИ ОЩЕ ПРОДУКТИ
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {filterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFilterOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[280px] bg-ds-card overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[13px] font-bold tracking-widest">ФИЛТРИ</span>
              <button onClick={() => setFilterOpen(false)}><X size={20} /></button>
            </div>
            <FilterContent />
            <button
              onClick={() => setFilterOpen(false)}
              className="w-full mt-6 bg-ds-gold text-white text-[12px] font-bold tracking-widest py-3.5 uppercase"
            >
              ПОКАЖИ {filtered.length} ПРОДУКТА
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StorePage(props: StorePageProps) {
  return (
    <Suspense fallback={
      <div className="bg-ds-main min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ds-gold mx-auto"></div>
      </div>
    }>
      <StorePageContent {...props} />
    </Suspense>
  );
}

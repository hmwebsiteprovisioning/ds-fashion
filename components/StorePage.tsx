'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, X, ChevronUp, ChevronDown } from 'lucide-react';
import ProductCard from './ProductCard';
import { MOCK_PRODUCTS, WOMEN_CATEGORIES, type MockProduct } from '@/lib/mock-data';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc';

const COLLECTION_CONFIG: Record<string, {
  title: string;
  description: string;
  image: string;
  filter: (p: MockProduct) => boolean;
}> = {
  'for-her': {
    title: 'Дамска колекция',
    description: 'Открийте селекция от вечна елегантност и съвременен стил.\nВисококачествени материи, прецизна изработка и женствен силует.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=85',
    filter: p => p.category === 'women',
  },
  'for-him': {
    title: 'Мъжка колекция',
    description: 'Открийте мъжка мода, вдъхновена от минимализма и качеството.\nОблекло, което говори с детайлите.',
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=900&q=85',
    filter: p => p.category === 'men',
  },
  accessories: {
    title: 'Аксесоари',
    description: 'Перфектното допълнение към всяка визия.\nЧанти, шалове, очила и още.',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=900&q=85',
    filter: p => p.category === 'accessories',
  },
  products: {
    title: 'Всички продукти',
    description: 'Разгледайте пълната колекция на DS-Fashion.',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=900&q=85',
    filter: () => true,
  },
};

interface StorePageProps {
  currentPage: string;
  products?: MockProduct[];
}

const ALL_COLORS = [
  { name: 'Бежово', hex: '#c8b49a' },
  { name: 'Черно', hex: '#1E1B18' },
  { name: 'Бяло', hex: '#f5f5f5' },
  { name: 'Кафяво', hex: '#6b4c3b' },
  { name: 'Сиво', hex: '#9e9e9e' },
  { name: 'Тъмносиньо', hex: '#1c2951' },
];
const ALL_MATERIALS = ['Памук', 'Вълна', 'Лен', 'Кашмир', 'Вискоза'];
const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL'];

export default function StorePage({ currentPage }: StorePageProps) {
  const config = COLLECTION_CONFIG[currentPage] || COLLECTION_CONFIG.products;
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(1000);
  const [filterOpen, setFilterOpen] = useState(false); // mobile
  const [catOpen, setCatOpen] = useState(true);
  const [sizeOpen, setSizeOpen] = useState(true);
  const [colorOpen, setColorOpen] = useState(true);
  const [matOpen, setMatOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);
  const [visibleCount, setVisibleCount] = useState(8);

  const filtered = useMemo(() => {
    let list = MOCK_PRODUCTS.filter(config.filter);
    if (selectedSizes.length) list = list.filter(p => p.sizes.some(s => selectedSizes.includes(s)));
    if (selectedColors.length) list = list.filter(p => p.colors.some(c => selectedColors.includes(c.name)));
    if (priceMax < 1000) list = list.filter(p => p.price <= priceMax);
    switch (sortBy) {
      case 'price-asc': list = [...list].sort((a, b) => a.price - b.price); break;
      case 'price-desc': list = [...list].sort((a, b) => b.price - a.price); break;
      case 'name-asc': list = [...list].sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    return list;
  }, [config, sortBy, selectedSizes, selectedColors, priceMax]);

  const displayed = filtered.slice(0, visibleCount);

  const toggleSize = (s: string) =>
    setSelectedSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleColor = (c: string) =>
    setSelectedColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  const clearAll = () => { setSelectedSizes([]); setSelectedColors([]); setSelectedMaterials([]); setPriceMax(1000); };

  const FilterContent = () => (
    <div className="space-y-0">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[12px] font-bold tracking-widest uppercase text-ds-text">Филтри</p>
        {(selectedSizes.length || selectedColors.length) ? (
          <button onClick={clearAll} className="text-[11px] text-ds-gold hover:underline tracking-wide">
            ИЗЧИСТИ ВСИЧКО
          </button>
        ) : null}
      </div>

      {/* Category */}
      <div className="border-t border-ds-border py-4">
        <button className="flex items-center justify-between w-full" onClick={() => setCatOpen(!catOpen)}>
          <span className="text-[12px] font-bold tracking-wide text-ds-text">Категория</span>
          {catOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {catOpen && (
          <div className="mt-3 space-y-2">
            {WOMEN_CATEGORIES.map(cat => (
              <div key={cat.name} className="flex items-center justify-between">
                <button className="text-[12px] text-ds-text-secondary hover:text-ds-gold transition-colors text-left">{cat.name}</button>
                <span className="text-[11px] text-ds-text-muted">{cat.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Size */}
      <div className="border-t border-ds-border py-4">
        <button className="flex items-center justify-between w-full" onClick={() => setSizeOpen(!sizeOpen)}>
          <span className="text-[12px] font-bold tracking-wide text-ds-text">Размер</span>
          {sizeOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {sizeOpen && (
          <div className="flex flex-wrap gap-2 mt-3">
            {ALL_SIZES.map(s => (
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

      {/* Color */}
      <div className="border-t border-ds-border py-4">
        <button className="flex items-center justify-between w-full" onClick={() => setColorOpen(!colorOpen)}>
          <span className="text-[12px] font-bold tracking-wide text-ds-text">Цвят</span>
          {colorOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {colorOpen && (
          <div className="flex flex-wrap gap-2.5 mt-3">
            {ALL_COLORS.map(c => (
              <button
                key={c.hex}
                onClick={() => toggleColor(c.name)}
                title={c.name}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  selectedColors.includes(c.name)
                    ? 'border-ds-gold scale-110'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{
                  backgroundColor: c.hex,
                  boxShadow: '0 0 0 1px #E2D6C8',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Material */}
      <div className="border-t border-ds-border py-4">
        <button className="flex items-center justify-between w-full" onClick={() => setMatOpen(!matOpen)}>
          <span className="text-[12px] font-bold tracking-wide text-ds-text">Материя</span>
          {matOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {matOpen && (
          <div className="space-y-2 mt-3">
            {ALL_MATERIALS.map(m => (
              <label key={m} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedMaterials.includes(m)}
                  onChange={() => setSelectedMaterials(prev =>
                    prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
                  )}
                  className="w-3.5 h-3.5 accent-ds-gold"
                />
                <span className="text-[12px] text-ds-text-secondary group-hover:text-ds-text transition-colors">{m}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price */}
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
              max={1000}
              step={10}
              value={priceMax}
              onChange={e => setPriceMax(Number(e.target.value))}
              className="w-full accent-ds-gold"
            />
            <div className="flex justify-between text-[11px] text-ds-text-secondary mt-1">
              <span>49 лв.</span>
              <span>{priceMax === 1000 ? '699 лв.' : `${priceMax} лв.`}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-ds-main min-h-screen">
      {/* Editorial header */}
      <div className="bg-ds-section">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="font-serif-display text-3xl sm:text-4xl lg:text-[2.75rem] text-ds-text mb-4 leading-tight">
                {config.title}
              </h1>
              <p className="text-[13px] sm:text-[14px] text-ds-text-secondary leading-relaxed whitespace-pre-line">
                {config.description}
              </p>
            </div>
            <div className="relative aspect-[16/7] overflow-hidden">
              <img src={config.image} alt={config.title} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[12px] text-ds-text-muted mb-5">
          <Link href="/" className="hover:text-ds-gold transition-colors">Начало</Link>
          <span>/</span>
          <span className="text-ds-text">{config.title}</span>
        </div>

        {/* Count + Sort bar */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <p className="text-[12px] text-ds-text-secondary">
            Показани 1–{Math.min(visibleCount, filtered.length)} от {filtered.length} продукта
          </p>
          <div className="flex items-center gap-3">
            {/* Mobile filter button */}
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
                onChange={e => setSortBy(e.target.value as SortOption)}
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
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-[210px] shrink-0 bg-ds-card border border-ds-border p-4">
            <FilterContent />
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-ds-text-muted text-[14px]">Няма намерени продукти</div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                  {displayed.map(p => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
                {visibleCount < filtered.length && (
                  <div className="text-center mt-10">
                    <button
                      onClick={() => setVisibleCount(n => n + 8)}
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

      {/* Mobile filter drawer */}
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

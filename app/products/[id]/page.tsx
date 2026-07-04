'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { Heart, Star, Minus, Plus, ShoppingBag, RotateCcw } from 'lucide-react';
import PublicPageLayout from '@/components/PublicPageLayout';
import ProductCard from '@/components/ProductCard';
import TrustBar from '@/components/TrustBar';
import { MOCK_PRODUCTS } from '@/lib/mock-data';

const TABS = [
  { id: 'characteristics', label: 'ХАРАКТЕРИСТИКИ' },
  { id: 'description', label: 'ОПИСАНИЕ' },
  { id: 'material', label: 'МАТЕРИАЛ' },
  { id: 'sizes', label: 'РАЗМЕРИ' },
  { id: 'delivery', label: 'ДОСТАВКА И ВРЪЩАНЕ' },
];

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [isAdmin, setIsAdmin] = useState(false);
  const handleSetIsAdmin = (v: boolean) => { setIsAdmin(v); localStorage.setItem('isAdmin', v.toString()); };

  const product = MOCK_PRODUCTS.find(p => p.id === id) ?? MOCK_PRODUCTS[8]; // fallback to black hoodie

  const [mainImg, setMainImg] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0].name);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [wished, setWished] = useState(false);
  const [activeTab, setActiveTab] = useState('characteristics');

  const related = MOCK_PRODUCTS.filter(p => p.id !== product.id && p.category === product.category).slice(0, 5);

  return (
    <PublicPageLayout isAdmin={isAdmin} setIsAdmin={handleSetIsAdmin}>
      <div className="bg-[#faf8f5] min-h-screen">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11px] text-[#9e9e9e] mb-6 flex-wrap">
            <Link href="/" className="hover:text-[#c49a3c]">Начало</Link>
            <span>/</span>
            <Link href={product.category === 'men' ? '/for-him' : product.category === 'women' ? '/for-her' : '/accessories'}
              className="hover:text-[#c49a3c] capitalize">
              {product.category === 'men' ? 'Мъже' : product.category === 'women' ? 'Жени' : 'Аксесоари'}
            </Link>
            <span>/</span>
            <span className="text-[#1a1a1a]">{product.name}</span>
          </div>

          {/* Main product area */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 bg-white p-6 sm:p-8">
            {/* Left: Thumbnails + Main Image */}
            <div className="flex gap-3">
              {/* Thumbnail strip */}
              <div className="hidden sm:flex flex-col gap-2 w-[72px] shrink-0">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImg(i)}
                    className={`aspect-square overflow-hidden border-2 transition-colors ${
                      mainImg === i ? 'border-[#c49a3c]' : 'border-[#e8e0d5] hover:border-[#c49a3c]'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Main image */}
              <div className="relative flex-1 aspect-[4/5] overflow-hidden bg-[#f5f0eb]">
                <img
                  src={product.images[mainImg]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.isNew && (
                  <span className="absolute top-4 left-4 bg-[#1a1a1a] text-white text-[10px] font-bold tracking-widest px-3 py-1.5 uppercase">
                    НОВО
                  </span>
                )}
                {/* Mobile thumbnails */}
                <div className="sm:hidden absolute bottom-3 inset-x-3 flex gap-1.5 justify-center">
                  {product.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setMainImg(i)}
                      className={`h-1.5 flex-1 max-w-[32px] transition-colors ${
                        mainImg === i ? 'bg-[#c49a3c]' : 'bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Product Info */}
            <div>
              <h1 className="font-serif-display text-2xl sm:text-3xl text-[#1a1a1a] mb-2 leading-tight">
                {product.name}
              </h1>

              {/* Stars */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < Math.floor(product.rating) ? '#c49a3c' : 'none'}
                      stroke={i < Math.floor(product.rating) ? '#c49a3c' : '#d0ccc8'}
                    />
                  ))}
                </div>
                <span className="text-[12px] text-[#6b6b6b]">{product.rating} ({product.reviewCount} отзива)</span>
              </div>

              {/* Price */}
              <p className="text-2xl font-bold text-[#1a1a1a] mb-2">
                {product.price.toFixed(2)} лв.
              </p>
              <div className="flex items-center gap-2 mb-5">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                <span className="text-[12px] text-green-700 font-medium">В наличност</span>
              </div>

              <p className="text-[13px] text-[#6b6b6b] leading-relaxed mb-6">{product.description}</p>

              {/* Color */}
              <div className="mb-5">
                <p className="text-[12px] font-bold tracking-wide text-[#1a1a1a] mb-2.5">
                  Цвят: <span className="font-normal text-[#6b6b6b]">{selectedColor}</span>
                </p>
                <div className="flex gap-2.5">
                  {product.colors.map(c => (
                    <button
                      key={c.hex}
                      onClick={() => setSelectedColor(c.name)}
                      title={c.name}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        selectedColor === c.name ? 'border-[#c49a3c] scale-110' : 'border-transparent hover:scale-110'
                      }`}
                      style={{ backgroundColor: c.hex, boxShadow: '0 0 0 1px #e8e0d5' }}
                    />
                  ))}
                </div>
              </div>

              {/* Size */}
              {product.sizes[0] !== 'ONE SIZE' && (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-[12px] font-bold tracking-wide text-[#1a1a1a]">Размер:</p>
                    <button className="text-[11px] text-[#c49a3c] underline">Таблица с размери</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map(s => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`text-[12px] px-3.5 py-2 border font-medium transition-colors ${
                          selectedSize === s
                            ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
                            : 'border-[#e0d8cf] text-[#6b6b6b] hover:border-[#1a1a1a] hover:text-[#1a1a1a]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <p className="text-[12px] font-bold tracking-wide text-[#1a1a1a] mb-2.5">Количество:</p>
                <div className="inline-flex items-center border border-[#e8e0d5]">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="px-4 py-2.5 text-[#1a1a1a] hover:bg-[#f5f0eb] transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-5 py-2.5 text-[14px] font-medium text-[#1a1a1a] min-w-[50px] text-center">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(q => q + 1)}
                    className="px-4 py-2.5 text-[#1a1a1a] hover:bg-[#f5f0eb] transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* CTA row */}
              <div className="flex gap-3">
                <button className="flex-1 bg-[#c49a3c] hover:bg-[#a07c28] text-white text-[13px] font-bold tracking-widest py-4 uppercase transition-colors flex items-center justify-center gap-2">
                  <ShoppingBag size={16} />
                  ДОБАВИ В КОЛИЧКАТА
                </button>
                <button
                  onClick={() => setWished(!wished)}
                  className="px-4 py-4 border border-[#e8e0d5] hover:border-[#1a1a1a] transition-colors"
                >
                  <Heart
                    size={18}
                    fill={wished ? '#c49a3c' : 'none'}
                    stroke={wished ? '#c49a3c' : '#1a1a1a'}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Trust bar */}
          <div className="mt-0">
            <TrustBar />
          </div>

          {/* Tabs */}
          <div className="mt-6 bg-white">
            <div className="flex border-b border-[#e8e0d5] overflow-x-auto">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-[11px] font-bold tracking-widest px-5 py-4 whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#c49a3c] text-[#c49a3c]'
                      : 'border-transparent text-[#6b6b6b] hover:text-[#1a1a1a]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6 sm:p-8">
              {activeTab === 'characteristics' && (
                <div className="grid sm:grid-cols-2 gap-x-12 gap-y-3">
                  {[
                    { label: 'Материал', value: product.material ?? '—' },
                    { label: 'Модел е', value: product.modelInfo ?? '—' },
                    { label: 'Кройка', value: product.fit ?? '—' },
                    { label: 'Детайли', value: 'Качулка с връзки, метални накрайници' },
                    { label: 'Произход', value: 'Произведено в Португалия' },
                    { label: 'Сезон', value: product.season ?? '—' },
                    { label: 'Уход', value: product.care ?? '—' },
                    { label: 'Артикулен номер', value: product.sku ?? '—' },
                  ].map(row => (
                    <div key={row.label} className="flex gap-4">
                      <span className="text-[13px] font-semibold text-[#1a1a1a] min-w-[120px]">{row.label}</span>
                      <span className="text-[13px] text-[#6b6b6b]">{row.value}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'description' && (
                <p className="text-[13px] text-[#4a4a4a] leading-relaxed max-w-2xl">{product.description}</p>
              )}
              {activeTab === 'material' && (
                <p className="text-[13px] text-[#4a4a4a] leading-relaxed max-w-2xl">{product.material ?? 'Информацията за материала не е налична.'}</p>
              )}
              {activeTab === 'sizes' && (
                <div className="overflow-x-auto">
                  <table className="text-[12px] border-collapse">
                    <thead>
                      <tr className="border-b border-[#e8e0d5]">
                        {['Размер', 'XS', 'S', 'M', 'L', 'XL', 'XXL'].map(h => (
                          <th key={h} className="px-5 py-2.5 font-bold text-[#1a1a1a] text-left">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Гърди (см)', '82', '86', '90', '95', '100', '106'],
                        ['Талия (см)', '64', '68', '72', '77', '83', '89'],
                        ['Ханш (см)', '90', '94', '98', '103', '109', '115'],
                      ].map(row => (
                        <tr key={row[0]} className="border-b border-[#f0ebe3]">
                          {row.map((cell, i) => (
                            <td key={i} className={`px-5 py-2.5 ${i === 0 ? 'font-medium text-[#1a1a1a]' : 'text-[#6b6b6b]'}`}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {activeTab === 'delivery' && (
                <div className="space-y-4 text-[13px] text-[#4a4a4a] max-w-xl">
                  <div className="flex gap-3">
                    <ShoppingBag size={18} className="text-[#c49a3c] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#1a1a1a] mb-1">Безплатна доставка</p>
                      <p className="text-[#6b6b6b]">За поръчки над 100 лв. Стандартна доставка 2–3 работни дни.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <RotateCcw size={18} className="text-[#c49a3c] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#1a1a1a] mb-1">Лесно връщане до 14 дни</p>
                      <p className="text-[#6b6b6b]">Върни продукта в оригиналния му вид до 14 дни от получаването.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related products */}
          {related.length > 0 && (
            <section className="mt-10">
              <h2 className="font-serif-display text-2xl text-[#1a1a1a] mb-6">Подходящо за теб</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {related.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </PublicPageLayout>
  );
}

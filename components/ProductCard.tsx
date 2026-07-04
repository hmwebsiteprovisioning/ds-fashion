'use client';

import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import type { MockProduct } from '@/lib/mock-data';

// Accept either the full MockProduct or a legacy Product-like shape
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyProduct = MockProduct | any;

interface ProductCardProps {
  product: AnyProduct;
  onAddToCart?: (product: AnyProduct) => void;
  // Legacy compat props
  isFavorited?: boolean;
}

export default function ProductCard({ product, onAddToCart, isFavorited: _isFavorited }: ProductCardProps) {
  const [wished, setWished] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) onAddToCart(product);
  };

  // Normalise fields — handle both MockProduct and legacy Product shapes
  const productId = product.id ?? product.productid ?? '';
  const productName = product.name ?? `${product.brand ?? ''} ${product.model ?? ''}`.trim();
  const productPrice: number = product.price ?? 0;
  const rawImages: string[] = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ['/hero-home.png'];
  const colors: Array<{ name: string; hex: string }> = Array.isArray(product.colors)
    ? product.colors
    : [];
  const sizes: string[] = Array.isArray(product.sizes)
    ? product.sizes
    : [];
  const isNew: boolean = product.isNew ?? product.isfeatured ?? false;

  return (
    <div className="group relative bg-white flex flex-col">
      {/* Image */}
      <Link href={`/products/${productId}`} className="relative block aspect-[3/4] overflow-hidden bg-[#f5f0eb]">
        <img
          src={rawImages[0]}
          alt={productName}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Hover second image */}
        {rawImages[1] && (
          <img
            src={rawImages[1]}
            alt={productName}
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
        )}

        {/* NEW badge */}
        {isNew && (
          <span className="absolute top-3 left-3 bg-[#1a1a1a] text-white text-[10px] font-bold tracking-widest px-2.5 py-1 uppercase">
            НОВО
          </span>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWished(!wished); }}
          className="absolute top-3 right-3 p-1.5 bg-white/90 hover:bg-white transition-colors"
          aria-label="Добави в любими"
        >
          <Heart
            size={16}
            fill={wished ? '#c49a3c' : 'none'}
            stroke={wished ? '#c49a3c' : '#1a1a1a'}
          />
        </button>
      </Link>

      {/* Info */}
      <div className="pt-3 pb-4 px-0.5 flex flex-col flex-1">
        <Link href={`/products/${productId}`}>
          <h3 className="text-[13px] sm:text-[14px] text-[#1a1a1a] font-medium leading-snug hover:text-[#c49a3c] transition-colors line-clamp-2">
            {productName}
          </h3>
        </Link>

        <p className="text-[14px] sm:text-[15px] font-semibold text-[#1a1a1a] mt-1.5">
          {productPrice.toFixed(2)} лв.
        </p>

        {/* Color swatches */}
        {colors.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            {colors.slice(0, 4).map((color: { name: string; hex: string }) => (
              <span
                key={color.hex}
                className="w-4 h-4 rounded-full border border-[#e8e0d5] cursor-pointer hover:scale-110 transition-transform"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
            {colors.length > 4 && (
              <span className="text-[10px] text-[#9e9e9e]">+{colors.length - 4}</span>
            )}
          </div>
        )}

        {/* Size chips */}
        {sizes.length > 0 && sizes[0] !== 'ONE SIZE' && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {sizes.map((size: string) => (
              <button
                key={size}
                onClick={(e) => { e.preventDefault(); setSelectedSize(size); }}
                className={`text-[10px] sm:text-[11px] px-2 py-0.5 border font-medium transition-colors ${
                  selectedSize === size
                    ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
                    : 'border-[#e0d8cf] text-[#6b6b6b] hover:border-[#1a1a1a] hover:text-[#1a1a1a]'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}

        {/* Quick add button */}
        <button
          onClick={handleAdd}
          className="mt-3 w-full bg-[#c49a3c] hover:bg-[#a07c28] text-white text-[11px] sm:text-[12px] font-bold tracking-widest py-2.5 uppercase transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingBag size={13} />
          БЪРЗА ДОБАВКА
        </button>
      </div>
    </div>
  );
}

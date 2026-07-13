'use client';

import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import type { StorefrontProduct } from '@/lib/storefront-products';
import { DS } from '@/lib/design-tokens';

import { formatPrice } from '@/lib/price-formatter';

type AnyProduct = StorefrontProduct | Record<string, unknown> | object;

interface ProductCardProps {
  product: AnyProduct;
  onAddToCart?: (product: AnyProduct) => void;
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

  const p = product as StorefrontProduct & Record<string, unknown>;
  const productId = String(p.id ?? p.productid ?? '');
  const productName = String(p.name ?? `${p.brand ?? ''} ${p.model ?? ''}`.trim());
  const productPrice = Number(p.price ?? 0);
  const compareAtPrice = p.compareAtPrice != null ? Number(p.compareAtPrice) : null;
  const isOnSale = p.isOnSale ?? (compareAtPrice != null && compareAtPrice > productPrice);
  const rawImages: string[] = Array.isArray(p.images) && p.images.length > 0
    ? p.images as string[]
    : ['/hero-home.png'];
  const colors = Array.isArray(p.colors) ? p.colors as Array<{ name: string; hex: string }> : [];
  const sizes: string[] = Array.isArray(p.sizes) ? p.sizes as string[] : [];
  const isNew = !!(p.isNew ?? p.isnew);

  return (
    <div className="group relative bg-ds-card border border-ds-border shadow-ds-card flex flex-col">
      <Link href={`/products/${productId}`} className="relative block aspect-[3/4] overflow-hidden bg-ds-image">
        <img
          src={rawImages[0]}
          alt={productName}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {rawImages[1] && (
          <img
            src={rawImages[1]}
            alt={productName}
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
        )}

        {isNew && (
          <span className="absolute top-3 left-3 bg-ds-info text-ds-gold border border-ds-border text-[10px] font-bold tracking-widest px-2.5 py-1 uppercase">
            НОВО
          </span>
        )}
        {isOnSale && (
          <span className="absolute top-3 left-3 bg-ds-error text-white text-[10px] font-bold tracking-widest px-2.5 py-1 uppercase">
            SALE
          </span>
        )}

        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWished(!wished); }}
          className="absolute top-3 right-3 p-1.5 rounded-full border border-ds-border transition-colors"
          style={{ backgroundColor: DS.wishlistBg }}
          aria-label="Добави в любими"
        >
          <Heart size={16} fill={wished ? DS.gold : 'none'} stroke={DS.gold} />
        </button>
      </Link>

      <div className="pt-3 pb-4 px-3 flex flex-col flex-1">
        <Link href={`/products/${productId}`}>
          <h3 className="text-[13px] sm:text-[14px] text-ds-text font-medium leading-snug hover:text-ds-gold transition-colors line-clamp-2">
            {productName}
          </h3>
        </Link>

        <div className="mt-1.5 flex items-baseline gap-2 flex-wrap">
          {formatPrice(productPrice, 'text-[14px] sm:text-[15px] font-semibold text-ds-gold')}
          {isOnSale && compareAtPrice != null && (
            <span className="text-[12px] text-ds-text-muted line-through">
              {compareAtPrice.toFixed(2)} €
            </span>
          )}
        </div>

        {colors.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            {colors.slice(0, 4).map((color) => (
              <span
                key={color.hex + color.name}
                className="w-4 h-4 rounded-full border border-ds-border cursor-pointer hover:scale-110 transition-transform"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
            {colors.length > 4 && (
              <span className="text-[10px] text-ds-text-muted">+{colors.length - 4}</span>
            )}
          </div>
        )}

        {sizes.length > 0 && sizes[0] !== 'ONE SIZE' && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={(e) => { e.preventDefault(); setSelectedSize(size); }}
                className={`text-[10px] sm:text-[11px] px-2 py-0.5 border font-medium transition-colors ${
                  selectedSize === size
                    ? 'border-ds-gold bg-ds-gold text-white'
                    : 'border-ds-border bg-ds-main text-ds-text-secondary hover:border-ds-gold'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={handleAdd}
          className="mt-3 w-full bg-ds-gold hover:bg-ds-gold-dark text-white text-[11px] sm:text-[12px] font-bold tracking-widest py-2.5 uppercase transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingBag size={13} />
          БЪРЗА ДОБАВКА
        </button>
      </div>
    </div>
  );
}


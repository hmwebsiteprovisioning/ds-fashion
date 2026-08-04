'use client';

import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import type { StorefrontProduct } from '@/lib/storefront-products';
import { DS } from '@/lib/design-tokens';

import { formatPrice } from '@/lib/price-formatter';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import QuickLoginModal from './QuickLoginModal';

type AnyProduct = StorefrontProduct | Record<string, unknown> | object;

interface ProductCardProps {
  product: AnyProduct;
  onAddToCart?: (product: AnyProduct) => void;
  isFavorited?: boolean;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { addItem, openCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { isFavorited, toggleFavorite } = useFavorites();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isPopping, setIsPopping] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const p = product as StorefrontProduct & Record<string, unknown>;
  const productId = String(p.id ?? p.productid ?? '');
  const wished = isFavorited(productId);
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
  const colorImagesMap = (p.colorImages || {}) as Record<string, string[]>;
  const rawVariants = (p.rawVariants || p.variants || p.Variants || []) as any[];

  // Selected color image resolution
  const activeColorKey = selectedColor ? selectedColor.trim().toLowerCase() : '';

  // Primary: use pre-built colorImages map
  const colorVariantImgs: string[] | null = (() => {
    if (!activeColorKey) return null;
    // Check colorImagesMap first
    if (colorImagesMap[activeColorKey] && colorImagesMap[activeColorKey].length > 0) {
      return colorImagesMap[activeColorKey];
    }
    // Fallback: search rawVariants directly for a variant whose colour matches
    if (rawVariants.length > 0) {
      const COLOR_PROP_NAMES = ['color', 'colour', 'цвят'];
      for (const v of rawVariants) {
        if (v.isvisible === false) continue;
        const pvs = (
          v.ProductVariantPropertyvalues ||
          v.ProductVariantPropertyValues ||
          v.product_variant_property_values ||
          v.productVariantPropertyvalues ||
          []
        ) as any[];
        const colorMatch = pvs.some((pv: any) => {
          const propName = String(
            pv.Property?.name || pv.Property?.Name ||
            pv.properties?.name || pv.properties?.Name ||
            pv.propertyid || ''
          ).trim().toLowerCase();
          const val = String(pv.value || pv.Value || '').trim().toLowerCase();
          return COLOR_PROP_NAMES.includes(propName) && val === activeColorKey;
        });
        if (colorMatch) {
          const imgs: string[] = Array.isArray(v.images) && v.images.length > 0
            ? v.images
            : v.imageurl
            ? [v.imageurl]
            : [];
          if (imgs.length > 0) return imgs;
        }
      }
    }
    return null;
  })();

  const mainCardImage = colorVariantImgs ? colorVariantImgs[0] : rawImages[0];
  // When a colour is selected: only use that colour's second variant image as the hover swap.
  // Never fall back to rawImages[1] — that would appear on top and visually "undo" the colour change.
  const secondaryCardImage = colorVariantImgs
    ? (colorVariantImgs[1] || null)
    : (rawImages[1] || null);

  const isSizeAvailable = (size: string, colorName: string | null): boolean => {
    if (!Array.isArray(rawVariants) || rawVariants.length === 0) return true;

    const targetSize = size.trim().toLowerCase();
    const targetColor = colorName ? colorName.trim().toLowerCase() : null;

    const matching = rawVariants.filter((v: any) => {
      if (v.isvisible === false) return false;

      const pvs = (v.ProductVariantPropertyvalues ||
                  v.ProductVariantPropertyValues ||
                  v.product_variant_property_values ||
                  v.productVariantPropertyvalues ||
                  []) as any[];

      let matchesSize = false;
      let matchesColor = targetColor ? false : true;

      pvs.forEach((pv: any) => {
        const propName = String(
          pv.Property?.name ||
          pv.Property?.Name ||
          pv.properties?.name ||
          pv.properties?.Name ||
          pv.propertyid ||
          ''
        ).trim().toLowerCase();
        const val = String(pv.value || pv.Value || '').trim().toLowerCase();

        if (['size', 'размер'].includes(propName) && val === targetSize) {
          matchesSize = true;
        }
        if (targetColor && ['color', 'colour', 'цвят'].includes(propName) && val === targetColor) {
          matchesColor = true;
        }
      });

      return matchesSize && matchesColor;
    });

    if (matching.length === 0) return false;

    return matching.some((v: any) => {
      const tracksQty = v.trackquantity !== false && v.trackquantity !== null;
      if (!tracksQty) return true;
      return (Number(v.quantity) || 0) > 0;
    });
  };

  const handleColorChange = (colorName: string) => {
    setSelectedColor(colorName);
    if (selectedSize && !isSizeAvailable(selectedSize, colorName)) {
      const firstAvail = sizes.find((s) => isSizeAvailable(s, colorName));
      setSelectedSize(firstAvail || null);
    }
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const availableSizes = sizes.filter((s) => isSizeAvailable(s, selectedColor));
    const sizeToUse = (selectedSize && isSizeAvailable(selectedSize, selectedColor))
      ? selectedSize
      : (availableSizes.length > 0 ? availableSizes[0] : (sizes.length > 0 ? sizes[0] : undefined));
    const colorToUse = selectedColor || (colors.length > 0 ? colors[0].name : String(p.color ?? ''));
    
    addItem({
      id: productId,
      name: productName,
      brand: String(p.brand ?? ''),
      model: String(p.model ?? ''),
      type: p.type ? String(p.type) : undefined,
      color: colorToUse,
      size: sizeToUse,
      price: productPrice,
      imageUrl: mainCardImage || rawImages[0] || '/hero-home.png',
      category: (p.category as 'clothes' | 'shoes' | 'accessories') || 'clothes',
    });

    openCart();

    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <div className="group relative bg-ds-card border border-ds-border shadow-ds-card flex flex-col active:scale-[0.98] md:active:scale-100 transition-all duration-300 rounded-2xl overflow-hidden">
      <Link href={`/products/${productId}`} className="relative block aspect-[3/4] overflow-hidden bg-ds-image">
        <img
          src={mainCardImage}
          alt={productName}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {secondaryCardImage && (
          <img
            src={secondaryCardImage}
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
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isAuthenticated) {
              setShowLoginModal(true);
              return;
            }
            setIsPopping(true);
            await toggleFavorite(productId);
          }}
          onAnimationEnd={() => setIsPopping(false)}
          className={`absolute top-3 right-3 p-1.5 rounded-full border border-ds-border transition-colors ${
            isPopping ? 'animate-heart-pop' : ''
          }`}
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
            {colors.slice(0, 5).map((color) => {
              const isSelected = selectedColor?.toLowerCase() === color.name.toLowerCase();
              return (
                <button
                  key={color.hex + color.name}
                  type="button"
                  title={color.name}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleColorChange(color.name);
                  }}
                  onMouseEnter={() => {
                    handleColorChange(color.name);
                  }}
                  className={`w-4 h-4 rounded-full border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-ds-gold ring-2 ring-ds-gold/60 scale-125 z-10'
                      : 'border-ds-border/70 hover:scale-110 hover:border-ds-gold/70'
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
              );
            })}
            {colors.length > 5 && (
              <span className="text-[10px] text-ds-text-muted">+{colors.length - 5}</span>
            )}
          </div>
        )}

        {sizes.length > 0 && sizes[0] !== 'ONE SIZE' && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {sizes.map((size) => {
              const isAvailable = isSizeAvailable(size, selectedColor);
              const isSelected = selectedSize === size && isAvailable;

              return (
                <button
                  key={size}
                  disabled={!isAvailable}
                  onClick={(e) => {
                    e.preventDefault();
                    if (isAvailable) {
                      setSelectedSize(size);
                    }
                  }}
                  className={`text-[10px] sm:text-[11px] px-2 py-0.5 border font-medium transition-all ${
                    !isAvailable
                      ? 'border-ds-border/40 bg-ds-card/40 text-ds-text-muted/40 line-through opacity-40 cursor-not-allowed'
                      : isSelected
                      ? 'border-ds-gold bg-ds-gold text-white cursor-pointer'
                      : 'border-ds-border bg-ds-main text-ds-text-secondary hover:border-ds-gold cursor-pointer'
                  }`}
                  title={!isAvailable ? `${size} (не е наличен за този цвят)` : size}
                >
                  {size}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-auto pt-3">
          <button
            onClick={handleAdd}
            className="w-full bg-ds-gold hover:bg-ds-gold-dark text-white text-[11px] sm:text-[12px] font-bold tracking-widest py-2.5 uppercase transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag size={13} />
            БЪРЗА ДОБАВКА
          </button>
        </div>
      </div>
      
      {showLoginModal && (
        <QuickLoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          productId={productId}
        />
      )}
    </div>
  );
}


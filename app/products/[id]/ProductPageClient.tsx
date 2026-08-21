'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Heart, Minus, Plus, ShoppingBag, Truck, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import PublicPageLayout from '@/components/PublicPageLayout';
import { toStorefrontProduct, type StorefrontProduct } from '@/lib/storefront-products';
import { rfTypePath } from '@/lib/rf-product-type-routes';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/price-formatter';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import { STORE_NAME } from '@/lib/branding';

const pageTranslations = {
  en: {
    loading: 'Loading...',
    productNotFound: 'Product not found',
    backToStore: 'Back to store',
    home: 'Home',
    category: 'Category',
    new: 'NEW',
    sale: 'SALE',
    color: 'Color',
    size: 'Size',
    quantity: 'Quantity',
    addToCart: 'ADD TO CART',
    buyNow: 'BUY NOW',
    inStock: 'available',
    outOfStock: 'Out of stock',
    lastItems: 'Last items!',
    relatedProducts: 'More from DS-Fashion',
    shippingCalculated: 'Shipping calculated at checkout',
    addAddress: 'Add address',
    save: 'Save',
    share: 'Share',
    refundPolicy: 'Refund Policy',
    reviews: 'Reviews',
    viewMore: 'View more',
    viewLess: 'View less',
    addedToWishlist: 'Added to wishlist!',
    removedFromWishlist: 'Removed from wishlist!',
    linkCopied: 'Share link copied!',
    colorLabel: 'Color',
    sizeLabel: 'Size',
    specifications: 'Specifications & Characteristics',
    refundText: 'We offer a 30-day refund policy. Return items must be unworn, unwashed, and in their original packaging.',
  },
  bg: {
    loading: 'Зареждане...',
    productNotFound: 'Продуктът не е намерен',
    backToStore: 'Към магазина',
    home: 'Начало',
    category: 'Категория',
    new: 'НОВО',
    sale: 'SALE',
    color: 'Цвят',
    size: 'Размер',
    quantity: 'Количество',
    addToCart: 'ДОБАВИ В КОЛИЧКАТА',
    buyNow: 'КУПИ СЕГА',
    inStock: 'налични',
    outOfStock: 'Изчерпан',
    lastItems: 'Последни бройки!',
    relatedProducts: 'Подобни продукти',
    shippingCalculated: 'Изчисляване на доставката при плащане',
    addAddress: 'Добави адрес',
    save: 'Запази',
    share: 'Сподели',
    refundPolicy: 'Условия за връщане',
    reviews: 'Отзиви',
    viewMore: 'Виж повече',
    viewLess: 'Виж по-малко',
    addedToWishlist: 'Добавено в любими!',
    removedFromWishlist: 'Премахнато от любими!',
    linkCopied: 'Връзката е копирана!',
    colorLabel: 'Цвят',
    sizeLabel: 'Размер',
    specifications: 'Характеристики на продукта',
    refundText: 'Предлагаме 30-дневен срок за връщане. Върнатите артикули трябва да бъдат некоригирани, неносени и в оригиналната си опаковка.',
  }
};

const mockRelatedProducts = [
  {
    id: 'mock-1',
    name: 'Dreamscape Trouser',
    price: 148.0,
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=400&h=500&q=80'],
    isOnSale: true
  },
  {
    id: 'mock-2',
    name: 'Match Point Tennis Skirt',
    price: 78.0,
    images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=400&h=500&q=80'],
    isOnSale: false
  },
  {
    id: 'mock-3',
    name: 'Airlift High-Waist Leggings',
    price: 118.0,
    images: ['https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=400&h=500&q=80'],
    isOnSale: false
  },
  {
    id: 'mock-4',
    name: 'Classic White Shirt',
    price: 98.0,
    images: ['https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=400&h=500&q=80'],
    isOnSale: true
  }
];

export default function ProductPageClient({ id }: { id: string }) {
  const router = useRouter();
  const { language } = useLanguage();
  const t = pageTranslations[language];
  const { addItem, openCart } = useCart();
  const { settings } = useStoreSettings();

  const [isAdmin, setIsAdmin] = useState(false);
  const [product, setProduct] = useState<StorefrontProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainImg, setMainImg] = useState(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Variant & characteristics state
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [rawVariants, setRawVariants] = useState<any[]>([]);
  const [rawProductData, setRawProductData] = useState<any | null>(null);

  const [qty, setQty] = useState(1);
  const [wished, setWished] = useState(false);

  // Stock availability for the currently selected variant
  const availableStock = useMemo(() => {
    if (!selectedVariant) return null; // no variant selected yet
    const tracksQty = selectedVariant.trackquantity !== false && selectedVariant.trackquantity !== null;
    if (!tracksQty) return null; // untracked = unlimited
    return Math.max(0, Number(selectedVariant.quantity) || 0);
  }, [selectedVariant]);

  // Accordions and toasts
  const [description, setDescription] = useState<string>('');
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [isRefundExpanded, setIsRefundExpanded] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);

  const triggerUserInteraction = useCallback(() => {
    setIsPaused(true);
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
    }
    pauseTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 20000);
  }, []);

  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    triggerUserInteraction();
    touchStartXRef.current = e.targetTouches[0].clientX;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    
    const deltaX = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 40;

    if (deltaX > minSwipeDistance) {
      // Swiped left -> Next image
      if (allImages.length > 1) {
        setMainImg((prev) => (prev + 1) % allImages.length);
      }
    } else if (deltaX < -minSwipeDistance) {
      // Swiped right -> Previous image
      if (allImages.length > 1) {
        setMainImg((prev) => (prev - 1 + allImages.length) % allImages.length);
      }
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    };
  }, []);

  const allImages = useMemo(() => {
    if (!product) return ['/hero-home.png'];
    const list: string[] = [];
    const addImg = (url?: string | null) => {
      if (url && typeof url === 'string' && url.trim() && !list.includes(url.trim())) {
        list.push(url.trim());
      }
    };

    (product.images || []).forEach(addImg);

    if (product.colorImages) {
      Object.values(product.colorImages).forEach((imgs) => {
        if (Array.isArray(imgs)) imgs.forEach(addImg);
      });
    }

    (rawVariants || []).forEach((v: any) => {
      if (Array.isArray(v.images)) v.images.forEach(addImg);
      else if (v.imageurl) addImg(v.imageurl);
    });

    return list.length > 0 ? list : ['/hero-home.png'];
  }, [product, rawVariants]);

  // 4.5-second auto-scroll interval
  useEffect(() => {
    if (isPaused || allImages.length <= 1) return;

    const interval = setInterval(() => {
      setMainImg((prev) => (prev + 1) % allImages.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused, allImages.length]);

  const handleSetIsAdmin = (v: boolean) => {
    setIsAdmin(v);
    localStorage.setItem('isAdmin', v.toString());
  };

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.product) {
          const raw = data.product;
          setRawProductData(raw);

          const sf = toStorefrontProduct({
            ...raw,
            variants: raw.Variants || raw.variants,
            images: (raw.Images || raw.images || []).map((img: { imageurl?: string } | string) =>
              typeof img === 'string' ? img : img.imageurl
            ).filter(Boolean),
          });
          setProduct(sf);
          document.title = `${sf.name} - ${settings?.storename || STORE_NAME}`;
          setDescription(raw.description || '');

          const variantsList = raw.Variants || raw.variants || sf.rawVariants || [];
          setRawVariants(variantsList);

          const primaryVar = variantsList.find((v: any) => v.IsPrimaryImage || v.isprimary) || variantsList[0];
          setSelectedVariant(primaryVar || null);

          const initialOpts: Record<string, string> = {};
          if (primaryVar) {
            const pvs = primaryVar.ProductVariantPropertyvalues ||
                        primaryVar.ProductVariantPropertyValues ||
                        primaryVar.product_variant_property_values ||
                        primaryVar.productVariantPropertyvalues ||
                        [];
            pvs.forEach((pv: any) => {
              const name = pv.Property?.name || pv.Property?.Name || pv.properties?.name || pv.properties?.Name || pv.propertyid;
              const val = pv.value || pv.Value;
              if (name && val) {
                initialOpts[String(name).trim().toLowerCase()] = String(val).trim();
              }
            });
          }

          const initialColor = initialOpts['color'] || initialOpts['colour'] || initialOpts['цвят'] || sf.colors[0]?.name || null;
          const initialSize = initialOpts['size'] || initialOpts['размер'] || sf.sizes[0] || null;

          if (initialColor) {
            initialOpts['color'] = initialColor;
            setSelectedColor(initialColor);
          }
          if (initialSize) {
            initialOpts['size'] = initialSize;
            setSelectedSize(initialSize);
          }

          setSelectedOptions(initialOpts);

          const colorKey = (initialColor || '').trim().toLowerCase();
          const colorImgs = sf.colorImages?.[colorKey];
          const initialTargetImg = (primaryVar?.images && primaryVar.images.length > 0)
            ? primaryVar.images[0]
            : (primaryVar?.imageurl)
            ? primaryVar.imageurl
            : (colorImgs && colorImgs.length > 0)
            ? colorImgs[0]
            : (sf.images.length > 0 ? sf.images[0] : null);

          if (initialTargetImg) {
            const initialIdx = allImages.indexOf(initialTargetImg);
            if (initialIdx !== -1) setMainImg(initialIdx);
            else setMainImg(0);
          } else {
            setMainImg(0);
          }
        } else {
          setProduct(null);
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  const isSizeAvailableForColor = (sizeVal: string, colorVal: string | null): boolean => {
    if (!rawVariants || rawVariants.length === 0) return true;

    const targetSize = sizeVal.trim().toLowerCase();
    const targetColor = colorVal ? colorVal.trim().toLowerCase() : null;

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

  const handleOptionSelect = (optionKey: string, value: string) => {
    const keyLower = optionKey.trim().toLowerCase();
    const updatedOptions = { ...selectedOptions, [keyLower]: value };

    let activeColorName = selectedColor;
    if (['color', 'colour', 'цвят'].includes(keyLower)) {
      activeColorName = value;
      setSelectedColor(value);

      // Check if current selectedSize is available in the new color
      if (selectedSize && !isSizeAvailableForColor(selectedSize, value)) {
        const firstAvailable = product?.sizes.find((s) => isSizeAvailableForColor(s, value));
        if (firstAvailable) {
          setSelectedSize(firstAvailable);
          updatedOptions['size'] = firstAvailable;
          updatedOptions['размер'] = firstAvailable;
        } else {
          setSelectedSize(null);
          delete updatedOptions['size'];
          delete updatedOptions['размер'];
        }
      }
    }
    if (['size', 'размер'].includes(keyLower)) {
      setSelectedSize(value);
    }

    setSelectedOptions(updatedOptions);

    if (rawVariants.length > 0) {
      const match = rawVariants.find((v) => {
        const pvs = v.ProductVariantPropertyvalues ||
                    v.ProductVariantPropertyValues ||
                    v.product_variant_property_values ||
                    v.productVariantPropertyvalues ||
                    [];
        const vOpts: Record<string, string> = {};
        pvs.forEach((pv: any) => {
          const name = pv.Property?.name || pv.Property?.Name || pv.properties?.name || pv.properties?.Name || pv.propertyid;
          const val = pv.value || pv.Value;
          if (name && val) vOpts[String(name).trim().toLowerCase()] = String(val).trim();
        });

        return Object.entries(updatedOptions).every(([k, val]) => {
          const key = k.trim().toLowerCase();
          if (!vOpts[key]) return true;
          return vOpts[key].toLowerCase() === val.toLowerCase();
        });
      });

      const activeColorKey = activeColorName ? activeColorName.trim().toLowerCase() : '';
      const fallbackColorImgs = activeColorKey && product?.colorImages?.[activeColorKey] ? product.colorImages[activeColorKey] : null;

      let targetUrl: string | null = null;
      if (match) {
        setSelectedVariant(match);
        if (match.images && match.images.length > 0) targetUrl = match.images[0];
        else if (match.imageurl) targetUrl = match.imageurl;

        // Reset qty to 1 when variant changes, and cap to available stock
        const tracksQty = match.trackquantity !== false && match.trackquantity !== null;
        if (tracksQty) {
          const stock = Math.max(0, Number(match.quantity) || 0);
          setQty((prev) => Math.min(prev, Math.max(1, stock)));
        }
      }
      if (!targetUrl && fallbackColorImgs && fallbackColorImgs.length > 0) {
        targetUrl = fallbackColorImgs[0];
      }

      if (targetUrl) {
        const idx = allImages.indexOf(targetUrl);
        if (idx !== -1) {
          setMainImg(idx);
        }
      }
    }

    // Trigger 20-second auto-scroll pause on characteristic selection
    triggerUserInteraction();
  };

  if (loading) {
    return (
      <PublicPageLayout isAdmin={isAdmin} setIsAdmin={handleSetIsAdmin}>
        <div className="min-h-[50vh] flex items-center justify-center text-ds-text-secondary font-medium">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ds-gold" />
            <span>{t.loading}</span>
          </div>
        </div>
      </PublicPageLayout>
    );
  }

  if (!product) {
    return (
      <PublicPageLayout isAdmin={isAdmin} setIsAdmin={handleSetIsAdmin}>
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-ds-text-muted">
          <p>{t.productNotFound}</p>
          <Link href="/products" className="text-ds-gold hover:underline font-semibold">{t.backToStore}</Link>
        </div>
      </PublicPageLayout>
    );
  }

  const categoryPath = product.rfproducttypeid ? rfTypePath(product.rfproducttypeid) : '/products';
  const nameParts = product.name.split(' ');
  const brandName = nameParts[0] || 'DS-Fashion';
  const modelName = nameParts.slice(1).join(' ') || product.name;

  const currentPrice = selectedVariant?.price != null ? Number(selectedVariant.price) : product.price;
  const activeImages = allImages;

  const triggerFlyToCart = (startEl: HTMLElement) => {
    // Find all potential cart icons in the header and pick the visible one
    const destElements = Array.from(
      document.querySelectorAll<HTMLElement>('#header-cart-icon, #header-cart-icon-desktop, #header-cart-icon-mobile, [data-cart-icon="true"]')
    );

    let destEl = destElements.find((el) => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.left > 0;
    });

    if (!destEl && destElements.length > 0) {
      destEl = destElements[destElements.length - 1];
    }

    const startRect = startEl.getBoundingClientRect();

    // Default to top-right corner if rect cannot be found
    let destX = window.innerWidth - 60;
    let destY = 32;

    if (destEl) {
      const destRect = destEl.getBoundingClientRect();
      if (destRect.width > 0 && destRect.left > 0) {
        destX = destRect.left + destRect.width / 2 - 22;
        destY = destRect.top + destRect.height / 2 - 22;
      }
    }

    const flyer = document.createElement('div');
    flyer.className = 'fixed z-[9999] pointer-events-none flex items-center justify-center bg-[#1E1B18] text-white rounded-full w-11 h-11 shadow-lg transition-all duration-[1000ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]';
    
    const startX = startRect.left + startRect.width / 2 - 22;
    const startY = startRect.top + startRect.height / 2 - 22;
    flyer.style.left = `${startX}px`;
    flyer.style.top = `${startY}px`;
    flyer.style.transform = 'scale(1)';
    
    flyer.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <path d="M16 10a4 4 0 0 1-8 0"></path>
      </svg>
    `;

    document.body.appendChild(flyer);

    requestAnimationFrame(() => {
      flyer.style.left = `${destX}px`;
      flyer.style.top = `${destY}px`;
      flyer.style.transform = 'scale(0.3) rotate(360deg)';
      flyer.style.opacity = '0.1';
    });

    setTimeout(() => {
      flyer.remove();
      if (destEl) {
        destEl.classList.add('animate-cart-bounce-scale');
        setTimeout(() => {
          destEl.classList.remove('animate-cart-bounce-scale');
        }, 450);
      }
    }, 950);
  };

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (availableStock === 0) return;
    triggerFlyToCart(e.currentTarget);

    addItem({
      id: selectedVariant?.productvariantid || product.id,
      name: product.name,
      brand: brandName,
      model: modelName,
      color: selectedColor || product.colors[0]?.name || '',
      price: currentPrice,
      imageUrl: activeImages[0] || product.images[0],
      category: 'clothes',
      size: selectedSize || undefined,
      options: selectedOptions,
      propertyValues: selectedOptions,
      quantity: qty,
      variantId: selectedVariant?.productvariantid || undefined,
      maxQuantity: availableStock ?? undefined,
    });
    
    setTimeout(() => {
      openCart();
    }, 1000);
  };

  const legacyCopyFallback = () => {
    const textArea = document.createElement('textarea');
    textArea.value = window.location.href;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        setShareToast(t.linkCopied);
        setTimeout(() => setShareToast(null), 3000);
      }
    } catch (copyErr) {
      document.body.removeChild(textArea);
      console.error('Legacy copy fallback failed:', copyErr);
    }
  };

  const fallbackCopy = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(window.location.href)
          .then(() => {
            setShareToast(t.linkCopied);
            setTimeout(() => setShareToast(null), 3000);
          })
          .catch(() => legacyCopyFallback());
      } else {
        legacyCopyFallback();
      }
    } catch (err) {
      legacyCopyFallback();
    }
  };

  const handleShare = () => {
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} on our store!`,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData)
        .then(() => {
          console.log('Shared successfully');
        })
        .catch((err) => {
          console.warn('Native sharing failed/cancelled:', err);
          if (err.name !== 'AbortError') {
            fallbackCopy();
          }
        });
    } else {
      if (typeof window !== 'undefined' && window.location.protocol === 'http:' && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        console.warn('Web Share API is disabled on iOS over HTTP. Serving HTTPS via "next dev --experimental-https" is required for native Share Sheet testing.');
      }
      fallbackCopy();
    }
  };

  const handleWishlistToggle = () => {
    setWished(!wished);
    setShareToast(wished ? t.removedFromWishlist : t.addedToWishlist);
    setTimeout(() => setShareToast(null), 3000);
  };

  return (
    <PublicPageLayout isAdmin={isAdmin} setIsAdmin={handleSetIsAdmin}>
      <div className="bg-ds-main min-h-screen transition-colors duration-300">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-[11px] text-ds-text-secondary/70 mb-6 flex-wrap tracking-wider uppercase font-medium">
            <Link href="/" className="hover:text-ds-gold transition-colors">{t.home}</Link>
            <span>/</span>
            <Link href={categoryPath} className="hover:text-ds-gold transition-colors">{t.category}</Link>
            <span>/</span>
            <span className="text-ds-text font-bold">{product.name}</span>
          </div>

          {/* Main Grid Wrapper */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-12">
            
            {/* Left Column - Product Images */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              
              {/* Main Image Container */}
              <div 
                className="relative aspect-[4/5] sm:aspect-square bg-white rounded-3xl border border-ds-border/30 overflow-hidden flex items-center justify-center p-4 sm:p-6 shadow-sm transition-all duration-300 hover:shadow-md group select-none touch-pan-y"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <img 
                  src={allImages[mainImg] || allImages[0]} 
                  alt={product.name} 
                  className="max-h-full max-w-full object-contain rounded-2xl transition-transform duration-500 hover:scale-105" 
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  {product.isNew && (
                    <span className="bg-ds-gold text-white text-[10px] font-bold tracking-wider px-3 py-1 rounded-full shadow-sm uppercase">
                      {t.new}
                    </span>
                  )}
                  {product.isOnSale && (
                    <span className="bg-ds-error text-white text-[10px] font-bold tracking-wider px-3 py-1 rounded-full shadow-sm uppercase">
                      {t.sale}
                    </span>
                  )}
                </div>

                {/* Minimalist PC / Desktop Navigation Arrows (Hidden on Mobile) */}
                {allImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMainImg((prev) => (prev - 1 + allImages.length) % allImages.length);
                        triggerUserInteraction();
                      }}
                      className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-white/80 hover:bg-white text-ds-text shadow-md transition-all hover:scale-110 opacity-75 hover:opacity-100 border border-ds-border/30 z-20 cursor-pointer"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMainImg((prev) => (prev + 1) % allImages.length);
                        triggerUserInteraction();
                      }}
                      className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-white/80 hover:bg-white text-ds-text shadow-md transition-all hover:scale-110 opacity-75 hover:opacity-100 border border-ds-border/30 z-20 cursor-pointer"
                      aria-label="Next image"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {/* Pagination Dots (Mobile & PC) */}
              {allImages.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 py-1">
                  {allImages.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setMainImg(i);
                        triggerUserInteraction();
                      }}
                      aria-label={`Go to image ${i + 1}`}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        mainImg === i
                          ? 'w-6 bg-ds-gold shadow-sm'
                          : 'w-2 bg-ds-border hover:bg-ds-text-secondary/50'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Thumbnail Strip */}
              {allImages.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setMainImg(i);
                        triggerUserInteraction();
                      }}
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all duration-200 shrink-0 snap-start cursor-pointer ${
                        mainImg === i
                          ? 'border-ds-gold scale-95 shadow-md ring-2 ring-ds-gold/20'
                          : 'border-ds-border/40 hover:border-ds-text/30 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

            </div>

            {/* Right Column - Product Details */}
            <div className="lg:col-span-5 flex flex-col space-y-6">
              
              {/* Title */}
              <div>
                <h1 className="font-serif-display text-2xl sm:text-3xl text-ds-text leading-tight tracking-tight capitalize">
                  {product.name}
                </h1>
              </div>

              {/* Price & Vat */}
              <div>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl font-extrabold text-ds-text">
                    {formatPrice(currentPrice, '')}
                  </span>
                  {product.compareAtPrice != null && product.compareAtPrice > currentPrice && (
                    <span className="text-lg text-ds-text-secondary/50 font-medium">
                      {formatPrice(product.compareAtPrice, 'line-through text-ds-text-secondary/50 font-medium', 'line-through text-[11px] text-ds-text-secondary/30')}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-ds-text-secondary/60 uppercase tracking-wider font-semibold mt-1">
                  {language === 'bg' ? 'вкл. ДДС' : 'incl. VAT'}
                </p>
              </div>

              {/* Option Swatches / Colors */}
              {product.colors.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-ds-text mb-2">
                    {t.colorLabel}: <span className="font-normal text-ds-text-secondary ml-1">{selectedColor || product.colors[0]?.name}</span>
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {product.colors.map((c) => {
                      const isSelected = selectedColor?.toLowerCase() === c.name.toLowerCase();
                      return (
                        <button
                          key={c.hex + c.name}
                          type="button"
                          title={c.name}
                          onClick={() => handleOptionSelect('color', c.name)}
                          className={`w-8 h-8 rounded-full border-2 transition-all duration-200 flex items-center justify-center p-0.5 relative cursor-pointer ${
                            isSelected
                              ? 'border-ds-gold ring-2 ring-ds-gold/50 scale-105 shadow-md ring-offset-1'
                              : 'border-ds-border/60 hover:border-ds-text/40 hover:scale-105 shadow-sm'
                          }`}
                        >
                          <span className="w-full h-full rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
                          {isSelected && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-ds-gold rounded-full ring-2 ring-white" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Option Pills / Sizes */}
              {product.sizes.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-ds-text mb-2">
                    {t.sizeLabel}: <span className="font-normal text-ds-text-secondary ml-1">{selectedSize || product.sizes[0]}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => {
                      const isAvailable = isSizeAvailableForColor(s, selectedColor);
                      const isSelected = selectedSize?.toLowerCase() === s.toLowerCase() && isAvailable;
                      return (
                        <button
                          key={s}
                          type="button"
                          disabled={!isAvailable}
                          onClick={() => isAvailable && handleOptionSelect('size', s)}
                          className={`text-xs px-4 py-2 border-2 rounded-full font-bold transition-all duration-200 ${
                            !isAvailable
                              ? 'border-ds-border/40 bg-ds-card/40 text-ds-text-muted/40 line-through opacity-40 cursor-not-allowed'
                              : isSelected
                              ? 'border-ds-text bg-ds-text text-white shadow-sm scale-95 ring-2 ring-ds-text/20 cursor-pointer' 
                              : 'border-ds-border/60 hover:border-ds-text/40 text-ds-text-secondary hover:text-ds-text cursor-pointer'
                          }`}
                          title={!isAvailable ? `${s} (не е наличен за този цвят)` : s}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Other Variant Characteristics / Options (e.g. Material, Style, Fit) */}
              {product.allOptions && Object.entries(product.allOptions).map(([key, opt]) => {
                const lowerKey = key.toLowerCase();
                if (['color', 'colour', 'цвят', 'size', 'размер'].includes(lowerKey)) return null;
                if (!opt.values || opt.values.length === 0) return null;

                const currentVal = selectedOptions[lowerKey] || opt.values[0];

                return (
                  <div key={key}>
                    <p className="text-xs font-bold uppercase tracking-wider text-ds-text mb-2">
                      {opt.originalName}: <span className="font-normal text-ds-text-secondary ml-1">{currentVal}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {opt.values.map((val) => {
                        const isSelected = currentVal?.toLowerCase() === val.toLowerCase();
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleOptionSelect(key, val)}
                            className={`text-xs px-4 py-2 border-2 rounded-full font-bold transition-all duration-200 ${
                              isSelected
                                ? 'border-ds-text bg-ds-text text-white shadow-sm scale-95 ring-2 ring-ds-text/20'
                                : 'border-ds-border/60 hover:border-ds-text/40 text-ds-text-secondary hover:text-ds-text'
                            }`}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Quantity Counter Pill */}
              <div className="flex flex-col space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-ds-text">
                    {t.quantity}
                  </span>
                  {availableStock !== null && availableStock > 0 && (
                    <span className={`text-[11px] font-semibold ${
                      availableStock <= 3
                        ? 'text-amber-600'
                        : 'text-ds-text-secondary/70'
                    }`}>
                      {availableStock <= 3
                        ? `${availableStock} ${t.inStock} — ${t.lastItems}`
                        : `${availableStock} ${t.inStock}`
                      }
                    </span>
                  )}
                  {availableStock === 0 && (
                    <span className="text-[11px] font-bold text-red-500 uppercase">
                      {t.outOfStock}
                    </span>
                  )}
                </div>
                <div className="inline-flex items-center border border-ds-border/60 bg-ds-info/10 rounded-full w-fit">
                  <button 
                    onClick={() => setQty(Math.max(1, qty - 1))} 
                    disabled={qty <= 1}
                    className="p-2.5 text-ds-text-secondary/70 hover:text-ds-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Minus size={14} strokeWidth={2.5} />
                  </button>
                  <span className="px-4 text-sm font-bold text-ds-text min-w-[2rem] text-center select-none">
                    {qty}
                  </span>
                  <button 
                    onClick={() => setQty(qty + 1)} 
                    disabled={availableStock !== null && qty >= availableStock}
                    className="p-2.5 text-ds-text-secondary/70 hover:text-ds-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Primary Add to Cart Checkout Button */}
              <div className="pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={availableStock === 0}
                  className={`w-full text-white text-xs font-bold tracking-wider py-4 rounded-full transition-all duration-200 shadow-md uppercase text-center flex items-center justify-center gap-2 ${
                    availableStock === 0
                      ? 'bg-ds-text/40 cursor-not-allowed'
                      : 'bg-ds-text hover:bg-ds-text/90 active:scale-95'
                  }`}
                >
                  <ShoppingBag size={16} />
                  {availableStock === 0 ? t.outOfStock : t.addToCart}
                </button>
              </div>

              {/* Save & Share Outlined Pill Buttons */}
              <div className="flex gap-4">
                <button 
                  onClick={handleWishlistToggle}
                  className="flex-1 border border-ds-border/85 hover:border-ds-text/30 hover:bg-ds-info/10 rounded-full py-3.5 px-6 flex items-center justify-center gap-2 text-xs font-bold text-ds-text uppercase tracking-wider transition-all duration-200"
                >
                  <Heart size={16} fill={wished ? '#ef4444' : 'none'} stroke={wished ? '#ef4444' : 'currentColor'} className="transition-all duration-200" />
                  {t.save}
                </button>
                <button 
                  onClick={handleShare}
                  className="flex-1 border border-ds-border/85 hover:border-ds-text/30 hover:bg-ds-info/10 rounded-full py-3.5 px-6 flex items-center justify-center gap-2 text-xs font-bold text-ds-text uppercase tracking-wider transition-all duration-200"
                >
                  <Share2 size={16} />
                  {t.share}
                </button>
              </div>

              {/* Description Accordion */}
              {description && (
                <div className="border-t border-ds-border/30 pt-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ds-text mb-2">
                    {language === 'bg' ? 'Описание' : 'Description'}
                  </h3>
                  <p className={`text-xs text-ds-text-secondary leading-relaxed ${isDescExpanded ? '' : 'line-clamp-3'}`}>
                    {description}
                  </p>
                  <button 
                    onClick={() => setIsDescExpanded(!isDescExpanded)}
                    className="text-[11px] text-ds-gold font-bold hover:underline mt-2 flex items-center gap-1"
                  >
                    {isDescExpanded ? t.viewLess : t.viewMore}
                  </button>
                </div>
              )}

              {/* Delivery & Returns Info Card */}
              <div className="border border-ds-border/40 bg-ds-info/10 rounded-3xl p-4 flex flex-col space-y-3 shadow-sm">
                <div className="flex items-center gap-2.5 text-xs text-ds-text-secondary">
                  <Truck size={16} className="text-ds-gold shrink-0 animate-pulse" />
                  <span>{language === 'bg' ? 'Връщанията се приемат в рамките на 14 дни' : 'Returns accepted within 14 days'}</span>
                </div>
                <button 
                  onClick={() => setIsRefundExpanded(!isRefundExpanded)}
                  className="w-full bg-white border border-ds-border/60 hover:bg-ds-info/20 text-[11px] font-bold text-ds-text py-2.5 rounded-xl transition-all"
                >
                  {t.refundPolicy}
                </button>
                {isRefundExpanded && (
                  <p className="text-[11px] text-ds-text-secondary leading-normal pt-1 pl-1 animate-fade-in">
                    {t.refundText}
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* Mocked Related Products Section (Alo Yoga style) */}
          <section className="mt-16 border-t border-ds-border/60 pt-12">
            <h2 className="font-serif-display text-2xl text-ds-text mb-8 text-center sm:text-left">
              {language === 'bg' ? 'Може да харесате също' : 'More from DS-Fashion'}
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
              {mockRelatedProducts.map((p) => {
                const priceBgn = p.price * 1.95;
                return (
                  <Link 
                    key={p.id}
                    href={`/products/${id}`}
                    className="w-[180px] sm:w-[220px] shrink-0 snap-start bg-ds-card border border-ds-border/40 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="aspect-[4/5] rounded-xl overflow-hidden bg-white flex items-center justify-center p-2 mb-3 relative">
                      <img src={p.images[0]} alt={p.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" />
                      {p.isOnSale && (
                        <span className="absolute top-2 left-2 bg-ds-error text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase">SALE</span>
                      )}
                    </div>
                    <h3 className="text-xs font-bold text-ds-text truncate uppercase tracking-wider">{p.name}</h3>
                    <div className="flex items-baseline gap-1.5 mt-1 flex-wrap">
                      <span className="text-xs font-extrabold text-ds-gold">€{p.price.toFixed(2)}</span>
                      <span className="text-[10px] text-ds-text-secondary/55">({priceBgn.toFixed(2)} лв.)</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

        </div>
      </div>

      {/* Floating Share Link Copied Toast Notification */}
      {shareToast && (
        <div className="fixed bottom-[calc(2rem+env(safe-area-inset-bottom,0px))] left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-[11px] font-bold px-6 py-3 rounded-full shadow-lg z-50 animate-fade-in flex items-center gap-2 select-none">
          {shareToast}
        </div>
      )}

      {/* Embedded slide-in animation rules */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        body {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </PublicPageLayout>
  );
}

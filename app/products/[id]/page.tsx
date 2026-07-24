'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Heart, Minus, Plus, ShoppingBag, Truck, ChevronDown, ChevronUp, Share2, Star, Sliders } from 'lucide-react';
import PublicPageLayout from '@/components/PublicPageLayout';
import ProductCard from '@/components/ProductCard';
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

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { language } = useLanguage();
  const t = pageTranslations[language];
  const { addItem, openCart } = useCart();
  const { settings } = useStoreSettings();

  const [isAdmin, setIsAdmin] = useState(false);
  const [product, setProduct] = useState<StorefrontProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainImg, setMainImg] = useState(0);

  // Variant & characteristics state
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [displayImages, setDisplayImages] = useState<string[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [rawVariants, setRawVariants] = useState<any[]>([]);
  const [rawProductData, setRawProductData] = useState<any | null>(null);

  const [qty, setQty] = useState(1);
  const [wished, setWished] = useState(false);

  // Accordions and toasts
  const [description, setDescription] = useState<string>('');
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [isRefundExpanded, setIsRefundExpanded] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);

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
                initialOpts[name.toLowerCase()] = val;
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

          const initialImgs = (primaryVar?.images && primaryVar.images.length > 0)
            ? primaryVar.images
            : (primaryVar?.imageurl)
            ? [primaryVar.imageurl]
            : (colorImgs && colorImgs.length > 0)
            ? colorImgs
            : (sf.images.length > 0 ? sf.images : ['/hero-home.png']);

          setDisplayImages(initialImgs);
          setMainImg(0);
        } else {
          setProduct(null);
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (product) {
      document.title = `${product.name} - ${settings?.storename || STORE_NAME}`;
    } else if (loading) {
      document.title = `${t.loading} - ${settings?.storename || STORE_NAME}`;
    } else {
      document.title = t.productNotFound;
    }
  }, [product, loading, t.productNotFound, t.loading, settings?.storename]);

  const handleOptionSelect = (optionKey: string, value: string) => {
    const keyLower = optionKey.toLowerCase();
    const updatedOptions = { ...selectedOptions, [keyLower]: value };
    setSelectedOptions(updatedOptions);

    let activeColorName = selectedColor;
    if (['color', 'colour', 'цвят'].includes(keyLower)) {
      activeColorName = value;
      setSelectedColor(value);
    }
    if (['size', 'размер'].includes(keyLower)) {
      setSelectedSize(value);
    }

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
          if (name && val) vOpts[name.toLowerCase()] = val;
        });

        return Object.entries(updatedOptions).every(([k, val]) => {
          if (!vOpts[k]) return true;
          return vOpts[k].toLowerCase() === val.toLowerCase();
        });
      });

      const activeColorKey = activeColorName ? activeColorName.trim().toLowerCase() : '';
      const fallbackColorImgs = activeColorKey && product?.colorImages?.[activeColorKey] ? product.colorImages[activeColorKey] : null;

      if (match) {
        setSelectedVariant(match);

        const varImgs = (match.images && match.images.length > 0)
          ? match.images
          : match.imageurl
          ? [match.imageurl]
          : (fallbackColorImgs && fallbackColorImgs.length > 0)
          ? fallbackColorImgs
          : null;

        if (varImgs && varImgs.length > 0) {
          setDisplayImages(varImgs);
          setMainImg(0);
        } else if (product?.images && product.images.length > 0) {
          setDisplayImages(product.images);
        }
      } else if (fallbackColorImgs && fallbackColorImgs.length > 0) {
        setDisplayImages(fallbackColorImgs);
        setMainImg(0);
      }
    }
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
  const activeImages = displayImages.length > 0 ? displayImages : product.images;

  const triggerFlyToCart = (startEl: HTMLElement) => {
    const destEl = document.getElementById('header-cart-icon');
    if (!destEl) return;

    const startRect = startEl.getBoundingClientRect();
    const destRect = destEl.getBoundingClientRect();

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
      const destX = destRect.left + destRect.width / 2 - 22;
      const destY = destRect.top + destRect.height / 2 - 22;
      
      flyer.style.left = `${destX}px`;
      flyer.style.top = `${destY}px`;
      flyer.style.transform = 'scale(0.3) rotate(360deg)';
      flyer.style.opacity = '0.1';
    });

    setTimeout(() => {
      flyer.remove();
      destEl.classList.add('animate-cart-bounce-scale');
      setTimeout(() => {
        destEl.classList.remove('animate-cart-bounce-scale');
      }, 450);
    }, 950);
  };

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
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
            <div className="lg:col-span-7">
              
              {/* Mobile Swipeable Image Carousel (peeking next image) */}
              <div 
                className="flex md:hidden gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 w-full"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {activeImages.map((img, i) => (
                  <div 
                    key={i} 
                    className={`${
                      activeImages.length > 1 ? 'w-[82vw] sm:w-[86vw]' : 'w-full'
                    } aspect-[4/5] bg-white rounded-3xl border border-ds-border/30 overflow-hidden flex items-center justify-center p-4 shrink-0 snap-center shadow-sm`}
                  >
                    <img 
                      src={img} 
                      alt="" 
                      className="max-h-full max-w-full object-contain rounded-2xl" 
                    />
                  </div>
                ))}
              </div>

              {/* Desktop gallery: Vertical thumbnails + Main active image */}
              <div className="hidden md:flex flex-row gap-4 flex-1">
                {activeImages.length > 1 && (
                  <div className="flex flex-col gap-3 w-[76px] shrink-0">
                    {activeImages.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setMainImg(i)}
                        className={`w-[72px] h-[72px] rounded-2xl overflow-hidden border-2 transition-all duration-200 shrink-0 ${
                          mainImg === i 
                            ? 'border-ds-text scale-95 shadow-md ring-2 ring-ds-text/10' 
                            : 'border-ds-border/40 hover:border-ds-text/30'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="relative flex-1 aspect-square bg-white rounded-3xl border border-ds-border/30 overflow-hidden flex items-center justify-center p-6 shadow-sm transition-all duration-300 hover:shadow-md">
                  <img 
                    src={activeImages[mainImg] || activeImages[0]} 
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
                </div>
              </div>

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
                      const isSelected = selectedSize?.toLowerCase() === s.toLowerCase();
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleOptionSelect('size', s)}
                          className={`text-xs px-4 py-2 border-2 rounded-full font-bold transition-all duration-200 ${
                            isSelected
                              ? 'border-ds-text bg-ds-text text-white shadow-sm scale-95 ring-2 ring-ds-text/20' 
                              : 'border-ds-border/60 hover:border-ds-text/40 text-ds-text-secondary hover:text-ds-text'
                          }`}
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
                <span className="text-xs font-bold uppercase tracking-wider text-ds-text">
                  {t.quantity}
                </span>
                <div className="inline-flex items-center border border-ds-border/60 bg-ds-info/10 rounded-full w-fit">
                  <button 
                    onClick={() => setQty(Math.max(1, qty - 1))} 
                    className="p-2.5 text-ds-text-secondary/70 hover:text-ds-text transition-colors"
                  >
                    <Minus size={14} strokeWidth={2.5} />
                  </button>
                  <span className="px-4 text-sm font-bold text-ds-text min-w-[2rem] text-center select-none">
                    {qty}
                  </span>
                  <button 
                    onClick={() => setQty(qty + 1)} 
                    className="p-2.5 text-ds-text-secondary/70 hover:text-ds-text transition-colors"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Primary Add to Cart Checkout Button */}
              <div className="pt-2">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-ds-text hover:bg-ds-text/90 text-white text-xs font-bold tracking-wider py-4 rounded-full transition-all duration-200 active:scale-95 shadow-md uppercase text-center flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={16} />
                  {t.addToCart}
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
                    href={`/products/${id}`} // Mock link redirects back to this product page safely
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

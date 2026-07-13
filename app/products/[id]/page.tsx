'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Heart, Minus, Plus, ShoppingBag } from 'lucide-react';
import PublicPageLayout from '@/components/PublicPageLayout';
import ProductCard from '@/components/ProductCard';
import TrustBar from '@/components/TrustBar';
import { toStorefrontProduct, type StorefrontProduct } from '@/lib/storefront-products';
import { rfTypePath } from '@/lib/rf-product-type-routes';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/price-formatter';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [isAdmin, setIsAdmin] = useState(false);
  const [product, setProduct] = useState<StorefrontProduct | null>(null);
  const [related, setRelated] = useState<StorefrontProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [mainImg, setMainImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [wished, setWished] = useState(false);
  const { addItem, openCart } = useCart();

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
          const sf = toStorefrontProduct({
            ...data.product,
            variants: data.product.Variants || data.product.variants,
            images: (data.product.Images || data.product.images || []).map((img: { imageurl?: string } | string) =>
              typeof img === 'string' ? img : img.imageurl
            ).filter(Boolean),
          });
          setProduct(sf);
          if (sf.sizes[0]) setSelectedSize(sf.sizes[0]);
        } else {
          setProduct(null);
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));

    fetch(`/api/products/${id}/related`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setRelated((data.products || []).map(toStorefrontProduct).slice(0, 5));
        }
      })
      .catch(() => setRelated([]));
  }, [id]);

  if (loading) {
    return (
      <PublicPageLayout isAdmin={isAdmin} setIsAdmin={handleSetIsAdmin}>
        <div className="min-h-[50vh] flex items-center justify-center text-ds-text-muted">Зареждане...</div>
      </PublicPageLayout>
    );
  }

  if (!product) {
    return (
      <PublicPageLayout isAdmin={isAdmin} setIsAdmin={handleSetIsAdmin}>
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-ds-text-muted">
          <p>Продуктът не е намерен</p>
          <Link href="/products" className="text-ds-gold hover:underline">Към магазина</Link>
        </div>
      </PublicPageLayout>
    );
  }

  const categoryPath = product.rfproducttypeid ? rfTypePath(product.rfproducttypeid) : '/products';

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      brand: '',
      model: product.name,
      color: product.colors[0]?.name || '',
      price: product.price,
      imageUrl: product.images[0],
      category: 'clothes',
      size: selectedSize || undefined,
      quantity: qty,
    });
    openCart();
  };

  return (
    <PublicPageLayout isAdmin={isAdmin} setIsAdmin={handleSetIsAdmin}>
      <div className="bg-ds-main min-h-screen">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-1.5 text-[11px] text-ds-text-muted mb-6 flex-wrap">
            <Link href="/" className="hover:text-ds-gold">Начало</Link>
            <span>/</span>
            <Link href={categoryPath} className="hover:text-ds-gold">Категория</Link>
            <span>/</span>
            <span className="text-ds-text">{product.name}</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 bg-ds-card border border-ds-border p-6 sm:p-8">
            <div className="flex gap-3">
              <div className="hidden sm:flex flex-col gap-2 w-[72px] shrink-0">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImg(i)}
                    className={`aspect-square overflow-hidden border-2 transition-colors ${
                      mainImg === i ? 'border-ds-gold' : 'border-ds-border hover:border-ds-gold'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <div className="relative flex-1 aspect-[4/5] overflow-hidden bg-ds-image border border-ds-border">
                <img src={product.images[mainImg]} alt={product.name} className="w-full h-full object-cover" />
                {product.isNew && (
                  <span className="absolute top-4 left-4 bg-ds-info text-ds-gold border border-ds-border text-[10px] font-bold tracking-widest px-3 py-1.5 uppercase">НОВО</span>
                )}
                {product.isOnSale && (
                  <span className="absolute top-4 left-4 bg-ds-error text-white text-[10px] font-bold tracking-widest px-3 py-1.5 uppercase">SALE</span>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-start justify-between gap-4">
                <h1 className="font-serif-display text-2xl sm:text-3xl text-ds-text leading-tight">{product.name}</h1>
                <button onClick={() => setWished(!wished)} className="p-2 border border-ds-border rounded-full shrink-0">
                  <Heart size={20} fill={wished ? '#B98236' : 'none'} stroke="#B98236" />
                </button>
              </div>

              <div className="flex items-baseline gap-3 mt-4 flex-wrap">
                {formatPrice(product.price, 'text-2xl font-semibold text-ds-gold')}
                {product.isOnSale && product.compareAtPrice != null && (
                  <span className="text-lg text-ds-text-muted line-through">{product.compareAtPrice.toFixed(2)} €</span>
                )}
              </div>

              {product.colors.length > 0 && (
                <div className="mt-6">
                  <p className="text-[12px] font-bold tracking-wide text-ds-text mb-2">Цвят</p>
                  <div className="flex flex-wrap gap-2.5">
                    {product.colors.map((c) => (
                      <span
                        key={c.hex + c.name}
                        title={c.name}
                        className="w-6 h-6 rounded-full border-2 border-ds-border"
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {product.sizes.length > 0 && (
                <div className="mt-6">
                  <p className="text-[12px] font-bold tracking-wide text-ds-text mb-2">Размер</p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`text-[12px] px-4 py-2 border font-medium transition-colors ${
                          selectedSize === s ? 'border-ds-gold bg-ds-gold text-white' : 'border-ds-border hover:border-ds-gold'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 mt-8">
                <div className="flex items-center border border-ds-border">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 hover:bg-ds-main"><Minus size={16} /></button>
                  <span className="px-4 text-sm font-medium">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="p-3 hover:bg-ds-main"><Plus size={16} /></button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-ds-gold hover:bg-ds-gold-dark text-white text-[12px] font-bold tracking-widest py-3.5 uppercase flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={16} />
                  ДОБАВИ В КОЛИЧКАТА
                </button>
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <section className="mt-12">
              <h2 className="font-serif-display text-xl text-ds-text mb-6">Подобни продукти</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
        <TrustBar />
      </div>
    </PublicPageLayout>
  );
}

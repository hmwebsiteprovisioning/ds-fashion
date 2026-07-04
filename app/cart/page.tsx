'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, Trash2, Heart, Truck, Shield, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PublicPageLayout from '@/components/PublicPageLayout';
import ProductCard from '@/components/ProductCard';
import { MOCK_PRODUCTS, MOCK_CART_ITEMS } from '@/lib/mock-data';

type CartEntry = {
  id: string;
  productId: string;
  name: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
};

const CROSS_SELL = MOCK_PRODUCTS.filter(p => ['a1', 'a2', 'm2', 'm6'].includes(p.id));

export default function CartPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const handleSetIsAdmin = (v: boolean) => { setIsAdmin(v); localStorage.setItem('isAdmin', v.toString()); };

  const [items, setItems] = useState<CartEntry[]>(MOCK_CART_ITEMS);
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponError, setCouponError] = useState('');

  const updateQty = (id: string, delta: number) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };
  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const delivery = subtotal >= 100 ? 0 : 9.90;
  const discount = appliedCoupon === 'SAVE10' ? subtotal * 0.10 : 0;
  const total = subtotal + delivery - discount;

  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'SAVE10') {
      setAppliedCoupon('SAVE10');
      setCouponError('');
    } else {
      setCouponError('Невалиден код за отстъпка');
    }
  };

  return (
    <PublicPageLayout isAdmin={isAdmin} setIsAdmin={handleSetIsAdmin}>
      <div className="bg-ds-main min-h-screen">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

          <h1 className="font-serif-display text-3xl sm:text-4xl text-ds-text mb-2">Количка</h1>
          <p className="text-[13px] text-ds-text-muted mb-8">{items.length} артикул{items.length !== 1 ? 'а' : ''}</p>

          {items.length === 0 ? (
            <div className="text-center py-20 bg-ds-card">
              <p className="text-[15px] text-ds-text-secondary mb-6">Количката ви е празна</p>
              <Link
                href="/products"
                className="inline-flex items-center px-8 py-3.5 bg-ds-gold text-white text-[12px] font-bold tracking-widest uppercase hover:bg-[#9C6A2D] transition-colors"
              >
                ПРОДЪЛЖИ ПАЗАРУВАНЕТО
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[1fr_380px] gap-8">
              {/* Cart items */}
              <div className="bg-ds-card border border-ds-border shadow-ds-card">
                <div className="divide-y divide-ds-border">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-4 p-5 sm:p-6">
                      <Link href={`/products/${item.productId}`} className="shrink-0 w-[90px] sm:w-[110px] aspect-[3/4] overflow-hidden bg-ds-image">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-2">
                          <Link href={`/products/${item.productId}`}>
                            <h3 className="text-[14px] font-medium text-ds-text hover:text-ds-gold transition-colors">{item.name}</h3>
                          </Link>
                          <p className="text-[14px] font-bold text-ds-text shrink-0">
                            {(item.price * item.quantity).toFixed(2)} лв.
                          </p>
                        </div>
                        <p className="text-[12px] text-ds-text-muted mt-1">
                          Цвят: {item.color} &nbsp;·&nbsp; Размер: {item.size}
                        </p>
                        <div className="flex items-center justify-between mt-4">
                          <div className="inline-flex items-center border border-ds-border">
                            <button onClick={() => updateQty(item.id, -1)} className="px-3 py-2 hover:bg-ds-main">
                              <Minus size={13} />
                            </button>
                            <span className="px-4 text-[13px] font-medium">{item.quantity}</span>
                            <button onClick={() => updateQty(item.id, 1)} className="px-3 py-2 hover:bg-ds-main">
                              <Plus size={13} />
                            </button>
                          </div>
                          <button onClick={() => removeItem(item.id)} className="p-1.5 hover:text-ds-error transition-colors text-ds-text-muted">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-5 sm:px-6 py-4 border-t border-[#f0ebe3]">
                  <button className="flex items-center gap-2 text-[12px] text-ds-text-secondary hover:text-ds-gold transition-colors">
                    <Heart size={14} />
                    Запази количката за по-късно
                  </button>
                </div>
              </div>

              {/* Order summary */}
              <div>
                <div className="bg-ds-card border border-ds-border shadow-ds-card p-6 sm:p-7">
                  <h2 className="font-serif-display text-xl text-ds-text mb-5">Обобщение на поръчката</h2>

                  <div className="space-y-3 text-[13px] mb-5">
                    <div className="flex justify-between">
                      <span className="text-ds-text-secondary">Междинна сума</span>
                      <span className="text-ds-text font-medium">{subtotal.toFixed(2)} лв.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ds-text-secondary">Доставка</span>
                      <span className="text-ds-text font-medium">{delivery === 0 ? 'Безплатна' : `${delivery.toFixed(2)} лв.`}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-ds-text-secondary">Отстъпка ({appliedCoupon})</span>
                        <span className="text-ds-success font-medium">-{discount.toFixed(2)} лв.</span>
                      </div>
                    )}
                  </div>

                  {/* Coupon */}
                  <div className="mb-5">
                    <p className="text-[12px] font-bold tracking-wide text-ds-text mb-2">Имаш код за отстъпка?</p>
                    <div className="flex gap-0">
                      <input
                        type="text"
                        value={coupon}
                        onChange={e => setCoupon(e.target.value)}
                        placeholder="Въведи код"
                        className="flex-1 px-3 py-2.5 border border-ds-border text-[12px] text-ds-text placeholder-ds-text-muted outline-none focus:border-ds-gold"
                      />
                      <button
                        onClick={applyCoupon}
                        className="border border-ds-gold bg-transparent text-ds-gold text-[11px] font-bold tracking-widest px-4 uppercase hover:bg-ds-gold hover:text-white transition-colors"
                      >
                        ПРИЛОЖИ
                      </button>
                    </div>
                    {couponError && <p className="text-[11px] text-red-500 mt-1">{couponError}</p>}
                  </div>

                  <div className="border-t border-ds-border pt-4 mb-6">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[14px] font-bold text-ds-text">Крайна сума</span>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-ds-gold">{total.toFixed(2)} лв.</p>
                        <p className="text-[11px] text-ds-text-muted">С включен ДДС</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push('/checkout')}
                    className="w-full bg-ds-gold hover:bg-ds-gold-dark text-white text-[13px] font-bold tracking-widest py-4 uppercase transition-colors mb-4"
                  >
                    ПРОДЪЛЖИ КЪМ CHECKOUT
                  </button>

                  {/* Trust row */}
                  <div className="space-y-2.5 mt-4 pt-4 border-t border-[#f0ebe3]">
                    {[
                      { Icon: Truck, text: 'Безплатна доставка над 100 лв.' },
                      { Icon: Shield, text: 'Сигурно плащане 100% защита' },
                      { Icon: RotateCcw, text: 'Лесно връщане до 14 дни' },
                    ].map(({ Icon, text }) => (
                      <div key={text} className="flex items-center gap-2.5 text-[12px] text-ds-text-secondary">
                        <Icon size={14} className="text-ds-gold shrink-0" />
                        {text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cross-sell */}
          <section className="mt-12">
            <h2 className="font-serif-display text-2xl text-ds-text mb-6">Може да харесаш още</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {CROSS_SELL.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </PublicPageLayout>
  );
}

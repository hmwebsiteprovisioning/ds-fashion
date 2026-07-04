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
      <div className="bg-[#faf8f5] min-h-screen">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

          <h1 className="font-serif-display text-3xl sm:text-4xl text-[#1a1a1a] mb-2">Количка</h1>
          <p className="text-[13px] text-[#9e9e9e] mb-8">{items.length} артикул{items.length !== 1 ? 'а' : ''}</p>

          {items.length === 0 ? (
            <div className="text-center py-20 bg-white">
              <p className="text-[15px] text-[#6b6b6b] mb-6">Количката ви е празна</p>
              <Link
                href="/products"
                className="inline-flex items-center px-8 py-3.5 bg-[#c49a3c] text-white text-[12px] font-bold tracking-widest uppercase hover:bg-[#a07c28] transition-colors"
              >
                ПРОДЪЛЖИ ПАЗАРУВАНЕТО
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[1fr_380px] gap-8">
              {/* Cart items */}
              <div className="bg-white">
                <div className="divide-y divide-[#f0ebe3]">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-4 p-5 sm:p-6">
                      <Link href={`/products/${item.productId}`} className="shrink-0 w-[90px] sm:w-[110px] aspect-[3/4] overflow-hidden bg-[#f5f0eb]">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-2">
                          <Link href={`/products/${item.productId}`}>
                            <h3 className="text-[14px] font-medium text-[#1a1a1a] hover:text-[#c49a3c] transition-colors">{item.name}</h3>
                          </Link>
                          <p className="text-[14px] font-bold text-[#1a1a1a] shrink-0">
                            {(item.price * item.quantity).toFixed(2)} лв.
                          </p>
                        </div>
                        <p className="text-[12px] text-[#9e9e9e] mt-1">
                          Цвят: {item.color} &nbsp;·&nbsp; Размер: {item.size}
                        </p>
                        <div className="flex items-center justify-between mt-4">
                          <div className="inline-flex items-center border border-[#e8e0d5]">
                            <button onClick={() => updateQty(item.id, -1)} className="px-3 py-2 hover:bg-[#f5f0eb]">
                              <Minus size={13} />
                            </button>
                            <span className="px-4 text-[13px] font-medium">{item.quantity}</span>
                            <button onClick={() => updateQty(item.id, 1)} className="px-3 py-2 hover:bg-[#f5f0eb]">
                              <Plus size={13} />
                            </button>
                          </div>
                          <button onClick={() => removeItem(item.id)} className="p-1.5 hover:text-red-500 transition-colors text-[#9e9e9e]">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-5 sm:px-6 py-4 border-t border-[#f0ebe3]">
                  <button className="flex items-center gap-2 text-[12px] text-[#6b6b6b] hover:text-[#c49a3c] transition-colors">
                    <Heart size={14} />
                    Запази количката за по-късно
                  </button>
                </div>
              </div>

              {/* Order summary */}
              <div>
                <div className="bg-white p-6 sm:p-7">
                  <h2 className="font-serif-display text-xl text-[#1a1a1a] mb-5">Обобщение на поръчката</h2>

                  <div className="space-y-3 text-[13px] mb-5">
                    <div className="flex justify-between">
                      <span className="text-[#6b6b6b]">Междинна сума</span>
                      <span className="text-[#1a1a1a] font-medium">{subtotal.toFixed(2)} лв.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b6b6b]">Доставка</span>
                      <span className="text-[#1a1a1a] font-medium">{delivery === 0 ? 'Безплатна' : `${delivery.toFixed(2)} лв.`}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-[#6b6b6b]">Отстъпка ({appliedCoupon})</span>
                        <span className="text-green-600 font-medium">-{discount.toFixed(2)} лв.</span>
                      </div>
                    )}
                  </div>

                  {/* Coupon */}
                  <div className="mb-5">
                    <p className="text-[12px] font-bold tracking-wide text-[#1a1a1a] mb-2">Имаш код за отстъпка?</p>
                    <div className="flex gap-0">
                      <input
                        type="text"
                        value={coupon}
                        onChange={e => setCoupon(e.target.value)}
                        placeholder="Въведи код"
                        className="flex-1 px-3 py-2.5 border border-[#e8e0d5] text-[12px] text-[#1a1a1a] placeholder-[#c0b8b0] outline-none focus:border-[#c49a3c]"
                      />
                      <button
                        onClick={applyCoupon}
                        className="bg-[#1a1a1a] text-white text-[11px] font-bold tracking-widest px-4 uppercase hover:bg-[#333] transition-colors"
                      >
                        ПРИЛОЖИ
                      </button>
                    </div>
                    {couponError && <p className="text-[11px] text-red-500 mt-1">{couponError}</p>}
                  </div>

                  <div className="border-t border-[#e8e0d5] pt-4 mb-6">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[14px] font-bold text-[#1a1a1a]">Крайна сума</span>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#1a1a1a]">{total.toFixed(2)} лв.</p>
                        <p className="text-[11px] text-[#9e9e9e]">С включен ДДС</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push('/checkout')}
                    className="w-full bg-[#c49a3c] hover:bg-[#a07c28] text-white text-[13px] font-bold tracking-widest py-4 uppercase transition-colors mb-4"
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
                      <div key={text} className="flex items-center gap-2.5 text-[12px] text-[#6b6b6b]">
                        <Icon size={14} className="text-[#c49a3c] shrink-0" />
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
            <h2 className="font-serif-display text-2xl text-[#1a1a1a] mb-6">Може да харесаш още</h2>
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

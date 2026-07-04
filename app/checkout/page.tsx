'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ShoppingBag, Shield, Truck, RotateCcw, Headphones, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { MOCK_CART_ITEMS } from '@/lib/mock-data';
import { STORE_NAME } from '@/lib/branding';
import { getLogoUrl } from '@/lib/branding';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import Image from 'next/image';

type Step = 1 | 2 | 3 | 4;

const STEPS = [
  { id: 1, label: 'Данни' },
  { id: 2, label: 'Доставка' },
  { id: 3, label: 'Плащане' },
  { id: 4, label: 'Потвърждение' },
];

const DELIVERY_OPTIONS = [
  { id: 'standard', label: 'Стандартна доставка', sub: '2–3 работни дни', price: 0, icon: '🚚' },
  { id: 'express', label: 'Експресна доставка', sub: '1 работен ден', price: 9.90, icon: '⚡' },
  { id: 'office', label: 'До офис на Еконт', sub: '2–3 работни дни', price: 4.90, icon: '📦' },
];

const PAYMENT_OPTIONS = [
  { id: 'card', label: 'Плащане с карта', sub: 'Visa, Mastercard, Maestro', icon: '💳' },
  { id: 'cod', label: 'Наложен платеж', sub: 'Плащане при доставка', icon: '💵' },
  { id: 'bank', label: 'Банков превод', sub: 'Плащане по банкови път', icon: '🏦' },
];

const items = MOCK_CART_ITEMS;

export default function CheckoutPage() {
  const router = useRouter();
  const { settings } = useStoreSettings();
  const logoUrl = getLogoUrl(settings?.logourl);
  const storeName = settings?.storename || STORE_NAME;

  const [step, setStep] = useState<Step>(1);
  const [delivery, setDelivery] = useState('standard');
  const [payment, setPayment] = useState('card');
  const [coupon, setCoupon] = useState('');
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    country: 'България', city: '', address: '', postcode: '',
    newsletter: false,
  });

  const selected = DELIVERY_OPTIONS.find(d => d.id === delivery)!;
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryCost = selected.price;
  const total = subtotal + deliveryCost;

  const setField = (field: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const goNext = () => setStep(s => Math.min(4, s + 1) as Step);
  const goBack = () => setStep(s => Math.max(1, s - 1) as Step);

  const submitOrder = () => {
    router.push('/checkout/success?orderId=DS-' + Date.now().toString(36).toUpperCase());
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col">
      {/* Checkout header */}
      <header className="bg-white border-b border-[#e8e0d5]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/cart" className="flex items-center gap-1.5 text-[12px] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors">
            <ChevronLeft size={16} />
            Върни се към магазина
          </Link>
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <Image src={logoUrl} alt={storeName} width={100} height={32} className="h-7 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-1.5 text-[12px] text-[#6b6b6b]">
            <ShoppingBag size={15} />
            Сигурна поръчка
          </div>
        </div>
      </header>

      {/* Step indicator */}
      <div className="bg-white border-b border-[#e8e0d5]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-0 py-4">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <button
                  onClick={() => s.id < step && setStep(s.id as Step)}
                  className="flex items-center gap-2"
                  disabled={s.id > step}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold border-2 transition-colors ${
                      step > s.id
                        ? 'bg-[#c49a3c] border-[#c49a3c] text-white'
                        : step === s.id
                        ? 'bg-[#1a1a1a] border-[#1a1a1a] text-white'
                        : 'bg-white border-[#e8e0d5] text-[#9e9e9e]'
                    }`}
                  >
                    {step > s.id ? <Check size={13} /> : s.id}
                  </span>
                  <span
                    className={`text-[12px] font-medium hidden sm:inline ${
                      step === s.id ? 'text-[#1a1a1a]' : step > s.id ? 'text-[#c49a3c]' : 'text-[#9e9e9e]'
                    }`}
                  >
                    {s.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`w-8 sm:w-14 h-px mx-2 sm:mx-3 ${step > s.id ? 'bg-[#c49a3c]' : 'bg-[#e8e0d5]'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-[1fr_380px] gap-8">

          {/* Left: Form */}
          <div className="space-y-6">

            {/* Step 1: Customer data */}
            {step === 1 && (
              <div className="bg-white p-6 sm:p-8">
                <h2 className="font-serif-display text-xl text-[#1a1a1a] mb-6">Данни за клиента</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-medium text-[#1a1a1a] mb-1.5">Име *</label>
                      <input value={form.firstName} onChange={e => setField('firstName', e.target.value)}
                        placeholder="Въведи име"
                        className="w-full border border-[#e8e0d5] px-3.5 py-2.5 text-[13px] text-[#1a1a1a] placeholder-[#c0b8b0] outline-none focus:border-[#c49a3c]" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-[#1a1a1a] mb-1.5">Фамилия *</label>
                      <input value={form.lastName} onChange={e => setField('lastName', e.target.value)}
                        placeholder="Въведи фамилия"
                        className="w-full border border-[#e8e0d5] px-3.5 py-2.5 text-[13px] text-[#1a1a1a] placeholder-[#c0b8b0] outline-none focus:border-[#c49a3c]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-medium text-[#1a1a1a] mb-1.5">Имейл адрес *</label>
                      <input type="email" value={form.email} onChange={e => setField('email', e.target.value)}
                        placeholder="Въведи имейл адрес"
                        className="w-full border border-[#e8e0d5] px-3.5 py-2.5 text-[13px] text-[#1a1a1a] placeholder-[#c0b8b0] outline-none focus:border-[#c49a3c]" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-[#1a1a1a] mb-1.5">Телефон *</label>
                      <input type="tel" value={form.phone} onChange={e => setField('phone', e.target.value)}
                        placeholder="Въведи телефон"
                        className="w-full border border-[#e8e0d5] px-3.5 py-2.5 text-[13px] text-[#1a1a1a] placeholder-[#c0b8b0] outline-none focus:border-[#c49a3c]" />
                    </div>
                  </div>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={form.newsletter}
                      onChange={e => setField('newsletter', e.target.checked)}
                      className="w-4 h-4 accent-[#c49a3c]" />
                    <span className="text-[12px] text-[#6b6b6b]">Абонирай се за нашия бюлетин и получавай ексклузивни предложения и новини.</span>
                  </label>
                </div>

                <h2 className="font-serif-display text-xl text-[#1a1a1a] mt-8 mb-5">Адрес за доставка</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-medium text-[#1a1a1a] mb-1.5">Държава / Регион *</label>
                      <select value={form.country} onChange={e => setField('country', e.target.value)}
                        className="w-full border border-[#e8e0d5] px-3.5 py-2.5 text-[13px] text-[#1a1a1a] outline-none focus:border-[#c49a3c] bg-white">
                        <option>България</option>
                        <option>Румъния</option>
                        <option>Гърция</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-[#1a1a1a] mb-1.5">Град *</label>
                      <input value={form.city} onChange={e => setField('city', e.target.value)}
                        placeholder="Въведи град"
                        className="w-full border border-[#e8e0d5] px-3.5 py-2.5 text-[13px] text-[#1a1a1a] placeholder-[#c0b8b0] outline-none focus:border-[#c49a3c]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-[1fr_auto] gap-4">
                    <div>
                      <label className="block text-[12px] font-medium text-[#1a1a1a] mb-1.5">Адрес *</label>
                      <input value={form.address} onChange={e => setField('address', e.target.value)}
                        placeholder="Въведи адрес"
                        className="w-full border border-[#e8e0d5] px-3.5 py-2.5 text-[13px] text-[#1a1a1a] placeholder-[#c0b8b0] outline-none focus:border-[#c49a3c]" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-[#1a1a1a] mb-1.5">Пощ. код *</label>
                      <input value={form.postcode} onChange={e => setField('postcode', e.target.value)}
                        placeholder="1000"
                        className="w-[110px] border border-[#e8e0d5] px-3.5 py-2.5 text-[13px] text-[#1a1a1a] placeholder-[#c0b8b0] outline-none focus:border-[#c49a3c]" />
                    </div>
                  </div>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-[#c49a3c]" />
                    <span className="text-[12px] text-[#6b6b6b]">Доставка до различен адрес</span>
                  </label>
                </div>
              </div>
            )}

            {/* Step 2: Delivery */}
            {step === 2 && (
              <div className="bg-white p-6 sm:p-8">
                <h2 className="font-serif-display text-xl text-[#1a1a1a] mb-6">Метод на доставка</h2>
                <div className="space-y-3">
                  {DELIVERY_OPTIONS.map(opt => (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-4 p-4 border-2 cursor-pointer transition-colors ${
                        delivery === opt.id ? 'border-[#c49a3c] bg-[#fdf9f0]' : 'border-[#e8e0d5] hover:border-[#c49a3c]/50'
                      }`}
                    >
                      <input type="radio" name="delivery" value={opt.id} checked={delivery === opt.id}
                        onChange={() => setDelivery(opt.id)} className="accent-[#c49a3c]" />
                      <span className="text-xl">{opt.icon}</span>
                      <div className="flex-1">
                        <p className="text-[13px] font-medium text-[#1a1a1a]">{opt.label}</p>
                        <p className="text-[11px] text-[#9e9e9e]">{opt.sub}</p>
                      </div>
                      <p className="text-[13px] font-bold text-[#1a1a1a]">
                        {opt.price === 0 ? 'над 100 лв.' : `${opt.price.toFixed(2)} лв.`}
                      </p>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="bg-white p-6 sm:p-8">
                <h2 className="font-serif-display text-xl text-[#1a1a1a] mb-6">Метод на плащане</h2>
                <div className="space-y-3">
                  {PAYMENT_OPTIONS.map(opt => (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-4 p-4 border-2 cursor-pointer transition-colors ${
                        payment === opt.id ? 'border-[#c49a3c] bg-[#fdf9f0]' : 'border-[#e8e0d5] hover:border-[#c49a3c]/50'
                      }`}
                    >
                      <input type="radio" name="payment" value={opt.id} checked={payment === opt.id}
                        onChange={() => setPayment(opt.id)} className="accent-[#c49a3c]" />
                      <span className="text-xl">{opt.icon}</span>
                      <div className="flex-1">
                        <p className="text-[13px] font-medium text-[#1a1a1a]">{opt.label}</p>
                        <p className="text-[11px] text-[#9e9e9e]">{opt.sub}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <label className="flex items-start gap-2.5 mt-6 cursor-pointer">
                  <input type="checkbox" required className="w-4 h-4 accent-[#c49a3c] mt-0.5" />
                  <span className="text-[12px] text-[#6b6b6b]">
                    Съгласявам се с{' '}
                    <Link href="/about" className="text-[#c49a3c] underline">Общите условия</Link>
                    {' '}и{' '}
                    <Link href="/about" className="text-[#c49a3c] underline">Политиката за поверителност</Link>.
                  </span>
                </label>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
              <div className="bg-white p-6 sm:p-8 text-center">
                <div className="w-16 h-16 bg-[#fdf9f0] border-2 border-[#c49a3c] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={28} className="text-[#c49a3c]" />
                </div>
                <h2 className="font-serif-display text-2xl text-[#1a1a1a] mb-2">Поръчката е приета!</h2>
                <p className="text-[13px] text-[#6b6b6b]">Ще получите потвърждение на посочения имейл адрес.</p>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3">
              {step > 1 && step < 4 && (
                <button
                  onClick={goBack}
                  className="flex items-center gap-2 px-6 py-3.5 border border-[#e8e0d5] text-[12px] font-bold tracking-widest uppercase text-[#1a1a1a] hover:bg-[#f5f0eb] transition-colors"
                >
                  <ChevronLeft size={15} />
                  НАЗАД
                </button>
              )}
              {step < 3 && (
                <button
                  onClick={goNext}
                  className="flex-1 bg-[#c49a3c] hover:bg-[#a07c28] text-white text-[12px] font-bold tracking-widest py-3.5 uppercase transition-colors"
                >
                  ПРОДЪЛЖИ
                </button>
              )}
              {step === 3 && (
                <button
                  onClick={submitOrder}
                  className="flex-1 bg-[#c49a3c] hover:bg-[#a07c28] text-white text-[12px] font-bold tracking-widest py-3.5 uppercase transition-colors"
                >
                  ЗАВЪРШИ ПОРЪЧКАТА
                </button>
              )}
            </div>
          </div>

          {/* Right: Order summary */}
          <div>
            {/* Mobile toggle */}
            <button
              className="lg:hidden w-full flex items-center justify-between p-4 bg-white border border-[#e8e0d5] mb-4"
              onClick={() => setSummaryOpen(!summaryOpen)}
            >
              <span className="text-[13px] font-bold text-[#1a1a1a]">Вашата поръчка</span>
              {summaryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <div className={`bg-white p-6 sm:p-7 ${!summaryOpen ? 'hidden lg:block' : ''}`}>
              <h2 className="font-serif-display text-xl text-[#1a1a1a] mb-5 hidden lg:block">Вашата поръчка</h2>

              <div className="divide-y divide-[#f0ebe3] mb-5">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3 py-3">
                    <div className="w-12 h-14 overflow-hidden bg-[#f5f0eb] shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-[#1a1a1a] truncate">{item.name}</p>
                      <p className="text-[11px] text-[#9e9e9e]">Размер: {item.size} · Бр: {item.quantity}</p>
                    </div>
                    <p className="text-[12px] font-bold text-[#1a1a1a] shrink-0">
                      {(item.price * item.quantity).toFixed(2)} лв.
                    </p>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="mb-4">
                <button className="text-[12px] text-[#6b6b6b] hover:text-[#c49a3c] transition-colors flex items-center gap-1">
                  Имате код за отстъпка? <ChevronDown size={14} />
                </button>
                <div className="flex gap-0 mt-2">
                  <input
                    value={coupon}
                    onChange={e => setCoupon(e.target.value)}
                    placeholder="Въведи код"
                    className="flex-1 border border-[#e8e0d5] px-3 py-2 text-[12px] outline-none focus:border-[#c49a3c]"
                  />
                  <button className="bg-[#1a1a1a] text-white text-[11px] font-bold px-4 uppercase hover:bg-[#333] transition-colors">
                    ПРИЛОЖИ
                  </button>
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-2.5 text-[13px] border-t border-[#f0ebe3] pt-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-[#6b6b6b]">Междинна сума</span>
                  <span className="text-[#1a1a1a]">{subtotal.toFixed(2)} лв.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b6b6b]">Доставка</span>
                  <span className="text-[#1a1a1a]">{deliveryCost === 0 ? 'Безплатна' : `${deliveryCost.toFixed(2)} лв.`}</span>
                </div>
              </div>
              <div className="flex justify-between items-baseline pt-3 border-t border-[#e8e0d5] mb-6">
                <span className="text-[14px] font-bold text-[#1a1a1a]">Общо</span>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#c49a3c]">{total.toFixed(2)} лв.</p>
                  <p className="text-[10px] text-[#9e9e9e]">с ДДС</p>
                </div>
              </div>

              {/* Trust micro items */}
              <div className="space-y-2 border-t border-[#f0ebe3] pt-4">
                {[
                  { Icon: Shield, text: 'Сигурно плащане' },
                  { Icon: Truck, text: 'Безплатна доставка над 100 лв.' },
                  { Icon: RotateCcw, text: 'Лесно връщане до 14 дни' },
                  { Icon: Headphones, text: 'Поддръжка на клиенти' },
                ].map(({ Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-[11px] text-[#9e9e9e]">
                    <Icon size={13} className="text-[#c49a3c] shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

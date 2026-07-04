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
    <div className="min-h-screen bg-ds-main flex flex-col">
      {/* Checkout header */}
      <header className="bg-ds-card border-b border-ds-border">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/cart" className="flex items-center gap-1.5 text-[12px] text-ds-text-secondary hover:text-ds-text transition-colors">
            <ChevronLeft size={16} />
            Върни се към магазина
          </Link>
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <Image src={logoUrl} alt={storeName} width={100} height={32} className="h-7 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-1.5 text-[12px] text-ds-text-secondary">
            <ShoppingBag size={15} />
            Сигурна поръчка
          </div>
        </div>
      </header>

      {/* Step indicator */}
      <div className="bg-ds-card border-b border-ds-border">
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
                        ? 'bg-ds-success border-ds-success text-white'
                        : step === s.id
                        ? 'bg-ds-gold border-ds-gold text-white'
                        : 'bg-ds-card border-ds-border-strong text-ds-text-secondary'
                    }`}
                  >
                    {step > s.id ? <Check size={13} /> : s.id}
                  </span>
                  <span
                    className={`text-[12px] font-medium hidden sm:inline ${
                      step === s.id ? 'text-ds-text' : step > s.id ? 'text-ds-success' : 'text-ds-text-muted'
                    }`}
                  >
                    {s.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`w-8 sm:w-14 h-px mx-2 sm:mx-3 ${step > s.id ? 'bg-ds-success' : 'bg-ds-border'}`} />
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
              <div className="bg-ds-card border border-ds-border shadow-ds-soft p-6 sm:p-8">
                <h2 className="font-serif-display text-xl text-ds-text mb-6">Данни за клиента</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-medium text-ds-text mb-1.5">Име *</label>
                      <input value={form.firstName} onChange={e => setField('firstName', e.target.value)}
                        placeholder="Въведи име"
                        className="w-full border border-ds-border px-3.5 py-2.5 text-[13px] text-ds-text placeholder-ds-text-muted outline-none focus:border-ds-gold" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-ds-text mb-1.5">Фамилия *</label>
                      <input value={form.lastName} onChange={e => setField('lastName', e.target.value)}
                        placeholder="Въведи фамилия"
                        className="w-full border border-ds-border px-3.5 py-2.5 text-[13px] text-ds-text placeholder-ds-text-muted outline-none focus:border-ds-gold" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-medium text-ds-text mb-1.5">Имейл адрес *</label>
                      <input type="email" value={form.email} onChange={e => setField('email', e.target.value)}
                        placeholder="Въведи имейл адрес"
                        className="w-full border border-ds-border px-3.5 py-2.5 text-[13px] text-ds-text placeholder-ds-text-muted outline-none focus:border-ds-gold" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-ds-text mb-1.5">Телефон *</label>
                      <input type="tel" value={form.phone} onChange={e => setField('phone', e.target.value)}
                        placeholder="Въведи телефон"
                        className="w-full border border-ds-border px-3.5 py-2.5 text-[13px] text-ds-text placeholder-ds-text-muted outline-none focus:border-ds-gold" />
                    </div>
                  </div>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={form.newsletter}
                      onChange={e => setField('newsletter', e.target.checked)}
                      className="w-4 h-4 accent-ds-gold" />
                    <span className="text-[12px] text-ds-text-secondary">Абонирай се за нашия бюлетин и получавай ексклузивни предложения и новини.</span>
                  </label>
                </div>

                <h2 className="font-serif-display text-xl text-ds-text mt-8 mb-5">Адрес за доставка</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-medium text-ds-text mb-1.5">Държава / Регион *</label>
                      <select value={form.country} onChange={e => setField('country', e.target.value)}
                        className="w-full border border-ds-border px-3.5 py-2.5 text-[13px] text-ds-text outline-none focus:border-ds-gold bg-ds-card">
                        <option>България</option>
                        <option>Румъния</option>
                        <option>Гърция</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-ds-text mb-1.5">Град *</label>
                      <input value={form.city} onChange={e => setField('city', e.target.value)}
                        placeholder="Въведи град"
                        className="w-full border border-ds-border px-3.5 py-2.5 text-[13px] text-ds-text placeholder-ds-text-muted outline-none focus:border-ds-gold" />
                    </div>
                  </div>
                  <div className="grid grid-cols-[1fr_auto] gap-4">
                    <div>
                      <label className="block text-[12px] font-medium text-ds-text mb-1.5">Адрес *</label>
                      <input value={form.address} onChange={e => setField('address', e.target.value)}
                        placeholder="Въведи адрес"
                        className="w-full border border-ds-border px-3.5 py-2.5 text-[13px] text-ds-text placeholder-ds-text-muted outline-none focus:border-ds-gold" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-ds-text mb-1.5">Пощ. код *</label>
                      <input value={form.postcode} onChange={e => setField('postcode', e.target.value)}
                        placeholder="1000"
                        className="w-[110px] border border-ds-border px-3.5 py-2.5 text-[13px] text-ds-text placeholder-ds-text-muted outline-none focus:border-ds-gold" />
                    </div>
                  </div>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-ds-gold" />
                    <span className="text-[12px] text-ds-text-secondary">Доставка до различен адрес</span>
                  </label>
                </div>
              </div>
            )}

            {/* Step 2: Delivery */}
            {step === 2 && (
              <div className="bg-ds-card border border-ds-border shadow-ds-soft p-6 sm:p-8">
                <h2 className="font-serif-display text-xl text-ds-text mb-6">Метод на доставка</h2>
                <div className="space-y-3">
                  {DELIVERY_OPTIONS.map(opt => (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-4 p-4 border-2 cursor-pointer transition-colors ${
                        delivery === opt.id ? 'border-ds-gold bg-ds-soft' : 'border-ds-border hover:border-ds-gold/50'
                      }`}
                    >
                      <input type="radio" name="delivery" value={opt.id} checked={delivery === opt.id}
                        onChange={() => setDelivery(opt.id)} className="accent-ds-gold" />
                      <span className="text-xl">{opt.icon}</span>
                      <div className="flex-1">
                        <p className="text-[13px] font-medium text-ds-text">{opt.label}</p>
                        <p className="text-[11px] text-ds-text-muted">{opt.sub}</p>
                      </div>
                      <p className="text-[13px] font-bold text-ds-text">
                        {opt.price === 0 ? 'над 100 лв.' : `${opt.price.toFixed(2)} лв.`}
                      </p>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="bg-ds-card border border-ds-border shadow-ds-soft p-6 sm:p-8">
                <h2 className="font-serif-display text-xl text-ds-text mb-6">Метод на плащане</h2>
                <div className="space-y-3">
                  {PAYMENT_OPTIONS.map(opt => (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-4 p-4 border-2 cursor-pointer transition-colors ${
                        payment === opt.id ? 'border-ds-gold bg-ds-soft' : 'border-ds-border hover:border-ds-gold/50'
                      }`}
                    >
                      <input type="radio" name="payment" value={opt.id} checked={payment === opt.id}
                        onChange={() => setPayment(opt.id)} className="accent-ds-gold" />
                      <span className="text-xl">{opt.icon}</span>
                      <div className="flex-1">
                        <p className="text-[13px] font-medium text-ds-text">{opt.label}</p>
                        <p className="text-[11px] text-ds-text-muted">{opt.sub}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <label className="flex items-start gap-2.5 mt-6 cursor-pointer">
                  <input type="checkbox" required className="w-4 h-4 accent-ds-gold mt-0.5" />
                  <span className="text-[12px] text-ds-text-secondary">
                    Съгласявам се с{' '}
                    <Link href="/about" className="text-ds-gold underline">Общите условия</Link>
                    {' '}и{' '}
                    <Link href="/about" className="text-ds-gold underline">Политиката за поверителност</Link>.
                  </span>
                </label>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
              <div className="bg-ds-card border border-ds-border shadow-ds-soft p-6 sm:p-8 text-center">
                <div className="w-16 h-16 bg-ds-soft border-2 border-ds-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={28} className="text-ds-gold" />
                </div>
                <h2 className="font-serif-display text-2xl text-ds-text mb-2">Поръчката е приета!</h2>
                <p className="text-[13px] text-ds-text-secondary">Ще получите потвърждение на посочения имейл адрес.</p>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3">
              {step > 1 && step < 4 && (
                <button
                  onClick={goBack}
                  className="flex items-center gap-2 px-6 py-3.5 border border-ds-border text-[12px] font-bold tracking-widest uppercase text-ds-text hover:bg-ds-main transition-colors"
                >
                  <ChevronLeft size={15} />
                  НАЗАД
                </button>
              )}
              {step < 3 && (
                <button
                  onClick={goNext}
                  className="flex-1 bg-ds-gold hover:bg-ds-gold-dark text-white text-[12px] font-bold tracking-widest py-3.5 uppercase transition-colors"
                >
                  ПРОДЪЛЖИ
                </button>
              )}
              {step === 3 && (
                <button
                  onClick={submitOrder}
                  className="flex-1 bg-ds-gold hover:bg-ds-gold-dark text-white text-[12px] font-bold tracking-widest py-3.5 uppercase transition-colors"
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
              className="lg:hidden w-full flex items-center justify-between p-4 bg-ds-card border border-ds-border mb-4"
              onClick={() => setSummaryOpen(!summaryOpen)}
            >
              <span className="text-[13px] font-bold text-ds-text">Вашата поръчка</span>
              {summaryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <div className={`bg-ds-card border border-ds-border shadow-ds-card p-6 sm:p-7 ${!summaryOpen ? 'hidden lg:block' : ''}`}>
              <h2 className="font-serif-display text-xl text-ds-text mb-5 hidden lg:block">Вашата поръчка</h2>

              <div className="divide-y divide-ds-border mb-5">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3 py-3">
                    <div className="w-12 h-14 overflow-hidden bg-ds-image shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-ds-text truncate">{item.name}</p>
                      <p className="text-[11px] text-ds-text-muted">Размер: {item.size} · Бр: {item.quantity}</p>
                    </div>
                    <p className="text-[12px] font-bold text-ds-text shrink-0">
                      {(item.price * item.quantity).toFixed(2)} лв.
                    </p>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="mb-4">
                <button className="text-[12px] text-ds-text-secondary hover:text-ds-gold transition-colors flex items-center gap-1">
                  Имате код за отстъпка? <ChevronDown size={14} />
                </button>
                <div className="flex gap-0 mt-2">
                  <input
                    value={coupon}
                    onChange={e => setCoupon(e.target.value)}
                    placeholder="Въведи код"
                    className="flex-1 border border-ds-border px-3 py-2 text-[12px] outline-none focus:border-ds-gold"
                  />
                  <button className="border border-ds-gold bg-transparent text-ds-gold text-[11px] font-bold px-4 uppercase hover:bg-ds-gold hover:text-white transition-colors">
                    ПРИЛОЖИ
                  </button>
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-2.5 text-[13px] border-t border-[#f0ebe3] pt-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-ds-text-secondary">Междинна сума</span>
                  <span className="text-ds-text">{subtotal.toFixed(2)} лв.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ds-text-secondary">Доставка</span>
                  <span className="text-ds-text">{deliveryCost === 0 ? 'Безплатна' : `${deliveryCost.toFixed(2)} лв.`}</span>
                </div>
              </div>
              <div className="flex justify-between items-baseline pt-3 border-t border-ds-border mb-6">
                <span className="text-[14px] font-bold text-ds-text">Общо</span>
                <div className="text-right">
                  <p className="text-2xl font-bold text-ds-gold">{total.toFixed(2)} лв.</p>
                  <p className="text-[10px] text-ds-text-muted">с ДДС</p>
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
                  <div key={text} className="flex items-center gap-2 text-[11px] text-ds-text-muted">
                    <Icon size={13} className="text-ds-gold shrink-0" />
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

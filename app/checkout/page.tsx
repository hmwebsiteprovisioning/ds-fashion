'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ShoppingBag, Shield, Truck, RotateCcw, Headphones, Check, ChevronDown, ChevronUp, MapPin, Zap, Package, CreditCard, Banknote, Landmark } from 'lucide-react';
import type { EcontOfficesData, EcontOffice } from '@/types/econt';
import { useCart } from '@/context/CartContext';
import { getItemCharacteristics } from '@/lib/cart-helpers';
import { formatPrice, formatPriceRaw } from '@/lib/price-formatter';
import { STORE_NAME } from '@/lib/branding';
import { getLogoUrl } from '@/lib/branding';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

type Step = 1 | 2 | 3 | 4;

const STEPS = [
  { id: 1, label: 'Данни' },
  { id: 2, label: 'Доставка' },
  { id: 3, label: 'Плащане' },
  { id: 4, label: 'Потвърждение' },
];

// Options will be generated dynamically inside the component

function translateError(error: string): string {
  if (!error) return '';
  const errorMap: Record<string, string> = {
    'insufficient stock': 'Недостатъчно количество в наличност. Някои артикули в количката ви вече не са налични.',
    'failed to place order': 'Неуспешно изпращане на поръчката. Моля, опитайте отново.',
    'stripe payment initialization failed': 'Неуспешно инициализиране на плащането със Stripe. Моля, опитайте отново.',
    'mypos payment initialization failed': 'Неуспешно инициализиране на плащането с myPOS. Моля, опитайте отново.',
    'failed to process order': 'Неуспешно обработване на поръчката. Моля, опитайте отново.',
    'internal server error': 'Вътрешна грешка на сървъра. Моля, опитайте отново по-късно.',
    'stripe payments are not configured': 'Плащанията със Stripe не са конфигурирани на този сървър.',
    'mypos payments are not configured': 'Плащанията с карта (myPOS) не са конфигурирани на този сървър.',
    'missing required order details': 'Липсват задължителни данни за поръчката.',
    'failed to validate stock': 'Неуспешно валидиране на наличността на артикулите.',
    'network error': 'Грешка в мрежата. Моля, проверете връзката си и опитайте отново.',
    'failed to fetch': 'Грешка при връзка със сървъра. Моля, опитайте отново.'
  };

  const normalized = error.toLowerCase().trim().replace(/[.,]$/, '');
  if (errorMap[normalized]) return errorMap[normalized];

  if (normalized.includes('declined') || normalized.includes('отказана')) {
    return 'Картата ви беше отказана. Моля, опитайте с друга карта.';
  }
  if (normalized.includes('expired') || normalized.includes('изтекла')) {
    return 'Картата ви е изтекла. Моля, проверете срока на валидност.';
  }
  if (normalized.includes('incorrect') || normalized.includes('невалиден')) {
    return 'Невалиден номер на картата. Моля, проверете данните.';
  }
  if (normalized.includes('stock') || normalized.includes('наличност')) {
    return 'Недостатъчно количество в наличност. Някои артикули в количката ви вече не са налични.';
  }

  return error;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const { settings } = useStoreSettings();
  const logoUrl = getLogoUrl(settings?.logourl);
  const storeName = settings?.storename || STORE_NAME;
  const { user, isAuthenticated } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [delivery, setDelivery] = useState('standard');
  const [payment, setPayment] = useState('card');
  const [coupon, setCoupon] = useState('');
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    country: 'България', city: '', address: '', postcode: '',
    econtOffice: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [econtData, setEcontData] = useState<EcontOfficesData | null>(null);

  // Auto-fill form fields when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const nameParts = user.name ? user.name.split(' ') : ['', ''];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Map preferredDeliveryType to checkout delivery value
      let preferredDelivery = delivery;
      if (user.preferredDeliveryType) {
        if (user.preferredDeliveryType === 'office') {
          preferredDelivery = 'office';
        } else if (user.preferredDeliveryType === 'address') {
          preferredDelivery = 'standard';
        }
      }

      // Build address string if address is preferred
      let addressString = '';
      if (user.preferredStreet) {
        addressString = `ул. ${user.preferredStreet}`;
        if (user.preferredStreetNumber) addressString += ` №${user.preferredStreetNumber}`;
        if (user.preferredEntrance) addressString += `, вх. ${user.preferredEntrance}`;
        if (user.preferredFloor) addressString += `, ет. ${user.preferredFloor}`;
        if (user.preferredApartment) addressString += `, ап. ${user.preferredApartment}`;
      } else if (user.locationText) {
        addressString = user.locationText;
      }

      setForm(prev => {
        return {
          ...prev,
          firstName: prev.firstName || firstName,
          lastName: prev.lastName || lastName,
          email: prev.email || user.email || '',
          phone: prev.phone || user.phone || '',
          city: prev.city || user.preferredCity || '',
          address: prev.address || addressString,
        };
      });

      if (preferredDelivery !== delivery) {
        setDelivery(preferredDelivery);
      }
    }
  }, [isAuthenticated, user]);

  // Load Econt offices data proactively if user is authenticated and prefers office delivery
  useEffect(() => {
    if (isAuthenticated && user?.preferredDeliveryType === 'office' && !econtData) {
      fetch('/data/econt-offices.json')
        .then(r => r.json())
        .then(data => setEcontData(data))
        .catch(err => console.error('Failed to load Econt offices for auto-fill:', err));
    }
  }, [isAuthenticated, user, econtData]);

  // Match preferred Econt office once econtData is loaded
  useEffect(() => {
    if (isAuthenticated && user?.preferredEcontOfficeId && econtData && !form.econtOffice) {
      let officeString = '';
      for (const city in econtData.officesByCity) {
        const office = econtData.officesByCity[city].find(o => o.id === user.preferredEcontOfficeId);
        if (office) {
          officeString = `${office.city}, ${office.name} (${office.address})`;
          break;
        }
      }
      if (officeString) {
        setForm(prev => ({
          ...prev,
          econtOffice: officeString
        }));
      }
    }
  }, [isAuthenticated, user, econtData, form.econtOffice]);

  const DELIVERY_OPTIONS = useMemo(() => [
    { id: 'standard', label: 'Стандартна доставка', sub: '2–3 работни дни', price: settings?.delivery_standard_price ?? 0, icon: <Truck className="text-black w-5 h-5" /> },
    { id: 'express', label: 'Експресна доставка', sub: '1 работен ден', price: settings?.delivery_express_price ?? 9.90, icon: <Zap className="text-black w-5 h-5" /> },
    { id: 'office', label: 'До офис на Еконт', sub: '2–3 работни дни', price: settings?.delivery_office_price ?? 4.90, icon: <Package className="text-black w-5 h-5" /> },
  ], [settings]);

  const PAYMENT_OPTIONS = useMemo(() => {
    const options = [];
    if (settings?.allow_card_payment ?? true) {
      options.push({ id: 'card', label: 'Плащане с карта', sub: 'Visa, Mastercard, Maestro', icon: <CreditCard className="text-black w-5 h-5" /> });
    }
    if (settings?.allow_cod_payment ?? true) {
      options.push({ id: 'cod', label: 'Наложен платеж', sub: 'Плащане при доставка', icon: <Banknote className="text-black w-5 h-5" /> });
    }
    if (settings?.allow_bank_payment ?? true) {
      options.push({ id: 'bank', label: 'Банков превод', sub: 'Плащане по банкови път', icon: <Landmark className="text-black w-5 h-5" /> });
    }
    return options;
  }, [settings]);

  // Ensure default selected payment is valid if settings change
  useEffect(() => {
    if (PAYMENT_OPTIONS.length > 0 && !PAYMENT_OPTIONS.find(p => p.id === payment)) {
      setPayment(PAYMENT_OPTIONS[0].id);
    }
  }, [PAYMENT_OPTIONS, payment]);

  const selected = DELIVERY_OPTIONS.find(d => d.id === delivery) || DELIVERY_OPTIONS[0];
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  
  // Calculate delivery cost based on free delivery threshold
  const freeThreshold = settings?.free_delivery_threshold ?? 100;
  const isFreeDelivery = subtotal >= freeThreshold;
  const deliveryCost = isFreeDelivery ? 0 : (selected?.price ?? 0);
  
  const total = subtotal + deliveryCost;

  const formRef = useRef<HTMLDivElement>(null);
  const [showOfficeDropdown, setShowOfficeDropdown] = useState(false);
  const officeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (delivery === 'office' && !econtData) {
      fetch('/data/econt-offices.json')
        .then(r => r.json())
        .then(data => setEcontData(data))
        .catch(err => console.error('Failed to load Econt offices:', err));
    }
  }, [delivery, econtData]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (officeDropdownRef.current && !officeDropdownRef.current.contains(e.target as Node)) {
        setShowOfficeDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOffices = useMemo(() => {
    if (!econtData || !form.econtOffice) return [];
    const search = form.econtOffice.toLowerCase();
    const all = Object.values(econtData.officesByCity).flat();
    return all.filter(o => 
      o.name.toLowerCase().includes(search) || 
      o.city.toLowerCase().includes(search) ||
      o.address.toLowerCase().includes(search)
    ).slice(0, 8);
  }, [econtData, form.econtOffice]);

  const setField = (field: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const goNext = () => setStep(s => Math.min(4, s + 1) as Step);
  const goBack = () => setStep(s => Math.max(1, s - 1) as Step);

  useEffect(() => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [step]);

  const submitOrder = async () => {
    setErrorMsg('');

    // Validate inputs
    if (!form.firstName?.trim() || !form.lastName?.trim() || !form.phone?.trim()) {
      setErrorMsg(settings?.language === 'bg' ? 'Моля, попълнете всички задължителни лични данни.' : 'Please fill in all required personal info.');
      setStep(1); // Go back to first step to fix fields
      return;
    }

    if (delivery !== 'office' && (!form.city?.trim() || !form.address?.trim() || !form.postcode?.trim())) {
      setErrorMsg(settings?.language === 'bg' ? 'Моля, попълнете всички задължителни полета за адрес.' : 'Please fill in all required address fields.');
      setStep(2); // Go to delivery step to fix fields
      return;
    }

    if (!form.email?.trim()) {
      setErrorMsg(settings?.language === 'bg' ? 'Моля, попълнете имейл адрес.' : 'Please enter an email address.');
      setStep(1);
      return;
    }

    if (delivery === 'office' && !form.econtOffice?.trim()) {
      setErrorMsg(settings?.language === 'bg' ? 'Моля, въведете офис на Еконт.' : 'Please enter an Econt office.');
      setStep(2);
      return;
    }

    if (items.length === 0) {
      setErrorMsg(settings?.language === 'bg' ? 'Количката е празна.' : 'Your cart is empty.');
      return;
    }

    setSubmitting(true);

    const orderData = {
      customer: {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        telephone: form.phone.trim(),
        country: form.country,
        city: form.city.trim()
      },
      delivery: {
        type: delivery,
        notes: `Пощенски код: ${form.postcode.trim()}`,
        street: form.address.trim(),
        streetNumber: '',
        entrance: '',
        floor: '',
        apartment: '',
        econtOfficeId: form.econtOffice.trim()
      },
      items: items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        size: item.size || '',
        color: (item as any).color || '',
        name: item.name
      })),
      totals: {
        subtotal: subtotal,
        delivery: deliveryCost,
        total: total
      },
      discount: null
    };

    try {
      if (payment === 'cod') {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });

        const data = await response.json();
        if (data.success && data.orderId) {
          clearCart();
          router.push(`/checkout/success?orderId=${data.orderId}`);
        } else {
          setErrorMsg(translateError(data.error || 'failed to place order'));
        }
      } else if (payment === 'card') {
        // Card Online via myPOS Hosted Checkout
        const cardOrderData = {
          ...orderData,
          paymentMethod: 'card_online'
        };

        const response = await fetch('/api/payments/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cardOrderData)
        });

        const data = await response.json();
        if (data.success && data.data?.formUrl && data.data?.formData) {
          clearCart(); // Clear cart before redirecting
          
          // Create and auto-submit hidden form to myPOS checkout endpoint
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = data.data.formUrl;
          form.style.display = 'none';

          Object.entries(data.data.formData).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = String(value);
            form.appendChild(input);
          });

          document.body.appendChild(form);
          form.submit();
        } else if (data.success && data.data?.url) {
          clearCart();
          window.location.href = data.data.url;
        } else {
          setErrorMsg(translateError(data.error || 'mypos payment initialization failed'));
        }
      } else {
        setErrorMsg('Избраният метод на плащане не е поддържан в момента.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMsg('Възникна грешка при обработка на поръчката. Моля, опитайте отново.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ds-main flex flex-col">
      {/* Checkout header */}
      <header className="bg-ds-card border-b border-ds-border">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/cart" className="flex items-center gap-1.5 text-[12px] text-ds-text-secondary hover:text-ds-text transition-colors">
            <ChevronLeft size={16} />
            Към магазина
          </Link>
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <Image src={logoUrl} alt={storeName} width={200} height={64} className="h-14 w-auto object-contain" />
          </Link>

        </div>
      </header>

      {/* Step indicator */}
      <div className="hidden lg:block bg-ds-card border-b border-ds-border">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-0 py-4">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <button
                  onClick={() => s.id < step && setStep(s.id as Step)}
                  className="flex flex-row sm:flex-col items-center gap-1 sm:gap-1.5"
                  disabled={s.id > step}
                >
                  <span
                    className={`hidden sm:flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold border-2 transition-colors ${step > s.id
                      ? 'bg-ds-success border-ds-success text-white'
                      : step === s.id
                        ? 'bg-ds-gold border-ds-gold text-white'
                        : 'bg-ds-card border-ds-border-strong text-ds-text-secondary'
                      }`}
                  >
                    {step > s.id ? <Check size={13} /> : s.id}
                  </span>
                  <span
                    className={`text-[10px] sm:text-[12px] font-medium uppercase tracking-wider sm:normal-case sm:tracking-normal ${step === s.id ? 'text-ds-text font-bold sm:font-medium' : step > s.id ? 'text-ds-success' : 'text-ds-text-muted'
                      }`}
                  >
                    {s.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`w-3 sm:w-14 h-px mx-1.5 sm:mx-3 ${step > s.id ? 'bg-ds-success' : 'bg-ds-border'} ${
                    /* Align the line with the circle on desktop */ ''
                  } sm:-translate-y-[10px]`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-[1fr_380px] gap-8">

          {/* Left: Form */}
          <div className="space-y-6 order-2 lg:order-1" ref={formRef}>

            {/* Step 1: Customer data */}
            {step === 1 && (
              <div className="bg-ds-card border border-ds-border shadow-ds-soft p-6 sm:p-8">
                <h2 className="font-serif-display text-xl text-ds-text mb-6">Данни за клиента</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-medium text-ds-text mb-1.5">Име *</label>
                      <input value={form.firstName} onChange={e => setField('firstName', e.target.value)}
                        placeholder="Въведи име"
                        className="w-full border border-ds-border px-3.5 py-2.5 text-[16px] sm:text-[13px] text-ds-text placeholder-ds-text-muted outline-none focus:border-ds-gold" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-ds-text mb-1.5">Фамилия *</label>
                      <input value={form.lastName} onChange={e => setField('lastName', e.target.value)}
                        placeholder="Въведи фамилия"
                        className="w-full border border-ds-border px-3.5 py-2.5 text-[16px] sm:text-[13px] text-ds-text placeholder-ds-text-muted outline-none focus:border-ds-gold" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-[12px] font-medium text-ds-text mb-1.5">Имейл адрес *</label>
                      <input type="email" value={form.email} onChange={e => setField('email', e.target.value)}
                        placeholder="Въведи имейл адрес"
                        className="w-full border border-ds-border px-3.5 py-2.5 text-[16px] sm:text-[13px] text-ds-text placeholder-ds-text-muted outline-none focus:border-ds-gold" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-ds-text mb-1.5">Телефон *</label>
                      <input type="tel" value={form.phone} onChange={e => setField('phone', e.target.value)}
                        placeholder="Въведи телефон"
                        className="w-full border border-ds-border px-3.5 py-2.5 text-[16px] sm:text-[13px] text-ds-text placeholder-ds-text-muted outline-none focus:border-ds-gold" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Delivery */}
            {step === 2 && (
              <div className="bg-ds-card border border-ds-border shadow-ds-soft p-6 sm:p-8">
                <h2 className="font-serif-display text-xl text-ds-text mb-6">Метод на доставка</h2>
                <div className="space-y-3 mb-6">
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
                      <div className="text-[13px] font-bold text-ds-text">
                        {opt.price === 0 ? 'Безплатна' : formatPrice(opt.price, 'text-[13px] font-bold text-ds-text')}
                      </div>
                    </label>
                  ))}
                </div>

                {delivery === 'office' && (
                  <div className="relative" ref={officeDropdownRef}>
                    <label className="block text-[12px] font-medium text-ds-text mb-1.5">Офис на Еконт *</label>
                    <input
                      type="text"
                      value={form.econtOffice}
                      onChange={(e) => {
                        setField('econtOffice', e.target.value);
                        setShowOfficeDropdown(true);
                      }}
                      onFocus={() => setShowOfficeDropdown(true)}
                      placeholder="Напр. София Център..."
                      className="w-full border border-ds-border px-3.5 py-2.5 text-[16px] sm:text-[13px] text-ds-text placeholder-ds-text-muted outline-none focus:border-ds-gold"
                    />
                    {showOfficeDropdown && form.econtOffice && (
                      <div className="absolute z-10 w-full mt-1 bg-ds-card border border-ds-border shadow-ds-soft max-h-[250px] overflow-y-auto">
                        {filteredOffices.length > 0 ? (
                          filteredOffices.map(o => (
                            <div
                              key={o.id}
                              className="p-3 hover:bg-ds-soft cursor-pointer border-b border-ds-border last:border-0"
                              onClick={() => {
                                setField('econtOffice', `${o.city}, ${o.name} (${o.address})`);
                                setShowOfficeDropdown(false);
                              }}
                            >
                              <div className="font-medium text-[13px] text-ds-text">{o.city}, {o.name}</div>
                              <div className="text-[11px] text-ds-text-muted mt-0.5">{o.address}</div>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-[13px] text-ds-text-muted">Няма намерени офиси</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {delivery !== 'office' && (
                  <div className="space-y-4 mt-2">
                    <h3 className="text-[13px] font-medium text-ds-text mb-2">Адрес за доставка</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[12px] font-medium text-ds-text mb-1.5">Държава / Регион *</label>
                        <select value={form.country} onChange={e => setField('country', e.target.value)}
                          className="w-full border border-ds-border px-3.5 py-2.5 text-[16px] sm:text-[13px] text-ds-text outline-none focus:border-ds-gold bg-ds-card">
                          <option>България</option>
                          <option>Румъния</option>
                          <option>Гърция</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[12px] font-medium text-ds-text mb-1.5">Град *</label>
                        <input value={form.city} onChange={e => setField('city', e.target.value)}
                          placeholder="Въведи град"
                          className="w-full border border-ds-border px-3.5 py-2.5 text-[16px] sm:text-[13px] text-ds-text placeholder-ds-text-muted outline-none focus:border-ds-gold" />
                      </div>
                      <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
                        <div>
                          <label className="block text-[12px] font-medium text-ds-text mb-1.5">Адрес *</label>
                          <input value={form.address} onChange={e => setField('address', e.target.value)}
                            placeholder="Въведи адрес"
                            className="w-full border border-ds-border px-3.5 py-2.5 text-[16px] sm:text-[13px] text-ds-text placeholder-ds-text-muted outline-none focus:border-ds-gold" />
                        </div>
                        <div>
                          <label className="block text-[12px] font-medium text-ds-text mb-1.5">Пощ. код *</label>
                          <input value={form.postcode} onChange={e => setField('postcode', e.target.value)}
                            placeholder="1000"
                            className="w-[110px] border border-ds-border px-3.5 py-2.5 text-[16px] sm:text-[13px] text-ds-text placeholder-ds-text-muted outline-none focus:border-ds-gold" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
                      className={`flex items-center gap-4 p-4 border-2 cursor-pointer transition-colors ${payment === opt.id ? 'border-ds-gold bg-ds-soft' : 'border-ds-border hover:border-ds-gold/50'
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

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/25 text-red-600 text-xs p-3.5 rounded mb-4 font-medium">
                {errorMsg}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3">
              {step > 1 && step < 4 && (
                <button
                  onClick={goBack}
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-3.5 border border-ds-border text-[12px] font-bold tracking-widest uppercase text-ds-text hover:bg-ds-main transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={15} />
                  НАЗАД
                </button>
              )}
              {step < 3 && (
                <button
                  onClick={goNext}
                  disabled={submitting}
                  className="flex-1 bg-ds-gold hover:bg-ds-gold-dark text-white text-[12px] font-bold tracking-widest py-3.5 uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ПРОДЪЛЖИ
                </button>
              )}
              {step === 3 && (
                <button
                  onClick={submitOrder}
                  disabled={submitting}
                  className="flex-1 bg-ds-gold hover:bg-ds-gold-dark text-white text-[12px] font-bold tracking-widest py-3.5 uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {submitting ? 'ОБРАБОТКА...' : 'ЗАВЪРШИ ПОРЪЧКАТА'}
                </button>
              )}
            </div>
          </div>

          {/* Right: Order summary */}
          <div className="order-1 lg:order-2">
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
                      <img src={item.imageUrl || '/hero-home.png'} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-ds-text truncate">{item.name}</p>
                      <div className="text-[11px] text-ds-text-muted mt-0.5 space-y-0.5">
                        {getItemCharacteristics(item, 'bg').map((char, charIdx) => (
                          <span key={charIdx} className="mr-2 inline-block">
                            {char.label}: <span className="font-medium text-ds-text">{char.value}</span>
                          </span>
                        ))}
                        <span className="inline-block font-medium">· Бр: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-[12px] font-bold text-ds-text shrink-0">
                      {formatPrice(item.price * item.quantity, 'text-[12px] font-bold text-ds-text')}
                    </div>
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
                <div className="flex justify-between items-baseline">
                  <span className="text-ds-text-secondary">Междинна сума</span>
                  {formatPrice(subtotal, 'text-ds-text')}
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-ds-text-secondary">Доставка</span>
                  <span className="text-ds-text">
                    {deliveryCost === 0 ? 'Безплатна' : formatPrice(deliveryCost, 'text-ds-text')}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-baseline pt-3 border-t border-ds-border mb-6">
                <span className="text-[14px] font-bold text-ds-text">Общо</span>
                <div className="text-right">
                  {formatPrice(total, 'text-2xl font-bold text-ds-gold')}
                  <p className="text-[10px] text-ds-text-muted mt-1">с ДДС</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

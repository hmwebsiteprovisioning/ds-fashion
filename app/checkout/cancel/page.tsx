'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import { AlertCircle, ArrowLeft, RefreshCw, ShoppingBag, PhoneCall, Mail } from 'lucide-react';

function CheckoutCancelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const { settings } = useStoreSettings();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const adminState = localStorage.getItem('isAdmin');
    if (adminState === 'true') {
      setIsAdmin(true);
    }
  }, []);

  const handleSetIsAdmin = (value: boolean) => {
    setIsAdmin(value);
    localStorage.setItem('isAdmin', value.toString());
  };

  useEffect(() => {
    const pageTitle = language === 'bg' ? 'Плащането е отказано' : 'Payment Cancelled';
    const storeName = settings?.storename || 'DS-Fashion';
    document.title = `${pageTitle} - ${storeName}`;
  }, [language, settings?.storename]);

  const sessionId = searchParams.get('session_id') || searchParams.get('orderId');

  return (
    <div className="min-h-screen flex flex-col bg-ds-main text-ds-text">
      <Header isAdmin={isAdmin} setIsAdmin={handleSetIsAdmin} />
      
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-20">
        <div className="max-w-xl w-full mx-auto text-center">
          
          {/* Status Badge */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 mb-6 shadow-lg shadow-amber-500/5">
            <AlertCircle className="w-10 h-10" />
          </div>

          {/* Heading */}
          <h1 className="font-serif-display text-3xl sm:text-4xl text-ds-gold mb-3">
            {language === 'en' ? 'Payment Cancelled' : 'Плащането беше отказано'}
          </h1>

          <p className="text-ds-text-secondary text-base sm:text-lg mb-8 leading-relaxed">
            {language === 'en'
              ? 'The payment process via myPOS was cancelled or declined. Your card has not been charged.'
              : 'Процесът на плащане с карта през myPOS беше прекъснат или отказан. Вашата карта не е била таксувана.'}
          </p>

          {/* Session ID / Order Reference if available */}
          {sessionId && (
            <div className="inline-block bg-ds-surface border border-ds-gold/20 rounded-lg px-4 py-2 text-xs font-mono text-ds-text-secondary mb-8">
              {language === 'en' ? 'Reference:' : 'Референция:'} {sessionId.substring(0, 16)}...
            </div>
          )}

          {/* Reassurance Info Box */}
          <div className="bg-ds-surface border border-ds-gold/20 rounded-xl p-6 mb-8 text-left space-y-3">
            <h3 className="text-sm font-semibold text-ds-gold uppercase tracking-wider">
              {language === 'en' ? 'What can you do now?' : 'Какво можете да направите сега?'}
            </h3>
            <ul className="text-sm text-ds-text-secondary space-y-2.5 list-disc list-inside">
              <li>
                {language === 'en'
                  ? 'You can retry paying with card or try a different payment card.'
                  : 'Можете да опитате плащането с карта отново или да използвате друга банкова карта.'}
              </li>
              <li>
                {language === 'en'
                  ? 'You can select "Cash on Delivery" to pay upon receiving your package.'
                  : 'Можете да изберете опцията „Наложен платеж“ и да платите при получаване на пратката от куриер.'}
              </li>
              <li>
                {language === 'en'
                  ? 'Items in your shopping bag are still saved.'
                  : 'Артикулите във вашата количка се пазят и не са загубени.'}
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <button
              onClick={() => router.push('/checkout')}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-ds-gold to-ds-gold-light hover:brightness-110 text-ds-main font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-ds-gold/20"
            >
              <RefreshCw className="w-4 h-4" />
              {language === 'en' ? 'Try Again' : 'Опитай отново'}
            </button>

            <button
              onClick={() => router.push('/cart')}
              className="w-full sm:w-auto px-6 py-3.5 bg-ds-surface border border-ds-gold/30 hover:border-ds-gold text-ds-text hover:text-ds-gold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              {language === 'en' ? 'View Cart' : 'Към количката'}
            </button>
          </div>

          {/* Need assistance */}
          <div className="border-t border-ds-gold/10 pt-6">
            <p className="text-xs text-ds-text-secondary mb-3">
              {language === 'en' ? 'Need assistance with your order?' : 'Нуждаете се от съдействие с вашата поръчка?'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-ds-gold">
              <a href={`tel:${settings?.telephonenumber || '0878918189'}`} className="flex items-center gap-1.5 hover:underline">
                <PhoneCall className="w-3.5 h-3.5" />
                {settings?.telephonenumber || '0878918189'}
              </a>
              <a href={`mailto:${settings?.email || 'osdjan01@abv.bg'}`} className="flex items-center gap-1.5 hover:underline">
                <Mail className="w-3.5 h-3.5" />
                {settings?.email || 'osdjan01@abv.bg'}
              </a>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CheckoutCancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-ds-main">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ds-gold"></div>
      </div>
    }>
      <CheckoutCancelContent />
    </Suspense>
  );
}

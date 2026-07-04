'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, User, Heart, ShoppingBag, Menu, X, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import { getLogoUrl, STORE_NAME } from '@/lib/branding';

const NAV_ITEMS = [
  { id: 'new', label: 'НОВО', path: '/products' },
  { id: 'women', label: 'ЖЕНИ', path: '/for-her' },
  { id: 'men', label: 'МЪЖЕ', path: '/for-him' },
  { id: 'collections', label: 'КОЛЕКЦИИ', path: '/products', hasDropdown: true },
  { id: 'accessories', label: 'АКСЕСОАРИ', path: '/accessories', hasDropdown: true },
  { id: 'sale', label: 'SALE', path: '/products', isSale: true },
  { id: 'inspiration', label: 'ВДЪХНОВЕНИЕ', path: '/products' },
];

interface HeaderProps {
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
}

export default function Header({ isAdmin, setIsAdmin }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { settings } = useStoreSettings();
  const logoUrl = getLogoUrl(settings?.logourl);
  const storeName = settings?.storename || STORE_NAME;

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-[#e8e0d5]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main header row */}
          <div className="flex items-center h-16 sm:h-[72px] relative">
            {/* Left: Search (desktop) + hamburger (mobile) */}
            <div className="flex items-center gap-3 flex-1">
              <button
                className="lg:hidden p-1.5"
                onClick={() => setMobileOpen(true)}
                aria-label="Menu"
              >
                <Menu size={22} className="text-[#1a1a1a]" />
              </button>
              <button
                className="hidden lg:flex items-center gap-2 text-[#6b6b6b] text-sm hover:text-[#1a1a1a] transition-colors"
                aria-label="Търсене"
              >
                <Search size={18} />
                <span>Търсене</span>
              </button>
            </div>

            {/* Center: Logo */}
            <Link
              href="/"
              className="absolute left-1/2 -translate-x-1/2 flex items-center"
            >
              <Image
                src={logoUrl}
                alt={storeName}
                width={120}
                height={40}
                className="h-8 sm:h-9 w-auto object-contain"
                priority
              />
            </Link>

            {/* Right: icons */}
            <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-end">
              <Link
                href={isAuthenticated && user ? '/user/dashboard' : '/user'}
                className="p-2 hover:text-[#c49a3c] transition-colors text-[#1a1a1a]"
                aria-label="Акаунт"
              >
                <User size={20} />
              </Link>
              <Link
                href={isAuthenticated ? '/user/dashboard?tab=favorites' : '/user'}
                className="p-2 hover:text-[#c49a3c] transition-colors text-[#1a1a1a]"
                aria-label="Любими"
              >
                <Heart size={20} />
              </Link>
              <Link
                href="/cart"
                className="p-2 hover:text-[#c49a3c] transition-colors text-[#1a1a1a] relative"
                aria-label="Количка"
              >
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#c49a3c] text-white text-[10px] rounded-full h-[18px] min-w-[18px] px-1 flex items-center justify-center font-semibold">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center justify-center gap-8 pb-3">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.id}
                href={item.path}
                className={`flex items-center gap-0.5 text-[13px] tracking-widest font-medium transition-colors hover:text-[#c49a3c] ${
                  item.isSale
                    ? 'text-red-600 hover:text-red-500'
                    : isActive(item.path) && item.path !== '/products'
                    ? 'text-[#c49a3c] border-b border-[#c49a3c]'
                    : 'text-[#1a1a1a]'
                }`}
              >
                {item.label}
                {item.hasDropdown && <ChevronDown size={12} className="mt-0.5" />}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-[#e8e0d5]">
              <span className="font-serif-display text-lg text-[#1a1a1a]">{storeName}</span>
              <button onClick={() => setMobileOpen(false)}>
                <X size={22} className="text-[#1a1a1a]" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4">
              {NAV_ITEMS.map(item => (
                <Link
                  key={item.id}
                  href={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-6 py-3.5 text-sm tracking-widest font-medium transition-colors ${
                    item.isSale ? 'text-red-600' : 'text-[#1a1a1a] hover:text-[#c49a3c]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, User, Heart, ShoppingBag, Menu, X, ChevronDown, Folder, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/price-formatter';
import { getLogoUrl, STORE_NAME } from '@/lib/branding';
import { RF_TYPE_NAV_ORDER, rfTypePath } from '@/lib/rf-product-type-routes';

type RfProductType = { rfproducttypeid: number; name: string };
type Collection = { collectionid: string; name: string; slug: string };

const STATIC_NAV = [
  { id: 'new', label: 'НОВО', path: '/products/new' },
  { id: 'sale', label: 'SALE', path: '/products/sale', isSale: true },
  { id: 'inspiration', label: 'ВДЪХНОВЕНИЕ', path: '/products/inspiration' },
];

type NavItem = {
  id: string;
  label: string;
  path: string;
  isSale?: boolean;
  hasDropdown?: boolean;
  dropdownItems?: Array<{ label: string; path: string }>;
};

interface HeaderProps {
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
}

export default function Header({ isAdmin, setIsAdmin }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [rfTypes, setRfTypes] = useState<RfProductType[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { settings } = useStoreSettings();
  const { language } = useLanguage();

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    products: any[];
    collections: any[];
    categories: any[];
  }>({ products: [], collections: [], categories: [] });

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ products: [], collections: [], categories: [] });
      return;
    }
    const delayDebounce = setTimeout(() => {
      setSearching(true);
      fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            setSearchResults({
              products: data.products || [],
              collections: data.collections || [],
              categories: data.categories || []
            });
          }
        })
        .catch((e) => console.error(e))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);
  const logoUrl = getLogoUrl(settings?.logourl);
  const storeName = settings?.storename || STORE_NAME;

  useEffect(() => {
    fetch('/api/rf-product-types')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setRfTypes(data.rfProductTypes || []);
      })
      .catch(() => setRfTypes([]));

    fetch('/api/collections')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setCollections(data.collections || []);
      })
      .catch(() => setCollections([]));
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const orderedRfTypes = RF_TYPE_NAV_ORDER
    .map((id) => rfTypes.find((r) => r.rfproducttypeid === id))
    .filter(Boolean) as RfProductType[];

  const rfNavItems = orderedRfTypes.map((rpt) => {
    let customLabel = rpt.name;
    if (rpt.rfproducttypeid === 1 && settings?.forhimlabel) {
      customLabel = settings.forhimlabel;
    } else if (rpt.rfproducttypeid === 2 && settings?.forherlabel) {
      customLabel = settings.forherlabel;
    } else if (rpt.rfproducttypeid === 3 && settings?.accessorieslabel) {
      customLabel = settings.accessorieslabel;
    }
    return {
      id: `rf-${rpt.rfproducttypeid}`,
      label: customLabel.toUpperCase(),
      path: rfTypePath(rpt.rfproducttypeid),
      hasDropdown: rpt.rfproducttypeid === 3,
    };
  });

  const saleNavItem = {
    id: 'sale',
    label: (settings?.salelabel || 'SALE').toUpperCase(),
    path: '/products/sale',
    isSale: true
  };

  const navItems: NavItem[] = [
    STATIC_NAV[0],
    ...rfNavItems.slice(0, 2),
    {
      id: 'collections',
      label: 'КОЛЕКЦИИ',
      path: '/collections',
      hasDropdown: collections.length > 0,
      dropdownItems: collections.map((c) => ({
        label: c.name,
        path: `/collections/${c.slug}`,
      })),
    },
    ...rfNavItems.slice(2),
    saleNavItem,
    STATIC_NAV[2],
  ];

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <>
      <header className="sticky top-0 z-50 bg-ds-card border-b border-ds-border">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 sm:h-[72px] relative">
            <div className="flex items-center gap-3 flex-1">
              <button
                className="lg:hidden p-1.5"
                onClick={() => setMobileOpen(true)}
                aria-label="Menu"
              >
                <Menu size={22} className="text-ds-text" />
              </button>
              <button
                onClick={() => setShowSearch(true)}
                className="hidden lg:flex items-center gap-2 text-ds-text-secondary text-sm hover:text-ds-text transition-colors"
                aria-label="Търсене"
              >
                <Search size={18} />
                <span>Търсене</span>
              </button>
            </div>

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

            <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-end">
              <button
                onClick={() => setShowSearch(true)}
                className="lg:hidden p-2 hover:text-ds-gold transition-colors text-ds-text"
                aria-label="Търсене"
              >
                <Search size={20} />
              </button>
              <Link
                href={isAuthenticated && user ? '/user/dashboard' : '/user'}
                className="p-2 hover:text-ds-gold transition-colors text-ds-text"
                aria-label="Акаунт"
              >
                <User size={20} />
              </Link>
              <Link
                href={isAuthenticated ? '/user/dashboard?tab=favorites' : '/user'}
                className="p-2 hover:text-ds-gold transition-colors text-ds-text"
                aria-label="Любими"
              >
                <Heart size={20} />
              </Link>
              <Link
                href="/cart"
                className="p-2 hover:text-ds-gold transition-colors text-ds-text relative"
                aria-label="Количка"
              >
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-ds-gold text-white text-[10px] rounded-full h-[18px] min-w-[18px] px-1 flex items-center justify-center font-semibold">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>

          <nav ref={dropdownRef} className="hidden lg:flex items-center justify-center gap-8 pb-3">
            {navItems.map((item) => (
              <div key={item.id} className="relative">
                {item.hasDropdown && 'dropdownItems' in item && item.dropdownItems?.length ? (
                  <>
                    <button
                      onClick={() => setOpenDropdown(openDropdown === item.id ? null : item.id)}
                      className={`flex items-center gap-0.5 text-[13px] tracking-widest font-medium transition-colors hover:text-ds-gold ${
                        item.isSale ? 'text-ds-error hover:text-ds-error/80' : 'text-ds-text'
                      }`}
                    >
                      {item.label}
                      <ChevronDown size={12} className="mt-0.5" />
                    </button>
                    {openDropdown === item.id && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 min-w-[180px] bg-ds-card border border-ds-border shadow-lg py-2 z-50">
                        {item.dropdownItems.map((sub) => (
                          <Link
                            key={sub.path}
                            href={sub.path}
                            onClick={() => setOpenDropdown(null)}
                            className="block px-4 py-2 text-[12px] text-ds-text hover:text-ds-gold hover:bg-ds-main transition-colors"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.path}
                    className={`flex items-center gap-0.5 text-[13px] tracking-widest font-medium transition-colors hover:text-ds-gold ${
                      item.isSale
                        ? 'text-ds-error hover:text-ds-error/80'
                        : isActive(item.path)
                        ? 'text-ds-gold border-b border-ds-gold'
                        : 'text-ds-text'
                    }`}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-ds-card flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-ds-border">
              <span className="font-serif-display text-lg text-ds-text">{storeName}</span>
              <button onClick={() => setMobileOpen(false)}>
                <X size={22} className="text-ds-text" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4">
              {navItems.map((item) => (
                <div key={item.id}>
                  <Link
                    href={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between px-6 py-3.5 text-sm tracking-widest font-medium transition-colors ${
                      item.isSale ? 'text-ds-error' : 'text-ds-text hover:text-ds-gold'
                    }`}
                  >
                    {item.label}
                  </Link>
                  {'dropdownItems' in item && item.dropdownItems?.map((sub) => (
                    <Link
                      key={sub.path}
                      href={sub.path}
                      onClick={() => setMobileOpen(false)}
                      className="block px-10 py-2 text-[12px] text-ds-text-secondary hover:text-ds-gold"
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}
      {/* Search Overlay */}
      {showSearch && (
        <div className="fixed inset-0 z-[100] bg-black/45 backdrop-blur-xs flex flex-col justify-start">
          <div className="absolute inset-0" onClick={() => setShowSearch(false)} />
          
          <div className="relative bg-ds-card border-b border-ds-border shadow-2xl w-full max-h-[85vh] flex flex-col z-10 animate-slide-down">
            <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-5">
              <div className="flex items-center gap-4 border-b border-ds-border pb-3">
                <Search size={22} className="text-ds-text-secondary" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'bg' ? 'Търсете продукти, колекции или категории...' : 'Search products, collections or categories...'}
                  className="flex-1 bg-transparent border-none outline-none text-ds-text placeholder-ds-text-muted text-base sm:text-lg py-1"
                />
                {searching ? (
                  <Loader2 className="w-5 h-5 text-ds-gold animate-spin" />
                ) : searchQuery ? (
                  <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-ds-main rounded-full">
                    <X size={18} className="text-ds-text-secondary" />
                  </button>
                ) : null}
                <button
                  onClick={() => setShowSearch(false)}
                  className="px-3 py-1 text-xs sm:text-sm font-medium border border-ds-border hover:border-ds-gold hover:text-ds-gold transition-colors rounded"
                >
                  {language === 'bg' ? 'Затвори' : 'Close'}
                </button>
              </div>

              {searchQuery.trim() !== '' && (
                <div className="overflow-y-auto max-h-[60vh] mt-6 py-2 pr-2 scrollbar-thin">
                  {searching && !searchResults.products.length && !searchResults.collections.length && !searchResults.categories.length ? (
                    <div className="text-center py-12 text-ds-text-muted text-sm">
                      {language === 'bg' ? 'Търсене...' : 'Searching...'}
                    </div>
                  ) : !searchResults.products.length && !searchResults.collections.length && !searchResults.categories.length ? (
                    <div className="text-center py-12 text-ds-text-muted text-sm">
                      {language === 'bg' ? 'Няма намерени резултати' : 'No results found'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      {/* Products */}
                      <div className="lg:col-span-6 space-y-4">
                        <h3 className="text-[11px] font-bold tracking-widest uppercase text-ds-gold border-b border-ds-border pb-2">
                          {language === 'bg' ? 'Продукти' : 'Products'} ({searchResults.products.length})
                        </h3>
                        {searchResults.products.length === 0 ? (
                          <p className="text-xs text-ds-text-muted">{language === 'bg' ? 'Няма намерени продукти' : 'No products found'}</p>
                        ) : (
                          <div className="space-y-3">
                            {searchResults.products.map((product) => (
                              <Link
                                key={product.productid}
                                href={`/products/${product.productid}`}
                                onClick={() => setShowSearch(false)}
                                className="flex gap-4 p-2 rounded hover:bg-ds-main transition-colors group"
                              >
                                <div className="relative w-12 h-12 bg-ds-main border border-ds-border rounded overflow-hidden flex-shrink-0">
                                  <img
                                    src={product.imageurl || 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=100&q=80'}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-xs sm:text-sm font-medium text-ds-text truncate group-hover:text-ds-gold transition-colors">
                                    {product.name}
                                  </h4>
                                  <p className="text-xs text-ds-text-muted line-clamp-1 mt-0.5">
                                    {product.description || ''}
                                  </p>
                                </div>
                                <div className="text-xs sm:text-sm font-semibold text-ds-text flex-shrink-0">
                                  {formatPrice(product.price, 'text-xs sm:text-sm font-semibold text-ds-text')}
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Collections & Categories */}
                      <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-6">
                        {/* Collections */}
                        <div className="space-y-4">
                          <h3 className="text-[11px] font-bold tracking-widest uppercase text-ds-gold border-b border-ds-border pb-2">
                            {language === 'bg' ? 'Колекции' : 'Collections'} ({searchResults.collections.length})
                          </h3>
                          {searchResults.collections.length === 0 ? (
                            <p className="text-xs text-ds-text-muted">{language === 'bg' ? 'Няма намерени колекции' : 'No collections found'}</p>
                          ) : (
                            <div className="space-y-2">
                              {searchResults.collections.map((col) => (
                                <Link
                                  key={col.collectionid}
                                  href={`/collections/${col.slug}`}
                                  onClick={() => setShowSearch(false)}
                                  className="flex items-center gap-3 p-2 rounded hover:bg-ds-main transition-colors group"
                                >
                                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-ds-border bg-ds-main flex-shrink-0">
                                    <img
                                      src={col.imageurl || 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=100&q=80'}
                                      alt={col.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <span className="text-xs sm:text-sm font-medium text-ds-text group-hover:text-ds-gold transition-colors truncate">
                                    {col.name}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Categories */}
                        <div className="space-y-4">
                          <h3 className="text-[11px] font-bold tracking-widest uppercase text-ds-gold border-b border-ds-border pb-2">
                            {language === 'bg' ? 'Категории' : 'Categories'} ({searchResults.categories.length})
                          </h3>
                          {searchResults.categories.length === 0 ? (
                            <p className="text-xs text-ds-text-muted">{language === 'bg' ? 'Няма намерени категории' : 'No categories found'}</p>
                          ) : (
                            <div className="space-y-2">
                              {searchResults.categories.map((cat) => (
                                <Link
                                  key={cat.producttypeid}
                                  href={`/products?category=${cat.producttypeid}`}
                                  onClick={() => setShowSearch(false)}
                                  className="flex items-center gap-3 p-2 rounded hover:bg-ds-main transition-colors group"
                                >
                                  <div className="w-8 h-8 rounded border border-ds-border bg-ds-main flex items-center justify-center text-ds-text-secondary flex-shrink-0">
                                    <Folder size={16} />
                                  </div>
                                  <span className="text-xs sm:text-sm font-medium text-ds-text group-hover:text-ds-gold transition-colors truncate">
                                    {cat.name}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

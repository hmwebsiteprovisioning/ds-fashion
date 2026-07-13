'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  Tag,
  Settings,
  Users,
  BarChart3,
  DollarSign,
  Percent,
  Image as ImageIcon,
  Eye,
  ArrowLeft,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  Boxes,
  ClipboardList,
  ShoppingCart,
  User,
  LogOut,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';
import { signOutAdmin } from '@/lib/auth';
import AdminPopover from './AdminPopover';
import AdminSidebarSearch from './AdminSidebarSearch';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
}

interface NavGroup {
  id: string;
  label: string;
  labelBg: string;
  items: NavItem[];
  collapsible?: boolean;
}

interface AdminSidebarProps {
  currentPath: string;
  collapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
}

function NavLink({
  item,
  active,
  isCollapsed,
  theme,
  onNavigate,
  onHover,
}: {
  item: NavItem;
  active: boolean;
  isCollapsed: boolean;
  theme: ReturnType<typeof useTheme>['theme'];
  onNavigate: () => void;
  onHover: (id: string | null) => void;
}) {
  const Icon = item.icon;
  return (
    <li className="relative">
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r"
          style={{ backgroundColor: theme.colors.primary }}
        />
      )}
      <Link
        href={item.path}
        className={`relative flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} px-2 py-2 rounded-lg transition-colors min-h-[40px] ${
          active ? 'font-medium' : ''
        }`}
        style={{
          backgroundColor: active ? `${theme.colors.primary}18` : 'transparent',
          color: active ? theme.colors.primary : theme.colors.textSecondary,
        }}
        onMouseEnter={() => {
          onHover(item.id);
        }}
        onMouseLeave={() => onHover(null)}
        onClick={onNavigate}
        title={isCollapsed ? item.label : undefined}
      >
        <Icon size={18} className="flex-shrink-0" />
        {!isCollapsed && <span className="text-xs truncate">{item.label}</span>}
      </Link>
    </li>
  );
}

export default function AdminSidebar({ collapsed: externalCollapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const t = translations[language || 'en'];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['catalog', 'sales', 'insights']));
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [internalCollapsed, setInternalCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin-sidebar-collapsed') === 'true';
    }
    return false;
  });

  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  useEffect(() => {
    setAdminEmail(localStorage.getItem('admin_user_email') || 'Admin');
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-sidebar-collapsed', String(isCollapsed));
    }
  }, [isCollapsed]);

  const handleToggle = () => {
    const newCollapsed = !isCollapsed;
    onToggle ? onToggle(newCollapsed) : setInternalCollapsed(newCollapsed);
  };

  const navGroups: NavGroup[] = [
    {
      id: 'overview',
      label: 'Overview',
      labelBg: 'Преглед',
      items: [{ id: 'dashboard', label: t.dashboard || 'Dashboard', path: '/admin', icon: LayoutDashboard }],
    },
    {
      id: 'catalog',
      label: 'Catalog',
      labelBg: 'Каталог',
      collapsible: true,
      items: [
        { id: 'product-types', label: language === 'bg' ? 'Категории' : 'Categories', path: '/admin/product-types', icon: Tag },
        { id: 'collections', label: language === 'bg' ? 'Колекции' : 'Collections', path: '/admin/collections', icon: Tag },
        { id: 'properties', label: language === 'bg' ? 'Характеристики' : 'Characteristics', path: '/admin/properties', icon: SlidersHorizontal },
        { id: 'products', label: language === 'bg' ? 'Артикули' : 'Items', path: '/admin/products', icon: Package },
        { id: 'stock', label: language === 'bg' ? 'Наличности' : 'Stock', path: '/admin/stock', icon: Boxes },
        { id: 'stock-in', label: language === 'bg' ? 'Заприхождаване' : 'Receive stock', path: '/admin/stock-in', icon: ClipboardList },
        { id: 'media', label: language === 'bg' ? 'Медия' : 'Media', path: '/admin/media', icon: ImageIcon },
      ],
    },
    {
      id: 'sales',
      label: 'Sales',
      labelBg: 'Продажби',
      collapsible: true,
      items: [
        { id: 'order-new', label: language === 'bg' ? 'Нова поръчка' : 'New order', path: '/admin/order-new', icon: ShoppingCart },
        { id: 'sales', label: language === 'bg' ? 'Продажби' : 'Sales', path: '/admin/sales', icon: BarChart3 },
        { id: 'customers', label: t.customers || 'Customers', path: '/admin/customers', icon: Users },
        { id: 'discounts', label: language === 'bg' ? 'Отстъпки' : 'Discounts', path: '/admin/discounts', icon: Percent },
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      labelBg: 'Анализи',
      collapsible: true,
      items: [
        { id: 'analytics', label: language === 'bg' ? 'Доклади' : 'Analytics', path: '/admin/analytics', icon: TrendingUp },
        { id: 'visitors', label: t.visitors || 'Visitors', path: '/admin/visitors', icon: Eye },
        { id: 'finance', label: language === 'bg' ? 'Финанси' : 'Finance', path: '/admin/finance', icon: DollarSign },
      ],
    },
  ];

  const bottomItems: NavItem[] = [
    { id: 'settings', label: t.storeSettings || 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') return pathname === '/admin';
    return pathname?.startsWith(path);
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const handleSignOut = async () => {
    await signOutAdmin();
    window.location.href = '/admin/login';
  };

  const closeMobile = () => {
    if (window.innerWidth < 1024) setIsMobileMenuOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-2 z-50 p-2 rounded-lg shadow-lg"
        style={{
          left: isMobileMenuOpen ? 'calc(256px - 5px - 2.5rem)' : '16px',
          backgroundColor: theme.colors.surface,
          color: theme.colors.text,
          border: `1px solid ${theme.colors.border}`,
        }}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen transform transition-transform duration-300 lg:transform-none ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-16' : 'w-64'} flex-shrink-0 border-r`}
        style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
      >
        <div className="h-full flex flex-col">
          {/* Profile block */}
          <div className="p-3 border-b" style={{ borderColor: theme.colors.border }}>
            {isCollapsed ? (
              <div className="flex justify-center">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: theme.colors.secondary }}
                >
                  <User size={18} style={{ color: theme.colors.primary }} />
                </div>
              </div>
            ) : (
              <AdminPopover
                align="left"
                trigger={
                  <div className="flex items-center gap-2 cursor-pointer rounded-lg p-2 hover:opacity-80">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: theme.colors.secondary }}
                    >
                      <User size={18} style={{ color: theme.colors.primary }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: theme.colors.text }}>
                        {adminEmail}
                      </p>
                      <p className="text-[10px]" style={{ color: theme.colors.textSecondary }}>
                        {language === 'bg' ? 'Администратор' : 'Administrator'}
                      </p>
                    </div>
                    <ChevronDown size={16} style={{ color: theme.colors.textSecondary }} />
                  </div>
                }
              >
                <div className="space-y-1 min-w-[180px]">
                  <button
                    onClick={() => setLanguage(language === 'bg' ? 'en' : 'bg')}
                    className="w-full text-left px-3 py-2 text-sm rounded hover:bg-slate-50"
                  >
                    {language === 'bg' ? 'English' : 'Български'}
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 text-sm rounded hover:bg-slate-50 flex items-center gap-2 text-red-600"
                  >
                    <LogOut size={14} />
                    {language === 'bg' ? 'Изход' : 'Sign out'}
                  </button>
                </div>
              </AdminPopover>
            )}
          </div>

          {/* Navigation groups */}
          <nav className="flex-1 overflow-y-auto p-2 min-h-0">
            {navGroups.map((group) => (
              <div key={group.id} className="mb-2">
                {!isCollapsed && (
                  <button
                    onClick={() => group.collapsible && toggleGroup(group.id)}
                    className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    <span>{language === 'bg' ? group.labelBg : group.label}</span>
                    {group.collapsible && (
                      <ChevronDown
                        size={12}
                        className={`transition-transform ${expandedGroups.has(group.id) ? '' : '-rotate-90'}`}
                      />
                    )}
                  </button>
                )}
                {(isCollapsed || !group.collapsible || expandedGroups.has(group.id)) && (
                  <ul className="space-y-0.5">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.id}
                        item={item}
                        active={isActive(item.path)}
                        isCollapsed={isCollapsed}
                        theme={theme}
                        onNavigate={closeMobile}
                        onHover={setHoveredItem}
                      />
                    ))}
                  </ul>
                )}
              </div>
            ))}

            {/* Sidebar search */}
            {!isCollapsed && (
              <div className="mt-3 px-1">
                <AdminSidebarSearch />
              </div>
            )}
          </nav>

          {/* Bottom: Settings + collapse + back to store */}
          <div className="p-2 border-t space-y-1 flex-shrink-0" style={{ borderColor: theme.colors.border }}>
            <ul className="space-y-0.5">
              {bottomItems.map((item) => (
                <NavLink
                  key={item.id}
                  item={item}
                  active={isActive(item.path)}
                  isCollapsed={isCollapsed}
                  theme={theme}
                  onNavigate={closeMobile}
                  onHover={setHoveredItem}
                />
              ))}
            </ul>

            <button
              onClick={() => window.innerWidth >= 1024 && handleToggle()}
              className={`hidden lg:flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} px-2 py-2 rounded-lg w-full text-xs`}
              style={{ backgroundColor: theme.colors.secondary, color: theme.colors.text }}
            >
              {isCollapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /><span>{language === 'bg' ? 'Свий' : 'Collapse'}</span></>}
            </button>

            <Link
              href="/"
              onClick={closeMobile}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} px-2 py-2 rounded-lg w-full text-xs`}
              style={{ backgroundColor: theme.colors.secondary, color: theme.colors.text }}
            >
              <ArrowLeft size={18} />
              {!isCollapsed && <span>{t.goToStore}</span>}
            </Link>
          </div>
        </div>

        {/* Collapsed tooltips */}
        {isCollapsed && hoveredItem && (
          <div
            ref={tooltipRef}
            className="fixed left-16 ml-2 px-3 py-2 rounded-lg shadow-lg z-50 text-xs pointer-events-none"
            style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}`, color: theme.colors.text }}
          >
            {[...navGroups.flatMap((g) => g.items), ...bottomItems].find((i) => i.id === hoveredItem)?.label}
          </div>
        )}
      </aside>
    </>
  );
}

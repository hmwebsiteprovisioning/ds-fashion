'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  Users,
  EuroIcon,
  ShoppingBag,
  type LucideIcon,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';
import AdminPage from './layout/AdminPage';
import PageHeader from './layout/PageHeader';
import Card from './layout/Card';
import { Badge } from './layout';
import AdminList, { AdminListItem } from './layout/AdminList';
import EmptyState from './layout/EmptyState';
import BulkActionsBar from './BulkActionsBar';
import AdminPopover from './AdminPopover';
import { AdminLineChart, AdminBarChart } from './charts';
import { getOrderStatusVariant } from '@/lib/admin-status-utils';
import { ChevronDown } from 'lucide-react';

type DateFilter = 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'lastYear';

const DATE_FILTER_LABELS: Record<DateFilter, { en: string; bg: string }> = {
  thisWeek: { en: 'This Week', bg: 'Тази седмица' },
  lastWeek: { en: 'Last Week', bg: 'Миналата седмица' },
  thisMonth: { en: 'This Month', bg: 'Този месец' },
  lastMonth: { en: 'Last Month', bg: 'Миналия месец' },
  thisYear: { en: 'This Year', bg: 'Тази година' },
  lastYear: { en: 'Last Year', bg: 'Миналата година' },
};

export default function Dashboard() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const router = useRouter();
  const t = translations[language || 'en'];
  const [dateFilter, setDateFilter] = useState<DateFilter>('thisMonth');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    salesGrowth: 0,
    ordersGrowth: 0,
    productsGrowth: 0,
    customersGrowth: 0,
    weeklySales: [] as Array<{ day: string; sales: number }>,
    productTypePerformance: [] as Array<{ productType: string; percentage: number; orders: number; sales: number }>,
    recentOrders: [] as Array<{ id: string; customer: string; amount: number; status: string; date: string }>,
    topProducts: [] as Array<{ name: string; sales: number; revenue: number; growth: number }>,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/dashboard?filter=${dateFilter}`);
        const result = await response.json();
        if (result.success && result.data) {
          setDashboardData({
            ...result.data,
            productTypePerformance: result.data.productTypePerformance || [],
            weeklySales: result.data.weeklySales || [],
            recentOrders: result.data.recentOrders || [],
            topProducts: result.data.topProducts || [],
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [dateFilter]);

  const dateFilterLabel = DATE_FILTER_LABELS[dateFilter][language === 'bg' ? 'bg' : 'en'];

  const lineChartData = useMemo(
    () =>
      dashboardData.weeklySales.map((d) => ({
        label: d.day,
        value: d.sales,
      })),
    [dashboardData.weeklySales]
  );

  const barChartData = useMemo(
    () =>
      dashboardData.productTypePerformance.map((pt) => ({
        label: pt.productType,
        value: pt.orders,
        secondaryValue: pt.sales,
        category: pt.productType,
      })),
    [dashboardData.productTypePerformance]
  );

  const weeklyTotal = dashboardData.weeklySales.reduce((s, d) => s + d.sales, 0);

  const toggleOrderSelect = (id: string, checked: boolean) => {
    setSelectedOrders((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const MetricCard = ({
    title,
    value,
    growth,
    icon: Icon,
    suffix = '',
  }: {
    title: string;
    value: number | string;
    growth: number;
    icon: LucideIcon;
    suffix?: string;
  }) => (
    <Card padding="small" className="!p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-medium text-slate-500 truncate">{title}</p>
          <p className="text-lg font-bold text-slate-900 truncate">
            {typeof value === 'number' ? value.toLocaleString() : value}
            {suffix}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            {growth >= 0 ? (
              <TrendingUp size={12} className="text-emerald-600" />
            ) : (
              <TrendingDown size={12} className="text-red-600" />
            )}
            <span className={`text-[10px] font-medium ${growth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {growth >= 0 ? '+' : ''}
              {growth}%
            </span>
          </div>
        </div>
        <div className="p-2 rounded-full bg-slate-100 flex-shrink-0">
          <Icon size={16} className="text-primary" />
        </div>
      </div>
    </Card>
  );

  const DateFilterPopover = (
    <AdminPopover
      align="right"
      trigger={
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50">
          {dateFilterLabel}
          <ChevronDown size={14} />
        </button>
      }
    >
      <div className="space-y-0.5 min-w-[160px]">
        {(Object.keys(DATE_FILTER_LABELS) as DateFilter[]).map((key) => (
          <button
            key={key}
            onClick={() => setDateFilter(key)}
            className={`w-full text-left px-3 py-2 text-xs rounded hover:bg-slate-50 ${
              dateFilter === key ? 'font-medium text-primary' : 'text-slate-600'
            }`}
          >
            {DATE_FILTER_LABELS[key][language === 'bg' ? 'bg' : 'en']}
          </button>
        ))}
      </div>
    </AdminPopover>
  );

  return (
    <AdminPage className="space-y-4">
      <PageHeader
        title={t.dashboard}
        subtitle={t.welcomeToAdmin}
        actions={DateFilterPopover}
      />

      {/* Row 1: Data management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <Card padding="none">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">{t.recentOrders}</h3>
            <Link href="/admin/sales" className="text-xs text-primary hover:underline">
              {language === 'bg' ? 'Виж всички' : 'View all'}
            </Link>
          </div>

          {selectedOrders.size > 0 && (
            <div className="px-4 py-2">
              <BulkActionsBar selectedCount={selectedOrders.size} onClear={() => setSelectedOrders(new Set())}>
                <button
                  onClick={() => router.push('/admin/sales')}
                  className="text-xs px-2 py-1 rounded bg-primary text-white"
                >
                  {language === 'bg' ? 'Отвори в продажби' : 'Open in Sales'}
                </button>
              </BulkActionsBar>
            </div>
          )}

          {loading ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
              ))}
            </div>
          ) : dashboardData.recentOrders.length > 0 ? (
            <AdminList selectable>
              {dashboardData.recentOrders.map((order) => (
                <AdminListItem
                  key={order.id}
                  selectable
                  selected={selectedOrders.has(order.id)}
                  onSelect={(checked) => toggleOrderSelect(order.id, checked)}
                  onClick={() => router.push(`/admin/sales?order=${order.id}`)}
                  thumbnail={
                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center">
                      <ShoppingCart size={14} className="text-slate-500" />
                    </div>
                  }
                  primary={order.id}
                  secondary={order.customer}
                  description={order.date}
                  meta={
                    <div className="text-right">
                      <span className="text-xs font-medium">€{order.amount.toFixed(2)}</span>
                      <Badge variant={getOrderStatusVariant(order.status)} className="text-[10px] mt-0.5">
                        {order.status}
                      </Badge>
                    </div>
                  }
                />
              ))}
            </AdminList>
          ) : (
            <div className="p-4">
              <EmptyState
                title={language === 'bg' ? 'Няма поръчки' : 'No orders yet'}
                description={language === 'bg' ? 'Поръчките ще се появят тук' : 'Orders will appear here'}
                icon={ShoppingCart}
                action={
                  <Link href="/admin/order-new" className="text-xs px-3 py-1.5 bg-primary text-white rounded-lg">
                    {language === 'bg' ? 'Нова поръчка' : 'New order'}
                  </Link>
                }
              />
            </div>
          )}
        </Card>

        {/* Top Products */}
        <Card padding="none">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">{t.topProducts}</h3>
            <Link
              href="/admin/order-new"
              className="text-xs px-2.5 py-1 bg-primary text-white rounded-lg hover:opacity-90"
            >
              {language === 'bg' ? 'Нова поръчка' : 'New order'}
            </Link>
          </div>
          {loading ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
              ))}
            </div>
          ) : dashboardData.topProducts.length > 0 ? (
            <AdminList>
              {dashboardData.topProducts.map((product, index) => (
                <AdminListItem
                  key={product.name}
                  thumbnail={
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                      {index + 1}
                    </div>
                  }
                  primary={product.name}
                  secondary={`${product.sales} ${t.sales}`}
                  meta={
                    <div className="text-right">
                      <span className="text-xs font-medium">€{product.revenue.toFixed(2)}</span>
                      {product.growth !== 0 && (
                        <span className={`text-[10px] block ${product.growth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {product.growth >= 0 ? '+' : ''}
                          {product.growth}%
                        </span>
                      )}
                    </div>
                  }
                />
              ))}
            </AdminList>
          ) : (
            <div className="p-4">
              <EmptyState
                title={language === 'bg' ? 'Няма продажби' : 'No sales yet'}
                icon={Package}
              />
            </div>
          )}
        </Card>
      </div>

      {/* Row 2: Metrics + Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* KPI Cards */}
        <Card padding="small">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            {language === 'bg' ? 'Ключови показатели' : 'Key Metrics'}
          </h3>
          {loading ? (
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-slate-100 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <MetricCard title={t.totalSales} value={dashboardData.totalSales} growth={dashboardData.salesGrowth} icon={EuroIcon} suffix="€" />
              <MetricCard title={t.totalOrders} value={dashboardData.totalOrders} growth={dashboardData.ordersGrowth} icon={ShoppingCart} />
              <MetricCard title={t.products} value={dashboardData.totalProducts} growth={dashboardData.productsGrowth} icon={Package} />
              <MetricCard title={t.customers} value={dashboardData.totalCustomers} growth={dashboardData.customersGrowth} icon={Users} />
            </div>
          )}
        </Card>

        {/* Line Chart */}
        <Card padding="small">
          {loading ? (
            <div className="h-48 bg-slate-100 rounded animate-pulse" />
          ) : (
            <AdminLineChart
              title={language === 'bg' ? 'Поръчки за седмицата' : 'Weekly Orders'}
              data={lineChartData}
              summaryMetric={{
                label: language === 'bg' ? 'Общо' : 'Total',
                value: weeklyTotal,
              }}
              dateRangeSelector={DateFilterPopover}
              valueLabel={language === 'bg' ? 'поръчки' : 'orders'}
            />
          )}
        </Card>
      </div>

      {/* Category bar chart - full width */}
      <Card padding="small">
        {loading ? (
          <div className="h-48 bg-slate-100 rounded animate-pulse" />
        ) : barChartData.length > 0 ? (
          <AdminBarChart
            title={language === 'bg' ? 'Поръчки по категория' : 'Orders by Category'}
            data={barChartData}
            valueLabel={language === 'bg' ? 'Поръчки' : 'Orders'}
            secondaryLabel={language === 'bg' ? 'Продажби €' : 'Sales €'}
            showContextToggle
            height={Math.max(200, barChartData.length * 36)}
          />
        ) : (
          <EmptyState
            title={language === 'bg' ? 'Няма данни за категории' : 'No category data'}
            icon={ShoppingBag}
          />
        )}
      </Card>
    </AdminPage>
  );
}

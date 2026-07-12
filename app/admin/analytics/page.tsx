'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';
import { AdminPage, PageHeader, Card, AdminTabs } from '../components/layout';
import { AdminLineChart, AdminBarChart } from '../components/charts';

interface AnalyticsData {
  totalOrders?: number;
  totalRevenue?: number;
  totalCustomers?: number;
  averageOrderValue?: number;
  salesByDay?: Array<{ date: string; orders: number; sales: number }>;
  topProducts?: Array<{ name: string; quantity: number; revenue: number }>;
  salesByStatus?: Array<{ status: string; count: number; revenue: number }>;
}

export default function AnalyticsPage() {
  const { language } = useLanguage();
  const t = translations[language || 'en'];
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    document.title = t.analytics || (language === 'bg' ? 'Анализи' : 'Analytics');
  }, [language, t]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/analytics');
      const result = await response.json();
      if (result.success) {
        setAnalyticsData(result.data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return t.pending;
      case 'confirmed': return t.confirmed;
      case 'shipped': return t.shipped;
      case 'delivered': return t.delivered;
      case 'cancelled': return t.cancelled;
      default: return status;
    }
  };

  const salesLineData = useMemo(
    () =>
      (analyticsData?.salesByDay || []).slice(-14).map((day, i, arr) => ({
        label: new Date(day.date).toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US', { month: 'short', day: 'numeric' }),
        value: day.sales,
        previousValue: i > 0 ? arr[i - 1].sales : undefined,
      })),
    [analyticsData?.salesByDay, language]
  );

  const topProductsBarData = useMemo(
    () =>
      (analyticsData?.topProducts || []).slice(0, 8).map((product) => ({
        label: product.name,
        value: product.revenue,
        secondaryValue: product.quantity,
      })),
    [analyticsData?.topProducts]
  );

  const statusBarData = useMemo(
    () =>
      (analyticsData?.salesByStatus || []).map((status) => ({
        label: getStatusLabel(status.status),
        value: status.count,
        secondaryValue: status.revenue,
        category: status.status,
      })),
    [analyticsData?.salesByStatus, t]
  );

  const analyticsTabs = [
    { id: 'overview', label: language === 'bg' ? 'Преглед' : 'Overview' },
    { id: 'products', label: t.topProducts, badge: analyticsData?.topProducts?.length },
    { id: 'status', label: t.salesByStatus, badge: analyticsData?.salesByStatus?.length },
  ];

  return (
    <AdminPage>
      <PageHeader
        title={t.analytics}
        subtitle={t.viewStorePerformanceMetrics}
      />

      <AdminTabs
        tabs={analyticsTabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        className="mb-4"
      />

      {loading ? (
        <Card className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
          <p className="mt-2 text-gray-500">{t.loadingAnalyticsData}</p>
        </Card>
      ) : !analyticsData ? (
        <Card className="text-center py-12">
          <p className="text-gray-500">{t.loadingAnalyticsData}</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <h3 className="text-sm font-semibold text-gray-900">{t.totalOrders}</h3>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{analyticsData.totalOrders || 0}</p>
                </Card>
                <Card>
                  <h3 className="text-sm font-semibold text-gray-900">{t.totalRevenue}</h3>
                  <p className="text-2xl font-bold text-green-600 mt-1">€{(analyticsData.totalRevenue || 0).toFixed(2)}</p>
                </Card>
                <Card>
                  <h3 className="text-sm font-semibold text-gray-900">{t.totalCustomers}</h3>
                  <p className="text-2xl font-bold text-purple-600 mt-1">{analyticsData.totalCustomers || 0}</p>
                </Card>
                <Card>
                  <h3 className="text-sm font-semibold text-gray-900">{t.averageOrderValue}</h3>
                  <p className="text-2xl font-bold text-orange-600 mt-1">€{(analyticsData.averageOrderValue || 0).toFixed(2)}</p>
                </Card>
              </div>

              {salesLineData.length > 0 && (
                <Card>
                  <AdminLineChart
                    title={t.recentSales}
                    data={salesLineData}
                    valueLabel="€"
                    summaryMetric={{
                      label: language === 'bg' ? 'Общо за периода' : 'Period total',
                      value: `€${salesLineData.reduce((s, d) => s + d.value, 0).toFixed(2)}`,
                    }}
                  />
                </Card>
              )}
            </>
          )}

          {activeTab === 'products' && (
            <Card>
              {topProductsBarData.length > 0 ? (
                <AdminBarChart
                  title={t.topProducts}
                  data={topProductsBarData}
                  valueLabel={language === 'bg' ? 'Приходи' : 'Revenue'}
                  secondaryLabel={t.sold}
                  showContextToggle
                />
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">{t.noOrdersFound}</p>
              )}
            </Card>
          )}

          {activeTab === 'status' && (
            <Card>
              {statusBarData.length > 0 ? (
                <AdminBarChart
                  title={t.salesByStatus}
                  data={statusBarData}
                  valueLabel={language === 'bg' ? 'Поръчки' : 'Orders'}
                  secondaryLabel={language === 'bg' ? 'Приходи' : 'Revenue'}
                  showContextToggle
                />
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">{t.noOrdersFound}</p>
              )}
            </Card>
          )}
        </div>
      )}
    </AdminPage>
  );
}

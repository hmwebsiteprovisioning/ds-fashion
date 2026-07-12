'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';
import { AdminPage, PageHeader, Card } from '../components/layout';

interface VisitorAnalytics {
  summary: {
    totalVisitors: number;
    totalSessions: number;
    totalPageViews: number;
    bounceRate: number;
    avgSessionDuration: number;
  };
  topCountries: Array<{ country: string; sessions: number }>;
  deviceTypes: Array<{ device: string; sessions: number }>;
  browsers: Array<{ browser: string; sessions: number }>;
  operatingSystems: Array<{ os: string; sessions: number }>;
  referrerSources: Array<{ referrer: string; sessions: number }>;
}

export default function VisitorsPage() {
  const { language } = useLanguage();
  const t = translations[language || 'en'];
  const [analytics, setAnalytics] = useState<VisitorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<string>('last7days');

  useEffect(() => {
    document.title = t.visitors || (language === 'bg' ? 'Посетители' : 'Visitors');
  }, [language, t]);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/visitors?timeRange=${timeRange}`);
      const result = await response.json();
      if (result.success) {
        setAnalytics(result.data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}${t.minutes.charAt(0)} ${secs}${t.seconds.charAt(0)}`;
    }
    return `${secs}${t.seconds.charAt(0)}`;
  };

  const getDeviceLabel = (device: string): string => {
    const map: Record<string, string> = {
      ios: t.ios,
      android: t.android,
      windows: t.windows,
      macos: t.macos,
      linux: t.linux,
      other: t.other,
    };
    return map[device.toLowerCase()] || device;
  };

  const getReferrerLabel = (referrer: string): string => {
    const map: Record<string, string> = {
      direct: t.direct,
      google: t.google,
      facebook: t.facebook,
      other: t.other,
    };
    return map[referrer.toLowerCase()] || referrer;
  };

  const timeRangeButtons = [
    { id: 'today', label: t.today },
    { id: 'last7days', label: t.last7Days },
    { id: 'last30days', label: t.last30Days },
  ];

  return (
    <AdminPage>
      <PageHeader
        title={t.visitors}
        subtitle={t.viewVisitorAnalytics}
        actions={
          <div className="flex gap-2 flex-wrap">
            {timeRangeButtons.map((range) => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  timeRange === range.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        }
      />

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
          <p className="mt-2 text-gray-500">{t.loadingVisitorData}</p>
        </div>
      ) : analytics ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <h3 className="text-xs font-semibold text-gray-600 uppercase">{t.totalVisitors}</h3>
              <p className="text-2xl font-bold text-blue-600 mt-1">{analytics.summary.totalVisitors}</p>
            </Card>
            <Card>
              <h3 className="text-xs font-semibold text-gray-600 uppercase">{t.sessions}</h3>
              <p className="text-2xl font-bold text-green-600 mt-1">{analytics.summary.totalSessions}</p>
            </Card>
            <Card>
              <h3 className="text-xs font-semibold text-gray-600 uppercase">{t.pageViews}</h3>
              <p className="text-2xl font-bold text-purple-600 mt-1">{analytics.summary.totalPageViews}</p>
            </Card>
            <Card>
              <h3 className="text-xs font-semibold text-gray-600 uppercase">{t.bounceRate}</h3>
              <p className="text-2xl font-bold text-orange-600 mt-1">{analytics.summary.bounceRate.toFixed(1)}%</p>
            </Card>
            <Card>
              <h3 className="text-xs font-semibold text-gray-600 uppercase">{t.avgSessionDuration}</h3>
              <p className="text-2xl font-bold text-indigo-600 mt-1">{formatDuration(analytics.summary.avgSessionDuration)}</p>
            </Card>
          </div>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.topCountries}</h3>
            <div className="space-y-2">
              {analytics.topCountries.slice(0, 10).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">{item.country}</span>
                  <span className="text-gray-600">{item.sessions} {t.sessions.toLowerCase()}</span>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.deviceTypes}</h3>
              <div className="space-y-2">
                {analytics.deviceTypes.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{getDeviceLabel(item.device)}</span>
                    <span className="text-gray-600">{item.sessions}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.browsers}</h3>
              <div className="space-y-2">
                {analytics.browsers.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{item.browser}</span>
                    <span className="text-gray-600">{item.sessions}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.operatingSystems}</h3>
              <div className="space-y-2">
                {analytics.operatingSystems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{item.os}</span>
                    <span className="text-gray-600">{item.sessions}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.referrerSources}</h3>
              <div className="space-y-2">
                {analytics.referrerSources.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium capitalize">{getReferrerLabel(item.referrer)}</span>
                    <span className="text-gray-600">{item.sessions}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="text-center py-12">
          <p className="text-gray-500">{t.noVisitorData}</p>
        </Card>
      )}
    </AdminPage>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';
import { getOrderStatusVariant } from '@/lib/admin-status-utils';
import { AdminPage, PageHeader, Card, Badge } from '../components/layout';

interface Transaction {
  orderid: string;
  date: string;
  customer: string;
  amount: number;
  status: string;
  type: string;
}

interface FinancialData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  totalDeliveryCost: number;
  netRevenue: number;
  revenueChange: number;
  ordersChange: number;
  transactions: Transaction[];
}

export default function FinancePage() {
  const { language } = useLanguage();
  const t = translations[language || 'en'];
  const [financeData, setFinanceData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    document.title = t.finance || (language === 'bg' ? 'Финанси' : 'Finance');
  }, [language, t]);

  useEffect(() => {
    loadFinanceData();
  }, []);

  useEffect(() => {
    if (financeData?.transactions) {
      setCurrentPage(1);
    }
  }, [financeData?.transactions?.length]);

  const loadFinanceData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/finance');
      const result = await response.json();
      if (result.success) {
        setFinanceData(result.data);
      }
    } catch (error) {
      console.error('Failed to load finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered': return t.delivered;
      case 'shipped': return t.shipped;
      case 'confirmed': return t.confirmed;
      case 'pending': return t.pending;
      default: return status;
    }
  };

  return (
    <AdminPage>
      <PageHeader
        title={t.finance}
        subtitle={t.financialOverviewAndRevenueTracking}
      />

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
          <p className="mt-2 text-gray-500">{t.loadingFinancialData}</p>
        </div>
      ) : financeData ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <h3 className="text-sm font-semibold text-gray-900">{t.totalRevenue}</h3>
              <p className="text-2xl font-bold text-success mt-1">€{financeData.totalRevenue.toFixed(2)}</p>
              {financeData.revenueChange !== 0 && (
                <p className={`text-sm mt-1 ${financeData.revenueChange > 0 ? 'text-success' : 'text-danger'}`}>
                  {financeData.revenueChange > 0 ? '+' : ''}{financeData.revenueChange.toFixed(1)}% {t.fromLastPeriod}
                </p>
              )}
            </Card>
            <Card>
              <h3 className="text-sm font-semibold text-gray-900">{t.netRevenue}</h3>
              <p className="text-2xl font-bold text-primary mt-1">€{financeData.netRevenue.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">
                {t.afterDeliveryCostsText} €{financeData.totalDeliveryCost.toFixed(2)}
              </p>
            </Card>
            <Card>
              <h3 className="text-sm font-semibold text-gray-900">{t.totalOrders}</h3>
              <p className="text-2xl font-bold text-primary mt-1">{financeData.totalOrders}</p>
              {financeData.ordersChange !== 0 && (
                <p className={`text-sm mt-1 ${financeData.ordersChange > 0 ? 'text-success' : 'text-danger'}`}>
                  {financeData.ordersChange > 0 ? '+' : ''}{financeData.ordersChange.toFixed(1)}% {t.fromLastPeriod}
                </p>
              )}
            </Card>
            <Card>
              <h3 className="text-sm font-semibold text-gray-900">{t.averageOrderValue}</h3>
              <p className="text-2xl font-bold text-primary mt-1">€{financeData.averageOrderValue.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">{t.perOrder}</p>
            </Card>
          </div>

          {financeData.transactions && financeData.transactions.length > 0 && (() => {
            const totalPages = Math.ceil(financeData.transactions.length / itemsPerPage);
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const currentTransactions = financeData.transactions.slice(startIndex, endIndex);

            return (
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.recentTransactions}</h3>
                <div className="space-y-3">
                  {currentTransactions.map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary font-semibold text-sm">
                            {transaction.customer && transaction.customer !== 'Unknown Customer'
                              ? transaction.customer.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                              : '??'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.customer || 'Unknown Customer'}</p>
                          <p className="text-sm text-gray-500">
                            {t.orderNumber}{transaction.orderid} • {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-success">€{transaction.amount.toFixed(2)}</p>
                        <Badge variant={getOrderStatusVariant(transaction.status)} className="mt-1">
                          {getStatusLabel(transaction.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      {t.showingTransactions} {startIndex + 1}-{Math.min(endIndex, financeData.transactions.length)} {t.ofTransactions} {financeData.transactions.length}
                    </div>
                    <nav className="inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-2 sm:px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronDown className="h-4 w-4 rotate-90" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 sm:px-4 py-2 border text-sm font-medium ${
                                currentPage === page
                                  ? 'bg-primary/10 border-primary text-primary'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        }
                        if (page === currentPage - 2 || page === currentPage + 2) {
                          return (
                            <span key={page} className="px-3 py-2 border border-gray-300 bg-white text-sm text-gray-700">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-2 sm:px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronDown className="h-4 w-4 -rotate-90" />
                      </button>
                    </nav>
                  </div>
                )}
              </Card>
            );
          })()}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="text-center">
              <h3 className="text-sm font-semibold text-gray-900">{t.deliveryCosts}</h3>
              <p className="text-2xl font-bold text-danger mt-1">€{financeData.totalDeliveryCost.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">{t.totalShippingExpenses}</p>
            </Card>
            <Card className="text-center">
              <h3 className="text-sm font-semibold text-gray-900">{t.pendingPayments}</h3>
              <p className="text-2xl font-bold text-warning mt-1">€{financeData.pendingPayments.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">{t.awaitingProcessing}</p>
            </Card>
            <Card className="text-center">
              <h3 className="text-sm font-semibold text-gray-900">{t.profitMargin}</h3>
              <p className="text-2xl font-bold text-primary mt-1">
                {financeData.totalRevenue > 0
                  ? ((financeData.netRevenue / financeData.totalRevenue) * 100).toFixed(1)
                  : 0}%
              </p>
              <p className="text-sm text-gray-500 mt-1">{t.revenueAfterCosts}</p>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="text-center py-12">
          <p className="text-gray-500">{t.unableToLoadFinancialData}</p>
        </Card>
      )}
    </AdminPage>
  );
}

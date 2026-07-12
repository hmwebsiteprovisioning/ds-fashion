'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, Users } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';
import { AdminPage, PageHeader, Card, AdminList, AdminListItem, EmptyState } from '../components/layout';

interface Customer {
  customerid: string;
  email?: string;
  name?: string;
  createdat: string;
  lastorder?: string;
  totalorders?: number;
  totalspent?: number;
}

export default function CustomersPage() {
  const { language } = useLanguage();
  const t = translations[language || 'en'];
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    document.title = t.customers || (language === 'bg' ? 'Клиенти' : 'Customers');
  }, [language, t]);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/customers');
      const result = await response.json();
      if (result.success) {
        setCustomers(result.customers || []);
      }
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.totalorders && c.totalorders > 0).length;
  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = customers.slice(startIndex, endIndex);

  return (
    <AdminPage>
      <PageHeader
        title={t.customers}
        subtitle={t.manageAndViewCustomerBase}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Card>
          <h3 className="text-sm font-semibold text-gray-900">{t.totalCustomers}</h3>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-1">{totalCustomers}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-gray-900">{t.activeCustomers}</h3>
          <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1">{activeCustomers}</p>
        </Card>
      </div>

      {loading ? (
        <div className="text-center py-8 sm:py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
          <p className="mt-2 text-sm text-gray-500">{t.loadingCustomers}</p>
        </div>
      ) : customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t.noCustomersFound}
          description={language === 'bg' ? 'Клиентите ще се появят тук след първата поръчка.' : 'Customers will appear here after their first order.'}
        />
      ) : (
        <>
          <AdminList>
            {paginatedCustomers.map((customer) => (
              <AdminListItem
                key={customer.customerid}
                thumbnail={
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                    {(customer.name || customer.email || '?').charAt(0).toUpperCase()}
                  </div>
                }
                primary={customer.name || t.na}
                secondary={customer.email || t.na}
                meta={
                  <span className="font-medium text-slate-900">
                    €{customer.totalspent?.toFixed(2) || '0.00'}
                  </span>
                }
                description={
                  <>
                    {customer.totalorders || 0} {t.totalOrdersHeader?.toLowerCase() || 'orders'}
                    {' · '}
                    {t.lastOrderHeader}: {customer.lastorder ? new Date(customer.lastorder).toLocaleDateString() : t.never}
                    {' · '}
                    {t.joinedHeader}: {new Date(customer.createdat).toLocaleDateString()}
                  </>
                }
              />
            ))}
          </AdminList>

          {totalPages > 1 && (
            <div className="mt-4 px-3 sm:px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 border border-slate-200 rounded-lg bg-white">
              <div className="flex-1 flex justify-between sm:hidden w-full">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  {t.previous || 'Previous'}
                </button>
                <span className="flex items-center text-sm text-gray-700">
                  <span className="font-medium">{currentPage}</span> / <span className="font-medium">{totalPages}</span>
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  {t.next || 'Next'}
                </button>
              </div>

              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between w-full">
                <p className="text-xs sm:text-sm text-gray-700">
                  {t.showingTransactions || 'Showing'} <span className="font-medium">{startIndex + 1}</span>{' '}
                  {language === 'bg' ? 'до' : 'to'} <span className="font-medium">{Math.min(endIndex, customers.length)}</span>{' '}
                  {language === 'bg' ? 'от' : 'of'} <span className="font-medium">{customers.length}</span>{' '}
                  {language === 'bg' ? 'клиенти' : 'customers'}
                </p>
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
                              ? 'bg-blue-50 border-blue-500 text-blue-600'
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
            </div>
          )}
        </>
      )}
    </AdminPage>
  );
}

'use client';

import { useEffect, useState } from 'react';
import AdminModal from '../components/AdminModal';
import AdminConfirmDialog from '../components/AdminConfirmDialog';
import { useAdminToast } from '../components/AdminToast';
import { useOptimisticMutation } from '../lib/useOptimisticMutation';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';
import { Plus, Edit2, Trash2, ChevronDown } from 'lucide-react';
import CompleteAnimation from '@/components/CompleteAnimation';
import { AdminPage, PageHeader, Card, Badge } from '../components/layout';

interface Discount {
  discountid: string;
  code: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
  isactive: boolean;
  createdat: string;
  expiresat?: string;
}

interface DiscountFormData {
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: string;
  isactive: boolean;
  expiresat: string;
}

export default function DiscountsPage() {
  const { language } = useLanguage();
  const t = translations[language || 'en'];
  const toast = useAdminToast();
  const { mutate: optimisticMutate } = useOptimisticMutation();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [discountPendingDelete, setDiscountPendingDelete] = useState<Discount | null>(null);
  const [formData, setFormData] = useState<DiscountFormData>({
    code: '',
    description: '',
    type: 'percentage',
    value: '',
    isactive: true,
    expiresat: '',
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showCompleteAnimation, setShowCompleteAnimation] = useState(false);

  useEffect(() => {
    document.title = t.discounts || (language === 'bg' ? 'Отстъпки' : 'Discounts');
  }, [language, t]);

  useEffect(() => {
    loadDiscounts();
  }, []);

  const loadDiscounts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/discounts');
      const result = await response.json();
      if (result.success) {
        setDiscounts(result.discounts || []);
      }
    } catch (error) {
      console.error('Failed to load discounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      type: 'percentage',
      value: '',
      isactive: true,
      expiresat: '',
    });
    setFormErrors([]);
    setEditingDiscount(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (discount: Discount) => {
    setFormData({
      code: discount.code,
      description: discount.description || '',
      type: discount.type,
      value: discount.value.toString(),
      isactive: discount.isactive,
      expiresat: discount.expiresat ? new Date(discount.expiresat).toISOString().slice(0, 16) : '',
    });
    setEditingDiscount(discount);
    setShowModal(true);
  };

  const closeModal = () => {
    if (!showCompleteAnimation) {
      setShowModal(false);
      setShowCompleteAnimation(false);
      resetForm();
    }
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.code.trim()) {
      errors.push(t.discountCodeRequiredMsg);
    } else if (formData.code.length < 3 || formData.code.length > 50) {
      errors.push(t.discountCodeLengthMsg);
    } else if (!/^[A-Z0-9_-]+$/i.test(formData.code)) {
      errors.push(t.discountCodeFormatMsg);
    }

    if (!formData.type || !['percentage', 'fixed'].includes(formData.type)) {
      errors.push(t.discountTypeRequiredMsg);
    }

    const value = parseFloat(formData.value);
    if (isNaN(value) || value <= 0) {
      errors.push(t.discountValueRequiredMsg);
    } else if (formData.type === 'percentage' && value > 100) {
      errors.push(t.discountPercentageMaxMsg);
    }

    if (formData.expiresat) {
      const expiryDate = new Date(formData.expiresat);
      if (isNaN(expiryDate.getTime())) {
        errors.push(t.invalidExpiryDateMsg);
      } else if (expiryDate <= new Date()) {
        errors.push(t.expiryDateFutureMsg);
      }
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      setFormErrors([]);

      const submitData = {
        ...formData,
        value: parseFloat(formData.value),
        expiresat: formData.expiresat || null,
        ...(editingDiscount && { discountid: editingDiscount.discountid }),
      };

      const method = editingDiscount ? 'PUT' : 'POST';
      const response = await fetch('/api/admin/discounts', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.details) {
          setFormErrors(result.details);
        } else {
          setFormErrors([result.error || 'Failed to save discount']);
        }
        return;
      }

      if (result.success) {
        setShowCompleteAnimation(true);
        setTimeout(async () => {
          await loadDiscounts();
          closeModal();
          setShowCompleteAnimation(false);
          toast.success(
            editingDiscount
              ? (language === 'bg' ? 'Отстъпката е обновена' : 'Discount updated')
              : (language === 'bg' ? 'Отстъпката е създадена' : 'Discount created')
          );
        }, 1200);
      }
    } catch (error) {
      console.error('Failed to save discount:', error);
      setFormErrors([t.unexpectedError]);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!discountPendingDelete) return;
    const discount = discountPendingDelete;
    const previousDiscounts = discounts;

    await optimisticMutate({
      applyOptimistic: () => {
        setDiscounts((prev) => prev.filter((d) => d.discountid !== discount.discountid));
        setDiscountPendingDelete(null);
      },
      rollback: () => setDiscounts(previousDiscounts),
      request: async () => {
        const response = await fetch(`/api/admin/discounts?id=${discount.discountid}`, { method: 'DELETE' });
        const result = await response.json();
        if (!result.success) throw new Error(result.error || t.failedToDeleteDiscount);
        return result;
      },
      onSuccess: () => toast.success(language === 'bg' ? 'Отстъпката е изтрита' : 'Discount deleted'),
      onError: (err) => toast.error(err instanceof Error ? err.message : t.unexpectedErrorDeleting),
    });
  };

  const activeDiscounts = discounts.filter((d) => d.isactive).length;
  const totalPages = Math.ceil(discounts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDiscounts = discounts.slice(startIndex, endIndex);

  return (
    <AdminPage>
      <PageHeader
        title={t.discounts}
        subtitle={t.manageDiscountCodesAndPromotions}
        actions={
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 text-sm sm:text-base"
          >
            <Plus size={18} className="sm:w-5 sm:h-5 mr-2" />
            {t.addDiscountCode}
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Card>
          <h3 className="text-sm font-semibold text-gray-900">{t.totalDiscounts}</h3>
          <p className="text-2xl font-bold text-blue-600 mt-1">{discounts.length}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-gray-900">{t.activeDiscounts}</h3>
          <p className="text-2xl font-bold text-success mt-1">{activeDiscounts}</p>
        </Card>
      </div>

      <Card className="overflow-hidden p-0">
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
            <p className="mt-2 text-sm text-gray-500">{t.loadingDiscounts}</p>
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.codeHeader}</th>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.descriptionHeader}</th>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.typeHeader}</th>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.valueHeader}</th>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.statusHeader}</th>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.expiresHeader}</th>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.actionsHeader}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedDiscounts.map((discount) => (
                    <tr key={discount.discountid} className="hover:bg-gray-50">
                      <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm font-mono">{discount.code}</td>
                      <td className="px-4 xl:px-6 py-4 text-sm text-gray-500">
                        <div className="max-w-xs truncate">{discount.description || t.na}</div>
                      </td>
                      <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                          {discount.type === 'percentage' ? t.percentage : t.fixedAmount}
                        </span>
                      </td>
                      <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {discount.type === 'percentage' ? `${discount.value}%` : `€${discount.value.toFixed(2)}`}
                      </td>
                      <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                        <Badge variant={discount.isactive ? 'success' : 'danger'}>
                          {discount.isactive ? t.active : t.inactive}
                        </Badge>
                      </td>
                      <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {discount.expiresat ? new Date(discount.expiresat).toLocaleDateString() : t.never}
                      </td>
                      <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(discount)}
                            className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded"
                            title={t.editDiscountCode || 'Edit discount'}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setDiscountPendingDelete(discount)}
                            className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                            title={language === 'bg' ? 'Изтрий отстъпка' : 'Delete discount'}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden divide-y divide-gray-200">
              {paginatedDiscounts.map((discount) => (
                <div key={discount.discountid} className="p-3 sm:p-4 hover:bg-gray-50">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-medium font-mono">{discount.code}</h3>
                          <Badge variant={discount.isactive ? 'success' : 'danger'}>
                            {discount.isactive ? t.active : t.inactive}
                          </Badge>
                        </div>
                        {discount.description && (
                          <p className="text-xs text-gray-500 line-clamp-2">{discount.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openEditModal(discount)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => setDiscountPendingDelete(discount)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500">{t.typeHeader}</p>
                        <p className="text-sm font-medium">{discount.type === 'percentage' ? t.percentage : t.fixedAmount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{t.valueHeader}</p>
                        <p className="text-sm font-medium">
                          {discount.type === 'percentage' ? `${discount.value}%` : `€${discount.value.toFixed(2)}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {discounts.length === 0 && !loading && (
          <div className="text-center py-8 sm:py-12 px-4 text-gray-500">
            <p className="text-sm">{t.noDiscountsFoundEmpty}</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-3 sm:px-4 lg:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-200">
            <div className="hidden sm:block text-xs sm:text-sm text-gray-700">
              {t.showingTransactions || 'Showing'} <span className="font-medium">{startIndex + 1}</span>{' '}
              {language === 'bg' ? 'до' : 'to'} <span className="font-medium">{Math.min(endIndex, discounts.length)}</span>{' '}
              {language === 'bg' ? 'от' : 'of'} <span className="font-medium">{discounts.length}</span>{' '}
              {language === 'bg' ? 'отстъпки' : 'discounts'}
            </div>
            <nav className="inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm text-gray-500 disabled:opacity-50"
              >
                <ChevronDown className="h-4 w-4 rotate-90" />
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm text-gray-500 disabled:opacity-50"
              >
                <ChevronDown className="h-4 w-4 -rotate-90" />
              </button>
            </nav>
          </div>
        )}
      </Card>

      <AdminConfirmDialog
        isOpen={!!discountPendingDelete}
        onClose={() => setDiscountPendingDelete(null)}
        onConfirm={confirmDelete}
        title={language === 'bg' ? 'Изтриване на отстъпка' : 'Delete discount'}
        message={`${t.confirmDeleteDiscount} "${discountPendingDelete?.code}"?`}
        confirmLabel={language === 'bg' ? 'Изтрий' : 'Delete'}
        cancelLabel={t.cancel}
        variant="danger"
      />

      <AdminModal
        isOpen={showModal}
        onClose={closeModal}
        title={editingDiscount ? t.editDiscountCode : t.createDiscountCode}
        subheader={
          editingDiscount
            ? (language === 'bg' ? 'Редактирайте информацията за отстъпката' : 'Edit the discount code information')
            : (language === 'bg' ? 'Създайте нов код за отстъпка за вашите клиенти' : 'Create a new discount code for your customers')
        }
        maxWidth="max-w-md"
        minWidth={400}
        minHeight={500}
      >
        <div className="relative">
          <form onSubmit={handleSubmit} className={`space-y-4 transition-all duration-300 ${showCompleteAnimation ? 'blur-sm pointer-events-none' : ''}`}>
            {formErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <ul className="text-xs sm:text-sm text-red-600 space-y-1">
                  {formErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{t.discountCodeRequired}</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md font-mono"
                placeholder={t.discountCodePlaceholder}
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{t.discountDescription}</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                placeholder={t.discountDescriptionPlaceholder}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{t.discountTypeRequired}</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as 'percentage' | 'fixed' }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
              >
                <option value="percentage">{t.percentage}</option>
                <option value="fixed">{t.fixedAmount}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{t.discountValueRequired}</label>
              <div className="flex">
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData((prev) => ({ ...prev, value: e.target.value }))}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-l-md"
                  min="0"
                  step={formData.type === 'percentage' ? '1' : '0.01'}
                  required
                />
                <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-xs rounded-r-md">
                  {formData.type === 'percentage' ? '%' : '€'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{t.expiryDateOptional}</label>
              <input
                type="datetime-local"
                value={formData.expiresat}
                onChange={(e) => setFormData((prev) => ({ ...prev, expiresat: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="isactive"
                checked={formData.isactive}
                onChange={(e) => setFormData((prev) => ({ ...prev, isactive: e.target.checked }))}
                className="mt-0.5 w-4 h-4"
              />
              <label htmlFor="isactive" className="text-xs sm:text-sm text-gray-700">{t.activeStatus}</label>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t border-gray-200">
              <button type="button" onClick={closeModal} className="px-4 py-2.5 text-sm text-gray-700 bg-gray-100 rounded-lg" disabled={submitting}>
                {t.cancel}
              </button>
              <button type="submit" disabled={submitting} className="px-4 py-2.5 text-sm bg-primary text-primary-foreground rounded-lg disabled:opacity-50">
                {submitting ? t.saving : (editingDiscount ? t.updateDiscount : t.createDiscountBtn)}
              </button>
            </div>
          </form>

          {showCompleteAnimation && (
            <div className="absolute inset-0 flex items-center justify-center z-50">
              <CompleteAnimation size={120} />
            </div>
          )}
        </div>
      </AdminModal>
    </AdminPage>
  );
}

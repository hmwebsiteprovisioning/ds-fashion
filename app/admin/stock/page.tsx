'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { Plus, Minus, AlertCircle, Save } from 'lucide-react';
import { AdminPage, PageHeader, Section, Card } from '../components/layout';

interface StockVariant {
  productvariantid: string;
  productid: string;
  product_name: string;
  sku: string | null;
  quantity: number;
  trackquantity: boolean;
  primary_image?: string | null;
  characteristics: Array<{
    property_name: string;
    value: string;
  }>;
}

export default function StockPage() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const [variants, setVariants] = useState<StockVariant[]>([]);
  const [filteredVariants, setFilteredVariants] = useState<StockVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<string>('all'); // 'all', 'low', 'out'
  const [editingQuantities, setEditingQuantities] = useState<Record<string, number>>({});
  const [updatingVariants, setUpdatingVariants] = useState<Set<string>>(new Set());
  const [tempQuantities, setTempQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    loadStock();
  }, []);

  useEffect(() => {
    filterVariants();
  }, [variants, searchTerm, stockFilter]);

  const loadStock = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stock');
      const result = await response.json();
      if (result.success) {
        setVariants(result.variants || []);
        // Initialize temp quantities
        const initialTemp: Record<string, number> = {};
        result.variants?.forEach((v: StockVariant) => {
          initialTemp[v.productvariantid] = v.quantity;
        });
        setTempQuantities(initialTemp);
      }
    } catch (error) {
      console.error('Failed to load stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterVariants = () => {
    let filtered = [...variants];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(v => 
        v.product_name.toLowerCase().includes(searchLower) ||
        v.sku?.toLowerCase().includes(searchLower) ||
        v.characteristics.some(c => 
          c.property_name.toLowerCase().includes(searchLower) ||
          c.value.toLowerCase().includes(searchLower)
        )
      );
    }

    // Apply stock filter
    if (stockFilter === 'low') {
      filtered = filtered.filter((v) => v.quantity === 1);
    } else if (stockFilter === 'out') {
      filtered = filtered.filter((v) => v.quantity === 0);
    } else if (stockFilter === 'negative') {
      filtered = filtered.filter((v) => v.quantity < 0);
    }

    setFilteredVariants(filtered);
  };

  const updateQuantity = async (variantId: string, action: 'set' | 'add' | 'remove', amount?: number) => {
    try {
      setUpdatingVariants(prev => new Set(prev).add(variantId));
      
      const currentQuantity = tempQuantities[variantId] || variants.find(v => v.productvariantid === variantId)?.quantity || 0;
      let newQuantity = currentQuantity;

      if (action === 'add') {
        newQuantity = currentQuantity + (amount || 1);
      } else if (action === 'remove') {
        newQuantity = currentQuantity - (amount || 1);
      } else if (action === 'set' && amount !== undefined) {
        newQuantity = amount;
      }

      const response = await fetch(`/api/admin/stock/${variantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          quantity: newQuantity,
          action: 'set'
        }),
      });

      const result = await response.json();
      if (result.success) {
        // Update local state
        setVariants(prev => prev.map(v => 
          v.productvariantid === variantId 
            ? { ...v, quantity: newQuantity }
            : v
        ));
        setTempQuantities(prev => ({ ...prev, [variantId]: newQuantity }));
        setEditingQuantities(prev => {
          const next = { ...prev };
          delete next[variantId];
          return next;
        });
      } else {
        alert(result.error || (language === 'bg' ? 'Грешка при обновяване на наличност' : 'Failed to update stock'));
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
      alert(language === 'bg' ? 'Грешка при обновяване на наличност' : 'Failed to update stock');
    } finally {
      setUpdatingVariants(prev => {
        const next = new Set(prev);
        next.delete(variantId);
        return next;
      });
    }
  };

  const handleQuantityChange = (variantId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setTempQuantities(prev => ({ ...prev, [variantId]: numValue }));
    setEditingQuantities(prev => ({ ...prev, [variantId]: numValue }));
  };

  const handleSaveQuantity = (variantId: string) => {
    const newQuantity = tempQuantities[variantId] ?? variants.find(v => v.productvariantid === variantId)?.quantity ?? 0;
    updateQuantity(variantId, 'set', newQuantity);
  };

  const formatCharacteristics = (characteristics: Array<{ property_name: string; value: string }>) => {
    if (characteristics.length === 0) return language === 'bg' ? 'Няма характеристики' : 'No characteristics';
    return characteristics.map(c => `${c.property_name}: ${c.value}`).join(', ');
  };

  const getStockStatusColor = (quantity: number) => {
    if (quantity < 0) {
      return 'text-purple-700 dark:text-purple-400';
    }
    if (quantity === 0) {
      return 'text-red-600 dark:text-red-400';
    }
    if (quantity === 1) {
      return 'text-yellow-600 dark:text-yellow-400';
    }
    return 'text-green-600 dark:text-green-400';
  };

  const totalVariants = variants.length;
  const lowStockCount = variants.filter((v) => v.quantity === 1).length;
  const outOfStockCount = variants.filter((v) => v.quantity === 0).length;
  const negativeStockCount = variants.filter((v) => v.quantity < 0).length;
  const inStockCount = variants.filter((v) => v.quantity > 1).length;

  return (
    <AdminPage className="space-y-4 sm:space-y-6">
      <PageHeader
        title={language === 'bg' ? 'Наличности' : 'Stock Management'}
        subtitle={language === 'bg' ? 'Управление на наличностите по варианти' : 'Manage stock quantities for all product variants'}
        actions={
          <Link
            href="/admin/stock-in"
            className="inline-flex items-center text-sm font-medium underline touch-manipulation min-h-[44px] py-2"
            style={{ color: theme.colors.primary }}
          >
            {language === 'bg' ? '→ Заприхождаване' : '→ Receive stock'}
          </Link>
        }
      />

        {/* Summary Cards */}
        <Section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          <div
            className="p-4 sm:p-5 lg:p-6 rounded-lg shadow-sm border"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text
            }}
          >
            <p className="text-xs sm:text-sm font-medium opacity-75" style={{ color: theme.colors.textSecondary }}>
              {language === 'bg' ? 'Общо варианти' : 'Total Variants'}
            </p>
            <p className="text-xl sm:text-2xl font-bold mt-1 sm:mt-2">{totalVariants}</p>
          </div>
          <div
            className="p-4 sm:p-5 lg:p-6 rounded-lg shadow-sm border"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text
            }}
          >
            <p className="text-xs sm:text-sm font-medium opacity-75" style={{ color: theme.colors.textSecondary }}>
              {language === 'bg' ? 'Нормална (>1)' : 'Normal (>1)'}
            </p>
            <p className="text-xl sm:text-2xl font-bold mt-1 sm:mt-2 text-green-600 dark:text-green-400">{inStockCount}</p>
          </div>
          <div
            className="p-4 sm:p-5 lg:p-6 rounded-lg shadow-sm border"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text
            }}
          >
            <p className="text-xs sm:text-sm font-medium opacity-75" style={{ color: theme.colors.textSecondary }}>
              {language === 'bg' ? 'Ниска (1 бр.)' : 'Low (1 pc)'}
            </p>
            <p className="text-xl sm:text-2xl font-bold mt-1 sm:mt-2 text-yellow-600 dark:text-yellow-400">{lowStockCount}</p>
          </div>
          <div
            className="p-4 sm:p-5 lg:p-6 rounded-lg shadow-sm border"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text
            }}
          >
            <p className="text-xs sm:text-sm font-medium opacity-75" style={{ color: theme.colors.textSecondary }}>
              {language === 'bg' ? 'Изчерпани (0)' : 'Out (0)'}
            </p>
            <p className="text-xl sm:text-2xl font-bold mt-1 sm:mt-2 text-red-600 dark:text-red-400">{outOfStockCount}</p>
          </div>
          <div
            className="p-4 sm:p-5 lg:p-6 rounded-lg shadow-sm border"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text
            }}
          >
            <p className="text-xs sm:text-sm font-medium opacity-75" style={{ color: theme.colors.textSecondary }}>
              {language === 'bg' ? 'Отрицателна' : 'Negative'}
            </p>
            <p className="text-xl sm:text-2xl font-bold mt-1 sm:mt-2 text-purple-600 dark:text-purple-400">{negativeStockCount}</p>
          </div>
        </div>
        </Section>

        {/* Filters */}
        <Section>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <input
            type="search"
            placeholder={language === 'bg' ? 'Търсене по продукт, SKU или характеристики...' : 'Search by product, SKU or characteristics...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2.5 sm:py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:border-transparent transition-colors duration-300"
            style={{
              backgroundColor: theme.colors.cardBg,
              borderColor: theme.colors.border,
              color: theme.colors.text
            }}
          />

          {/* Stock Filter */}
          <div className="flex gap-2">
            {['all', 'low', 'out', 'negative'].map((filter) => (
              <button
                key={filter}
                onClick={() => setStockFilter(filter)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  stockFilter === filter ? 'text-white' : ''
                }`}
                style={{
                  backgroundColor: stockFilter === filter ? theme.colors.primary : theme.colors.surface,
                  color: stockFilter === filter ? '#ffffff' : theme.colors.text,
                  border: `1px solid ${theme.colors.border}`
                }}
              >
                {filter === 'all' && (language === 'bg' ? 'Всички' : 'All')}
                {filter === 'low' && (language === 'bg' ? 'Ниска наличност' : 'Low Stock')}
                {filter === 'out' && (language === 'bg' ? 'Изчерпани' : 'Out of Stock')}
                {filter === 'negative' && (language === 'bg' ? 'Претоварване' : 'Oversold')}
              </button>
            ))}
          </div>
        </div>
        </Section>

        {/* Stock Grid */}
        <Section>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : filteredVariants.length === 0 ? (
          <div className="p-8 text-center" style={{ color: theme.colors.textSecondary }}>
            {language === 'bg' ? 'Няма намерени варианти' : 'No variants found'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredVariants.map((variant) => {
              const isUpdating = updatingVariants.has(variant.productvariantid);
              const currentQuantity = tempQuantities[variant.productvariantid] ?? variant.quantity;
              const isEditing = editingQuantities[variant.productvariantid] !== undefined;

              return (
                <Card
                  key={variant.productvariantid}
                  className="p-4 sm:p-5"
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border
                  }}
                >
                  {variant.primary_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={variant.primary_image}
                      alt=""
                      className="w-full h-40 object-cover rounded-lg mb-3 border"
                      style={{ borderColor: theme.colors.border }}
                    />
                  ) : null}

                  {/* Product Name */}
                  <Link
                    href={`/admin/products`}
                    className="block mb-2 font-semibold text-sm sm:text-base hover:underline"
                    style={{ color: theme.colors.primary }}
                  >
                    {variant.product_name}
                  </Link>

                  {/* Characteristics */}
                  <div className="mb-3 text-xs sm:text-sm" style={{ color: theme.colors.textSecondary }}>
                    {formatCharacteristics(variant.characteristics)}
                  </div>

                  {/* SKU */}
                  {variant.sku && (
                    <div className="mb-3 text-xs" style={{ color: theme.colors.textSecondary }}>
                      SKU: {variant.sku}
                    </div>
                  )}

                  {/* Current Quantity */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm font-medium" style={{ color: theme.colors.textSecondary }}>
                        {language === 'bg' ? 'Наличност:' : 'Stock:'}
                      </span>
                      <span className={`text-lg sm:text-xl font-bold ${getStockStatusColor(variant.quantity)}`}>
                        {variant.quantity}
                        {variant.quantity === 0 && (
                          <AlertCircle size={16} className="inline-block ml-1" />
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="space-y-2">
                    {/* Quantity Input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={currentQuantity}
                        onChange={(e) => handleQuantityChange(variant.productvariantid, e.target.value)}
                        disabled={isUpdating}
                        className="flex-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                        style={{
                          backgroundColor: theme.colors.cardBg,
                          borderColor: theme.colors.border,
                          color: theme.colors.text
                        }}
                      />
                      {isEditing && (
                        <button
                          onClick={() => handleSaveQuantity(variant.productvariantid)}
                          disabled={isUpdating}
                          className="p-2 rounded-lg transition-colors"
                          style={{
                            backgroundColor: theme.colors.primary,
                            color: '#ffffff'
                          }}
                          title={language === 'bg' ? 'Запази' : 'Save'}
                        >
                          <Save size={16} />
                        </button>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateQuantity(variant.productvariantid, 'add', 1)}
                        disabled={isUpdating}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm rounded-lg transition-colors"
                        style={{
                          backgroundColor: theme.colors.secondary,
                          color: theme.colors.text
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = theme.colors.primary;
                          e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = theme.colors.secondary;
                          e.currentTarget.style.color = theme.colors.text;
                        }}
                      >
                        <Plus size={14} />
                        {language === 'bg' ? 'Добави' : 'Add'}
                      </button>
                      <button
                        onClick={() => updateQuantity(variant.productvariantid, 'remove', 1)}
                        disabled={isUpdating}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm rounded-lg transition-colors disabled:opacity-50"
                        style={{
                          backgroundColor: theme.colors.secondary,
                          color: theme.colors.text
                        }}
                        onMouseEnter={(e) => {
                          if (!isUpdating) {
                            e.currentTarget.style.backgroundColor = theme.colors.primary;
                            e.currentTarget.style.color = '#ffffff';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = theme.colors.secondary;
                          e.currentTarget.style.color = theme.colors.text;
                        }}
                      >
                        <Minus size={14} />
                        {language === 'bg' ? 'Премахни' : 'Remove'}
                      </button>
                    </div>

                    {isUpdating && (
                      <div className="flex items-center justify-center py-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
        </Section>
    </AdminPage>
  );
}

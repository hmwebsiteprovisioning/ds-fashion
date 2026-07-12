'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { ProductType, Property } from '@/lib/types/product-types';
import AdminModal from '../../components/AdminModal';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';
import CompleteAnimation from '@/components/CompleteAnimation';
import { AdminPage, PageHeader, Section, Card, Breadcrumbs } from '../../components/layout';

export default function ProductTypeDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { language } = useLanguage();
  const t = translations[language || 'bg'];

  const [productType, setProductType] = useState<ProductType | null>(null);

  useEffect(() => {
    if (productType) {
      document.title = productType.name || t.productTypes || (language === 'bg' ? 'Категория' : 'Product Type');
    } else {
      document.title = t.productTypes || (language === 'bg' ? 'Категория' : 'Product Type');
    }
  }, [productType, language, t]);
  const [assignedProperties, setAssignedProperties] = useState<any[]>([]);
  const [availableProperties, setAvailableProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<Set<string>>(new Set());
  const [addingProperties, setAddingProperties] = useState(false);
  const [showCompleteAnimation, setShowCompleteAnimation] = useState(false);

  useEffect(() => {
    if (id) {
      loadProductType();
      loadAvailableProperties();
    }
  }, [id]);

  const loadProductType = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/product-types/${id}`);
      const result = await response.json();
      if (result.success) {
        setProductType(result.productType);
        setAssignedProperties(result.productType.product_type_properties || []);
      }
    } catch (error) {
      console.error('Failed to load product type:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableProperties = async () => {
    try {
      const response = await fetch('/api/properties');
      const result = await response.json();
      if (result.success) {
        setAvailableProperties(result.properties);
      }
    } catch (error) {
      console.error('Failed to load properties:', error);
    }
  };

  const handleAddProperty = async (propertyId?: string) => {
    // If propertyId is provided, use it for backward compatibility
    // Otherwise, use selectedPropertyIds
    const propertyIds = propertyId 
      ? [propertyId] 
      : Array.from(selectedPropertyIds);

    if (propertyIds.length === 0) {
      alert(language === 'bg' ? 'Моля, изберете поне една характеристика' : 'Please select at least one property');
      return;
    }

    try {
      setAddingProperties(true);
      const response = await fetch(`/api/product-types/${id}/properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyids: propertyIds })
      });

      const result = await response.json();
      if (result.success) {
        // Show complete animation
        setShowCompleteAnimation(true);
        
        // Close modal and reset after animation completes
        setTimeout(() => {
          loadProductType();
          setSelectedPropertyIds(new Set());
          setShowAddModal(false);
          setShowCompleteAnimation(false);
        }, 1200);
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Failed to add properties:', error);
      alert(language === 'bg' ? 'Грешка при добавяне на характеристики' : 'Failed to add properties');
    } finally {
      setAddingProperties(false);
    }
  };

  const handleToggleProperty = (propertyId: string) => {
    setSelectedPropertyIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(propertyId)) {
        newSet.delete(propertyId);
      } else {
        newSet.add(propertyId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedPropertyIds.size === unassignedProperties.length) {
      // Deselect all
      setSelectedPropertyIds(new Set());
    } else {
      // Select all
      setSelectedPropertyIds(new Set(unassignedProperties.map(p => p.propertyid)));
    }
  };

  const handleRemoveProperty = async (propertyId: string) => {
    if (!confirm(t.removeProperty)) return;

    try {
      const response = await fetch(`/api/product-types/${id}/properties?propertyId=${propertyId}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      if (result.success) {
        loadProductType();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Failed to remove property:', error);
      alert('Failed to remove property');
    }
  };

  const unassignedProperties = availableProperties.filter(
    prop => !assignedProperties.some(ap => ap.propertyid === prop.propertyid)
  );

  if (loading) {
    return (
      <AdminPage>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-500">{language === 'bg' ? 'Зареждане...' : 'Loading...'}</p>
        </div>
      </AdminPage>
    );
  }

  if (!productType) {
    return (
      <AdminPage>
        <Breadcrumbs
          items={[
            { label: language === 'bg' ? 'Категории' : 'Categories', href: '/admin/product-types' },
            { label: language === 'bg' ? 'Не е намерена' : 'Not found' },
          ]}
        />
        <p className="text-gray-500">{language === 'bg' ? 'Категорията не е намерена' : 'Product type not found'}</p>
      </AdminPage>
    );
  }

  return (
    <AdminPage className="space-y-6">
      <Breadcrumbs
        items={[
          { label: language === 'bg' ? 'Категории' : 'Categories', href: '/admin/product-types' },
          { label: productType.name },
        ]}
      />
      <PageHeader
        title={productType.name}
        subtitle={language === 'bg' ? 'Управление на присвоени характеристики' : 'Manage assigned properties'}
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation text-sm sm:text-base font-medium"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            {t.addProperty}
          </button>
        }
      />

      <Section
        title={language === 'bg' ? 'Присвоени характеристики' : 'Assigned Properties'}
      >
        <Card padding="small">
          {assignedProperties.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-gray-500 text-sm sm:text-base">
                {language === 'bg' ? 'Няма присвоени характеристики все още.' : 'No properties assigned yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-2">
              {assignedProperties.map((ap) => (
                <div
                  key={ap.ProductTypePropertyID}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 sm:p-3 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base sm:text-sm text-gray-900">
                      {ap.properties?.name}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveProperty(ap.propertyid)}
                    className="flex items-center justify-center sm:justify-end gap-2 px-4 py-2.5 sm:px-3 sm:py-2 text-red-600 hover:text-red-700 hover:bg-red-50 active:bg-red-100 rounded-lg transition-colors touch-manipulation border border-red-200 sm:border-0 w-full sm:w-auto min-h-[44px] sm:min-h-0"
                    aria-label={language === 'bg' ? 'Премахни характеристика' : 'Remove property'}
                  >
                    <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
                    <span className="sm:hidden text-sm font-medium">
                      {language === 'bg' ? 'Премахни' : 'Remove'}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </Section>

        <AdminModal
          isOpen={showAddModal}
          onClose={() => {
            if (!showCompleteAnimation) {
              setShowAddModal(false);
              setSelectedPropertyIds(new Set());
              setShowCompleteAnimation(false);
            }
          }}
          title={t.addProperty}
          subheader={language === 'bg' ? 'Изберете характеристики за добавяне към тази категория' : 'Select properties to add to this category'}
          maxWidth="max-w-md"
          minWidth={320}
          minHeight={300}
        >
          <div className="relative">
            <div className={`space-y-4 transition-all duration-300 ${showCompleteAnimation ? 'blur-sm pointer-events-none' : ''}`}>
            {unassignedProperties.length === 0 ? (
              <p className="text-gray-500">{t.allPropertiesAssigned}</p>
            ) : (
              <>
                <div className="flex items-center gap-2 pb-2 border-b">
                  <input
                    type="checkbox"
                    id="select-all-properties"
                    checked={selectedPropertyIds.size === unassignedProperties.length && unassignedProperties.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="select-all-properties"
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    {language === 'bg' ? 'Избери всички' : 'Select All'}
                  </label>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {unassignedProperties.map((prop) => (
                    <label
                      key={prop.propertyid}
                      className="flex items-start gap-3 w-full text-left p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors touch-manipulation min-h-[60px]"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPropertyIds.has(prop.propertyid)}
                        onChange={() => handleToggleProperty(prop.propertyid)}
                        className="mt-1 w-5 h-5 sm:w-4 sm:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm sm:text-base text-gray-900">{prop.name}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      if (!showCompleteAnimation) {
                        setShowAddModal(false);
                        setSelectedPropertyIds(new Set());
                        setShowCompleteAnimation(false);
                      }
                    }}
                    disabled={showCompleteAnimation}
                    className="w-full sm:w-auto px-4 py-2.5 text-sm sm:text-base text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 transition-colors touch-manipulation"
                  >
                    {language === 'bg' ? 'Отказ' : 'Cancel'}
                  </button>
                  <button
                    onClick={() => handleAddProperty()}
                    disabled={selectedPropertyIds.size === 0 || addingProperties || showCompleteAnimation}
                    className="w-full sm:w-auto px-4 py-2.5 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors touch-manipulation font-medium"
                  >
                    {addingProperties ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        {language === 'bg' ? 'Добавяне...' : 'Adding...'}
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        {language === 'bg' 
                          ? `Добави (${selectedPropertyIds.size})` 
                          : `Add (${selectedPropertyIds.size})`}
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
            </div>
            
            {/* Complete Animation Overlay */}
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





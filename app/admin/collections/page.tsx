'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';
import { AdminPage, PageHeader, Section, Card, EmptyState } from '../components/layout';
import { Plus, Trash2, Edit2, Upload, Image as ImageIcon } from 'lucide-react';
import AdminModal from '../components/AdminModal';
import { adminAuthHeaders } from '@/lib/admin-auth-headers';

type Collection = {
  collectionid: string;
  name: string;
  slug: string;
  description?: string | null;
  imageurl?: string | null;
  sortorder: number;
  isactive: boolean;
  showonindex: boolean;
};

export default function CollectionsPage() {
  const { language } = useLanguage();
  const t = translations[language || 'en'];
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    imageurl: '',
    sortorder: 0,
    isactive: true,
    showonindex: false
  });
  const [saving, setSaving] = useState(false);

  // Media Library state
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<Array<{name: string, path: string, url: string}>>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/collections?includeInactive=true');
      const data = await res.json();
      if (data.success) setCollections(data.collections || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const loadMediaFiles = async () => {
    try {
      setLoadingMedia(true);
      const response = await fetch('/api/storage/list?folders=images,logos,hero-images&limit=200');
      const result = await response.json();
      if (result.success) setMediaFiles(result.files || []);
    } catch (error) {
      console.error('Failed to load media files:', error);
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleImageUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    if (file.size > 10 * 1024 * 1024) {
      alert(language === 'bg' ? 'Размерът на изображението трябва да е под 10MB' : 'Image size must be less than 10MB');
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      if (result.success && result.url) {
        setForm(prev => ({ ...prev, imageurl: result.url }));
      } else {
        alert(language === 'bg' ? 'Неуспешно качване' : 'Failed to upload: ' + (result.error || 'Unknown error'));
      }
    } catch (e) {
      console.error(e);
      alert('Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleOpenMedia = () => {
    setShowMediaModal(true);
    loadMediaFiles();
  };

  const handleOpenNew = () => {
    setEditingCollection(null);
    setForm({
      name: '',
      slug: '',
      description: '',
      imageurl: '',
      sortorder: 0,
      isactive: true,
      showonindex: false
    });
    setShowModal(true);
  };

  const handleOpenEdit = (c: Collection) => {
    setEditingCollection(c);
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description || '',
      imageurl: c.imageurl || '',
      sortorder: c.sortorder || 0,
      isactive: c.isactive,
      showonindex: c.showonindex || false
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const headers = await adminAuthHeaders();
      const url = editingCollection 
        ? `/api/collections/${editingCollection.collectionid}`
        : '/api/collections';
      const method = editingCollection ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setForm({ name: '', slug: '', description: '', imageurl: '', sortorder: 0, isactive: true, showonindex: false });
        setEditingCollection(null);
        load();
      } else {
        alert(data.error || 'Failed to save');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'bg' ? 'Изтриване на колекция?' : 'Delete collection?')) return;
    const headers = await adminAuthHeaders();
    await fetch(`/api/collections/${id}`, { method: 'DELETE', headers });
    load();
  };

  return (
    <AdminPage>
      <PageHeader
        title={language === 'bg' ? 'Колекции' : 'Collections'}
        subtitle={language === 'bg' ? 'Управление на продуктови колекции' : 'Manage product collections'}
        actions={
          <button
            onClick={handleOpenNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm transition-transform active:scale-95"
          >
            <Plus size={16} />
            {language === 'bg' ? 'Нова колекция' : 'New collection'}
          </button>
        }
      />
      <Section>
        <Card>
          {loading ? (
            <p className="text-sm text-gray-500 p-4">Loading...</p>
          ) : collections.length === 0 ? (
            <EmptyState
              title={language === 'bg' ? 'Няма колекции' : 'No collections'}
              description={language === 'bg' ? 'Създайте първата колекция.' : 'Create your first collection.'}
            />
          ) : (
            <div className="divide-y">
              {collections.map((c) => (
                <div key={c.collectionid} className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    {c.imageurl && (
                      <div className="w-10 h-10 border rounded-md overflow-hidden bg-gray-50 flex-shrink-0">
                        <img src={c.imageurl} alt={c.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-950">{c.name}</p>
                        {c.showonindex && (
                          <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full border border-amber-200 font-semibold">
                            {language === 'bg' ? 'Начална' : 'Index'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">/collections/{c.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleOpenEdit(c)} 
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title={language === 'bg' ? 'Редактирай' : 'Edit'}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(c.collectionid)} 
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title={language === 'bg' ? 'Изтрий' : 'Delete'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </Section>

      <AdminModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={editingCollection ? (language === 'bg' ? 'Редактиране на колекция' : 'Edit collection') : (language === 'bg' ? 'Нова колекция' : 'New collection')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{language === 'bg' ? 'Име' : 'Name'}</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Slug</label>
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="auto-generated if empty"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{language === 'bg' ? 'Изображение' : 'Image'}</label>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  disabled={uploadingImage}
                />
                <span className="inline-flex items-center gap-2 px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded hover:bg-gray-50 active:bg-gray-100 transition-colors">
                  <Upload size={16} />
                  {uploadingImage 
                    ? (language === 'bg' ? 'Качване...' : 'Uploading...') 
                    : (language === 'bg' ? 'Качи изображение' : 'Upload image')}
                </span>
              </label>
              <button
                type="button"
                onClick={handleOpenMedia}
                className="inline-flex items-center gap-2 px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <ImageIcon size={16} />
                {language === 'bg' ? 'Избери от медия' : 'Select from media'}
              </button>
            </div>
            <input
              value={form.imageurl}
              onChange={(e) => setForm({ ...form, imageurl: e.target.value })}
              placeholder="/images/collections/spring.jpg"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
            {form.imageurl && (
              <div className="mt-2 relative w-20 h-20 border rounded-md overflow-hidden bg-gray-50">
                <img src={form.imageurl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{language === 'bg' ? 'Описание' : 'Description'}</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              rows={3}
            />
          </div>
          <div className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="isactive"
              checked={form.isactive}
              onChange={(e) => setForm({ ...form, isactive: e.target.checked })}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="isactive" className="text-sm font-medium select-none">
              {language === 'bg' ? 'Активна колекция' : 'Active collection'}
            </label>
          </div>
          <div className="flex flex-col gap-1 py-1">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showonindex"
                checked={form.showonindex}
                disabled={collections.filter(c => c.showonindex && c.collectionid !== editingCollection?.collectionid).length >= 3 && !form.showonindex}
                onChange={(e) => setForm({ ...form, showonindex: e.target.checked })}
                className="rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-50"
              />
              <label htmlFor="showonindex" className="text-sm font-medium select-none">
                {language === 'bg' ? 'Покажи на началната страница' : 'Show on index page'}
              </label>
            </div>
            {collections.filter(c => c.showonindex && c.collectionid !== editingCollection?.collectionid).length >= 3 && !form.showonindex && (
              <p className="text-xs text-amber-600">
                {language === 'bg' 
                  ? 'Максимум 3 колекции могат да бъдат показани на началната страница.' 
                  : 'Maximum of 3 collections can be visible on the index page.'}
              </p>
            )}
          </div>
          <button type="submit" disabled={saving} className="w-full bg-primary text-white py-2.5 rounded-lg transition-colors hover:bg-primary-hover active:scale-98">
            {saving ? '...' : (editingCollection ? (language === 'bg' ? 'Запази' : 'Save') : (language === 'bg' ? 'Създай' : 'Create'))}
          </button>
        </form>
      </AdminModal>

      {/* Media Selection Modal */}
      <AdminModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        title={language === 'bg' ? 'Избери изображение от медията' : 'Select Image from Media'}
        maxWidth="max-w-4xl"
      >
        {loadingMedia ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-xs sm:text-sm text-gray-500">
              {language === 'bg' ? 'Зареждане...' : 'Loading...'}
            </p>
          </div>
        ) : mediaFiles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">{language === 'bg' ? 'Няма налични изображения' : 'No images available'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
            {mediaFiles.map((file, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setForm(prev => ({ ...prev, imageurl: file.url }));
                  setShowMediaModal(false);
                }}
                className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-blue-500 transition-colors group"
              >
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100">
                    {language === 'bg' ? 'Избери' : 'Select'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </AdminModal>
    </AdminPage>
  );
}

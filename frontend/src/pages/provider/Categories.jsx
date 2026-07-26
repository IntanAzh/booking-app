import React, { useState, useEffect } from 'react';
import { Plus, X, FolderPlus, Tag, AlertCircle } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import { categoryService } from '../../services/categoryService';

const ProviderCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    slug: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAllCategories();
      setCategories(data.data || data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Gagal memuat data kategori');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '' });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleEdit = (row) => {
    setEditingCategory(row);
    setFormData({
      name: row.name || '',
      slug: row.slug || ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name') {
      setFormData((prev) => ({
        ...prev,
        name: value,
        slug: generateSlug(value)
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
    if (formError) setFormError('');
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.name.trim()) {
      setFormError('Nama kategori wajib diisi');
      return;
    }

    if (!formData.slug || !formData.slug.trim()) {
      setFormError('Slug kategori wajib diisi');
      return;
    }

    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(formData.slug.trim())) {
      setFormError('Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung (-) tanpa spasi');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim()
      };

      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, payload);
      } else {
        await categoryService.createCategory(payload);
      }

      setIsModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', slug: '' });
      fetchCategories();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Gagal menyimpan kategori');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (row) => {
    if (window.confirm(`Hapus kategori "${row.name}"?`)) {
      try {
        await categoryService.deleteCategory(row.id);
        setCategories(categories.filter((c) => c.id !== row.id));
      } catch (err) {
        alert('Gagal menghapus: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { 
      header: 'Nama Kategori', 
      accessor: 'name',
      render: (row) => <div className="font-bold text-slate-900">{row.name}</div>
    },
    { 
      header: 'Slug', 
      accessor: 'slug',
      render: (row) => <div className="text-slate-500 font-mono text-xs">{row.slug || '-'}</div>
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="text-slate-500 mt-1">Lihat dan tambah kategori layanan aplikasi.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} /> Tambah Kategori
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
          {error}
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={categories} 
          searchPlaceholder="Cari nama atau slug..."
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Modal Tambah/Edit Kategori */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <FolderPlus size={20} />
                </div>
                <h3 className="font-bold text-slate-800">
                  {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitCategory} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 text-sm flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nama Kategori
                </label>
                <div className="relative">
                  <Tag size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Contoh: Spa & Kesehatan"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Slug URL
                </label>
                <div className="relative">
                  <Tag size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="spa-kesehatan"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 text-sm font-mono"
                    required
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">Gunakan huruf kecil, angka, dan tanda hubung (-).</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Kategori</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderCategories;

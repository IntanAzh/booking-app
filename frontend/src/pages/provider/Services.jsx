import React, { useState, useEffect, useContext } from 'react';
import { Plus, X } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import { serviceApi } from '../../services/serviceApi';
import { categoryService } from '../../services/categoryService';
import { AuthContext } from '../../context/AuthContext';

const ProviderServices = () => {
  const { user } = useContext(AuthContext);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: 30,
    category_id: '',
  });

  useEffect(() => {
    if (user?.id) {
      fetchServices();
      fetchCategories();
    }
  }, [user]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await serviceApi.getAllServices({ provider_id: user.id });
      setServices(data || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat data layanan Anda');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getAllCategories();
      const catList = res.data || res || [];
      setCategories(catList);
      if (catList.length > 0 && !formData.category_id) {
        setFormData((prev) => ({ ...prev, category_id: catList[0].id }));
      }
    } catch (err) {
      console.error('Gagal memuat kategori', err);
    }
  };

  const openCreateModal = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: 30,
      category_id: categories[0]?.id || '',
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleEdit = (row) => {
    setEditingService(row);
    setFormData({
      name: row.name || '',
      description: row.description || '',
      price: row.price || '',
      duration: row.duration || 30,
      category_id: row.category_id || (categories[0]?.id || ''),
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim() || !formData.price || !formData.category_id) {
      setFormError('Nama, harga, dan kategori wajib diisi');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        price: Number(formData.price),
        duration: Number(formData.duration),
        category_id: Number(formData.category_id),
      };

      if (editingService) {
        await serviceApi.updateService(editingService.id, payload);
      } else {
        await serviceApi.createService(payload);
      }

      setShowModal(false);
      setEditingService(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        duration: 30,
        category_id: categories[0]?.id || '',
      });
      fetchServices();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Gagal menyimpan layanan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (row) => {
    if (window.confirm(`Hapus layanan ${row.name}?`)) {
      try {
        await serviceApi.deleteService(row.id);
        setServices(services.filter((s) => s.id !== row.id));
      } catch (err) {
        alert('Gagal menghapus: ' + err.message);
      }
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { 
      header: 'Nama Layanan', 
      accessor: 'name',
      render: (row) => <div className="font-bold text-slate-900">{row.name}</div>
    },
    { 
      header: 'Kategori', 
      accessor: 'category',
      render: (row) => <span className="text-slate-600">{row.category?.name || '-'}</span>
    },
    { 
      header: 'Harga', 
      accessor: 'price',
      render: (row) => <span className="font-medium text-green-600">${row.price}</span>
    },
    { 
      header: 'Durasi', 
      accessor: 'duration',
      render: (row) => <span>{row.duration} menit</span>
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Services</h1>
          <p className="text-slate-500 mt-1">Kelola daftar layanan spesifik yang Anda tawarkan.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} /> Tambah Layanan Baru
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
          data={services} 
          searchPlaceholder="Cari layanan Anda..."
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Modal Popup Tambah/Edit Layanan */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-800">
                {editingService ? 'Edit Layanan' : 'Tambah Layanan Baru'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Layanan</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Contoh: Potong Rambut Pria"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Kategori</label>
                <select 
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"
                >
                  {categories.length === 0 && <option value="">Pilih Kategori</option>}
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Harga ($)</label>
                  <input 
                    type="number" 
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="50"
                    min="0"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Durasi (Menit)</label>
                  <input 
                    type="number" 
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="30"
                    min="5"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Deskripsi</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Penjelasan singkat layanan..."
                  rows="3"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Layanan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderServices;

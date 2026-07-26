import React, { useState, useEffect, useContext } from 'react';
import { Plus, X, Upload, Image as ImageIcon } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import { serviceApi } from '../../services/serviceApi';
import { categoryService } from '../../services/categoryService';
import { AuthContext } from '../../context/AuthContext';
import { uploadImageToSupabase, isSupabaseConfigured } from '../../services/supabaseService';

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
    image_url: '',
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
      image_url: '',
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
      image_url: row.image_url || '',
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const [uploadingImage, setUploadingImage] = useState(false);

  const compressImage = (file, maxWidth = 1000, quality = 0.8) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormError('Ukuran file foto terlalu besar (Maksimal 5MB). Silakan pilih berkas lain.');
        return;
      }

      setFormError(null);
      setUploadingImage(true);

      try {
        if (isSupabaseConfigured) {
          try {
            // Upload directly to Supabase Storage and get public URL
            const publicUrl = await uploadImageToSupabase(file);
            setFormData((prev) => ({ ...prev, image_url: publicUrl }));
          } catch (supaErr) {
            console.warn('Supabase upload failed, falling back to Base64:', supaErr.message);
            const compressedDataUrl = await compressImage(file);
            setFormData((prev) => ({ ...prev, image_url: compressedDataUrl }));
            setFormError(supaErr.message);
          }
        } else {
          // Fallback to compressed Base64 Data URL if Supabase credentials are not set
          const compressedDataUrl = await compressImage(file);
          setFormData((prev) => ({ ...prev, image_url: compressedDataUrl }));
        }
      } catch (err) {
        console.error('Gagal mengunggah foto:', err);
        setFormError(err.message || 'Gagal mengunggah berkas foto');
      } finally {
        setUploadingImage(false);
      }
    }
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
        image_url: '',
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
        alert('Gagal menghapus: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    {
      header: 'Foto',
      accessor: 'image_url',
      render: (row) => (
        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
          {row.image_url ? (
            <img src={row.image_url} alt={row.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] text-slate-400 font-bold">No Image</span>
          )}
        </div>
      )
    },
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

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-semibold text-slate-700">Foto Layanan</label>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    isSupabaseConfigured ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {isSupabaseConfigured ? '⚡ Supabase Storage Active' : 'ℹ️ Base64 Mode'}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {uploadingImage ? (
                    <div className="border-2 border-dashed border-primary-300 rounded-xl p-6 text-center bg-primary-50/50 flex flex-col items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      <span className="text-xs font-semibold text-primary-700">Mengunggah foto ke Supabase Storage...</span>
                    </div>
                  ) : formData.image_url ? (
                    <div className="relative w-full h-36 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">
                      <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, image_url: '' }))}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-90 hover:opacity-100 shadow-md text-xs flex items-center gap-1"
                      >
                        <X size={14} /> Hapus Foto
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-blue-500 transition-colors bg-slate-50">
                      <ImageIcon size={32} className="mx-auto text-slate-400 mb-2" />
                      <label className="cursor-pointer text-xs text-blue-600 font-bold hover:underline flex items-center justify-center gap-1">
                        <Upload size={14} /> Upload Foto ke Supabase Storage
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageFileChange} 
                          className="hidden" 
                          disabled={uploadingImage}
                        />
                      </label>
                      <p className="text-[11px] text-slate-400 mt-1">Format PNG, JPG, GIF (Maks. 5MB)</p>
                    </div>
                  )}
                </div>
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

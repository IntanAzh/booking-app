import React, { useState, useEffect } from 'react';
import { Plus, X, UserPlus, Lock, Mail, User, AlertCircle, Eye, EyeOff } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import { providerService } from '../../services/providerService';

const Providers = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const res = await providerService.getAllProviders();
      setProviders(res.data || res || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal memuat data provider');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (formError) setFormError('');
  };

  const handleCreateProvider = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.email || !formData.password) {
      setFormError('Semua field wajib diisi');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
    if (!passwordRegex.test(formData.password)) {
      setFormError('Password harus terdiri dari minimal 6 karakter serta mengandung huruf besar dan huruf kecil');
      return;
    }

    try {
      setSubmitting(true);
      await providerService.createProvider(formData);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '' });
      fetchProviders();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Gagal membuat provider');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (row) => {
    if (window.confirm(`Hapus provider "${row.name}"?`)) {
      try {
        await providerService.deleteProvider(row.id);
        setProviders(providers.filter((p) => p.id !== row.id));
      } catch (err) {
        alert('Gagal menghapus: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { 
      header: 'Nama', 
      accessor: 'name',
      render: (row) => <div className="font-medium text-slate-900">{row.name}</div>
    },
    { header: 'Email', accessor: 'email' },
    { 
      header: 'Role', 
      accessor: 'role',
      render: (row) => (
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-100 text-blue-700">
          {row.role}
        </span>
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Providers</h1>
          <p className="text-slate-500 mt-1">Lihat dan kelola mitra penyedia layanan Anda.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} /> Tambah Provider
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
          {error}
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={providers} 
          searchPlaceholder="Cari nama atau email..."
          onDelete={handleDelete}
        />
      )}

      {/* Modal Tambah Provider */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
                  <UserPlus size={20} />
                </div>
                <h3 className="font-bold text-slate-800">Tambah Provider Baru</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body Form */}
            <form onSubmit={handleCreateProvider} className="p-6 space-y-4" autoComplete="off">
              {formError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 text-sm flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nama Provider
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    name="name"
                    autoComplete="off"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Contoh: Salon Kecantikan Syariah"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-800 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="email"
                    name="email"
                    autoComplete="off"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="provider@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-800 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-800 text-sm"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Actions */}
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
                  className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Provider</span>
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

export default Providers;

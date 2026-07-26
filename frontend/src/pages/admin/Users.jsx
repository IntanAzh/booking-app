import React, { useState, useEffect } from 'react';
import { Plus, X, UserPlus, Mail, Lock, User as UserIcon, Shield, AlertCircle, Eye, EyeOff } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import { userService } from '../../services/userService';
import { authService } from '../../services/authService';

const Users = () => {
  const [users, setUsers] = useState([]);
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
    password: '',
    role: 'customer'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data.data || data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Gagal memuat data pengguna');
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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.email || !formData.password) {
      setFormError('Nama, email, dan password wajib diisi');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
    if (!passwordRegex.test(formData.password)) {
      setFormError('Password harus terdiri dari minimal 6 karakter serta mengandung huruf besar dan huruf kecil');
      return;
    }

    try {
      setSubmitting(true);
      await authService.register(formData);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'customer' });
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Gagal menambah user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (row) => {
    if (window.confirm(`Hapus pengguna ${row.name}?`)) {
      try {
        await userService.deleteUser(row.id);
        setUsers(users.filter((u) => u.id !== row.id));
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
      render: (row) => {
        let bgColor = 'bg-slate-100 text-slate-700';
        if (row.role === 'admin') bgColor = 'bg-purple-100 text-purple-700';
        if (row.role === 'provider') bgColor = 'bg-blue-100 text-blue-700';
        
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${bgColor}`}>
            {row.role}
          </span>
        );
      }
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Users</h1>
          <p className="text-slate-500 mt-1">Kelola data pelanggan, provider, dan admin.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} /> Tambah User
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
          data={users} 
          searchPlaceholder="Cari nama atau email..."
          onDelete={handleDelete}
        />
      )}

      {/* Modal Tambah User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
                  <UserPlus size={20} />
                </div>
                <h3 className="font-bold text-slate-800">Tambah User Baru</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4" autoComplete="off">
              {formError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 text-sm flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    name="name"
                    autoComplete="off"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Nama Pengguna"
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
                    placeholder="email@example.com"
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
                    placeholder="Password minimal 6 karakter (huruf besar & kecil)"
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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Role Pengguna
                </label>
                <div className="relative">
                  <Shield size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select 
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-800 text-sm bg-white"
                  >
                    <option value="customer">Customer</option>
                    <option value="provider">Provider</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
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
                  className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan User</span>
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

export default Users;

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import { userService } from '../../services/userService';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      // Adjust if backend returns { message, data: [...] }
      setUsers(data.data || data);
    } catch (err) {
      setError(err.message || 'Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row) => {
    if (window.confirm(`Hapus pengguna ${row.name}?`)) {
      try {
        await userService.deleteUser(row.id);
        setUsers(users.filter((u) => u.id !== row.id));
      } catch (err) {
        alert('Gagal menghapus: ' + err.message);
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
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2">
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
          onEdit={(row) => console.log('Edit', row)} // TODO: Implement modal
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default Users;

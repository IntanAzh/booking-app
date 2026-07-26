import React, { useState, useEffect, useContext } from 'react';
import { Plus } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import { serviceApi } from '../../services/serviceApi';
import { AuthContext } from '../../context/AuthContext';

const ProviderServices = () => {
  const { user } = useContext(AuthContext);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) fetchServices();
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
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
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
          onEdit={(row) => console.log('Edit', row)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default ProviderServices;

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import { serviceApi } from '../../services/serviceApi';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await serviceApi.getAllServices();
      setServices(data || []); // getAllServices returns response.data.data
    } catch (err) {
      setError(err.message || 'Gagal memuat data layanan');
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
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Services</h1>
          <p className="text-slate-500 mt-1">Kelola daftar layanan (treatment/service) yang Anda tawarkan.</p>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2">
          <Plus size={18} /> Tambah Layanan
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
          data={services} 
          searchPlaceholder="Cari layanan..."
          onEdit={(row) => console.log('Edit', row)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default Services;

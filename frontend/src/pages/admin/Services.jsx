import React, { useState, useEffect } from 'react';
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
          <p className="text-slate-500 mt-1">Daftar layanan (treatment/service) yang tersedia.</p>
        </div>
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
        />
      )}
    </div>
  );
};

export default Services;

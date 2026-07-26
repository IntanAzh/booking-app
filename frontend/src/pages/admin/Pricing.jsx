import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import { pricingService } from '../../services/pricingService';

const Pricing = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const data = await pricingService.getAllRules();
      setRules(data.data || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat data aturan harga');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { 
      header: 'Nama Aturan', 
      accessor: 'name',
      render: (row) => <div className="font-bold text-slate-900">{row.name}</div>
    },
    { 
      header: 'Tipe', 
      accessor: 'type',
      render: (row) => <span className="uppercase text-slate-500 font-medium text-xs">{row.type}</span>
    },
    { 
      header: 'Faktor', 
      accessor: 'factor',
      render: (row) => <span className="font-bold text-slate-700">{row.factor}x</span>
    },
    { header: 'Mulai', accessor: 'start_date' },
    { header: 'Selesai', accessor: 'end_date' },
    { 
      header: 'Status', 
      accessor: 'is_active',
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-bold ${row.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {row.is_active ? 'Aktif' : 'Nonaktif'}
        </span>
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dynamic Pricing</h1>
          <p className="text-slate-500 mt-1">Atur lonjakan harga (surge pricing) berdasarkan waktu atau musim.</p>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2">
          <Plus size={18} /> Tambah Aturan
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
          data={rules} 
          searchPlaceholder="Cari aturan..."
          onEdit={(row) => console.log('Edit', row)}
          onDelete={(row) => console.log('Delete', row)}
        />
      )}
    </div>
  );
};

export default Pricing;

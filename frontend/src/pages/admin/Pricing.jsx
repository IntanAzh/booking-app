import React, { useState, useEffect } from 'react';
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
      header: 'Tipe Aturan', 
      accessor: 'rule_type',
      render: (row) => <span className="uppercase text-slate-600 font-bold text-xs">{row.rule_type || row.type || '-'}</span>
    },
    { 
      header: 'Tipe Penyesuaian', 
      accessor: 'adjustment_type',
      render: (row) => <span className="capitalize text-slate-500 font-medium text-xs">{row.adjustment_type || '-'}</span>
    },
    { 
      header: 'Nilai Penyesuaian', 
      accessor: 'adjustment_value',
      render: (row) => (
        <span className="font-bold text-emerald-600">
          {row.adjustment_type === 'percentage' ? `+${row.adjustment_value}%` : `+$${row.adjustment_value}`}
        </span>
      )
    },
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
        />
      )}
    </div>
  );
};

export default Pricing;

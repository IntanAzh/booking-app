import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import { slotService } from '../../services/slotService';

const Slots = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const data = await slotService.getAllSlots();
      setSlots(data.data || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat data slot');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { 
      header: 'Provider', 
      accessor: 'provider',
      render: (row) => <div className="font-medium text-slate-900">{row.provider?.name || '-'}</div>
    },
    { 
      header: 'Tanggal', 
      accessor: 'date',
      render: (row) => <span>{new Date(row.date).toLocaleDateString()}</span>
    },
    { 
      header: 'Jam Mulai', 
      accessor: 'start_time'
    },
    { 
      header: 'Jam Selesai', 
      accessor: 'end_time'
    },
    { 
      header: 'Tipe', 
      accessor: 'is_recurring',
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-bold ${row.is_recurring ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
          {row.is_recurring ? 'Berulang' : 'Sekali'}
        </span>
      )
    },
    { 
      header: 'Tersedia', 
      accessor: 'is_available',
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-bold ${row.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {row.is_available ? 'Ya' : 'Tidak'}
        </span>
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Slots</h1>
          <p className="text-slate-500 mt-1">Detail slot waktu yang tersedia untuk booking.</p>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2">
          <Plus size={18} /> Tambah Slot Khusus
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
          data={slots} 
          searchPlaceholder="Cari slot..."
          onEdit={(row) => console.log('Edit', row)}
          onDelete={(row) => console.log('Delete', row)}
        />
      )}
    </div>
  );
};

export default Slots;

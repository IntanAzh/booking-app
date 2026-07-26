import React, { useState, useEffect } from 'react';
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
      accessor: 'slot_date',
      render: (row) => <span>{row.slot_date ? new Date(row.slot_date).toLocaleDateString() : '-'}</span>
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
      header: 'Kapasitas', 
      accessor: 'capacity',
      render: (row) => <span className="font-bold text-slate-700">{row.capacity ?? 1}</span>
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => {
        let bgColor = 'bg-slate-100 text-slate-700';
        if (row.status === 'available') bgColor = 'bg-green-100 text-green-700';
        if (row.status === 'booked') bgColor = 'bg-blue-100 text-blue-700';
        if (row.status === 'blocked') bgColor = 'bg-red-100 text-red-700';
        return (
          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${bgColor}`}>
            {row.status || 'available'}
          </span>
        );
      }
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Slots</h1>
          <p className="text-slate-500 mt-1">Detail slot waktu yang tersedia untuk booking.</p>
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
          data={slots} 
          searchPlaceholder="Cari slot..."
        />
      )}
    </div>
  );
};

export default Slots;

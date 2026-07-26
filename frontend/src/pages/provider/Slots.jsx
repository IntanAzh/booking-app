import React, { useState, useEffect, useContext } from 'react';
import { Plus } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import { slotService } from '../../services/slotService';
import { AuthContext } from '../../context/AuthContext';

const ProviderSlots = () => {
  const { user } = useContext(AuthContext);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) fetchSlots();
  }, [user]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const data = await slotService.getAllSlots({ provider_id: user.id });
      setSlots(data.data || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat data slot Anda');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row) => {
    if (window.confirm(`Hapus slot ini?`)) {
      try {
        await slotService.deleteSlot(row.id);
        setSlots(slots.filter((s) => s.id !== row.id));
      } catch (err) {
        alert('Gagal menghapus: ' + err.message);
      }
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { 
      header: 'Tanggal', 
      accessor: 'date',
      render: (row) => <span>{new Date(row.date).toLocaleDateString()}</span>
    },
    { header: 'Jam Mulai', accessor: 'start_time' },
    { header: 'Jam Selesai', accessor: 'end_time' },
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
          <h1 className="text-2xl font-bold text-slate-900">My Slots</h1>
          <p className="text-slate-500 mt-1">Detail slot ketersediaan spesifik harian Anda.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
          <Plus size={18} /> Tambah Slot Khusus
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
          data={slots} 
          searchPlaceholder="Cari slot..."
          onEdit={(row) => console.log('Edit', row)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default ProviderSlots;

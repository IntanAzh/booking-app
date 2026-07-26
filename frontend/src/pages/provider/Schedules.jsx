import React, { useState, useEffect, useContext } from 'react';
import { Plus } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import { scheduleService } from '../../services/scheduleService';
import { AuthContext } from '../../context/AuthContext';

const ProviderSchedules = () => {
  const { user } = useContext(AuthContext);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) fetchSchedules();
  }, [user]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const data = await scheduleService.getAllSchedules({ provider_id: user.id });
      setSchedules(data.data || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat data jadwal Anda');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row) => {
    if (window.confirm(`Hapus jadwal untuk hari ${row.day_of_week}?`)) {
      try {
        await scheduleService.deleteSchedule(row.id);
        setSchedules(schedules.filter((s) => s.id !== row.id));
      } catch (err) {
        alert('Gagal menghapus: ' + err.message);
      }
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { 
      header: 'Layanan', 
      accessor: 'service',
      render: (row) => <div className="text-slate-700">{row.service?.name || '-'}</div>
    },
    { header: 'Hari', accessor: 'day_of_week', render: (row) => <span className="font-bold capitalize">{row.day_of_week}</span> },
    { header: 'Jam Mulai', accessor: 'start_time' },
    { header: 'Jam Selesai', accessor: 'end_time' },
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
          <h1 className="text-2xl font-bold text-slate-900">My Schedules</h1>
          <p className="text-slate-500 mt-1">Atur jadwal ketersediaan Anda di setiap hari kerja.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
          <Plus size={18} /> Buat Jadwal Rutin
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
          data={schedules} 
          searchPlaceholder="Cari jadwal hari..."
          onEdit={(row) => console.log('Edit', row)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default ProviderSchedules;

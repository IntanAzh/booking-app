import React, { useState, useEffect } from 'react';
import DataTable from '../../components/common/DataTable';
import { scheduleService } from '../../services/scheduleService';

const Schedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const data = await scheduleService.getAllSchedules();
      setSchedules(data.data || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat data jadwal');
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
      header: 'Layanan', 
      accessor: 'service',
      render: (row) => <div className="text-slate-700">{row.service?.name || '-'}</div>
    },
    { header: 'Hari', accessor: 'day' },
    { 
      header: 'Jam Mulai', 
      accessor: 'start_time'
    },
    { 
      header: 'Jam Selesai', 
      accessor: 'end_time'
    },
    { 
      header: 'Status Aktif', 
      accessor: 'is_available',
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-bold ${row.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {row.is_available ? 'Tersedia' : 'Tidak Tersedia'}
        </span>
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Schedules</h1>
          <p className="text-slate-500 mt-1">Daftar jadwal ketersediaan layanan dan provider.</p>
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
          data={schedules} 
          searchPlaceholder="Cari jadwal..."
        />
      )}
    </div>
  );
};

export default Schedules;

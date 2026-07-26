import React, { useState, useEffect, useContext } from 'react';
import DataTable from '../../components/common/DataTable';
import { bookingApi } from '../../services/bookingApi';
import { AuthContext } from '../../context/AuthContext';

const ProviderBookings = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingApi.getAllBookings({ provider_id: user.id });
      setBookings(data.data || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat data reservasi');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await bookingApi.updateBookingStatus(id, newStatus);
      fetchBookings();
    } catch (err) {
      alert('Gagal mengubah status: ' + err.message);
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { 
      header: 'Pelanggan', 
      accessor: 'customer',
      render: (row) => <div className="font-medium text-slate-900">{row.customer?.name || row.user?.name || '-'}</div>
    },
    { 
      header: 'Layanan', 
      accessor: 'service',
      render: (row) => <div className="text-slate-700">{row.service?.name || '-'}</div>
    },
    { 
      header: 'Tanggal & Waktu', 
      accessor: 'start_time',
      render: (row) => (
        <span>
          {row.start_time ? new Date(row.start_time).toLocaleString('id-ID') : '-'}
        </span>
      )
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => {
        let bgColor = 'bg-slate-100 text-slate-700';
        if (row.status === 'confirmed') bgColor = 'bg-blue-100 text-blue-700';
        if (row.status === 'pending') bgColor = 'bg-amber-100 text-amber-700';
        if (row.status === 'cancelled') bgColor = 'bg-red-100 text-red-700';
        if (row.status === 'completed') bgColor = 'bg-green-100 text-green-700';
        
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${bgColor}`}>
            {row.status}
          </span>
        );
      }
    },
    {
      header: 'Aksi Status',
      accessor: 'action',
      render: (row) => (
        <div className="flex gap-2">
          {row.status === 'pending' && (
            <button 
              onClick={() => handleStatusChange(row.id, 'confirmed')}
              className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-bold hover:bg-blue-100 border border-blue-200"
            >
              Konfirmasi
            </button>
          )}
          {row.status === 'confirmed' && (
            <button 
              onClick={() => handleStatusChange(row.id, 'completed')}
              className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs font-bold hover:bg-green-100 border border-green-200"
            >
              Selesaikan
            </button>
          )}
          {(row.status === 'pending' || row.status === 'confirmed') && (
            <button 
              onClick={() => handleStatusChange(row.id, 'cancelled')}
              className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs font-bold hover:bg-red-100 border border-red-200"
            >
              Batalkan
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pesanan Pelanggan (Bookings)</h1>
          <p className="text-slate-500 mt-1">Kelola konfirmasi, penyelesaian, atau pembatalan reservasi Anda.</p>
        </div>
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
          data={bookings} 
          searchPlaceholder="Cari pesanan..."
          actions={false}
        />
      )}
    </div>
  );
};

export default ProviderBookings;

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import { bookingApi } from '../../services/bookingApi';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingApi.getAllBookings();
      setBookings(data.data || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat data booking');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row) => {
    if (window.confirm(`Hapus booking #${row.id}?`)) {
      try {
        await bookingApi.deleteBooking(row.id);
        setBookings(bookings.filter((b) => b.id !== row.id));
      } catch (err) {
        alert('Gagal menghapus: ' + err.message);
      }
    }
  };

  const handleStatusChange = async (row, newStatus) => {
    try {
      await bookingApi.updateBookingStatus(row.id, newStatus);
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
      render: (row) => <div className="font-medium text-slate-900">{row.user?.name || '-'}</div>
    },
    { 
      header: 'Layanan', 
      accessor: 'service',
      render: (row) => <div className="text-slate-700">{row.service?.name || '-'}</div>
    },
    { 
      header: 'Tanggal', 
      accessor: 'booking_date',
      render: (row) => <span>{new Date(row.booking_date).toLocaleDateString()}</span>
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => {
        let bgColor = 'bg-slate-100 text-slate-700';
        if (row.status === 'confirmed') bgColor = 'bg-green-100 text-green-700';
        if (row.status === 'pending') bgColor = 'bg-amber-100 text-amber-700';
        if (row.status === 'cancelled') bgColor = 'bg-red-100 text-red-700';
        if (row.status === 'completed') bgColor = 'bg-blue-100 text-blue-700';
        
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
        <select 
          className="text-xs border border-slate-200 rounded p-1"
          value={row.status}
          onChange={(e) => handleStatusChange(row, e.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Bookings</h1>
          <p className="text-slate-500 mt-1">Kelola seluruh reservasi dan jadwal pertemuan.</p>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2">
          <Plus size={18} /> Buat Booking
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
          data={bookings} 
          searchPlaceholder="Cari ID atau nama pelanggan..."
          onEdit={(row) => console.log('Edit', row)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default Bookings;

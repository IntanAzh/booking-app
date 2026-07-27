import React, { useState, useEffect, useContext } from 'react';
import { CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';
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

  // Bug #A Fix: Hanya boleh "Selesaikan" jika payment_status === 'paid'
  const handleComplete = async (booking) => {
    if (booking.payment_status !== 'paid') {
      alert('Pesanan ini belum dibayar. Tidak bisa diselesaikan sebelum pembayaran lunas.');
      return;
    }
    // Bug #C Fix: Konfirmasi sebelum aksi kritis
    if (!window.confirm(`Tandai pesanan #${booking.id} (${booking.service?.name || ''}) sebagai SELESAI?\n\nTindakan ini menandakan layanan sudah diberikan kepada pelanggan.`)) return;
    try {
      await bookingApi.updateBookingStatus(booking.id, 'completed');
      fetchBookings();
    } catch (err) {
      alert('Gagal menyelesaikan pesanan: ' + (err.response?.data?.message || err.message));
    }
  };

  // Bug #B Fix: Pakai cancelBooking() → PATCH /bookings/:id/cancel (slot release + refund otomatis)
  // Bug #C Fix: Konfirmasi sebelum aksi kritis
  const handleCancel = async (booking) => {
    const isPaid = booking.payment_status === 'paid';
    const confirmMsg = isPaid
      ? `Batalkan pesanan #${booking.id} (${booking.service?.name || ''})?\n\n⚠️ Booking ini sudah DIBAYAR. Pembayaran akan otomatis di-refund ke customer.`
      : `Batalkan pesanan #${booking.id} (${booking.service?.name || ''})?\n\nTindakan ini tidak dapat dibatalkan.`;

    if (!window.confirm(confirmMsg)) return;
    try {
      await bookingApi.cancelBooking(booking.id);
      fetchBookings();
    } catch (err) {
      alert('Gagal membatalkan pesanan: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleConfirm = async (booking) => {
    if (!window.confirm(`Konfirmasi pesanan #${booking.id} (${booking.service?.name || ''})?`)) return;
    try {
      await bookingApi.updateBookingStatus(booking.id, 'confirmed');
      fetchBookings();
    } catch (err) {
      alert('Gagal mengkonfirmasi pesanan: ' + (err.response?.data?.message || err.message));
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      render: (row) => <span className="font-mono text-xs font-bold text-slate-700">#{row.id}</span>
    },
    { 
      header: 'Pelanggan', 
      accessor: 'customer',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900 text-sm">{row.customer?.name || '-'}</div>
          <div className="text-xs text-slate-400">{row.customer?.email || ''}</div>
        </div>
      )
    },
    { 
      header: 'Layanan', 
      accessor: 'service',
      render: (row) => <div className="text-slate-700 text-sm font-medium">{row.service?.name || '-'}</div>
    },
    { 
      header: 'Tanggal & Waktu', 
      accessor: 'start_time',
      render: (row) => (
        <span className="text-xs text-slate-600">
          {row.start_time ? new Date(row.start_time).toLocaleString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          }) : '-'}
        </span>
      )
    },
    { 
      header: 'Status Booking', 
      accessor: 'status',
      render: (row) => {
        let bgColor = 'bg-slate-100 text-slate-700';
        if (row.status === 'confirmed') bgColor = 'bg-blue-100 text-blue-700';
        if (row.status === 'pending') bgColor = 'bg-amber-100 text-amber-700';
        if (row.status === 'cancelled') bgColor = 'bg-red-100 text-red-700';
        if (row.status === 'completed') bgColor = 'bg-green-100 text-green-700';
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${bgColor}`}>
            {row.status}
          </span>
        );
      }
    },
    // Bug #D Fix: Tambah kolom Status Bayar
    {
      header: 'Status Bayar',
      accessor: 'payment_status',
      render: (row) => {
        const ps = row.payment_status || 'unpaid';
        let style = 'bg-amber-100 text-amber-700';
        if (ps === 'paid') style = 'bg-green-100 text-green-700';
        if (ps === 'refunded') style = 'bg-purple-100 text-purple-700';
        return (
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${style}`}>
            {ps}
          </span>
        );
      }
    },
    {
      header: 'Aksi',
      accessor: 'action',
      render: (row) => (
        <div className="flex flex-wrap gap-1.5">
          {/* Konfirmasi — hanya untuk status pending */}
          {row.status === 'pending' && (
            <button 
              onClick={() => handleConfirm(row)}
              className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 border border-blue-200 transition-colors flex items-center gap-1"
            >
              <Clock size={11} /> Konfirmasi
            </button>
          )}

          {/* Bug #A Fix: Selesaikan hanya jika confirmed DAN payment_status = paid */}
          {row.status === 'confirmed' && (
            <button 
              onClick={() => handleComplete(row)}
              disabled={row.payment_status !== 'paid'}
              title={row.payment_status !== 'paid' ? 'Belum bisa diselesaikan — tunggu pembayaran dari customer' : 'Tandai layanan sudah selesai diberikan'}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1 ${
                row.payment_status === 'paid'
                  ? 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200'
                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
              }`}
            >
              <CheckCircle2 size={11} /> Selesaikan
            </button>
          )}

          {/* Bug #B Fix: Batalkan via cancelBooking() → PATCH /cancel (slot release + refund) */}
          {(row.status === 'pending' || row.status === 'confirmed') && (
            <button 
              onClick={() => handleCancel(row)}
              className="px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-1"
            >
              <XCircle size={11} /> Batalkan
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
          <p className="text-slate-500 mt-1 text-sm">Kelola konfirmasi, penyelesaian, atau pembatalan reservasi Anda.</p>
        </div>
        <button
          onClick={fetchBookings}
          className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          title="Refresh Data"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Keterangan tombol Selesaikan */}
      <div className="mb-4 p-3.5 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 flex items-start gap-2">
        <CheckCircle2 size={14} className="text-blue-600 shrink-0 mt-0.5" />
        <span>
          <strong>Catatan:</strong> Tombol <strong>Selesaikan</strong> hanya aktif jika booking sudah berstatus <strong>Confirmed</strong> dan customer sudah melakukan <strong>Pembayaran (Paid)</strong>. Pembatalan booking yang sudah dibayar akan otomatis memproses <strong>refund</strong>.
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">
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



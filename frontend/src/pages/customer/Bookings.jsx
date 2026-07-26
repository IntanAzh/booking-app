import React, { useState, useEffect, useContext } from 'react';
import { 
  Plus, Calendar, Clock, DollarSign, AlertCircle, X, CheckCircle, 
  XCircle, CreditCard, User, Tag, RefreshCw
} from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import { bookingApi } from '../../services/bookingApi';
import { serviceApi } from '../../services/serviceApi';
import { slotService } from '../../services/slotService';
import { paymentService } from '../../services/paymentService';
import { AuthContext } from '../../context/AuthContext';

const CustomerBookings = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [services, setServices] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    fetchBookings();
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedServiceId) {
      fetchSlotsForService(selectedServiceId);
    } else {
      setAvailableSlots([]);
    }
  }, [selectedServiceId]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingApi.getAllBookings();
      setBookings(data.data || data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Gagal memuat histori pesanan Anda');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const data = await serviceApi.getAllServices();
      setServices(data || []);
    } catch (err) {
      console.error('Gagal memuat daftar layanan', err);
    }
  };

  const fetchSlotsForService = async (serviceId) => {
    try {
      const data = await slotService.getAllSlots({ service_id: serviceId, status: 'available' });
      setAvailableSlots(data.data || []);
    } catch (err) {
      console.error('Gagal memuat slot layanan', err);
    }
  };

  const openCreateModal = () => {
    setSelectedServiceId(services[0]?.id || '');
    setSelectedSlotId('');
    setModalError('');
    setIsModalOpen(true);
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!selectedServiceId) {
      setModalError('Silakan pilih layanan');
      return;
    }

    if (!selectedSlotId) {
      setModalError('Silakan pilih slot waktu yang tersedia');
      return;
    }

    try {
      setSubmitting(true);
      await bookingApi.createBooking({
        service_id: Number(selectedServiceId),
        slot_id: Number(selectedSlotId),
      });

      setIsModalOpen(false);
      fetchBookings();
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Gagal membuat reservasi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = async (booking) => {
    if (window.confirm(`Yakin ingin membatalkan pesanan untuk ${booking.service?.name}?`)) {
      try {
        await bookingApi.updateBookingStatus(booking.id, 'cancelled');
        fetchBookings();
      } catch (err) {
        alert('Gagal membatalkan pesanan: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const openPaymentModal = (booking) => {
    setSelectedBooking(booking);
    setPaymentMethod('transfer');
    setPaymentError('');
    setIsPaymentModalOpen(true);
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setPaymentError('');

    if (!selectedBooking) return;

    try {
      setPaying(true);
      await paymentService.processPayment({
        booking_id: selectedBooking.id,
        amount: Number(selectedBooking.total_price || selectedBooking.service?.price || 0),
        method: paymentMethod,
      });

      setIsPaymentModalOpen(false);
      setSelectedBooking(null);
      fetchBookings();
    } catch (err) {
      setPaymentError(err.response?.data?.message || err.message || 'Gagal memproses pembayaran');
    } finally {
      setPaying(false);
    }
  };

  const extractTime = (isoString) => {
    if (!isoString) return '-';
    if (isoString.includes('T')) {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return isoString.substring(0, 5);
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { 
      header: 'Layanan', 
      accessor: 'service',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.service?.name || 'Layanan'}</div>
          <div className="text-xs text-slate-500">{row.provider?.name ? `Mitra: ${row.provider.name}` : ''}</div>
        </div>
      )
    },
    { 
      header: 'Tanggal & Waktu', 
      accessor: 'start_time',
      render: (row) => (
        <div className="text-xs">
          <div className="font-semibold text-slate-800">
            {row.start_time ? new Date(row.start_time).toLocaleDateString('id-ID') : '-'}
          </div>
          <div className="text-slate-500">
            {extractTime(row.start_time)} - {extractTime(row.end_time)}
          </div>
        </div>
      )
    },
    { 
      header: 'Total Biaya', 
      accessor: 'total_price',
      render: (row) => (
        <span className="font-extrabold text-green-600">
          ${row.total_price || row.service?.price || 0}
        </span>
      )
    },
    { 
      header: 'Status Pesanan', 
      accessor: 'status',
      render: (row) => {
        let badgeStyle = 'bg-slate-100 text-slate-700';
        if (row.status === 'confirmed') badgeStyle = 'bg-blue-100 text-blue-700';
        if (row.status === 'completed') badgeStyle = 'bg-green-100 text-green-700';
        if (row.status === 'cancelled') badgeStyle = 'bg-red-100 text-red-700';
        if (row.status === 'pending') badgeStyle = 'bg-amber-100 text-amber-700';

        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${badgeStyle}`}>
            {row.status}
          </span>
        );
      }
    },
    { 
      header: 'Pembayaran', 
      accessor: 'payment_status',
      render: (row) => {
        const isPaid = row.payment_status === 'paid';
        return (
          <div className="flex flex-col gap-1">
            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase inline-block w-max ${
              isPaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {row.payment_status || 'unpaid'}
            </span>
            {!isPaid && row.status !== 'cancelled' && (
              <button
                onClick={() => openPaymentModal(row)}
                className="text-xs bg-primary-600 text-white px-2 py-1 rounded hover:bg-primary-700 font-semibold transition-colors flex items-center gap-1 w-max"
              >
                <CreditCard size={12} /> Bayar Now
              </button>
            )}
          </div>
        );
      }
    },
    {
      header: 'Aksi',
      accessor: 'actions',
      render: (row) => (
        <div>
          {row.status !== 'cancelled' && row.status !== 'completed' && (
            <button
              onClick={() => handleCancelBooking(row)}
              className="text-xs text-red-600 hover:text-red-800 font-semibold underline"
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pesanan Saya</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola daftar reservasi layanan aktif dan riwayat pemesanan Anda.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBookings}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={openCreateModal}
            className="bg-primary-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-md flex items-center gap-2 text-sm"
          >
            <Plus size={18} /> Buat Reservasi Baru
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">
          {error}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={bookings}
          searchPlaceholder="Cari nama layanan..."
        />
      )}

      {/* Modal Popup Buat Reservasi Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-800">Buat Reservasi Baru</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 text-xs mb-4 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  1. Pilih Layanan
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  required
                >
                  <option value="">-- Pilih Layanan --</option>
                  {services.map((svc) => (
                    <option key={svc.id} value={svc.id}>
                      {svc.name} (${svc.price}) - {svc.duration} Menit
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  2. Pilih Slot Waktu Tersedia
                </label>
                {availableSlots.length === 0 ? (
                  <div className="text-xs text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
                    Tidak ada slot waktu tersedia untuk layanan ini.
                  </div>
                ) : (
                  <select
                    value={selectedSlotId}
                    onChange={(e) => setSelectedSlotId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    required
                  >
                    <option value="">-- Pilih Slot Jam --</option>
                    {availableSlots.map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {slot.slot_date ? new Date(slot.slot_date).toLocaleDateString('id-ID') : ''} | Jam: {extractTime(slot.start_time)} - {extractTime(slot.end_time)}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 text-sm font-medium hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || availableSlots.length === 0}
                  className="px-5 py-2 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Memproses...' : 'Konfirmasi Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pembayaran */}
      {isPaymentModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-800">Pembayaran Reservasi #{selectedBooking.id}</h3>
              <button 
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {paymentError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 text-xs mb-4">
                {paymentError}
              </div>
            )}

            <form onSubmit={handleProcessPayment} className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Layanan:</span>
                  <span className="font-bold text-slate-800">{selectedBooking.service?.name}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Total Tagihan:</span>
                  <span className="font-extrabold text-green-600 text-sm">
                    ${selectedBooking.total_price || selectedBooking.service?.price || 0}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Metode Pembayaran
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="transfer">Transfer Bank (BCA / Mandiri)</option>
                  <option value="ewallet">E-Wallet (GoPay / OVO / Dana)</option>
                  <option value="card">Kartu Kredit / Debit</option>
                  <option value="cash">Bayar di Tempat (Tunai)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 text-slate-600 text-sm font-medium hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={paying}
                  className="px-5 py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {paying ? 'Memproses...' : 'Bayar Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerBookings;

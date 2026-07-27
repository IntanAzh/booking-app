import React, { useState, useEffect, useContext } from 'react';
import { 
  Plus, Calendar as CalendarIcon, Clock, DollarSign, AlertCircle, X, CheckCircle2, 
  XCircle, CreditCard, User, Tag, RefreshCw, Store, Info, ChevronRight, ArrowLeft, 
  ShieldCheck, Lock, Sparkles, Check, FileText, Download
} from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import { bookingApi } from '../../services/bookingApi';
import { serviceApi } from '../../services/serviceApi';
import { slotService } from '../../services/slotService';
import { scheduleService } from '../../services/scheduleService';
import { paymentService } from '../../services/paymentService';
import { AuthContext } from '../../context/AuthContext';
import { generateCustomerReceiptPDF } from '../../utils/pdfGenerator';

const CustomerBookings = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stepper Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Select Service, 2: Select Date & Slot, 3: Summary
  
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  
  const [shopSchedules, setShopSchedules] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [allSlots, setAllSlots] = useState([]);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Booking Receipt / Detail Modal State
  const [detailBooking, setDetailBooking] = useState(null);

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedBookingForPay, setSelectedBookingForPay] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    fetchBookings();
    fetchServices();
  }, []);

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

  // When a service is chosen in Step 1
  const handleSelectService = async (service) => {
    setSelectedService(service);
    setSelectedSlot(null);
    setModalError('');
    setCurrentStep(2);

    // Fetch shop routine schedule and slots for this service
    try {
      setSlotsLoading(true);
      const [schedRes, slotRes] = await Promise.all([
        scheduleService.getAllSchedules({ service_id: service.id }),
        slotService.getAllSlots({ service_id: service.id })
      ]);

      setShopSchedules(schedRes.data || schedRes || []);
      setAllSlots(slotRes.data || slotRes || []);
    } catch (err) {
      console.error('Gagal memuat jadwal & slot toko', err);
    } finally {
      setSlotsLoading(false);
    }
  };

  // Filter slots for the selected date
  const slotsForSelectedDate = allSlots.filter((slot) => {
    if (!slot.slot_date) return true;
    const slotDateStr = slot.slot_date.substring(0, 10);
    return slotDateStr === selectedDate;
  });

  // Get day of week for selected date e.g. "monday", "tuesday"
  const getDayOfWeek = (dateString) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const d = new Date(dateString);
    return days[d.getDay()];
  };

  const selectedDayName = getDayOfWeek(selectedDate);
  const shopScheduleForDay = shopSchedules.find(s => s.day === selectedDayName);
  const isShopOpenToday = shopScheduleForDay ? shopScheduleForDay.is_available : true;

  const openCreateModal = () => {
    setCurrentStep(1);
    setSelectedService(null);
    setSelectedSlot(null);
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!selectedService || !selectedSlot) {
      setModalError('Silakan lengkapi pemilihan layanan dan slot waktu');
      return;
    }

    try {
      setSubmitting(true);
      await bookingApi.createBooking({
        service_id: Number(selectedService.id),
        slot_id: Number(selectedSlot.id),
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
    if (window.confirm(`Yakin ingin membatalkan pesanan #${booking.id} (${booking.service?.name})?`)) {
      try {
        await bookingApi.updateBookingStatus(booking.id, 'cancelled');
        fetchBookings();
      } catch (err) {
        alert('Gagal membatalkan pesanan: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const openPaymentModal = (booking) => {
    setSelectedBookingForPay(booking);
    setPaymentMethod('transfer');
    setPaymentError('');
    setIsPaymentModalOpen(true);
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setPaymentError('');

    if (!selectedBookingForPay) return;

    try {
      setPaying(true);
      await paymentService.processPayment({
        booking_id: selectedBookingForPay.id,
        amount: Number(selectedBookingForPay.total_price || selectedBookingForPay.service?.price || 0),
        method: paymentMethod,
      });

      setIsPaymentModalOpen(false);
      setSelectedBookingForPay(null);
      fetchBookings();
    } catch (err) {
      setPaymentError(err.response?.data?.message || err.message || 'Gagal memproses pembayaran');
    } finally {
      setPaying(false);
    }
  };

  const extractTime = (val) => {
    if (!val) return '-';
    if (typeof val === 'string' && val.includes('T')) {
      const d = new Date(val);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return String(val).substring(0, 5);
  };

  const columns = [
    { header: 'ID Pesanan', accessor: 'id', render: (row) => <span className="font-mono text-xs font-bold text-slate-700">#{row.id}</span> },
    { 
      header: 'Layanan & Provider', 
      accessor: 'service',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.service?.name || 'Layanan'}</div>
          <div className="text-xs text-slate-500">{row.provider?.name ? `Mitra: ${row.provider.name}` : ''}</div>
        </div>
      )
    },
    { 
      header: 'Tanggal & Jam', 
      accessor: 'start_time',
      render: (row) => (
        <div className="text-xs">
          <div className="font-semibold text-slate-800">
            {row.start_time ? new Date(row.start_time).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
          </div>
          <div className="text-slate-500 font-mono">
            {extractTime(row.start_time)} - {extractTime(row.end_time)}
          </div>
        </div>
      )
    },
    { 
      header: 'Total Biaya', 
      accessor: 'total_price',
      render: (row) => (
        <span className="font-extrabold text-green-600 text-sm">
          ${row.total_price || row.service?.price || 0}
        </span>
      )
    },
    { 
      header: 'Status Booking', 
      accessor: 'status',
      render: (row) => {
        let badgeStyle = 'bg-slate-100 text-slate-700';
        if (row.status === 'confirmed') badgeStyle = 'bg-blue-100 text-blue-700 border border-blue-200';
        if (row.status === 'completed') badgeStyle = 'bg-green-100 text-green-700 border border-green-200';
        if (row.status === 'cancelled') badgeStyle = 'bg-red-100 text-red-700 border border-red-200';
        if (row.status === 'pending') badgeStyle = 'bg-amber-100 text-amber-700 border border-amber-200';

        return (
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${badgeStyle}`}>
            {row.status}
          </span>
        );
      }
    },
    { 
      header: 'Status Bayar', 
      accessor: 'payment_status',
      render: (row) => {
        const isPaid = row.payment_status === 'paid';
        return (
          <div className="flex flex-col gap-1">
            <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase inline-block w-max ${
              isPaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {row.payment_status || 'unpaid'}
            </span>
            {!isPaid && row.status !== 'cancelled' && (
              <button
                onClick={() => openPaymentModal(row)}
                className="text-xs bg-primary-600 text-white px-2.5 py-1 rounded-lg hover:bg-primary-700 font-semibold transition-all shadow-sm flex items-center gap-1 w-max mt-1"
              >
                <CreditCard size={12} /> Bayar Sekarang
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDetailBooking(row)}
            className="text-xs text-primary-600 hover:text-primary-800 font-semibold underline flex items-center gap-1"
          >
            <FileText size={14} /> Detail
          </button>
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
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={openCreateModal}
            className="bg-primary-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-md flex items-center gap-2 text-sm"
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

      {/* STEPPER WIZARD MODAL: BUAT RESERVASI BARU */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            
            {/* Header Wizard & Progress Bar */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Reservasi Layanan Online</h3>
                <p className="text-xs text-slate-500">Langkah {currentStep} dari 3: {
                  currentStep === 1 ? 'Pilih Layanan' : currentStep === 2 ? 'Pilih Waktu Operasional' : 'Konfirmasi Reservasi'
                }</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Stepper Progress Indicator */}
            <div className="grid grid-cols-3 gap-2 my-6">
              <div className={`h-2 rounded-full transition-colors ${currentStep >= 1 ? 'bg-primary-600' : 'bg-slate-200'}`}></div>
              <div className={`h-2 rounded-full transition-colors ${currentStep >= 2 ? 'bg-primary-600' : 'bg-slate-200'}`}></div>
              <div className={`h-2 rounded-full transition-colors ${currentStep >= 3 ? 'bg-primary-600' : 'bg-slate-200'}`}></div>
            </div>

            {modalError && (
              <div className="bg-red-50 text-red-600 p-3.5 rounded-2xl border border-red-100 text-xs mb-4 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {/* STEP 1: PILIH LAYANAN */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Silakan Pilih Layanan yang Anda Ingin Pesan
                </h4>

                {services.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                    Belum ada layanan yang tersedia di sistem saat ini.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {services.map((svc) => (
                      <div
                        key={svc.id}
                        onClick={() => handleSelectService(svc)}
                        className={`rounded-2xl border cursor-pointer overflow-hidden transition-all duration-200 flex flex-col justify-between hover:shadow-lg ${
                          selectedService?.id === svc.id
                            ? 'border-primary-600 bg-primary-50/50 shadow-md ring-2 ring-primary-500/20'
                            : 'border-slate-200 bg-white hover:border-primary-300'
                        }`}
                      >
                        {/* Service Thumbnail */}
                        <div className="w-full h-32 bg-slate-100 relative overflow-hidden">
                          {svc.image_url ? (
                            <img src={svc.image_url} alt={svc.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                              <Sparkles size={24} />
                            </div>
                          )}
                          <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white/90 backdrop-blur-md text-primary-700 shadow-sm">
                            {svc.category?.name || 'Layanan'}
                          </span>
                        </div>

                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <h5 className="font-bold text-slate-900 text-base">{svc.name}</h5>
                              <span className="text-base font-extrabold text-green-600 shrink-0 ml-2">
                                ${svc.price}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                              {svc.description || 'Layanan profesional dengan standar kualitas terbaik.'}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                            <span className="flex items-center gap-1 font-medium">
                              <Clock size={14} className="text-primary-500" />
                              {svc.duration} Menit
                            </span>
                            <span className="text-primary-600 font-bold flex items-center gap-1">
                              Pilih <ChevronRight size={14} />
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: PILIH JAM SESUAI OPERASIONAL TOKO & KETENTUAN AVAILABILITY */}
            {currentStep === 2 && selectedService && (
              <div className="space-y-6">
                
                {/* Information Header & Selected Service Pill */}
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-primary-600 tracking-wider">Layanan Terpilih</span>
                    <h4 className="font-bold text-slate-900 text-base">{selectedService.name}</h4>
                    <span className="text-xs text-slate-500">${selectedService.price} • {selectedService.duration} Menit</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs text-primary-600 hover:underline font-semibold flex items-center gap-1"
                  >
                    <ArrowLeft size={14} /> Ganti Layanan
                  </button>
                </div>

                {/* Jam Operasional Toko Banner */}
                <div className="bg-blue-50/70 border border-blue-100 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
                    <Store size={16} className="text-blue-600" />
                    <span>Ketentuan Jam Buka Toko (Provider Schedule)</span>
                  </div>
                  {shopSchedules.length === 0 ? (
                    <p className="text-xs text-blue-700">Toko buka setiap hari (09:00 - 17:00).</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {shopSchedules.map((sch) => (
                        <span 
                          key={sch.id} 
                          className={`px-2.5 py-1 rounded-lg font-medium text-[11px] capitalize ${
                            sch.is_available 
                              ? 'bg-white text-slate-700 border border-slate-200' 
                              : 'bg-red-50 text-red-600 border border-red-100 line-through'
                          }`}
                        >
                          {sch.day}: {sch.is_available ? `${sch.start_time} - ${sch.end_time}` : 'Tutup'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Select Date Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    1. Pilih Tanggal Reservasi
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedSlot(null);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>

                {/* Check Shop Open Status Warning */}
                {!isShopOpenToday && (
                  <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-200 text-xs flex items-start gap-3">
                    <XCircle size={18} className="shrink-0 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-bold">Toko/Provider Tutup pada Hari Ini ({selectedDayName.toUpperCase()})</p>
                      <p className="mt-0.5">Silakan ganti ke tanggal lain yang termasuk dalam jadwal operasional buka toko.</p>
                    </div>
                  </div>
                )}

                {/* Select Time Slot Grid with Status Transparency */}
                {isShopOpenToday && (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        2. Pilih Jam Operasional yang Tersedia
                      </label>
                      <span className="text-[11px] text-slate-500">
                        {slotsForSelectedDate.length} Slot Ditemukan
                      </span>
                    </div>

                    {slotsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      </div>
                    ) : slotsForSelectedDate.length === 0 ? (
                      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-1">
                        <p className="font-semibold text-slate-700">Belum ada slot waktu khusus untuk tanggal ini.</p>
                        <p>Silakan hubungi provider atau pilih tanggal alternatif lainnya.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {slotsForSelectedDate.map((slot) => {
                          const isAvailable = slot.status === 'available' && !slot.is_full && slot.remaining_capacity > 0;
                          const isBookedFull = slot.status === 'booked' || slot.is_full || slot.remaining_capacity === 0;
                          const isBlocked = slot.status === 'blocked';
                          const isSelected = selectedSlot?.id === slot.id;

                          let cardStyle = 'border-slate-200 bg-white hover:border-primary-400 cursor-pointer';
                          let statusLabel = 'Tersedia';
                          let statusBadgeClass = 'bg-green-100 text-green-700';

                          if (isSelected) {
                            cardStyle = 'border-primary-600 bg-primary-50 ring-2 ring-primary-500/30 cursor-pointer';
                          } else if (isBookedFull) {
                            cardStyle = 'border-red-200 bg-red-50/40 opacity-75 cursor-not-allowed';
                            statusLabel = 'Penuh (Full)';
                            statusBadgeClass = 'bg-red-100 text-red-700';
                          } else if (isBlocked) {
                            cardStyle = 'border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed';
                            statusLabel = 'Istirahat / Diblokir';
                            statusBadgeClass = 'bg-slate-200 text-slate-600';
                          }

                          return (
                            <div
                              key={slot.id}
                              onClick={() => {
                                if (isAvailable) setSelectedSlot(slot);
                              }}
                              className={`p-4 rounded-2xl border transition-all flex justify-between items-center ${cardStyle}`}
                            >
                              <div>
                                <div className="font-mono font-bold text-slate-900 text-sm">
                                  {extractTime(slot.start_time)} - {extractTime(slot.end_time)}
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  {isAvailable ? `Sisa Kapasitas: ${slot.remaining_capacity ?? slot.capacity} Kursi` : (
                                    isBookedFull ? 'Maaf, slot waktu ini sudah penuh dibooking.' : 'Jam ini sedang ditutup oleh provider.'
                                  )}
                                </div>
                              </div>

                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBadgeClass}`}>
                                {statusLabel}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Step Navigation Buttons */}
                <div className="pt-4 border-t border-slate-100 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2.5 text-slate-600 text-sm font-semibold hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1"
                  >
                    <ArrowLeft size={16} /> Kembali
                  </button>

                  <button
                    type="button"
                    disabled={!selectedSlot}
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-2.5 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-md disabled:opacity-50 flex items-center gap-1"
                  >
                    Lanjut ke Ringkasan <ChevronRight size={16} />
                  </button>
                </div>

              </div>
            )}

            {/* STEP 3: SUMMARY & CONFIRMATION */}
            {currentStep === 3 && selectedService && selectedSlot && (
              <div className="space-y-6">
                <div className="text-center pb-2">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">Konfirmasi Pemesanan Layanan</h4>
                  <p className="text-xs text-slate-500">Periksa kembali detail pesanan Anda sebelum mengonfirmasi.</p>
                </div>

                {/* Summary Card Receipt */}
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Layanan</span>
                    <span className="font-bold text-slate-900 text-sm">{selectedService.name}</span>
                  </div>

                  <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Penyedia (Mitra)</span>
                    <span className="font-semibold text-slate-800 text-sm">{selectedService.provider?.name || 'Provider Profesional'}</span>
                  </div>

                  <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Tanggal & Waktu</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}, {extractTime(selectedSlot.start_time)} - {extractTime(selectedSlot.end_time)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Durasi Service</span>
                    <span className="font-semibold text-slate-800 text-sm">{selectedService.duration} Menit</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-bold text-slate-900">Total Biaya Layanan</span>
                    <span className="text-2xl font-extrabold text-green-600">${selectedService.price}</span>
                  </div>
                </div>

                {/* Trust Guarantee Note */}
                <div className="flex items-center gap-3 p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs text-blue-800">
                  <ShieldCheck size={20} className="text-blue-600 shrink-0" />
                  <span>Jaminan garansi reservasi instan. Anda dapat membatalkan pesanan kapan saja sebelum waktu layanan.</span>
                </div>

                {/* Step 3 Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2.5 text-slate-600 text-sm font-semibold hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1"
                  >
                    <ArrowLeft size={16} /> Ubah Jam/Tanggal
                  </button>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleCreateBooking}
                    className="px-8 py-3 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? 'Memproses Reservasi...' : 'Konfirmasi & Buat Pesanan'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* DETAIL MODAL RECEIPT */}
      {detailBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Detail Reservasi #{detailBooking.id}</h3>
              <button 
                onClick={() => setDetailBooking(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Layanan:</span>
                  <span className="font-bold text-slate-900">{detailBooking.service?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Penyedia (Mitra):</span>
                  <span className="font-semibold text-slate-800">{detailBooking.provider?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tanggal:</span>
                  <span className="font-bold text-slate-900">
                    {detailBooking.start_time ? new Date(detailBooking.start_time).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Jam Slot:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {extractTime(detailBooking.start_time)} - {extractTime(detailBooking.end_time)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status Pesanan:</span>
                  <span className="font-bold uppercase text-primary-600">{detailBooking.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status Pembayaran:</span>
                  <span className="font-bold uppercase text-green-600">{detailBooking.payment_status || 'unpaid'}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                  <span className="font-bold text-slate-900">Total Harga:</span>
                  <span className="font-extrabold text-green-600">${detailBooking.total_price || detailBooking.service?.price}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              {detailBooking.payment_status === 'paid' && (
                <button
                  onClick={() => generateCustomerReceiptPDF(null, detailBooking)}
                  className="px-4 py-2.5 bg-primary-600 text-white rounded-xl text-xs font-bold hover:bg-primary-700 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Download size={14} /> Unduh Resi PDF
                </button>
              )}
              <button
                onClick={() => setDetailBooking(null)}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PEMBAYARAN */}
      {isPaymentModalOpen && selectedBookingForPay && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-800">Pembayaran Reservasi #{selectedBookingForPay.id}</h3>
              <button 
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {paymentError && (
              <div className="bg-red-50 text-red-600 p-3.5 rounded-2xl border border-red-100 text-xs mb-4">
                {paymentError}
              </div>
            )}

            <form onSubmit={handleProcessPayment} className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Layanan:</span>
                  <span className="font-bold text-slate-800">{selectedBookingForPay.service?.name}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Total Tagihan:</span>
                  <span className="font-extrabold text-green-600 text-sm">
                    ${selectedBookingForPay.total_price || selectedBookingForPay.service?.price || 0}
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
                  className="px-5 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
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

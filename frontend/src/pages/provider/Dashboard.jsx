import React, { useState, useEffect, useContext } from 'react';
import { Calendar, CreditCard, Settings, Activity, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { serviceApi } from '../../services/serviceApi';
import { bookingApi } from '../../services/bookingApi';
import { scheduleService } from '../../services/scheduleService';
import { paymentService } from '../../services/paymentService';

const StatCard = ({ title, value, icon: Icon, bgColor, iconColor, description }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800 mt-1">{value ?? '—'}</h3>
        {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
      </div>
      <div className={`p-3 rounded-xl ${bgColor}`}>
        <Icon size={24} className={iconColor} />
      </div>
    </div>
  </div>
);

const statusMeta = {
  pending:   { color: 'text-amber-600',  bg: 'bg-amber-50',   icon: AlertCircle,   label: 'Menunggu Konfirmasi' },
  confirmed: { color: 'text-blue-600',   bg: 'bg-blue-50',    icon: Clock,         label: 'Dikonfirmasi' },
  completed: { color: 'text-green-600',  bg: 'bg-green-50',   icon: CheckCircle,   label: 'Selesai' },
  cancelled: { color: 'text-red-600',    bg: 'bg-red-50',     icon: XCircle,       label: 'Dibatalkan' },
};

const ProviderDashboard = () => {
  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState({ services: 0, bookings: 0, revenue: 0, todaySchedules: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) fetchAllData();
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Run all fetches in parallel
      const [servicesData, bookingsData, schedulesData, paymentsData] = await Promise.allSettled([
        serviceApi.getAllServices({ provider_id: user.id }),
        bookingApi.getAllBookings({ provider_id: user.id }),
        scheduleService.getAllSchedules({ provider_id: user.id }),
        paymentService.getAllPayments({ provider_id: user.id }),
      ]);

      const services   = servicesData.status === 'fulfilled'  ? (servicesData.value || [])          : [];
      const bookings   = bookingsData.status === 'fulfilled'  ? (bookingsData.value.data || [])      : [];
      const schedules  = schedulesData.status === 'fulfilled' ? (schedulesData.value.data || [])     : [];
      const payments   = paymentsData.status === 'fulfilled'  ? (paymentsData.value.data || [])      : [];

      // Today's schedules — filter by current day name
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const todaySchedules = schedules.filter(s => s.day_of_week?.toLowerCase() === today && s.is_active);

      // Calculate total revenue from completed payments
      const totalRevenue = payments
        .filter(p => p.status === 'completed' || p.status === 'paid')
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

      setStats({
        services: services.length,
        bookings: bookings.length,
        revenue: totalRevenue,
        todaySchedules: todaySchedules.length,
      });

      // Show last 5 bookings
      setRecentBookings(bookings.slice(0, 5));
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Provider</h1>
        <p className="text-slate-500 mt-1">
          Selamat datang, <span className="font-semibold text-blue-600">{user?.name}</span>. Berikut ringkasan bisnis Anda hari ini.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Booking"
          value={stats.bookings}
          icon={Activity}
          bgColor="bg-blue-100"
          iconColor="text-blue-600"
          description="Semua reservasi masuk"
        />
        <StatCard
          title="Total Pendapatan"
          value={`Rp ${stats.revenue.toLocaleString('id-ID')}`}
          icon={CreditCard}
          bgColor="bg-emerald-100"
          iconColor="text-emerald-600"
          description="Dari pembayaran selesai"
        />
        <StatCard
          title="Layanan Aktif"
          value={stats.services}
          icon={Settings}
          bgColor="bg-amber-100"
          iconColor="text-amber-600"
          description="Services yang Anda tawarkan"
        />
        <StatCard
          title="Jadwal Hari Ini"
          value={stats.todaySchedules}
          icon={Calendar}
          bgColor="bg-purple-100"
          iconColor="text-purple-600"
          description={`Hari ${new Date().toLocaleDateString('id-ID', { weekday: 'long' })}`}
        />
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800">Reservasi Terbaru</h2>
          <p className="text-sm text-slate-400 mt-0.5">5 booking terkini dari pelanggan Anda</p>
        </div>
        <div className="divide-y divide-slate-50">
          {recentBookings.length > 0 ? recentBookings.map((booking) => {
            const meta = statusMeta[booking.status] || statusMeta.pending;
            const StatusIcon = meta.icon;
            return (
              <div key={booking.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold uppercase text-sm flex-shrink-0">
                    {booking.user?.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">{booking.user?.name || 'Pelanggan'}</div>
                    <div className="text-sm text-slate-500">{booking.service?.name || 'Layanan'} • {new Date(booking.booking_date).toLocaleDateString('id-ID')}</div>
                  </div>
                </div>
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${meta.bg} ${meta.color}`}>
                  <StatusIcon size={12} />
                  {meta.label}
                </span>
              </div>
            );
          }) : (
            <div className="py-12 text-center text-slate-400">
              <Activity size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Belum ada reservasi yang masuk.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;

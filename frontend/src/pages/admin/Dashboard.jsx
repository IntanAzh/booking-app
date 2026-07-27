import React, { useState, useEffect } from 'react';
import { Users, CreditCard, Box, Activity, TrendingUp, Download } from 'lucide-react';
import api from '../../services/api';
import { paymentService } from '../../services/paymentService';
import { generateAdminFinancialReportPDF } from '../../utils/pdfGenerator';

const StatCard = ({ title, value, icon: Icon, color, description }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
        {description && <p className="text-xs text-slate-400 mt-2">{description}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/admin');
      setDashboardData(response.data.data);
      setError(null);
    } catch (err) {
      console.error("Gagal memuat dashboard", err);
      setError(err.response?.data?.message || err.message || 'Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setExporting(true);
      const res = await paymentService.getAllPayments();
      const payments = res.data || [];
      const revenue = dashboardData?.revenue?.total_revenue || 0;
      const paidCount = dashboardData?.revenue?.paid_completed_bookings || 0;

      generateAdminFinancialReportPDF(payments, {
        total_revenue: revenue,
        paid_count: paidCount
      });
    } catch (err) {
      alert('Gagal mengunduh laporan PDF: ' + (err.message || 'Terjadi kesalahan'));
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
        {error}
      </div>
    );
  }

  const usersInfo = dashboardData?.users || { total_users: 0, total_customers: 0, total_providers: 0 };
  const bookingsInfo = dashboardData?.bookings || { total_bookings: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
  const revenueInfo = dashboardData?.revenue || { total_revenue: 0, paid_completed_bookings: 0 };
  const servicesInfo = dashboardData?.services || { total_services: 0 };
  const topServices = dashboardData?.top_services || [];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1">Pantau metrik utama aplikasi dari data terkini database.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchDashboardData}
            className="bg-white border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 rounded-lg shadow-sm hover:bg-slate-50 flex items-center gap-2"
          >
            <TrendingUp size={16} /> Refresh Data
          </button>
          <button 
            onClick={handleDownloadPDF}
            disabled={exporting}
            className="bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-lg shadow-md hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Download size={16} /> {exporting ? 'Memproses...' : 'Unduh Laporan PDF'}
          </button>
        </div>
      </div>

      {/* Stat Cards Live Database */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={usersInfo.total_users} 
          icon={Users} 
          color="bg-blue-100 text-blue-600" 
          description={`${usersInfo.total_customers} Customer • ${usersInfo.total_providers} Provider`}
        />
        <StatCard 
          title="Total Bookings" 
          value={bookingsInfo.total_bookings} 
          icon={Activity} 
          color="bg-indigo-100 text-indigo-600" 
          description={`${bookingsInfo.confirmed} Confirmed • ${bookingsInfo.completed} Completed`}
        />
        <StatCard 
          title="Total Revenue" 
          value={`$${Number(revenueInfo.total_revenue).toLocaleString()}`} 
          icon={CreditCard} 
          color="bg-emerald-100 text-emerald-600" 
          description={`Dari ${revenueInfo.paid_completed_bookings} transaksi sukses`}
        />
        <StatCard 
          title="Active Services" 
          value={servicesInfo.total_services} 
          icon={Box} 
          color="bg-amber-100 text-amber-600" 
          description="Layanan terdaftar"
        />
      </div>

      {/* Summary Status & Top Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Status Reservasi</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-amber-50 rounded-xl">
              <span className="text-sm font-medium text-amber-800">Pending</span>
              <span className="font-bold text-amber-900">{bookingsInfo.pending}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
              <span className="text-sm font-medium text-blue-800">Confirmed</span>
              <span className="font-bold text-blue-900">{bookingsInfo.confirmed}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
              <span className="text-sm font-medium text-emerald-800">Completed</span>
              <span className="font-bold text-emerald-900">{bookingsInfo.completed}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
              <span className="text-sm font-medium text-red-800">Cancelled</span>
              <span className="font-bold text-red-900">{bookingsInfo.cancelled}</span>
            </div>
          </div>
        </div>

        {/* Top Services */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Layanan Terpopuler</h3>
          {topServices.length > 0 ? (
            <div className="space-y-3">
              {topServices.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <div>
                    <span className="text-sm font-bold text-slate-800">{item.service?.name || 'Layanan'}</span>
                    <p className="text-xs text-slate-400">Harga: ${item.service?.price}</p>
                  </div>
                  <span className="text-xs font-bold bg-primary-100 text-primary-700 px-3 py-1 rounded-full">
                    {item.total_bookings} Booking
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-sm">
              Belum ada data layanan populer.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


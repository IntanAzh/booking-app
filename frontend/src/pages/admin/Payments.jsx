import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, DollarSign, CreditCard, Activity } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import { paymentService } from '../../services/paymentService';
import { generateAdminFinancialReportPDF, generateCustomerReceiptPDF } from '../../utils/pdfGenerator';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getAllPayments();
      setPayments(data.data || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat data pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    // PDF generator hitung sendiri dari payments[]
    generateAdminFinancialReportPDF(payments);
  };

  const st = (p) => String(p?.status || '').toLowerCase();
  const totalRevenue = payments.reduce((acc, p) => st(p) === 'paid' ? acc + Number(p.amount || 0) : acc, 0);
  const paidCount = payments.filter(p => st(p) === 'paid').length;
  const pendingCount = payments.filter(p => st(p) === 'pending').length;

  const columns = [
    { header: 'ID Tx', accessor: 'id', render: (row) => <span className="font-mono text-xs font-bold text-slate-700">#{row.id}</span> },
    { 
      header: 'Booking ID', 
      accessor: 'booking_id',
      render: (row) => <div className="font-bold text-slate-900">#{row.booking_id}</div>
    },
    { 
      header: 'Pelanggan', 
      accessor: 'customer',
      render: (row) => <span className="text-xs text-slate-700 font-medium">{row.booking?.customer?.name || row.booking?.user?.name || '-'}</span>
    },
    { 
      header: 'Jumlah', 
      accessor: 'amount',
      render: (row) => <span className="font-extrabold text-emerald-600">${row.amount || 0}</span>
    },
    { 
      header: 'Metode', 
      accessor: 'method',
      render: (row) => <span className="uppercase text-slate-600 text-xs font-semibold">{row.method || row.payment_method || '-'}</span>
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => {
        let bgColor = 'bg-slate-100 text-slate-700';
        if (row.status === 'completed' || row.status === 'paid') bgColor = 'bg-green-100 text-green-700';
        if (row.status === 'pending') bgColor = 'bg-amber-100 text-amber-700';
        if (row.status === 'failed') bgColor = 'bg-red-100 text-red-700';
        if (row.status === 'refunded') bgColor = 'bg-purple-100 text-purple-700';
        
        return (
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${bgColor}`}>
            {row.status}
          </span>
        );
      }
    },
    {
      header: 'Cetak Resi',
      accessor: 'actions',
      render: (row) => (
        <button
          onClick={() => generateCustomerReceiptPDF(row)}
          className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800 font-semibold underline"
          title="Unduh Resi PDF Transaksi Ini"
        >
          <Download size={13} /> PDF
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen & Data Keuangan</h1>
          <p className="text-slate-500 text-sm mt-1">Pantau transaksi, riwayat pembayaran pelanggan, dan unduh laporan PDF.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPayments}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw size={18} />
          </button>
          
          <button
            onClick={handleExportPDF}
            disabled={payments.length === 0}
            className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md flex items-center gap-2 text-xs sm:text-sm disabled:opacity-50"
          >
            <Download size={16} /> Unduh Laporan PDF
          </button>
        </div>
      </div>

      {/* Ringkasan Statistik Keuangan Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Pendapatan</span>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">${totalRevenue.toLocaleString()}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Transaksi Lunas (Paid)</span>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{paidCount} <span className="text-xs font-normal text-slate-400">/ {payments.length}</span></h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <CreditCard size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Menunggu (Pending)</span>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{pendingCount}</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Activity size={22} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">
          {error}
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={payments} 
          searchPlaceholder="Cari Booking ID / Pelanggan..."
        />
      )}
    </div>
  );
};

export default Payments;


import React, { useState, useEffect } from 'react';
import { CreditCard, RefreshCw, Download } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import { paymentService } from '../../services/paymentService';
import { generateCustomerReceiptPDF } from '../../utils/pdfGenerator';

const CustomerPayments = () => {
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
      setPayments(data.data || data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Gagal memuat data riwayat pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'ID Tx', accessor: 'id' },
    { 
      header: 'Booking ID', 
      accessor: 'booking_id',
      render: (row) => <span className="font-bold text-slate-700">#{row.booking_id}</span>
    },
    { 
      header: 'Jumlah Bayar', 
      accessor: 'amount',
      render: (row) => (
        <span className="font-extrabold text-green-600">
          ${row.amount || 0}
        </span>
      )
    },
    { 
      header: 'Metode', 
      accessor: 'method',
      render: (row) => <span className="font-semibold text-slate-700 capitalize">{row.method || '-'}</span>
    },
    { 
      header: 'Tanggal Bayar', 
      accessor: 'paid_at',
      render: (row) => (
        <span className="text-xs text-slate-600">
          {row.paid_at ? new Date(row.paid_at).toLocaleString('id-ID') : row.createdAt ? new Date(row.createdAt).toLocaleString('id-ID') : '-'}
        </span>
      )
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => {
        let badgeStyle = 'bg-slate-100 text-slate-700';
        if (row.status === 'paid' || row.status === 'completed') badgeStyle = 'bg-green-100 text-green-700';
        if (row.status === 'failed') badgeStyle = 'bg-red-100 text-red-700';
        if (row.status === 'refunded') badgeStyle = 'bg-purple-100 text-purple-700';
        if (row.status === 'pending') badgeStyle = 'bg-amber-100 text-amber-700';

        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${badgeStyle}`}>
            {row.status}
          </span>
        );
      }
    },
    {
      header: 'Resi PDF',
      accessor: 'actions',
      render: (row) => (
        row.status === 'paid' || row.status === 'completed' ? (
          <button
            onClick={() => generateCustomerReceiptPDF(row)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200 rounded-lg transition-colors shadow-sm"
            title="Unduh Bukti Pembayaran PDF"
          >
            <Download size={14} /> Unduh PDF
          </button>
        ) : (
          <span className="text-xs text-slate-400 font-medium">-</span>
        )
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Riwayat Pembayaran</h1>
          <p className="text-slate-500 text-sm mt-1">Daftar transaksi pembayaran yang pernah Anda lakukan.</p>
        </div>

        <button
          onClick={fetchPayments}
          className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
          title="Refresh Data"
        >
          <RefreshCw size={18} />
        </button>
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
          data={payments}
          searchPlaceholder="Cari transaksi..."
        />
      )}
    </div>
  );
};

export default CustomerPayments;


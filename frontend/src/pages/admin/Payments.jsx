import React, { useState, useEffect } from 'react';
import DataTable from '../../components/common/DataTable';
import { paymentService } from '../../services/paymentService';

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

  const columns = [
    { header: 'ID', accessor: 'id' },
    { 
      header: 'Booking ID', 
      accessor: 'booking_id',
      render: (row) => <div className="font-medium text-slate-900">#{row.booking_id}</div>
    },
    { 
      header: 'Jumlah', 
      accessor: 'amount',
      render: (row) => <span className="font-bold text-emerald-600">${row.amount}</span>
    },
    { 
      header: 'Metode', 
      accessor: 'method',
      render: (row) => <span className="uppercase text-slate-500 font-medium">{row.method || row.payment_method || '-'}</span>
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => {
        let bgColor = 'bg-slate-100 text-slate-700';
        if (row.status === 'completed' || row.status === 'paid') bgColor = 'bg-green-100 text-green-700';
        if (row.status === 'pending') bgColor = 'bg-amber-100 text-amber-700';
        if (row.status === 'failed') bgColor = 'bg-red-100 text-red-700';
        
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${bgColor}`}>
            {row.status}
          </span>
        );
      }
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Payments</h1>
          <p className="text-slate-500 mt-1">Pantau transaksi dan riwayat pembayaran pelanggan.</p>
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
          data={payments} 
          searchPlaceholder="Cari Booking ID..."
          actions={false} // Biasanya admin tidak mengubah transaksi pembayaran secara langsung
        />
      )}
    </div>
  );
};

export default Payments;

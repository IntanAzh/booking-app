import React, { useState, useEffect, useContext } from 'react';
import DataTable from '../../components/common/DataTable';
import { paymentService } from '../../services/paymentService';
import { AuthContext } from '../../context/AuthContext';

const ProviderPayments = () => {
  const { user } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) fetchPayments();
  }, [user]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getAllPayments({ provider_id: user.id });
      setPayments(data.data || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat riwayat pembayaran');
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
      header: 'Total Pembayaran', 
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
          <h1 className="text-2xl font-bold text-slate-900">Riwayat Pembayaran</h1>
          <p className="text-slate-500 mt-1">Pantau total pendapatan dari layanan yang telah Anda selesaikan.</p>
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
          data={payments} 
          searchPlaceholder="Cari ID transaksi..."
          actions={false}
        />
      )}
    </div>
  );
};

export default ProviderPayments;

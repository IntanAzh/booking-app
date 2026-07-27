import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates and downloads a PDF receipt for a customer's completed payment.
 * @param {Object} payment - Payment object from backend
 * @param {Object} [bookingOverride] - Optional booking object override
 */
export const generateCustomerReceiptPDF = (payment, bookingOverride = null) => {
  const doc = new jsPDF();
  const booking = bookingOverride || payment?.booking || {};
  
  // Primary colors
  const primaryColor = [37, 99, 235]; // #2563eb
  const darkTextColor = [30, 41, 59]; // #1e293b
  const mutedTextColor = [100, 116, 139]; // #64748b
  const greenColor = [22, 163, 74]; // #16a34a

  // Top Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 38, 'F');
  
  // Title & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('BUKTI PEMBAYARAN', 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('RESI OFFICIAL & BUKTI TRANSAKSI SAH', 14, 28);

  // Transaction reference & Date (Right aligned in header)
  const txRef = payment?.transaction_ref || `TX-${payment?.id || booking?.id || Date.now()}`;
  doc.setFontSize(8.5);
  doc.text(`No. Ref: ${txRef}`, 196, 18, { align: 'right' });
  
  const rawDate = payment?.paid_at || payment?.createdAt || booking?.updatedAt || new Date();
  const dateStr = new Date(rawDate).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Tanggal: ${dateStr}`, 196, 26, { align: 'right' });

  // Status Badge Container
  const isPaid = (payment?.status === 'paid' || payment?.status === 'completed' || booking?.payment_status === 'paid');
  
  if (isPaid) {
    doc.setFillColor(240, 253, 244); // Light Green
    doc.setDrawColor(187, 247, 208);
  } else {
    doc.setFillColor(254, 243, 199); // Light Amber
    doc.setDrawColor(253, 230, 138);
  }
  doc.roundedRect(14, 44, 182, 18, 3, 3, 'FD');
  
  doc.setTextColor(...(isPaid ? greenColor : [217, 119, 6]));
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.text(
    isPaid ? 'STATUS PEMBAYARAN: LUNAS / PAID' : `STATUS PEMBAYARAN: ${(payment?.status || booking?.payment_status || 'PENDING').toUpperCase()}`,
    22,
    55.5
  );

  // Reservation Info Section
  doc.setTextColor(...darkTextColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMASI RESERVASI & PELANGGAN', 14, 72);

  const customerName = booking?.customer?.name || booking?.user?.name || 'Pelanggan';
  const customerEmail = booking?.customer?.email || booking?.user?.email || '-';
  const providerName = booking?.provider?.name || 'Mitra Provider';
  const serviceName = booking?.service?.name || 'Layanan Reservasi';
  const bookingId = booking?.id || payment?.booking_id || '-';
  const paymentMethod = (payment?.method || payment?.payment_method || 'transfer').toUpperCase();
  
  let bookingDateStr = '-';
  if (booking?.start_time) {
    bookingDateStr = new Date(booking.start_time).toLocaleString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  autoTable(doc, {
    startY: 76,
    head: [['Item Rincian', 'Detail Informasi']],
    body: [
      ['ID Pesanan (Booking ID)', `#${bookingId}`],
      ['Nama Pelanggan', `${customerName} (${customerEmail})`],
      ['Penyedia Jasa (Provider)', providerName],
      ['Nama Layanan', serviceName],
      ['Jadwal Reservasi', bookingDateStr],
      ['Metode Pembayaran', paymentMethod],
    ],
    theme: 'striped',
    headStyles: { fillStyle: 'F', fillColor: [241, 245, 249], textColor: darkTextColor, fontStyle: 'bold', fontSize: 9 },
    styles: { fontSize: 8.5, cellPadding: 3.5, textColor: darkTextColor },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold' },
      1: { cellWidth: 122 }
    }
  });

  // Financial Breakdown Table
  const finalY = doc.lastAutoTable.finalY + 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  doc.text('RINCIAN TAGIHAN & BIAYA', 14, finalY);

  const amount = payment?.amount !== undefined ? payment.amount : (booking?.total_price || booking?.service?.price || 0);

  autoTable(doc, {
    startY: finalY + 4,
    head: [['Deskripsi Layanan', 'Durasi', 'Harga']],
    body: [
      [serviceName, `${booking?.service?.duration || '-'} Menit`, `$${amount}`],
    ],
    foot: [
      ['TOTAL BAYAR', '', `$${amount}`]
    ],
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    footStyles: { fillColor: [241, 245, 249], textColor: greenColor, fontStyle: 'bold', fontSize: 10 },
    styles: { fontSize: 8.5, cellPadding: 4, textColor: darkTextColor },
    columnStyles: {
      0: { cellWidth: 112 },
      1: { cellWidth: 35, halign: 'center' },
      2: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
    }
  });

  // Guarantee and Footer
  const endY = doc.lastAutoTable.finalY + 18;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, endY, 196, endY);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...mutedTextColor);
  doc.text('Terima kasih telah mempercayakan pemesanan Anda pada platform kami.', 105, endY + 6, { align: 'center' });
  doc.text('Bukti pembayaran ini merupakan resi elektronik yang sah dan tidak memerlukan tanda tangan basah.', 105, endY + 10, { align: 'center' });

  // Save File
  doc.save(`Bukti_Pembayaran_#${bookingId}.pdf`);
};

/**
 * Generates and downloads an Admin Financial & Payment Report PDF.
 * @param {Array} payments - List of payment objects
 * @param {Object} [summary] - Summary metrics (revenue, total count, paid count)
 */
export const generateAdminFinancialReportPDF = (payments = [], summary = {}) => {
  const doc = new jsPDF();

  const headerBgColor = [15, 23, 42]; // Slate 900
  const darkTextColor = [30, 41, 59];
  const mutedTextColor = [100, 116, 139];
  const greenColor = [22, 163, 74];
  const blueColor = [37, 99, 235];

  // Header Banner
  doc.setFillColor(...headerBgColor);
  doc.rect(0, 0, 210, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('LAPORAN DATA KEUANGAN & TRANSAKSI', 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('REKAPITULASI PEMBAYARAN KEUANGAN SISTEM', 14, 28);
  
  const formattedPrintDate = new Date().toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.setFontSize(8.5);
  doc.text(`Dicetak: ${formattedPrintDate}`, 196, 26, { align: 'right' });

  // Summary Metrics Section Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 43, 182, 28, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 43, 182, 28, 3, 3, 'D');

  const totalRev = summary?.total_revenue !== undefined 
    ? summary.total_revenue 
    : payments.reduce((acc, p) => (p.status === 'paid' || p.status === 'completed' ? acc + Number(p.amount || 0) : acc), 0);

  const paidCount = summary?.paid_count !== undefined 
    ? summary.paid_count 
    : payments.filter(p => p.status === 'paid' || p.status === 'completed').length;

  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const failedCount = payments.filter(p => p.status === 'failed' || p.status === 'refunded').length;

  // Metric 1: Revenue
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...mutedTextColor);
  doc.text('TOTAL PENDAPATAN', 20, 52);
  doc.setFontSize(14);
  doc.setTextColor(...greenColor);
  doc.text(`$${Number(totalRev).toLocaleString()}`, 20, 62);

  // Metric 2: Total Transactions
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedTextColor);
  doc.text('TOTAL TRANSAKSI', 85, 52);
  doc.setFontSize(14);
  doc.setTextColor(...blueColor);
  doc.text(`${payments.length} Transaksi`, 85, 62);

  // Metric 3: Status Breakdown
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedTextColor);
  doc.text('RINCIAN STATUS', 145, 52);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  doc.text(`Paid: ${paidCount}  |  Pending: ${pendingCount}`, 145, 60);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedTextColor);
  doc.text(`Gagal/Refund: ${failedCount}`, 145, 66);

  // Table Heading
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  doc.text('RIWAYAT DETAILED TRANSAKSI PEMBAYARAN', 14, 80);

  const tableRows = payments.map((p, idx) => {
    const txId = p.id || '-';
    const bookingId = p.booking_id || p.booking?.id || '-';
    const customer = p.booking?.customer?.name || p.booking?.user?.name || '-';
    const service = p.booking?.service?.name || '-';
    const method = (p.method || p.payment_method || '-').toUpperCase();
    const amount = `$${p.amount !== undefined ? p.amount : (p.booking?.total_price || 0)}`;
    const date = p.paid_at 
      ? new Date(p.paid_at).toLocaleDateString('id-ID') 
      : p.createdAt 
        ? new Date(p.createdAt).toLocaleDateString('id-ID') 
        : '-';
    const status = (p.status || 'pending').toUpperCase();

    return [
      idx + 1,
      `#${txId}`,
      `#${bookingId}`,
      customer,
      service,
      method,
      date,
      amount,
      status
    ];
  });

  autoTable(doc, {
    startY: 84,
    head: [['No', 'ID Tx', 'Booking', 'Pelanggan', 'Layanan', 'Metode', 'Tanggal', 'Jumlah', 'Status']],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: headerBgColor, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 7.5, cellPadding: 3, textColor: darkTextColor },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 15 },
      2: { cellWidth: 16 },
      3: { cellWidth: 32 },
      4: { cellWidth: 35 },
      5: { cellWidth: 20 },
      6: { cellWidth: 24 },
      7: { cellWidth: 18, fontStyle: 'bold', halign: 'right' },
      8: { cellWidth: 14, fontStyle: 'bold', halign: 'center' }
    }
  });

  const finalY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...mutedTextColor);
  doc.text('Laporan data keuangan ini dieksport secara otomatis oleh sistem administrasi Booking App.', 105, finalY, { align: 'center' });

  doc.save(`Laporan_Keuangan_Admin_${new Date().toISOString().split('T')[0]}.pdf`);
};

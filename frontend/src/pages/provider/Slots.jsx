import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { Plus, X } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import { slotService } from '../../services/slotService';
import { serviceApi } from '../../services/serviceApi';
import { scheduleService } from '../../services/scheduleService';
import { AuthContext } from '../../context/AuthContext';

const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const dayLabels = {
  sunday: 'Minggu',
  monday: 'Senin',
  tuesday: 'Selasa',
  wednesday: 'Rabu',
  thursday: 'Kamis',
  friday: 'Jumat',
  saturday: 'Sabtu',
};

const toDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateLabel = (dateStr) =>
  new Date(`${dateStr}T00:00:00`).toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

const ProviderSlots = () => {
  const { user } = useContext(AuthContext);
  const [slots, setSlots] = useState([]);
  const [services, setServices] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const [formData, setFormData] = useState({
    service_id: '',
    slot_date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '10:00',
    capacity: 1,
    status: 'available',
  });

  const fetchSlots = useCallback(async () => {
    try {
      setLoading(true);
      const data = await slotService.getAllSlots({ provider_id: user.id });
      setSlots(data.data || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat data slot Anda');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchProviderServices = useCallback(async () => {
    try {
      const data = await serviceApi.getAllServices({ provider_id: user.id });
      const svcList = data || [];
      setServices(svcList);
      setFormData((prev) =>
        svcList.length > 0 && !prev.service_id
          ? { ...prev, service_id: svcList[0].id }
          : prev,
      );
    } catch (err) {
      console.error('Gagal memuat layanan provider', err);
    }
  }, [user?.id]);

  const fetchProviderSchedules = useCallback(async () => {
    try {
      const res = await scheduleService.getAllSchedules({
        provider_id: user.id,
        is_available: true,
      });
      setSchedules(res.data || res || []);
    } catch (err) {
      console.error('Gagal memuat jadwal provider', err);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchSlots();
      fetchProviderServices();
      fetchProviderSchedules();
    }
  }, [user?.id, fetchSlots, fetchProviderServices, fetchProviderSchedules]);

  const getAllowedDatesForService = useCallback(
    (serviceId, daysAhead = 45) => {
      const activeSchedules = schedules.filter(
        (schedule) =>
          Number(schedule.service_id) === Number(serviceId) &&
          schedule.is_available,
      );
      const allowedDays = new Set(activeSchedules.map((schedule) => schedule.day));
      const dates = [];
      const cursor = new Date();
      cursor.setHours(0, 0, 0, 0);

      for (let i = 0; i < daysAhead; i += 1) {
        const candidate = new Date(cursor);
        candidate.setDate(cursor.getDate() + i);
        const dayName = dayNames[candidate.getDay()];

        if (allowedDays.has(dayName)) {
          dates.push({
            date: toDateString(candidate),
            day: dayName,
            label: formatDateLabel(toDateString(candidate)),
          });
        }
      }

      return dates;
    },
    [schedules],
  );

  const availableDates = useMemo(
    () => getAllowedDatesForService(formData.service_id),
    [formData.service_id, getAllowedDatesForService],
  );

  const selectedDateSchedules = schedules.filter(
    (schedule) =>
      Number(schedule.service_id) === Number(formData.service_id) &&
      schedule.is_available &&
      schedule.day === dayNames[new Date(`${formData.slot_date}T00:00:00`).getDay()],
  );

  useEffect(() => {
    if (!showModal || !formData.service_id || availableDates.length === 0) return;
    const currentDateIsAllowed = availableDates.some((item) => item.date === formData.slot_date);
    if (!currentDateIsAllowed) {
      setFormData((prev) => ({ ...prev, slot_date: availableDates[0].date }));
    }
  }, [showModal, formData.service_id, formData.slot_date, availableDates]);

  const extractTimeStr = (val) => {
    if (!val) return '09:00';
    if (val.includes('T')) {
      const d = new Date(val);
      const hrs = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${hrs}:${mins}`;
    }
    return val.substring(0, 5);
  };

  const openCreateModal = () => {
    setEditingSlot(null);
    setFormData({
      service_id: services[0]?.id || '',
      slot_date: new Date().toISOString().split('T')[0],
      start_time: '09:00',
      end_time: '10:00',
      capacity: 1,
      status: 'available',
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleEdit = (row) => {
    setEditingSlot(row);
    setFormData({
      service_id: row.service_id || (services[0]?.id || ''),
      slot_date: row.slot_date ? row.slot_date.substring(0, 10) : new Date().toISOString().split('T')[0],
      start_time: extractTimeStr(row.start_time),
      end_time: extractTimeStr(row.end_time),
      capacity: row.capacity ?? 1,
      status: row.status || 'available',
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'service_id') {
      const nextDates = getAllowedDatesForService(value);
      setFormData((prev) => ({
        ...prev,
        service_id: value,
        slot_date: nextDates[0]?.date || prev.slot_date,
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.service_id || !formData.slot_date || !formData.start_time || !formData.end_time) {
      setFormError('Layanan, tanggal, jam mulai, dan jam selesai wajib diisi');
      return;
    }

    if (availableDates.length === 0) {
      setFormError('Layanan ini belum memiliki jadwal aktif. Buat jadwal terlebih dahulu.');
      return;
    }

    if (!availableDates.some((item) => item.date === formData.slot_date)) {
      setFormError('Tanggal slot harus mengikuti hari pada jadwal aktif layanan.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        provider_id: user.id,
        service_id: Number(formData.service_id),
        slot_date: formData.slot_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        capacity: Number(formData.capacity) || 1,
        status: formData.status,
      };

      if (editingSlot) {
        await slotService.updateSlot(editingSlot.id, payload);
      } else {
        await slotService.createSlot(payload);
      }

      setShowModal(false);
      setEditingSlot(null);
      fetchSlots();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Gagal menyimpan slot');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (row) => {
    if (window.confirm(`Hapus slot ini?`)) {
      try {
        await slotService.deleteSlot(row.id);
        setSlots(slots.filter((s) => s.id !== row.id));
      } catch (err) {
        alert('Gagal menghapus: ' + err.message);
      }
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { 
      header: 'Tanggal', 
      accessor: 'slot_date',
      render: (row) => <span>{row.slot_date ? new Date(row.slot_date).toLocaleDateString('id-ID') : '-'}</span>
    },
    { 
      header: 'Jam Mulai', 
      accessor: 'start_time',
      render: (row) => <span>{extractTimeStr(row.start_time)}</span>
    },
    { 
      header: 'Jam Selesai', 
      accessor: 'end_time',
      render: (row) => <span>{extractTimeStr(row.end_time)}</span>
    },
    { 
      header: 'Kapasitas', 
      accessor: 'capacity',
      render: (row) => <span className="font-bold text-slate-700">{row.capacity ?? 1}</span>
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => {
        let bgColor = 'bg-slate-100 text-slate-700';
        if (row.status === 'available') bgColor = 'bg-green-100 text-green-700';
        if (row.status === 'booked') bgColor = 'bg-blue-100 text-blue-700';
        if (row.status === 'blocked') bgColor = 'bg-red-100 text-red-700';
        return (
          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${bgColor}`}>
            {row.status || '-'}
          </span>
        );
      }
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Slots</h1>
          <p className="text-slate-500 mt-1">Detail slot ketersediaan spesifik harian Anda.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} /> Tambah Slot Khusus
        </button>
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
          data={slots} 
          searchPlaceholder="Cari slot..."
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Modal Popup Tambah/Edit Slot Khusus */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-800">
                {editingSlot ? 'Edit Slot Khusus' : 'Tambah Slot Khusus'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Layanan</label>
                <select 
                  name="service_id"
                  value={formData.service_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"
                >
                  {services.length === 0 && <option value="">Pilih Layanan Anda</option>}
                  {services.map((svc) => (
                    <option key={svc.id} value={svc.id}>{svc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tanggal Slot</label>
                {availableDates.length === 0 ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    Layanan ini belum memiliki jadwal aktif. Buat jadwal layanan terlebih dahulu.
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto rounded-xl border border-slate-200 p-2 bg-slate-50">
                      {availableDates.map((item) => (
                        <button
                          key={item.date}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, slot_date: item.date }))}
                          className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors text-left ${
                            formData.slot_date === item.date
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                          }`}
                        >
                          <span className="block">{item.label}</span>
                          <span className={formData.slot_date === item.date ? 'text-blue-100' : 'text-slate-400'}>
                            {item.date}
                          </span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Tanggal yang muncul hanya hari masa depan sesuai jadwal aktif layanan.
                    </p>
                  </>
                )}
              </div>

              {selectedDateSchedules.length > 0 && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                  <div className="font-bold mb-1">
                    Jadwal aktif {dayLabels[selectedDateSchedules[0].day] || selectedDateSchedules[0].day}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedDateSchedules.map((schedule) => (
                      <span key={schedule.id} className="rounded-lg bg-white px-2 py-1 border border-blue-100">
                        {String(schedule.start_time).substring(0, 5)} - {String(schedule.end_time).substring(0, 5)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Jam Mulai</label>
                  <input 
                    type="time" 
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Jam Selesai</label>
                  <input 
                    type="time" 
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Kapasitas</label>
                  <input 
                    type="number" 
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                  <select 
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="available">Available (Tersedia)</option>
                    <option value="blocked">Blocked (Diblokir)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderSlots;

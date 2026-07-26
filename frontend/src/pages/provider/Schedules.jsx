import React, { useState, useEffect, useContext } from 'react';
import { Plus, X } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import { scheduleService } from '../../services/scheduleService';
import { serviceApi } from '../../services/serviceApi';
import { AuthContext } from '../../context/AuthContext';

const DAYS = [
  { value: 'monday', label: 'Senin (Monday)' },
  { value: 'tuesday', label: 'Selasa (Tuesday)' },
  { value: 'wednesday', label: 'Rabu (Wednesday)' },
  { value: 'thursday', label: 'Kamis (Thursday)' },
  { value: 'friday', label: 'Jumat (Friday)' },
  { value: 'saturday', label: 'Sabtu (Saturday)' },
  { value: 'sunday', label: 'Minggu (Sunday)' },
];

const ProviderSchedules = () => {
  const { user } = useContext(AuthContext);
  const [schedules, setSchedules] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const [formData, setFormData] = useState({
    service_id: '',
    day: 'monday',
    start_time: '09:00',
    end_time: '17:00',
    is_available: true,
  });

  useEffect(() => {
    if (user?.id) {
      fetchSchedules();
      fetchProviderServices();
    }
  }, [user]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const data = await scheduleService.getAllSchedules({ provider_id: user.id });
      setSchedules(data.data || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat data jadwal Anda');
    } finally {
      setLoading(false);
    }
  };

  const fetchProviderServices = async () => {
    try {
      const data = await serviceApi.getAllServices({ provider_id: user.id });
      const svcList = data || [];
      setServices(svcList);
      if (svcList.length > 0 && !formData.service_id) {
        setFormData((prev) => ({ ...prev, service_id: svcList[0].id }));
      }
    } catch (err) {
      console.error('Gagal memuat layanan provider', err);
    }
  };

  const openCreateModal = () => {
    setEditingSchedule(null);
    setFormData({
      service_id: services[0]?.id || '',
      day: 'monday',
      start_time: '09:00',
      end_time: '17:00',
      is_available: true,
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleEdit = (row) => {
    setEditingSchedule(row);
    setFormData({
      service_id: row.service_id || (services[0]?.id || ''),
      day: row.day || 'monday',
      start_time: row.start_time || '09:00',
      end_time: row.end_time || '17:00',
      is_available: row.is_available ?? true,
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.service_id || !formData.day || !formData.start_time || !formData.end_time) {
      setFormError('Semua field wajib diisi');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        provider_id: user.id,
        service_id: Number(formData.service_id),
        day: formData.day,
        start_time: formData.start_time,
        end_time: formData.end_time,
        is_available: formData.is_available,
      };

      if (editingSchedule) {
        await scheduleService.updateSchedule(editingSchedule.id, payload);
      } else {
        await scheduleService.createSchedule(payload);
      }

      setShowModal(false);
      setEditingSchedule(null);
      fetchSchedules();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Gagal menyimpan jadwal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (row) => {
    if (window.confirm(`Hapus jadwal untuk hari ${row.day}?`)) {
      try {
        await scheduleService.deleteSchedule(row.id);
        setSchedules(schedules.filter((s) => s.id !== row.id));
      } catch (err) {
        alert('Gagal menghapus: ' + err.message);
      }
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { 
      header: 'Layanan', 
      accessor: 'service',
      render: (row) => <div className="text-slate-700 font-semibold">{row.service?.name || '-'}</div>
    },
    { header: 'Hari', accessor: 'day', render: (row) => <span className="font-bold capitalize">{row.day}</span> },
    { header: 'Jam Mulai', accessor: 'start_time' },
    { header: 'Jam Selesai', accessor: 'end_time' },
    { 
      header: 'Status', 
      accessor: 'is_available',
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-bold ${row.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {row.is_available ? 'Tersedia' : 'Tidak Tersedia'}
        </span>
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Schedules</h1>
          <p className="text-slate-500 mt-1">Atur jadwal ketersediaan Anda di setiap hari kerja.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} /> Buat Jadwal Rutin
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
          data={schedules} 
          searchPlaceholder="Cari jadwal hari..."
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Modal Popup Buat/Edit Jadwal Rutin */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-800">
                {editingSchedule ? 'Edit Jadwal Rutin' : 'Buat Jadwal Rutin'}
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
                <label className="block text-sm font-semibold text-slate-700 mb-1">Hari Kerja</label>
                <select 
                  name="day"
                  value={formData.day}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"
                >
                  {DAYS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

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

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox"
                  id="is_available"
                  name="is_available"
                  checked={formData.is_available}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_available" className="text-sm font-medium text-slate-700">
                  Status Ketersediaan (Tersedia)
                </label>
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
                  {submitting ? 'Menyimpan...' : 'Simpan Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderSchedules;

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import { categoryService } from '../../services/categoryService';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAllCategories();
      setCategories(data.data || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat data kategori');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row) => {
    if (window.confirm(`Hapus kategori ${row.name}?`)) {
      try {
        await categoryService.deleteCategory(row.id);
        setCategories(categories.filter((c) => c.id !== row.id));
      } catch (err) {
        alert('Gagal menghapus: ' + err.message);
      }
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { 
      header: 'Nama Kategori', 
      accessor: 'name',
      render: (row) => <div className="font-bold text-slate-900">{row.name}</div>
    },
    { header: 'Slug', accessor: 'slug' },
    { header: 'Deskripsi', accessor: 'description' }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Categories</h1>
          <p className="text-slate-500 mt-1">Kelola kategori layanan aplikasi Anda.</p>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2">
          <Plus size={18} /> Tambah Kategori
        </button>
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
          data={categories} 
          searchPlaceholder="Cari kategori..."
          onEdit={(row) => console.log('Edit', row)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default Categories;

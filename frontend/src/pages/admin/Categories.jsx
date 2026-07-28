import React, { useState, useEffect } from 'react';
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
      
      setCategories(data.data || data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Gagal memuat data kategori');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { 
      header: 'Nama Kategori', 
      accessor: 'name',
      render: (row) => <div className="font-bold text-slate-900">{row.name}</div>
    },
    { 
      header: 'Slug', 
      accessor: 'slug',
      render: (row) => <div className="text-slate-500 font-mono text-xs">{row.slug || '-'}</div>
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Categories</h1>
          <p className="text-slate-500 mt-1">Lihat kategori layanan. Pembuatan dan perubahan kategori dilakukan oleh provider.</p>
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
          data={categories} 
          searchPlaceholder="Cari nama kategori..."
        />
      )}
    </div>
  );
};

export default Categories;

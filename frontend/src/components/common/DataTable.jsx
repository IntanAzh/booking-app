import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Edit, Trash2 } from 'lucide-react';

const DataTable = ({ 
  columns = [], 
  data = [], 
  searchPlaceholder = "Search...", 
  onSearch, 
  onEdit, 
  onDelete,
  actions = true 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
    if (onSearch) {
      onSearch(value);
    }
  };

  const filteredData = useMemo(() => {
    if (onSearch) return data || [];
    if (!searchTerm.trim()) return data || [];
    const lower = searchTerm.toLowerCase().trim();

    return (data || []).filter((row) =>
      columns.some((col) => {
        const rawVal = row[col.accessor];
        if (rawVal === undefined || rawVal === null) return false;
        
        let searchString = '';
        if (typeof rawVal === 'object') {
          searchString = rawVal.name || rawVal.email || rawVal.title || JSON.stringify(rawVal);
        } else {
          searchString = String(rawVal);
        }

        return searchString.toLowerCase().includes(lower);
      })
    );
  }, [data, searchTerm, columns, onSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  
  // Reset page if filtered results are fewer
  const validPage = Math.min(currentPage, totalPages);
  const paginatedData = filteredData.slice(
    (validPage - 1) * itemsPerPage,
    validPage * itemsPerPage
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      {/* Table Header/Toolbar */}
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            value={searchTerm}
            placeholder={searchPlaceholder}
            onChange={handleSearchChange}
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 w-64 transition-all text-sm"
          />
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {columns.map((col, index) => (
                <th key={index} className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {col.header}
                </th>
              ))}
              {actions && (onEdit || onDelete) && (
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-slate-50/50 transition-colors">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="py-4 px-6 text-sm text-slate-700 whitespace-nowrap">
                      {/* Allow custom rendering in column definition */}
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                  {actions && (onEdit || onDelete) && (
                    <td className="py-4 px-6 text-sm text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        {onEdit && (
                          <button 
                            onClick={() => onEdit(row)}
                            className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                        )}
                        {onDelete && (
                          <button 
                            onClick={() => onDelete(row)}
                            className="p-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (actions && (onEdit || onDelete) ? 1 : 0)} className="py-8 text-center text-slate-500 text-sm">
                  Tidak ada data yang ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50/50">
        <span className="text-sm text-slate-500">
          Showing <span className="font-medium text-slate-700">{paginatedData.length}</span> of <span className="font-medium text-slate-700">{filteredData.length}</span> entries
        </span>
        <div className="flex gap-2">
          <button 
            disabled={validPage <= 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="px-3 py-1 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <span className="px-3 py-1 text-sm text-slate-600 font-medium self-center">
            {validPage} / {totalPages}
          </span>
          <button 
            disabled={validPage >= totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className="px-3 py-1 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;

'use client';

import { useState } from 'react';
import Pagination from './Pagination';

export interface Column<T extends object> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface DataTableProps<T extends object> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T & string;
  loading?: boolean;
  error?: string | null;
  total?: number;
  limit?: number;
  offset?: number;
  onPageChange?: (offset: number) => void;
  actions?: (item: T) => React.ReactNode;
  emptyMessage?: string;
  onRetry?: () => void;
}

export default function DataTable<T extends object>({
  columns,
  data,
  keyField,
  loading,
  error,
  total = 0,
  limit = 20,
  offset = 0,
  onPageChange,
  actions,
  emptyMessage = 'No data found',
  onRetry,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sortedData = sortKey
    ? [...data].sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[sortKey];
        const bVal = (b as Record<string, unknown>)[sortKey];
        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        const cmp = (aVal as number | string) < (bVal as number | string) ? -1 : 1;
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : data;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="animate-pulse p-4">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded mb-2" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-red-600 mb-2">{error}</p>
        {onRetry && (
          <button onClick={onRetry} className="text-blue-600 hover:underline">
            Try again
          </button>
        )}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    col.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  } ${col.className ?? ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      <span>{sortDir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((item) => (
              <tr key={String((item as Record<string, unknown>)[keyField])} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-sm text-gray-900 ${col.className ?? ''}`}
                  >
                    {col.render
                      ? col.render(item)
                      : String((item as Record<string, unknown>)[col.key] ?? '-')}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3 text-right text-sm">{actions(item)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {onPageChange && total > limit && (
        <Pagination
          total={total}
          limit={limit}
          offset={offset}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
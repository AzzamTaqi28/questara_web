'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { CheckIn } from '@questara/types';
import DataTable from '@/components/admin/DataTable';
import type { Column } from '@/components/admin/DataTable';
import ErrorState from '@/components/admin/ErrorState';
import { PageLoader } from '@/components/admin/LoadingSpinner';
import EmptyState from '@/components/admin/EmptyState';
import { buildPaginationParams } from '@/lib/api';

interface CheckInsResponse { ok: boolean; check_ins: CheckIn[]; total: number; limit: number; offset: number; }

export default function CheckInsPage() {
  const [data, setData] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [validFilter, setValidFilter] = useState<string>('');

  const fetchCheckIns = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = getToken();
    const params = buildPaginationParams(limit, offset) + (validFilter ? `&valid=${validFilter}` : '');
    try {
      const res = await apiFetch<CheckInsResponse>(`/admin/check-ins${params}`, { token: token ?? undefined });
      setData(res.check_ins);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load check-ins');
    } finally {
      setLoading(false);
    }
  }, [limit, offset, validFilter]);

  useEffect(() => { fetchCheckIns(); }, [fetchCheckIns]);

  const columns: Column<CheckIn>[] = [
    { key: 'id', label: 'ID', render: (c) => c.id.slice(0, 8) },
    { key: 'user_id', label: 'User ID', render: (c) => c.user_id.slice(0, 8) },
    { key: 'place_id', label: 'Place ID', render: (c) => c.place_id.slice(0, 8) },
    { key: 'quest_id', label: 'Quest', render: (c) => c.quest_id ? c.quest_id.slice(0, 8) : '-' },
    {
      key: 'method',
      label: 'Method',
      render: (c) => (
        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 capitalize">{c.method}</span>
      ),
    },
    {
      key: 'is_valid',
      label: 'Valid',
      render: (c) => (
        <span className={`px-2 py-1 text-xs rounded-full ${c.is_valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {c.is_valid ? 'Valid' : 'Invalid'}
        </span>
      ),
    },
    { key: 'distance_meters', label: 'Distance (m)', render: (c) => c.distance_meters ?? '-' },
    { key: 'created_at', label: 'Time', render: (c) => new Date(c.created_at).toLocaleString() },
  ];

  if (loading && data.length === 0) return <PageLoader />;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Check-ins</h1>
          <p className="text-gray-500 mt-1">View user check-in history</p>
        </div>
        <select
          value={validFilter}
          onChange={(e) => setValidFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">All</option>
          <option value="true">Valid only</option>
          <option value="false">Invalid only</option>
        </select>
      </div>

      {error && data.length === 0 ? (
        <ErrorState message={error} onRetry={fetchCheckIns} />
      ) : data.length === 0 ? (
        <EmptyState title="No check-ins yet" description="Check-ins will appear here." />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          keyField="id"
          total={total}
          limit={limit}
          offset={offset}
          onPageChange={(o) => setOffset(o)}
        />
      )}
    </div>
  );
}
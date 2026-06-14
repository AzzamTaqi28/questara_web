'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { Submission } from '@questara/types';
import DataTable from '@/components/admin/DataTable';
import type { Column } from '@/components/admin/DataTable';
import ErrorState from '@/components/admin/ErrorState';
import { PageLoader } from '@/components/admin/LoadingSpinner';
import EmptyState from '@/components/admin/EmptyState';
import FormModal from '@/components/admin/FormModal';
import type { FormField } from '@/components/admin/FormModal';
import { buildPaginationParams } from '@/lib/api';

interface SubmissionsResponse { ok: boolean; submissions: Submission[]; total: number; limit: number; offset: number; }

export default function SubmissionsPage() {
  const [data, setData] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = getToken();
    const params = buildPaginationParams(limit, offset) + (statusFilter ? `&status=${statusFilter}` : '');
    try {
      const res = await apiFetch<SubmissionsResponse>(`/admin/submissions${params}`, { token: token ?? undefined });
      setData(res.submissions);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  }, [limit, offset, statusFilter]);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

  async function handleUpdateStatus(id: string, status: Submission['status']) {
    setUpdating(id);
    const token = getToken();
    await apiFetch(`/admin/submissions/${id}`, {
      method: 'PUT',
      token: token ?? undefined,
      body: JSON.stringify({ status }),
    });
    await fetchSubmissions();
    setUpdating(null);
  }

  const columns: Column<Submission>[] = [
    { key: 'id', label: 'ID', render: (s) => s.id.slice(0, 8) },
    { key: 'type', label: 'Type', render: (s) => (
      <span className={`px-2 py-1 text-xs rounded-full ${s.type === 'event' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>{s.type}</span>
    )},
    { key: 'title', label: 'Title', sortable: true },
    { key: 'location_text', label: 'Location' },
    { key: 'date_text', label: 'Date' },
    {
      key: 'status',
      label: 'Status',
      render: (s) => {
        const colors: Record<string, string> = {
          pending: 'bg-yellow-100 text-yellow-800',
          approved: 'bg-green-100 text-green-800',
          rejected: 'bg-red-100 text-red-800',
          converted: 'bg-blue-100 text-blue-800',
        };
        return <span className={`px-2 py-1 text-xs rounded-full ${colors[s.status as keyof typeof colors]}`}>{s.status}</span>;
      },
    },
    { key: 'created_at', label: 'Submitted', render: (s) => new Date(s.created_at).toLocaleDateString() },
  ];

  if (loading && data.length === 0) return <PageLoader />;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
          <p className="text-gray-500 mt-1">Review user-submitted places and events</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="converted">Converted</option>
        </select>
      </div>

      {error && data.length === 0 ? (
        <ErrorState message={error} onRetry={fetchSubmissions} />
      ) : data.length === 0 ? (
        <EmptyState title="No submissions" description="No submissions match the current filter." />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          keyField="id"
          total={total}
          limit={limit}
          offset={offset}
          onPageChange={(o) => setOffset(o)}
          actions={(s) => (
            <div className="flex gap-2 justify-end">
              {s.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus(s.id, 'approved')}
                    disabled={updating === s.id}
                    className="text-green-600 hover:text-green-800 text-sm disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(s.id, 'rejected')}
                    disabled={updating === s.id}
                    className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                  >
                    Reject
                  </button>
                </>
              )}
              {s.status === 'approved' && (
                <button
                  onClick={() => handleUpdateStatus(s.id, 'converted')}
                  disabled={updating === s.id}
                  className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50"
                >
                  Convert
                </button>
              )}
            </div>
          )}
        />
      )}
    </div>
  );
}
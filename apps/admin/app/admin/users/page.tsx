'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { Profile } from '@questara/types';
import DataTable from '@/components/admin/DataTable';
import type { Column } from '@/components/admin/DataTable';
import ErrorState from '@/components/admin/ErrorState';
import { PageLoader } from '@/components/admin/LoadingSpinner';
import EmptyState from '@/components/admin/EmptyState';
import { buildPaginationParams } from '@/lib/api';

interface UsersResponse { ok: boolean; profiles: Profile[]; total: number; limit: number; offset: number; }

export default function UsersPage() {
  const [data, setData] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = getToken();
    try {
      const res = await apiFetch<UsersResponse>(
        `/admin/users${buildPaginationParams(limit, offset)}`,
        { token: token ?? undefined }
      );
      setData(res.profiles);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [limit, offset]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const columns: Column<Profile>[] = [
    { key: 'username', label: 'Username', sortable: true },
    { key: 'display_name', label: 'Display Name' },
    {
      key: 'role',
      label: 'Role',
      render: (p) => (
        <span className={`px-2 py-1 text-xs rounded-full ${p.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
          {p.role}
        </span>
      ),
    },
    { key: 'xp', label: 'XP', render: (p) => p.xp.toLocaleString() },
    { key: 'home_city', label: 'Home City' },
    { key: 'created_at', label: 'Joined', render: (p) => new Date(p.created_at).toLocaleDateString() },
  ];

  if (loading && data.length === 0) return <PageLoader />;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-500 mt-1">View all registered users</p>
      </div>

      {error && data.length === 0 ? (
        <ErrorState message={error} onRetry={fetchUsers} />
      ) : data.length === 0 ? (
        <EmptyState title="No users yet" description="Users will appear here once they sign up." />
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
'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { Stamp, Place } from '@questara/types';
import DataTable from '@/components/admin/DataTable';
import type { Column } from '@/components/admin/DataTable';
import FormModal from '@/components/admin/FormModal';
import type { FormField } from '@/components/admin/FormModal';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import ErrorState from '@/components/admin/ErrorState';
import { PageLoader } from '@/components/admin/LoadingSpinner';
import EmptyState from '@/components/admin/EmptyState';
import { buildPaginationParams } from '@/lib/api';

interface StampsResponse { ok: boolean; stamps: Stamp[]; total: number; limit: number; offset: number; }
interface PlacesResponse { ok: boolean; places: Place[]; total: number; }

const rarityOptions = [
  { value: 'common', label: 'Common' },
  { value: 'rare', label: 'Rare' },
  { value: 'epic', label: 'Epic' },
  { value: 'legendary', label: 'Legendary' },
];

export default function StampsPage() {
  const [data, setData] = useState<Stamp[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [editingStamp, setEditingStamp] = useState<Stamp | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchStamps = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = getToken();
    try {
      const res = await apiFetch<StampsResponse>(
        `/admin/stamps${buildPaginationParams(limit, offset)}`,
        { token: token ?? undefined }
      );
      setData(res.stamps);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stamps');
    } finally {
      setLoading(false);
    }
  }, [limit, offset]);

  useEffect(() => {
    fetchStamps();
    const token = getToken();
    apiFetch<PlacesResponse>('/admin/places?limit=200', { token: token ?? undefined })
      .then((res) => setPlaces(res.places))
      .catch(() => {});
  }, [fetchStamps]);

  const columns: Column<Stamp>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (s) => (
        <div className="flex items-center gap-3">
          {s.image_url && (
            <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden flex-shrink-0">
              <img src={s.image_url} alt={s.name} className="w-full h-full object-cover" />
            </div>
          )}
          <span className="font-medium">{s.name}</span>
        </div>
      ),
    },
    {
      key: 'place_id',
      label: 'Place',
      render: (s) => places.find((p) => p.id === s.place_id)?.name ?? s.place_id.slice(0, 8),
    },
    {
      key: 'rarity',
      label: 'Rarity',
      render: (s) => {
        const colors: Record<string, string> = {
          common: 'bg-gray-100 text-gray-800',
          rare: 'bg-blue-100 text-blue-800',
          epic: 'bg-purple-100 text-purple-800',
          legendary: 'bg-yellow-100 text-yellow-800',
        };
        return (
          <span className={`px-2 py-1 text-xs rounded-full capitalize ${colors[s.rarity]}`}>
            {s.rarity}
          </span>
        );
      },
    },
    { key: 'description', label: 'Description' },
  ];

  function getFormFields(): FormField[] {
    return [
      { name: 'name', label: 'Stamp Name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', rows: 2 },
      { name: 'place_id', label: 'Place', type: 'select', required: true, options: places.map((p) => ({ value: p.id, label: p.name })) },
      { name: 'image_url', label: 'Image URL', type: 'url' },
      { name: 'rarity', label: 'Rarity', type: 'select', required: true, options: rarityOptions },
    ];
  }

  function handleAdd() { setEditingStamp(null); setShowForm(true); }
  function handleEdit(stamp: Stamp) { setEditingStamp(stamp); setShowForm(true); }

  async function handleSubmit(formData: Record<string, unknown>) {
    setFormLoading(true);
    const token = getToken();
    const method = editingStamp ? 'PUT' : 'POST';
    const url = editingStamp ? `/admin/stamps/${editingStamp.id}` : '/admin/stamps';
    const res = await apiFetch<{ ok: boolean; stamp?: Stamp }>(url, {
      method,
      token: token ?? undefined,
      body: JSON.stringify(formData),
    });
    if (!res.ok) throw new Error('Failed to save stamp');
    await fetchStamps();
    setFormLoading(false);
  }

  function handleDeleteClick(id: string) { setDeleteId(id); }

  async function handleDeleteConfirm() {
    if (!deleteId) return;
    setDeleteLoading(true);
    const token = getToken();
    await apiFetch(`/admin/stamps/${deleteId}`, { method: 'DELETE', token: token ?? undefined });
    await fetchStamps();
    setDeleteLoading(false);
  }

  if (loading && data.length === 0) return <PageLoader />;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stamps</h1>
          <p className="text-gray-500 mt-1">Manage collectible stamps</p>
        </div>
        <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <span>➕</span> Add Stamp
        </button>
      </div>

      {error && data.length === 0 ? (
        <ErrorState message={error} onRetry={fetchStamps} />
      ) : data.length === 0 ? (
        <EmptyState title="No stamps yet" description="Add your first stamp." action={{ label: 'Add Stamp', onClick: handleAdd }} />
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
              <button onClick={() => handleEdit(s)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
              <button onClick={() => handleDeleteClick(s.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
            </div>
          )}
        />
      )}

      <FormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        title={editingStamp ? 'Edit Stamp' : 'Add Stamp'}
        fields={getFormFields()}
        initialData={(editingStamp ?? { rarity: 'common' }) as Partial<Record<string, unknown>>}
        submitLabel={editingStamp ? 'Update' : 'Create'}
        loading={formLoading}
      />

      <DeleteConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        itemName={data.find((s) => s.id === deleteId)?.name as string}
        loading={deleteLoading}
      />
    </div>
  );
}
'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { Event, City, Place } from '@questara/types';
import DataTable from '@/components/admin/DataTable';
import type { Column } from '@/components/admin/DataTable';
import FormModal from '@/components/admin/FormModal';
import type { FormField } from '@/components/admin/FormModal';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import ErrorState from '@/components/admin/ErrorState';
import { PageLoader } from '@/components/admin/LoadingSpinner';
import EmptyState from '@/components/admin/EmptyState';
import { buildPaginationParams } from '@/lib/api';

interface EventsResponse {
  ok: boolean;
  events: Event[];
  total: number;
  limit: number;
  offset: number;
}

interface CitiesResponse { ok: boolean; cities: City[]; total: number; }
interface PlacesResponse { ok: boolean; places: Place[]; total: number; }

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'expired', label: 'Expired' },
  { value: 'rejected', label: 'Rejected' },
];

export default function EventsPage() {
  const [data, setData] = useState<Event[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = getToken();
    try {
      const res = await apiFetch<EventsResponse>(
        `/admin/events${buildPaginationParams(limit, offset)}`,
        { token: token ?? undefined }
      );
      setData(res.events);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [limit, offset]);

  useEffect(() => {
    fetchEvents();
    const token = getToken();
    apiFetch<CitiesResponse>('/admin/cities?limit=100', { token: token ?? undefined })
      .then((res) => setCities(res.cities))
      .catch(() => {});
    apiFetch<PlacesResponse>('/admin/places?limit=100', { token: token ?? undefined })
      .then((res) => setPlaces(res.places))
      .catch(() => {});
  }, [fetchEvents]);

  const columns: Column<Event>[] = [
    { key: 'title', label: 'Title', sortable: true },
    {
      key: 'city_id',
      label: 'City',
      render: (e) => cities.find(c => c.id === e.city_id)?.name ?? e.city_id.slice(0, 8),
    },
    {
      key: 'start_time',
      label: 'Start',
      render: (e) => e.start_time ? new Date(e.start_time).toLocaleDateString() : '-',
    },
    {
      key: 'end_time',
      label: 'End',
      render: (e) => e.end_time ? new Date(e.end_time).toLocaleDateString() : '-',
    },
    {
      key: 'status',
      label: 'Status',
      render: (e) => {
        const colors: Record<string, string> = {
          draft: 'bg-yellow-100 text-yellow-800',
          published: 'bg-green-100 text-green-800',
          expired: 'bg-gray-100 text-gray-800',
          rejected: 'bg-red-100 text-red-800',
        };
        return (
          <span className={`px-2 py-1 text-xs rounded-full ${colors[e.status] ?? ''}`}>
            {e.status}
          </span>
        );
      },
    },
    { key: 'tags', label: 'Tags', render: (e) => e.tags?.join(', ') || '-' },
  ];

  function getFormFields(): FormField[] {
    return [
      { name: 'title', label: 'Event Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', rows: 3 },
      { name: 'city_id', label: 'City', type: 'select', required: true, options: cities.map(c => ({ value: c.id, label: c.name })) },
      { name: 'place_id', label: 'Place (optional)', type: 'select', options: [{ value: '', label: 'None' }, ...places.map(p => ({ value: p.id, label: p.name }))] },
      { name: 'start_time', label: 'Start Time', type: 'text', placeholder: '2024-12-25T09:00:00Z' },
      { name: 'end_time', label: 'End Time', type: 'text', placeholder: '2024-12-25T17:00:00Z' },
      { name: 'price_min', label: 'Min Price (Rp)', type: 'number', placeholder: '50000' },
      { name: 'price_max', label: 'Max Price (Rp)', type: 'number', placeholder: '150000' },
      { name: 'image_url', label: 'Image URL', type: 'url' },
      { name: 'source_url', label: 'Source URL', type: 'url' },
      { name: 'tags', label: 'Tags (comma-separated)', type: 'text', placeholder: 'festival, cultural, family' },
      { name: 'status', label: 'Status', type: 'select', options: statusOptions },
    ];
  }

  function handleAdd() {
    setEditingEvent(null);
    setShowForm(true);
  }

  function handleEdit(event: Event) {
    setEditingEvent(event);
    setShowForm(true);
  }

  async function handleSubmit(formData: Record<string, unknown>) {
    setFormLoading(true);
    const token = getToken();
    const method = editingEvent ? 'PUT' : 'POST';
    const url = editingEvent ? `/admin/events/${editingEvent.id}` : '/admin/events';

    // Process tags
    const processedData = {
      ...formData,
      price_min: formData.price_min ? Number(formData.price_min) : null,
      price_max: formData.price_max ? Number(formData.price_max) : null,
      tags: formData.tags ? String(formData.tags).split(',').map(t => t.trim()).filter(Boolean) : [],
    };

    const res = await apiFetch<{ ok: boolean; event?: Event; error?: string }>(url, {
      method,
      token: token ?? undefined,
      body: JSON.stringify(processedData),
    });

    if (!res.ok) {
      throw new Error(res.error ?? 'Failed to save event');
    }

    await fetchEvents();
    setFormLoading(false);
  }

  function handleDeleteClick(id: string) {
    setDeleteId(id);
  }

  async function handleDeleteConfirm() {
    if (!deleteId) return;
    setDeleteLoading(true);
    const token = getToken();
    const res = await apiFetch<{ ok: boolean; error?: string }>(`/admin/events/${deleteId}`, {
      method: 'DELETE',
      token: token ?? undefined,
    });
    if (!res.ok) throw new Error(res.error ?? 'Failed to delete');
    await fetchEvents();
    setDeleteLoading(false);
  }

  if (loading && data.length === 0) return <PageLoader />;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-500 mt-1">Manage events and activities</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span>➕</span> Add Event
        </button>
      </div>

      {error && data.length === 0 ? (
        <ErrorState message={error} onRetry={fetchEvents} />
      ) : data.length === 0 ? (
        <EmptyState
          title="No events yet"
          description="Add your first event to get started."
          action={{ label: 'Add Event', onClick: handleAdd }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          keyField="id"
          total={total}
          limit={limit}
          offset={offset}
          onPageChange={(o) => setOffset(o)}
          actions={(event) => (
            <div className="flex gap-2 justify-end">
              <button onClick={() => handleEdit(event)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
              <button onClick={() => handleDeleteClick(event.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
            </div>
          )}
        />
      )}

      <FormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        title={editingEvent ? 'Edit Event' : 'Add Event'}
        fields={getFormFields()}
        initialData={editingEvent ? {
          ...editingEvent,
          price_min: editingEvent.price_min ?? '',
          price_max: editingEvent.price_max ?? '',
          tags: editingEvent.tags?.join(', '),
          place_id: editingEvent.place_id ?? '',
        } : { status: 'draft' }}
        submitLabel={editingEvent ? 'Update' : 'Create'}
        loading={formLoading}
      />

      <DeleteConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        itemName={data.find(e => e.id === deleteId)?.title}
        loading={deleteLoading}
      />
    </div>
  );
}
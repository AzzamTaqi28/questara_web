'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { Place, City } from '@questara/types';
import DataTable from '@/components/admin/DataTable';
import type { Column } from '@/components/admin/DataTable';
import FormModal from '@/components/admin/FormModal';
import type { FormField } from '@/components/admin/FormModal';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import ErrorState from '@/components/admin/ErrorState';
import { PageLoader } from '@/components/admin/LoadingSpinner';
import EmptyState from '@/components/admin/EmptyState';
import { buildPaginationParams } from '@/lib/api';

interface PlacesResponse {
  ok: boolean;
  places: Place[];
  total: number;
  limit: number;
  offset: number;
}

interface CitiesResponse {
  ok: boolean;
  cities: City[];
  total: number;
}

const verificationOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' },
];

const categoryOptions = [
  { value: 'temple', label: 'Temple' },
  { value: 'museum', label: 'Museum' },
  { value: 'landmark', label: 'Landmark' },
  { value: 'nature', label: 'Nature' },
  { value: 'food', label: 'Food & Dining' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'other', label: 'Other' },
];

export default function PlacesPage() {
  const [data, setData] = useState<Place[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchPlaces = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = getToken();
    try {
      const res = await apiFetch<PlacesResponse>(
        `/admin/places${buildPaginationParams(limit, offset)}`,
        { token: token ?? undefined }
      );
      setData(res.places);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load places');
    } finally {
      setLoading(false);
    }
  }, [limit, offset]);

  useEffect(() => {
    fetchPlaces();
    // Fetch cities for dropdown
    const token = getToken();
    apiFetch<CitiesResponse>('/admin/cities?limit=100', { token: token ?? undefined })
      .then((res) => setCities(res.cities))
      .catch(() => {});
  }, [fetchPlaces]);

  const columns: Column<Place>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'category', label: 'Category', render: (p) => (
      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 capitalize">
        {p.category}
      </span>
    )},
    {
      key: 'city_id',
      label: 'City',
      render: (p) => {
        const city = cities.find(c => c.id === p.city_id);
        return city?.name ?? p.city_id.slice(0, 8);
      },
    },
    { key: 'address', label: 'Address' },
    {
      key: 'verification_status',
      label: 'Status',
      render: (p) => {
        const colors = {
          draft: 'bg-yellow-100 text-yellow-800',
          verified: 'bg-green-100 text-green-800',
          rejected: 'bg-red-100 text-red-800',
        };
        return (
          <span className={`px-2 py-1 text-xs rounded-full ${colors[p.verification_status as keyof typeof colors]}`}>
            {p.verification_status}
          </span>
        );
      },
    },
    {
      key: 'ticket_price_min',
      label: 'Price',
      render: (p) => p.ticket_price_min
        ? `Rp ${p.ticket_price_min.toLocaleString()}`
        : '-',
    },
  ];

  function getFormFields(): FormField[] {
    return [
      { name: 'name', label: 'Place Name', type: 'text', required: true, placeholder: 'e.g., Borobudur Temple' },
      { name: 'city_id', label: 'City', type: 'select', required: true, options: cities.map(c => ({ value: c.id, label: c.name })) },
      { name: 'category', label: 'Category', type: 'select', required: true, options: categoryOptions },
      { name: 'description', label: 'Description', type: 'textarea', rows: 3, placeholder: 'Describe the place...' },
      { name: 'address', label: 'Address', type: 'text', placeholder: 'Full address' },
      { name: 'lat', label: 'Latitude', type: 'number', placeholder: '-7.6079' },
      { name: 'lng', label: 'Longitude', type: 'number', placeholder: '110.3978' },
      { name: 'ticket_price_min', label: 'Min Price (Rp)', type: 'number', placeholder: '50000' },
      { name: 'ticket_price_max', label: 'Max Price (Rp)', type: 'number', placeholder: '100000' },
      { name: 'image_url', label: 'Image URL', type: 'url', placeholder: 'https://...' },
      { name: 'source_url', label: 'Source URL', type: 'url', placeholder: 'https://...' },
      {
        name: 'verification_status',
        label: 'Verification Status',
        type: 'select',
        options: verificationOptions,
      },
    ];
  }

  function handleAdd() {
    setEditingPlace(null);
    setShowForm(true);
  }

  function handleEdit(place: Place) {
    setEditingPlace(place);
    setShowForm(true);
  }

  async function handleSubmit(formData: Record<string, unknown>) {
    setFormLoading(true);
    const token = getToken();
    const method = editingPlace ? 'PUT' : 'POST';
    const url = editingPlace ? `/admin/places/${editingPlace.id}` : '/admin/places';

    // Convert numeric fields
    const processedData = {
      ...formData,
      lat: formData.lat ? Number(formData.lat) : null,
      lng: formData.lng ? Number(formData.lng) : null,
      ticket_price_min: formData.ticket_price_min ? Number(formData.ticket_price_min) : null,
      ticket_price_max: formData.ticket_price_max ? Number(formData.ticket_price_max) : null,
    };

    const res = await apiFetch<{ ok: boolean; place?: Place; error?: string }>(url, {
      method,
      token: token ?? undefined,
      body: JSON.stringify(processedData),
    });

    if (!res.ok) {
      throw new Error(res.error ?? 'Failed to save place');
    }

    await fetchPlaces();
    setFormLoading(false);
  }

  function handleDeleteClick(id: string) {
    setDeleteId(id);
  }

  async function handleDeleteConfirm() {
    if (!deleteId) return;
    setDeleteLoading(true);
    const token = getToken();

    const res = await apiFetch<{ ok: boolean; error?: string }>(`/admin/places/${deleteId}`, {
      method: 'DELETE',
      token: token ?? undefined,
    });

    if (!res.ok) {
      throw new Error(res.error ?? 'Failed to delete');
    }

    await fetchPlaces();
    setDeleteLoading(false);
  }

  function handlePageChange(newOffset: number) {
    setOffset(newOffset);
  }

  if (loading && data.length === 0) {
    return <PageLoader />;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Places</h1>
          <p className="text-gray-500 mt-1">Manage tourist attractions and venues</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span>➕</span> Add Place
        </button>
      </div>

      {error && data.length === 0 ? (
        <ErrorState message={error} onRetry={fetchPlaces} />
      ) : data.length === 0 ? (
        <EmptyState
          title="No places yet"
          description="Add your first place to get started."
          action={{ label: 'Add Place', onClick: handleAdd }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          keyField="id"
          total={total}
          limit={limit}
          offset={offset}
          onPageChange={handlePageChange}
          actions={(place) => (
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => handleEdit(place)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteClick(place.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            </div>
          )}
        />
      )}

      <FormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        title={editingPlace ? 'Edit Place' : 'Add Place'}
        fields={getFormFields()}
        initialData={editingPlace ? {
          ...editingPlace,
          lat: editingPlace.lat ?? '',
          lng: editingPlace.lng ?? '',
          ticket_price_min: editingPlace.ticket_price_min ?? '',
          ticket_price_max: editingPlace.ticket_price_max ?? '',
        } : { verification_status: 'draft' }}
        submitLabel={editingPlace ? 'Update' : 'Create'}
        loading={formLoading}
      />

      <DeleteConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        itemName={data.find(p => p.id === deleteId)?.name}
        loading={deleteLoading}
      />
    </div>
  );
}
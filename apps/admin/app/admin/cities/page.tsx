'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { City } from '@questara/types';
import DataTable from '@/components/admin/DataTable';
import type { Column } from '@/components/admin/DataTable';
import FormModal from '@/components/admin/FormModal';
import type { FormField } from '@/components/admin/FormModal';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import ErrorState from '@/components/admin/ErrorState';
import { PageLoader } from '@/components/admin/LoadingSpinner';
import EmptyState from '@/components/admin/EmptyState';
import { buildPaginationParams } from '@/lib/api';

interface CitiesResponse {
  ok: boolean;
  cities: City[];
  total: number;
  limit: number;
  offset: number;
}

const formFields: FormField[] = [
  { name: 'name', label: 'City Name', type: 'text', required: true, placeholder: 'e.g., Yogyakarta' },
  { name: 'province', label: 'Province', type: 'text', placeholder: 'e.g., Yogyakarta' },
  { name: 'country', label: 'Country', type: 'text', placeholder: 'Indonesia', required: true },
  { name: 'lat', label: 'Latitude', type: 'number', placeholder: '-7.7956' },
  { name: 'lng', label: 'Longitude', type: 'number', placeholder: '110.3695' },
  { name: 'is_active', label: 'Active', type: 'checkbox', placeholder: 'City is active and visible to users' },
];

export default function CitiesPage() {
  const [data, setData] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCities = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = getToken();
    try {
      const res = await apiFetch<CitiesResponse>(
        `/admin/cities${buildPaginationParams(limit, offset)}`,
        { token: token ?? undefined }
      );
      setData(res.cities);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cities');
    } finally {
      setLoading(false);
    }
  }, [limit, offset]);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const columns: Column<City>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'province', label: 'Province' },
    { key: 'country', label: 'Country' },
    {
      key: 'lat',
      label: 'Coordinates',
      render: (city) => city.lat && city.lng ? `${city.lat}, ${city.lng}` : '-',
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (city) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          city.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {city.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    { key: 'created_at', label: 'Created', render: (city) => new Date(city.created_at).toLocaleDateString() },
  ];

  function handleAdd() {
    setEditingCity(null);
    setShowForm(true);
  }

  function handleEdit(city: City) {
    setEditingCity(city);
    setShowForm(true);
  }

  async function handleSubmit(formData: Record<string, unknown>) {
    setFormLoading(true);
    const token = getToken();
    const method = editingCity ? 'PUT' : 'POST';
    const url = editingCity ? `/admin/cities/${editingCity.id}` : '/admin/cities';

    const res = await apiFetch<{ ok: boolean; city?: City; error?: string }>(url, {
      method,
      token: token ?? undefined,
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      throw new Error(res.error ?? 'Failed to save city');
    }

    await fetchCities();
    setFormLoading(false);
  }

  function handleDeleteClick(id: string) {
    setDeleteId(id);
  }

  async function handleDeleteConfirm() {
    if (!deleteId) return;
    setDeleteLoading(true);
    const token = getToken();

    const res = await apiFetch<{ ok: boolean; error?: string }>(`/admin/cities/${deleteId}`, {
      method: 'DELETE',
      token: token ?? undefined,
    });

    if (!res.ok) {
      throw new Error(res.error ?? 'Failed to delete');
    }

    await fetchCities();
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
          <h1 className="text-2xl font-bold text-gray-900">Cities</h1>
          <p className="text-gray-500 mt-1">Manage city destinations</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span>➕</span> Add City
        </button>
      </div>

      {error && data.length === 0 ? (
        <ErrorState message={error} onRetry={fetchCities} />
      ) : data.length === 0 ? (
        <EmptyState
          title="No cities yet"
          description="Add your first city to get started."
          action={{ label: 'Add City', onClick: handleAdd }}
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
          actions={(city) => (
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => handleEdit(city)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteClick(city.id)}
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
        title={editingCity ? 'Edit City' : 'Add City'}
        fields={formFields}
        initialData={editingCity ? {
          name: editingCity.name,
          province: editingCity.province ?? '',
          country: editingCity.country,
          lat: editingCity.lat ?? '',
          lng: editingCity.lng ?? '',
          is_active: editingCity.is_active,
        } : { country: 'Indonesia', is_active: true }}
        submitLabel={editingCity ? 'Update' : 'Create'}
        loading={formLoading}
      />

      <DeleteConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        itemName={data.find(c => c.id === deleteId)?.name}
        loading={deleteLoading}
      />
    </div>
  );
}
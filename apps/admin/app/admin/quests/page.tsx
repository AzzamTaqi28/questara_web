'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { Quest, City } from '@questara/types';
import DataTable from '@/components/admin/DataTable';
import type { Column } from '@/components/admin/DataTable';
import FormModal from '@/components/admin/FormModal';
import type { FormField } from '@/components/admin/FormModal';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import ErrorState from '@/components/admin/ErrorState';
import { PageLoader } from '@/components/admin/LoadingSpinner';
import EmptyState from '@/components/admin/EmptyState';
import { buildPaginationParams } from '@/lib/api';

interface QuestsResponse { ok: boolean; quests: Quest[]; total: number; limit: number; offset: number; }
interface CitiesResponse { ok: boolean; cities: City[]; total: number; }

const difficultyOptions = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

export default function QuestsPage() {
  const router = useRouter();
  const [data, setData] = useState<Quest[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchQuests = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = getToken();
    try {
      const res = await apiFetch<QuestsResponse>(
        `/admin/quests${buildPaginationParams(limit, offset)}`,
        { token: token ?? undefined }
      );
      setData(res.quests);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quests');
    } finally {
      setLoading(false);
    }
  }, [limit, offset]);

  useEffect(() => {
    fetchQuests();
    const token = getToken();
    apiFetch<CitiesResponse>('/admin/cities?limit=100', { token: token ?? undefined })
      .then((res) => setCities(res.cities))
      .catch(() => {});
  }, [fetchQuests]);

  const columns: Column<Quest>[] = [
    { key: 'title', label: 'Title', sortable: true },
    {
      key: 'city_id',
      label: 'City',
      render: (q) => cities.find(c => c.id === q.city_id)?.name ?? q.city_id.slice(0, 8),
    },
    {
      key: 'difficulty',
      label: 'Difficulty',
      render: (q) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          q.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
          q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {q.difficulty}
        </span>
      ),
    },
    { key: 'estimated_duration_minutes', label: 'Duration (min)', render: (q) => q.estimated_duration_minutes ?? '-' },
    { key: 'tags', label: 'Tags', render: (q) => q.tags?.join(', ') || '-' },
    {
      key: 'is_published',
      label: 'Status',
      render: (q) => (
        <span className={`px-2 py-1 text-xs rounded-full ${q.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {q.is_published ? 'Published' : 'Draft'}
        </span>
      ),
    },
  ];

  function getFormFields(): FormField[] {
    return [
      { name: 'title', label: 'Quest Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', rows: 3 },
      { name: 'city_id', label: 'City', type: 'select', required: true, options: cities.map(c => ({ value: c.id, label: c.name })) },
      { name: 'difficulty', label: 'Difficulty', type: 'select', required: true, options: difficultyOptions },
      { name: 'estimated_duration_minutes', label: 'Duration (minutes)', type: 'number' },
      { name: 'estimated_budget_min', label: 'Min Budget (Rp)', type: 'number' },
      { name: 'estimated_budget_max', label: 'Max Budget (Rp)', type: 'number' },
      { name: 'cover_image_url', label: 'Cover Image URL', type: 'url' },
      { name: 'tags', label: 'Tags (comma-separated)', type: 'text', placeholder: 'history, culture, adventure' },
      { name: 'is_published', label: 'Published', type: 'checkbox', placeholder: 'Quest is visible to users' },
    ];
  }

  function handleAdd() {
    setEditingQuest(null);
    setShowForm(true);
  }

  function handleEdit(quest: Quest) {
    setEditingQuest(quest);
    setShowForm(true);
  }

  function handleBuilder(quest: Quest) {
    router.push(`/admin/quests/${quest.id}/builder`);
  }

  async function handleSubmit(formData: Record<string, unknown>) {
    setFormLoading(true);
    const token = getToken();
    const method = editingQuest ? 'PUT' : 'POST';
    const url = editingQuest ? `/admin/quests/${editingQuest.id}` : '/admin/quests';

    const processedData = {
      ...formData,
      estimated_duration_minutes: formData.estimated_duration_minutes ? Number(formData.estimated_duration_minutes) : null,
      estimated_budget_min: formData.estimated_budget_min ? Number(formData.estimated_budget_min) : null,
      estimated_budget_max: formData.estimated_budget_max ? Number(formData.estimated_budget_max) : null,
      tags: formData.tags ? String(formData.tags).split(',').map(t => t.trim()).filter(Boolean) : [],
    };

    const res = await apiFetch<{ ok: boolean; quest?: Quest; error?: string }>(url, {
      method,
      token: token ?? undefined,
      body: JSON.stringify(processedData),
    });

    if (!res.ok) throw new Error(res.error ?? 'Failed to save quest');
    await fetchQuests();
    setFormLoading(false);
  }

  function handleDeleteClick(id: string) { setDeleteId(id); }

  async function handleDeleteConfirm() {
    if (!deleteId) return;
    setDeleteLoading(true);
    const token = getToken();
    const res = await apiFetch<{ ok: boolean; error?: string }>(`/admin/quests/${deleteId}`, {
      method: 'DELETE',
      token: token ?? undefined,
    });
    if (!res.ok) throw new Error(res.error ?? 'Failed to delete');
    await fetchQuests();
    setDeleteLoading(false);
  }

  if (loading && data.length === 0) return <PageLoader />;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quests</h1>
          <p className="text-gray-500 mt-1">Manage adventure quests</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span>➕</span> Create Quest
        </button>
      </div>

      {error && data.length === 0 ? (
        <ErrorState message={error} onRetry={fetchQuests} />
      ) : data.length === 0 ? (
        <EmptyState
          title="No quests yet"
          description="Create your first quest to get started."
          action={{ label: 'Create Quest', onClick: handleAdd }}
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
          actions={(quest) => (
            <div className="flex gap-2 justify-end">
              <button onClick={() => handleBuilder(quest)} className="text-purple-600 hover:text-purple-800 text-sm">
                Builder
              </button>
              <button onClick={() => handleEdit(quest)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
              <button onClick={() => handleDeleteClick(quest.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
            </div>
          )}
        />
      )}

      <FormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        title={editingQuest ? 'Edit Quest' : 'Create Quest'}
        fields={getFormFields()}
        initialData={editingQuest ? {
          ...editingQuest,
          estimated_duration_minutes: editingQuest.estimated_duration_minutes ?? '',
          estimated_budget_min: editingQuest.estimated_budget_min ?? '',
          estimated_budget_max: editingQuest.estimated_budget_max ?? '',
          tags: editingQuest.tags?.join(', '),
        } : { difficulty: 'easy', is_published: false }}
        submitLabel={editingQuest ? 'Update' : 'Create'}
        loading={formLoading}
      />

      <DeleteConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        itemName={data.find(q => q.id === deleteId)?.title}
        loading={deleteLoading}
      />
    </div>
  );
}
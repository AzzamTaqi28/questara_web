'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { Quest, QuestStop, Place } from '@questara/types';
import FormModal from '@/components/admin/FormModal';
import type { FormField } from '@/components/admin/FormModal';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import ErrorState from '@/components/admin/ErrorState';
import { PageLoader } from '@/components/admin/LoadingSpinner';

interface StopsResponse { ok: boolean; stops: (QuestStop & { place?: Place })[]; }
interface PlacesResponse { ok: boolean; places: Place[]; total: number; }
interface QuestResponse { ok: boolean; quest: Quest; }

export default function QuestBuilderPage() {
  const router = useRouter();
  const params = useParams();
  const questId = params.id as string;

  const [quest, setQuest] = useState<Quest | null>(null);
  const [stops, setStops] = useState<(QuestStop & { place?: Place })[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Quest edit form
  const [showQuestForm, setShowQuestForm] = useState(false);
  const [questFormLoading, setQuestFormLoading] = useState(false);

  // Add stop form
  const [showStopForm, setShowStopForm] = useState(false);
  const [stopFormLoading, setStopFormLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = getToken();
    try {
      const [questRes, stopsRes, placesRes] = await Promise.all([
        apiFetch<QuestResponse>(`/admin/quests/${questId}`, { token: token ?? undefined }),
        apiFetch<StopsResponse>(`/admin/quests/${questId}/stops`, { token: token ?? undefined }),
        apiFetch<PlacesResponse>(`/admin/places?limit=200`, { token: token ?? undefined }),
      ]);

      if (!questRes.ok) throw new Error('Quest not found');

      // Enrich stops with place names
      const enrichedStops = stopsRes.stops.map((stop) => ({
        ...stop,
        place: placesRes.places.find((p) => p.id === stop.place_id),
      }));

      setQuest(questRes.quest);
      setStops(enrichedStops);
      setPlaces(placesRes.places);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quest');
    } finally {
      setLoading(false);
    }
  }, [questId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  async function handleUpdateQuest(formData: Record<string, unknown>) {
    setQuestFormLoading(true);
    const token = getToken();
    const res = await apiFetch<{ ok: boolean; quest?: Quest }>(`/admin/quests/${questId}`, {
      method: 'PUT',
      token: token ?? undefined,
      body: JSON.stringify({
        ...formData,
        estimated_duration_minutes: formData.estimated_duration_minutes ? Number(formData.estimated_duration_minutes) : null,
        estimated_budget_min: formData.estimated_budget_min ? Number(formData.estimated_budget_min) : null,
        estimated_budget_max: formData.estimated_budget_max ? Number(formData.estimated_budget_max) : null,
        tags: formData.tags ? String(formData.tags).split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      }),
    });
    if (res.ok && res.quest) setQuest(res.quest);
    setQuestFormLoading(false);
  }

  async function handleTogglePublish() {
    if (!quest) return;
    const token = getToken();
    await apiFetch(`/admin/quests/${questId}`, {
      method: 'PUT',
      token: token ?? undefined,
      body: JSON.stringify({ is_published: !quest.is_published }),
    });
    setQuest({ ...quest, is_published: !quest.is_published });
  }

  async function handleAddStop(formData: Record<string, unknown>) {
    setStopFormLoading(true);
    const token = getToken();
    await apiFetch(`/admin/quests/${questId}/stops`, {
      method: 'POST',
      token: token ?? undefined,
      body: JSON.stringify({
        place_id: formData.place_id,
        position: Number(formData.position) || stops.length + 1,
        required: formData.required === true || formData.required === 'true',
        hint: formData.hint || null,
        recommended_duration_minutes: formData.recommended_duration_minutes ? Number(formData.recommended_duration_minutes) : null,
      }),
    });
    await fetchAll();
    setStopFormLoading(false);
  }

  async function handleRemoveStop(stopId: string) {
    const token = getToken();
    await apiFetch(`/admin/quests/${questId}/stops/${stopId}`, {
      method: 'DELETE',
      token: token ?? undefined,
    });
    await fetchAll();
  }

  async function handleReorder(newStops: (QuestStop & { place?: Place })[]) {
    const stopIds = newStops.map((s) => s.id);
    const token = getToken();
    await apiFetch(`/admin/quests/${questId}/reorder`, {
      method: 'POST',
      token: token ?? undefined,
      body: JSON.stringify({ stop_ids: stopIds }),
    });
    setStops(newStops);
  }

  function moveStop(index: number, direction: 'up' | 'down') {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= stops.length) return;
    const newStops = [...stops];
    [newStops[index], newStops[newIndex]] = [newStops[newIndex], newStops[index]];
    handleReorder(newStops);
  }

  if (loading) return <PageLoader />;
  if (error || !quest) return <div className="p-8"><ErrorState message={error ?? 'Quest not found'} onRetry={fetchAll} /></div>;

  const questFormFields: FormField[] = [
    { name: 'title', label: 'Quest Title', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea', rows: 3 },
    { name: 'difficulty', label: 'Difficulty', type: 'select', options: [{ value: 'easy', label: 'Easy' }, { value: 'medium', label: 'Medium' }, { value: 'hard', label: 'Hard' }] },
    { name: 'estimated_duration_minutes', label: 'Duration (minutes)', type: 'number' },
    { name: 'estimated_budget_min', label: 'Min Budget (Rp)', type: 'number' },
    { name: 'estimated_budget_max', label: 'Max Budget (Rp)', type: 'number' },
    { name: 'cover_image_url', label: 'Cover Image URL', type: 'url' },
    { name: 'tags', label: 'Tags (comma-separated)', type: 'text' },
  ];

  const stopFormFields: FormField[] = [
    { name: 'place_id', label: 'Place', type: 'select', required: true, options: places.map((p) => ({ value: p.id, label: p.name })) },
    { name: 'position', label: 'Position', type: 'number', placeholder: `${stops.length + 1}` },
    { name: 'hint', label: 'Hint Text', type: 'text', placeholder: 'Optional clue for adventurers' },
    { name: 'recommended_duration_minutes', label: 'Recommended Duration (min)', type: 'number' },
    { name: 'required', label: 'Required Stop', type: 'checkbox', placeholder: 'Must be visited to complete quest' },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
          ← Back
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{quest.title}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {stops.length} stops · {quest.difficulty} · {quest.is_published ? 'Published' : 'Draft'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowQuestForm(true)}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Edit Quest
          </button>
          <button
            onClick={handleTogglePublish}
            className={`px-4 py-2 rounded-lg ${quest.is_published ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
          >
            {quest.is_published ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stops List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Quest Stops</h2>
            <button
              onClick={() => setShowStopForm(true)}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              ➕ Add Stop
            </button>
          </div>

          {stops.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
              No stops yet. Add places to build your quest route.
            </div>
          ) : (
            <div className="space-y-3">
              {stops.map((stop, index) => (
                <div key={stop.id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start gap-4">
                    {/* Position indicator */}
                    <div className="flex flex-col items-center gap-1">
                      <span className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      {index > 0 && (
                        <button onClick={() => moveStop(index, 'up')} className="text-gray-400 hover:text-gray-600 text-xs">↑</button>
                      )}
                      {index < stops.length - 1 && (
                        <button onClick={() => moveStop(index, 'down')} className="text-gray-400 hover:text-gray-600 text-xs">↓</button>
                      )}
                    </div>

                    {/* Stop info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{stop.place?.name ?? 'Unknown Place'}</h3>
                        {stop.required && (
                          <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded">Required</span>
                        )}
                      </div>
                      {stop.hint && (
                        <p className="text-sm text-gray-500 mt-1">💡 {stop.hint}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        {stop.recommended_duration_minutes && (
                          <span>⏱ {stop.recommended_duration_minutes} min</span>
                        )}
                        {stop.place?.category && (
                          <span className="capitalize">{stop.place.category}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <button
                      onClick={() => handleRemoveStop(stop.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview Card */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Quest Preview</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {quest.cover_image_url && (
              <div className="h-32 bg-gray-100">
                <img src={quest.cover_image_url} alt={quest.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  quest.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                  quest.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {quest.difficulty}
                </span>
                <span className="text-xs text-gray-500">{stops.length} stops</span>
              </div>
              <h3 className="font-semibold text-gray-900">{quest.title}</h3>
              {quest.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-3">{quest.description}</p>
              )}
              {quest.estimated_duration_minutes && (
                <p className="text-xs text-gray-400 mt-2">⏱ ~{quest.estimated_duration_minutes} min</p>
              )}
            </div>
          </div>

          {/* Stamps earned */}
          <h3 className="text-sm font-medium text-gray-700">Stamps Earned</h3>
          <div className="space-y-2">
            {stops.filter(s => s.place).map((stop) => (
              <div key={stop.id} className="flex items-center gap-2 text-sm text-gray-600">
                <span>🎫</span>
                <span>{stop.place?.name}</span>
              </div>
            ))}
            {stops.length === 0 && (
              <p className="text-xs text-gray-400">Add stops to see stamps</p>
            )}
          </div>
        </div>
      </div>

      {/* Quest Edit Modal */}
      <FormModal
        isOpen={showQuestForm}
        onClose={() => setShowQuestForm(false)}
        onSubmit={handleUpdateQuest}
        title="Edit Quest"
        fields={questFormFields}
        initialData={{
          ...quest,
          estimated_duration_minutes: quest.estimated_duration_minutes ?? '',
          estimated_budget_min: quest.estimated_budget_min ?? '',
          estimated_budget_max: quest.estimated_budget_max ?? '',
          tags: quest.tags?.join(', '),
        }}
        submitLabel="Update"
        loading={questFormLoading}
      />

      {/* Add Stop Modal */}
      <FormModal
        isOpen={showStopForm}
        onClose={() => setShowStopForm(false)}
        onSubmit={handleAddStop}
        title="Add Stop"
        fields={stopFormFields}
        initialData={{ position: stops.length + 1, required: true }}
        submitLabel="Add Stop"
        loading={stopFormLoading}
      />
    </div>
  );
}
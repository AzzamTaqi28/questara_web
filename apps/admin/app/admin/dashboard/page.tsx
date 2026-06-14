'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { getToken } from '@/lib/auth';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import ErrorState from '@/components/admin/ErrorState';
import Link from 'next/link';

interface MetricCard {
  label: string;
  value: number | string;
  icon: string;
  color: string;
}

interface DashboardData {
  cities: number;
  places: number;
  quests: number;
  stamps: number;
  checkIns: number;
  users: number;
  pendingSubmissions: number;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardData>({
    cities: 0,
    places: 0,
    quests: 0,
    stamps: 0,
    checkIns: 0,
    users: 0,
    pendingSubmissions: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    setError(null);
    const token = getToken();

    try {
      const [citiesRes, placesRes, questsRes, stampsRes, usersRes, submissionsRes] = await Promise.allSettled([
        apiFetch<{ ok: boolean; total: number }>('/admin/cities?limit=1', { token: token ?? undefined }),
        apiFetch<{ ok: boolean; total: number }>('/admin/places?limit=1', { token: token ?? undefined }),
        apiFetch<{ ok: boolean; total: number }>('/admin/quests?limit=1', { token: token ?? undefined }),
        apiFetch<{ ok: boolean; stamps: unknown[] }>('/admin/stamps?limit=1', { token: token ?? undefined }),
        apiFetch<{ ok: boolean; total: number }>('/admin/users?limit=1', { token: token ?? undefined }),
        apiFetch<{ ok: boolean; submissions: unknown[]; total: number }>('/admin/submissions?limit=1&status=pending', { token: token ?? undefined }),
      ]);

      setMetrics({
        cities: citiesRes.status === 'fulfilled' ? citiesRes.value.total : 0,
        places: placesRes.status === 'fulfilled' ? placesRes.value.total : 0,
        quests: questsRes.status === 'fulfilled' ? questsRes.value.total : 0,
        stamps: stampsRes.status === 'fulfilled' ? stampsRes.value.stamps.length : 0,
        users: usersRes.status === 'fulfilled' ? usersRes.value.total : 0,
        checkIns: 0, // Will be fetched separately if needed
        pendingSubmissions: submissionsRes.status === 'fulfilled' ? submissionsRes.value.total : 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  const metricCards: MetricCard[] = [
    { label: 'Cities', value: metrics.cities, icon: '🏙️', color: 'bg-blue-50 border-blue-200' },
    { label: 'Places', value: metrics.places, icon: '📍', color: 'bg-green-50 border-green-200' },
    { label: 'Quests', value: metrics.quests, icon: '🗺️', color: 'bg-purple-50 border-purple-200' },
    { label: 'Stamps', value: metrics.stamps, icon: '🎫', color: 'bg-pink-50 border-pink-200' },
    { label: 'Users', value: metrics.users, icon: '👥', color: 'bg-orange-50 border-orange-200' },
    { label: 'Pending Reviews', value: metrics.pendingSubmissions, icon: '📝', color: 'bg-yellow-50 border-yellow-200' },
  ];

  const quickActions = [
    { label: 'Create Quest', href: '/admin/quests', icon: '➕', color: 'bg-purple-600 hover:bg-purple-700' },
    { label: 'Add Place', href: '/admin/places', icon: '📍', color: 'bg-green-600 hover:bg-green-700' },
    { label: 'Review Submissions', href: '/admin/submissions', icon: '📝', color: 'bg-yellow-600 hover:bg-yellow-700' },
  ];

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorState message={error} onRetry={fetchDashboardData} />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of Questara platform</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {metricCards.map((card) => (
          <div
            key={card.label}
            className={`p-6 rounded-xl border ${card.color}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
              <span className="text-3xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg ${action.color} transition-colors`}
            >
              <span>{action.icon}</span>
              <span className="font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
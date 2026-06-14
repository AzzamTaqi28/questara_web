'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout, getSession, type AdminUser } from '@/lib/auth';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/cities', label: 'Cities', icon: '🏙️' },
  { href: '/admin/places', label: 'Places', icon: '📍' },
  { href: '/admin/events', label: 'Events', icon: '🎪' },
  { href: '/admin/quests', label: 'Quests', icon: '🗺️' },
  { href: '/admin/stamps', label: 'Stamps', icon: '🎫' },
  { href: '/admin/submissions', label: 'Submissions', icon: '📝' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/check-ins', label: 'Check-ins', icon: '✓' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    getSession().then((session) => {
      if (session) setUser(session.user);
    });
  }, []);

  async function handleLogout() {
    await logout();
  }

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold">Questara Admin</h1>
        <p className="text-gray-400 text-sm mt-1">Content Management</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-medium">
            {user?.display_name?.[0]?.toUpperCase() ?? user?.username?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.display_name ?? user?.username ?? 'Admin'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {user?.email ?? 'admin@questara.id'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full mt-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-left"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSession, type AdminUser } from '@/lib/auth';
import LoadingSpinner from './LoadingSpinner';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const session = await getSession();
        if (!session) {
          router.push('/login');
          return;
        }
        if (session.user.role !== 'admin') {
          router.push('/login?error=not_admin');
          return;
        }
        setUser(session.user);
      } catch {
        router.push('/login');
      } finally {
        setChecking(false);
      }
    }
    checkAuth();
  }, [router, pathname]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}

// Export user for use in other components
export function useAdminUser(): AdminUser | null {
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        setUser(session.user);
      }
    });
  }, []);

  return user;
}
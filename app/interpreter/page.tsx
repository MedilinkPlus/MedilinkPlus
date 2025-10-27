'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RoleGuard from '@/components/RoleGuard';

export default function InterpreterHomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/interpreter/dashboard');
  }, [router]);

  return (
    <RoleGuard allowedRoles={['interpreter']}>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A8E6CF] mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
      </div>
    </RoleGuard>
  );
}

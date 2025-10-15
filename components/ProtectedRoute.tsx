'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/system/LoadingSpinner';
import { ErrorMessage } from '@/components/system/ErrorMessage';
import Link from 'next/link';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
  showLoading?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  fallback,
  redirectTo = '/auth/login',
  showLoading = true 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Loading state
  if (loading && showLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Checking authentication..." />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 flex items-center justify-center bg-red-100 rounded-full mx-auto mb-6">
            <i className="ri-lock-line text-red-500 text-4xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Restricted</h2>
          <p className="text-gray-600 mb-8">
            You need to log in to access this page.
          </p>
          <button
            onClick={() => router.push(redirectTo)}
            className="w-full bg-[#A8E6CF] text-white py-3 rounded-2xl font-medium text-lg cursor-pointer whitespace-nowrap inline-block text-center hover:bg-[#8DD5B8] transition-colors"
          >
            Log in
          </button>
        </div>
      </div>
    );
  }

  // 인증된 사용자에게 콘텐츠 표시
  return <>{children}</>;
}

'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/system/LoadingSpinner';
import Link from 'next/link';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: ReactNode;
  redirectTo?: string;
  showLoading?: boolean;
}

export default function RoleGuard({ 
  children, 
  allowedRoles,
  fallback,
  redirectTo,
  showLoading = true 
}: RoleGuardProps) {
  const { user, profile, loading } = useAuth();

  // Loading state
  if (loading && showLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Checking permissions..." />
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
            <i className="ri-user-forbid-line text-red-500 text-4xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Restricted</h2>
          <p className="text-gray-600 mb-8">
            You need to log in to access this page.
          </p>
          <Link 
            href="/auth/login"
            className="w-full bg-[#A8E6CF] text-white py-3 rounded-2xl font-medium text-lg cursor-pointer whitespace-nowrap inline-block text-center hover:bg-[#8DD5B8] transition-colors"
          >
            Log in
          </Link>
        </div>
      </div>
    );
  }

  // Authenticated but profile not ready yet
  if (!profile) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Preparing your profile..." />
      </div>
    );
  }

  // Lacking required role
  if (!allowedRoles.includes(profile.role)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (redirectTo) {
      // Redirect when specified
      window.location.href = redirectTo;
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Redirecting..." />
        </div>
      );
    }

    // Show insufficient permission message
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 flex items-center justify-center bg-orange-100 rounded-full mx-auto mb-6">
            <i className="ri-shield-forbid-line text-orange-500 text-4xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Insufficient Permission</h2>
          <p className="text-gray-600 mb-4">
            You do not have permission to access this page.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Current role: <span className="font-medium">{profile.role}</span><br />
            Required role(s): <span className="font-medium">{allowedRoles.join(', ')}</span>
          </p>
          <div className="space-y-3">
            <Link 
              href="/dashboard"
              className="w-full bg-[#A8E6CF] text-white py-3 rounded-2xl font-medium text-lg cursor-pointer whitespace-nowrap inline-block text-center hover:bg-[#8DD5B8] transition-colors"
            >
              Go to Dashboard
            </Link>
            <Link 
              href="/profile"
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-2xl font-medium text-lg cursor-pointer whitespace-nowrap inline-block text-center hover:bg-gray-200 transition-colors"
            >
              View Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 권한이 있는 경우 콘텐츠 표시
  return <>{children}</>;
}

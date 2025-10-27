'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import ReservationCard from './ReservationCard';
import { useReservations } from '@/hooks/useReservations';
import { LoadingSpinner } from '@/components/system/LoadingSpinner';
import { ErrorMessage } from '@/components/system/ErrorMessage';
import { NoReservations } from '@/components/system/EmptyState';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ReservationsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const {
    reservations,
    loading,
    error,
    fetchReservations,
    changeStatus,
    cancelReservation
  } = useReservations({
    autoFetch: true
  });

  const filteredReservations = reservations?.filter(reservation => {
    if (statusFilter === 'all') return true;
    return reservation.status === statusFilter;
  }) || [];

  const handleStatusChange = async (reservationId: string, newStatus: string) => {
    try {
      await changeStatus(reservationId, newStatus as any);
      // Refresh reservations after status change
      fetchReservations();
    } catch (err) {
      console.error('Status change error:', err);
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    try {
      await cancelReservation(reservationId, 'Cancelled by user request');
      // Refresh reservations after cancellation
      fetchReservations();
    } catch (err) {
      console.error('Cancel reservation error:', err);
    }
  };

  const getStatusCount = (status: string) => {
    return reservations?.filter(r => r.status === status).length || 0;
  };

  if (loading && reservations.length === 0) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 pb-20">
          <Header />
          <main className="pt-4">
            <LoadingSpinner size="lg" text="Loading reservations..." className="py-20" />
          </main>
          <BottomNavigation />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />
        
        <main className="pt-4">
          <div className="px-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">My Reservations</h1>
            <p className="text-gray-600">View and manage your reservations</p>
          </div>

          {error && (
            <div className="px-4 mb-4">
              <ErrorMessage error={error} onRetry={fetchReservations} />
            </div>
          )}

          {/* 상태별 필터 */}
          <div className="px-4 mb-6">
            <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
              <div className="flex space-x-1">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-[#A8E6CF] text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  All ({reservations?.length || 0})
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-colors ${
                    statusFilter === 'pending'
                      ? 'bg-[#FFD3B6] text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Pending ({getStatusCount('pending')})
                </button>
                <button
                  onClick={() => setStatusFilter('confirmed')}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-colors ${
                    statusFilter === 'confirmed'
                      ? 'bg-[#A8E6CF] text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Confirmed ({getStatusCount('confirmed')})
                </button>
                <button
                  onClick={() => setStatusFilter('completed')}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-colors ${
                    statusFilter === 'completed'
                      ? 'bg-green-500 text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Completed ({getStatusCount('completed')})
                </button>
              </div>
            </div>
          </div>

          {/* 예약 목록 */}
          <div className="px-4">
            {filteredReservations.length === 0 ? (
              <NoReservations />
            ) : (
              <div className="space-y-4">
                {filteredReservations.map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    onCancel={handleCancelReservation}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 새 예약 버튼 */}
          <div className="px-4 mt-8 mb-8">
            <div className="bg-gradient-to-r from-[#A8E6CF] to-[#FFD3B6] rounded-2xl p-6 text-center">
              <h3 className="text-lg font-bold text-white mb-3">Need a new reservation?</h3>
              <p className="text-white/90 text-sm mb-4">
                Get professional medical services at Seoul's best hospitals
              </p>
              <a
                href="/hospitals"
                className="inline-block bg-white text-[#A8E6CF] px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Find Hospitals
              </a>
            </div>
          </div>
        </main>
        
        <BottomNavigation />
      </div>
    </ProtectedRoute>
  );
}
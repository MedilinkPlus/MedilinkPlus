
'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import QuickLinks from '@/components/QuickLinks';
import Promotions from '@/components/Promotions';
import { useReservations } from '@/hooks/useReservations';
import { useHospitals } from '@/hooks/useHospitals';
import { LoadingSpinner } from '@/components/system/LoadingSpinner';
import { ErrorMessage } from '@/components/system/ErrorMessage';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import RoleGuard from '@/components/RoleGuard';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const {
    reservations,
    loading: reservationsLoading,
    error: reservationsError,
    fetchReservations
  } = useReservations({
    autoFetch: true,
    limit: 10
  });

  const {
    hospitals,
    loading: hospitalsLoading,
    error: hospitalsError,
    fetchHospitals
  } = useHospitals({
    autoFetch: true,
    limit: 5
  });

  const calculateStats = () => {
    if (!reservations) return null;

    const total = reservations.length;
    const pending = reservations.filter(r => r.status === 'pending').length;
    const confirmed = reservations.filter(r => r.status === 'confirmed').length;
    const completed = reservations.filter(r => r.status === 'completed').length;
    const cancelled = reservations.filter(r => r.status === 'cancelled').length;

    // 이번 달 예약 수 계산
    const now = new Date();
    const thisMonth = reservations.filter(r => {
      const reservationDate = new Date(r.date);
      return reservationDate.getMonth() === now.getMonth() && 
             reservationDate.getFullYear() === now.getFullYear();
    }).length;

    // 다음 예약 찾기
    const nextAppointment = reservations
      .filter(r => r.status === 'pending' || r.status === 'confirmed')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      thisMonth,
      nextAppointment
    };
  };

  const stats = calculateStats();

  if (reservationsLoading && reservations.length === 0) {
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
        <main>
          <QuickLinks />
          <Promotions />

          {(reservationsError || hospitalsError) && (
            <div className="px-4 mt-6">
              <ErrorMessage 
                error={reservationsError || hospitalsError || '데이터를 불러오는 중 오류가 발생했습니다.'} 
                onRetry={() => {
                  if (reservationsError) fetchReservations();
                  if (hospitalsError) fetchHospitals();
                }}
              />
            </div>
          )}

          {stats && (
            <div className="px-4 mt-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Reservation Stats</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#A8E6CF]">{stats.total}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#FFD3B6]">{stats.thisMonth}</div>
                    <div className="text-sm text-gray-600">This month</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-yellow-600">{stats.pending}</div>
                    <div className="text-xs text-gray-500">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">{stats.confirmed}</div>
                    <div className="text-xs text-gray-500">Confirmed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">{stats.completed}</div>
                    <div className="text-xs text-gray-500">Completed</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {stats?.nextAppointment && (
            <div className="px-4 mt-6">
              <div className="bg-gradient-to-r from-[#A8E6CF]/10 to-[#FFD3B6]/10 rounded-2xl p-6 border border-[#A8E6CF]/20">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Next Appointment</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <span className="font-medium">Treatment:</span> {stats.nextAppointment.treatment}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Date:</span> {new Date(stats.nextAppointment.date).toLocaleDateString('en-US')}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Time:</span> {stats.nextAppointment.time}
                  </p>
                </div>
                <div className="mt-4">
                  <Link 
                    href={`/reservations/${stats.nextAppointment.id}`}
                    className="text-[#A8E6CF] font-medium hover:text-[#8DD5B8] transition-colors"
                  >
                    View details →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {stats && (
            <div className="px-4 mt-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Reservation Status Overview</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Pending</span>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                      <span className="font-medium">{stats.pending}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Confirmed</span>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                      <span className="font-medium">{stats.confirmed}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Completed</span>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                      <span className="font-medium">{stats.completed}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Cancelled</span>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                      <span className="font-medium">{stats.cancelled}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Admin shortcuts removed by request */}

          <div className="px-4 mt-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/reservations" className="bg-[#FFD3B6] text-white p-4 rounded-xl text-center cursor-pointer whitespace-nowrap hover:bg-[#FFC4A3] transition-colors">
                  <div className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-full mx-auto mb-2">
                    <i className="ri-calendar-line text-white"></i>
                  </div>
                  <p className="font-medium">My Reservations</p>
                  <p className="text-xs opacity-90">Manage reservations</p>
                </Link>
                <Link href="/profile" className="bg-gray-100 text-gray-700 p-4 rounded-xl text-center cursor-pointer whitespace-nowrap hover:bg-gray-200 transition-colors">
                  <div className="w-8 h-8 flex items-center justify-center bg-gray-300 rounded-full mx-auto mb-2">
                    <i className="ri-user-line text-gray-600"></i>
                  </div>
                  <p className="font-medium">Profile</p>
                  <p className="text-xs opacity-90">Edit info</p>
                </Link>
              </div>
            </div>
          </div>

          <div className="px-4 mt-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Why choose MediLink+</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-[#A8E6CF] rounded-full mr-3">
                    <i className="ri-shield-check-line text-white text-sm"></i>
                  </div>
                  <span className="text-gray-700 text-sm">Certified medical interpreters</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-[#FFD3B6] rounded-full mr-3">
                    <i className="ri-hospital-line text-white text-sm"></i>
                  </div>
                  <span className="text-gray-700 text-sm">Top hospitals</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-[#E0BBE4] rounded-full mr-3">
                    <i className="ri-customer-service-2-line text-white text-sm"></i>
                  </div>
                  <span className="text-gray-700 text-sm">24/7 customer support</span>
                </div>
              </div>
            </div>
          </div>
        </main>
        <BottomNavigation />
      </div>
    </ProtectedRoute>
  );
}

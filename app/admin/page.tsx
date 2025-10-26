
'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import AdminBottomNavigation from '@/components/AdminBottomNavigation';
import RoleGuard from '@/components/RoleGuard';
import Link from 'next/link';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const adminStats = {
    totalUsers: 1247,
    totalHospitals: 89,
    totalInterpreters: 156,
    totalReservations: 3421,
    pendingReservations: 89,
    completedReservations: 2987,
    cancelledReservations: 345,
    monthlyRevenue: 12500000
  };

  const recentActivities = [
    { id: 1, type: 'user_signup', message: 'New user registered: john.doe@email.com', time: '2 min ago' },
    { id: 2, type: 'reservation_created', message: 'New reservation created: ID #12345', time: '5 min ago' },
    { id: 3, type: 'hospital_updated', message: 'Hospital info updated: Seoul National University Hospital', time: '15 min ago' },
    { id: 4, type: 'interpreter_verified', message: 'Interpreter verified: Kim Interpreter', time: '1 hour ago' },
    { id: 5, type: 'payment_received', message: 'Payment completed: ₩350,000', time: '2 hours ago' }
  ];

  const quickActions = [
    { 
      title: 'Price Comparison', 
      description: 'Manage treatment fees and pricing', 
      icon: 'ri-bar-chart-line',
      color: 'bg-[#B8E6E3]',
      href: '/admin/price-comparison'
    },
    { 
      title: 'User Management', 
      description: 'Manage user accounts and permissions', 
      icon: 'ri-user-settings-line',
      color: 'bg-[#A8E6CF]',
      href: '/admin/users'
    },
    { 
      title: 'Hospital Management', 
      description: 'Manage hospital information and services', 
      icon: 'ri-hospital-line',
      color: 'bg-[#FFD3B6]',
      href: '/admin/hospitals'
    },
    { 
      title: 'Interpreter Management', 
      description: 'Manage interpreter verification and accounts', 
      icon: 'ri-translate-2',
      color: 'bg-[#E0BBE4]',
      href: '/admin/interpreters'
    },
    { 
      title: 'Reservation Management', 
      description: 'Manage reservations and status', 
      icon: 'ri-calendar-line',
      color: 'bg-[#FFB6C1]',
      href: '/admin/reservations'
    },
    { 
      title: 'Promotion Management', 
      description: 'Configure discounts and promotions', 
      icon: 'ri-gift-line',
      color: 'bg-[#F7DC6F]',
      href: '/admin/promotions'
    }
  ];

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />
        
        <main className="pt-4">
          <div className="px-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Monitor and manage the entire MediLink+ system</p>
          </div>

          {/* 통계 카드 */}
          <div className="px-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-[#A8E6CF]">{adminStats.totalUsers.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 flex items-center justify-center bg-[#A8E6CF]/20 rounded-full">
                    <i className="ri-user-line text-[#A8E6CF] text-xl"></i>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Hospitals</p>
                    <p className="text-2xl font-bold text-[#FFD3B6]">{adminStats.totalHospitals}</p>
                  </div>
                  <div className="w-12 h-12 flex items-center justify-center bg-[#FFD3B6]/20 rounded-full">
                    <i className="ri-hospital-line text-[#FFD3B6] text-xl"></i>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Interpreters</p>
                    <p className="text-2xl font-bold text-[#E0BBE4]">{adminStats.totalInterpreters}</p>
                  </div>
                  <div className="w-12 h-12 flex items-center justify-center bg-[#E0BBE4]/20 rounded-full">
                    <i className="ri-translate-2 text-[#E0BBE4] text-xl"></i>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Reservations</p>
                    <p className="text-2xl font-bold text-[#98D8C8]">{adminStats.totalReservations.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 flex items-center justify-center bg-[#98D8C8]/20 rounded-full">
                    <i className="ri-calendar-line text-[#98D8C8] text-xl"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 예약 현황 */}
          <div className="px-4 mb-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Reservation Status</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{adminStats.pendingReservations}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{adminStats.completedReservations}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{adminStats.cancelledReservations}</div>
                  <div className="text-sm text-gray-600">Cancelled</div>
                </div>
              </div>
            </div>
          </div>

          {/* 빠른 액션 */}
          <div className="px-4 mb-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className={`w-12 h-12 flex items-center justify-center ${action.color} rounded-full mx-auto mb-3`}>
                      <i className={`${action.icon} text-white text-xl`}></i>
                    </div>
                    <h4 className="font-medium text-gray-800 text-center mb-1">{action.title}</h4>
                    <p className="text-gray-500 text-xs text-center">{action.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* 최근 활동 */}
          <div className="px-4 mb-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center">
                      <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full mr-3">
                        <i className="ri-notification-line text-gray-600 text-sm"></i>
                      </div>
                      <span className="text-gray-700 text-sm">{activity.message}</span>
                    </div>
                    <span className="text-gray-500 text-xs">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 시스템 상태 */}
          <div className="px-4 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Database</span>
                  <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                    Normal
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">File Storage</span>
                  <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                    Normal
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Email Service</span>
                  <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                    Normal
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">LINE Integration</span>
                  <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                    Normal
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <AdminBottomNavigation />
      </div>
    </RoleGuard>
  );
}

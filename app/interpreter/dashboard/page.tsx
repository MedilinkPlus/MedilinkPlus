
'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import InterpreterBottomNavigation from '@/components/InterpreterBottomNavigation';
import RoleGuard from '@/components/RoleGuard';
import Link from 'next/link';

export default function InterpreterDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const interpreterStats = {
    totalRequests: 47,
    completedRequests: 38,
    pendingRequests: 6,
    cancelledRequests: 3,
    totalEarnings: 1250000,
    thisMonthEarnings: 280000,
    averageRating: 4.8,
    totalReviews: 42
  };

  const recentRequests = [
    { id: 1, patient: 'Patient Kim', hospital: 'Seoul National University Hospital', date: '2024-01-15', time: '14:00', status: 'confirmed' },
    { id: 2, patient: 'Patient Lee', hospital: 'Yonsei Severance Hospital', date: '2024-01-16', time: '10:30', status: 'pending' },
    { id: 3, patient: 'Patient Park', hospital: 'Korea University Hospital', date: '2024-01-17', time: '16:00', status: 'pending' }
  ];

  const quickActions = [
    { 
      title: 'Check Requests', 
      description: 'Review new interpretation requests', 
      icon: 'ri-notification-line',
      color: 'bg-[#A8E6CF]',
      href: '/interpreter/requests'
    },
    { 
      title: 'Manage Reservations', 
      description: 'Track interpretation reservations', 
      icon: 'ri-calendar-line',
      color: 'bg-[#FFD3B6]',
      href: '/interpreter/reservations'
    },
    { 
      title: 'Manage Customers', 
      description: 'Customer info and history', 
      icon: 'ri-user-line',
      color: 'bg-[#E0BBE4]',
      href: '/interpreter/customers'
    },
    { 
      title: 'Edit Profile', 
      description: 'Update interpreter information', 
      icon: 'ri-user-settings-line',
      color: 'bg-[#98D8C8]',
      href: '/interpreter/profile'
    }
  ];

  return (
    <RoleGuard allowedRoles={['interpreter']}>
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />
        
        <main className="pt-4">
          <div className="px-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Interpreter Dashboard</h1>
            <p className="text-gray-600">Manage requests and reservations, and track your earnings</p>
          </div>

          {/* Stats Cards */}
          <div className="px-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Requests</p>
                    <p className="text-2xl font-bold text-[#A8E6CF]">{interpreterStats.totalRequests}</p>
                  </div>
                  <div className="w-12 h-12 flex items-center justify-center bg-[#A8E6CF]/20 rounded-full">
                    <i className="ri-translate-2 text-[#A8E6CF] text-xl"></i>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completed Requests</p>
                    <p className="text-2xl font-bold text-[#FFD3B6]">{interpreterStats.completedRequests}</p>
                  </div>
                  <div className="w-12 h-12 flex items-center justify-center bg-[#FFD3B6]/20 rounded-full">
                    <i className="ri-check-double-line text-[#FFD3B6] text-xl"></i>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Requests</p>
                    <p className="text-2xl font-bold text-[#E0BBE4]">{interpreterStats.pendingRequests}</p>
                  </div>
                  <div className="w-12 h-12 flex items-center justify-center bg-[#E0BBE4]/20 rounded-full">
                    <i className="ri-time-line text-[#E0BBE4] text-xl"></i>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Average Rating</p>
                    <p className="text-2xl font-bold text-[#98D8C8]">{interpreterStats.averageRating}</p>
                  </div>
                  <div className="w-12 h-12 flex items-center justify-center bg-[#98D8C8]/20 rounded-full">
                    <i className="ri-star-line text-[#98D8C8] text-xl"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Earnings */}
          <div className="px-4 mb-6">
            <div className="bg-gradient-to-r from-[#A8E6CF] to-[#FFD3B6] rounded-2xl p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Earnings Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">₩{interpreterStats.totalEarnings.toLocaleString()}</div>
                  <div className="text-sm opacity-90">Total Earnings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">₩{interpreterStats.thisMonthEarnings.toLocaleString()}</div>
                  <div className="text-sm opacity-90">This Month</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
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

          {/* Recent Requests */}
          <div className="px-4 mb-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Recent Requests</h3>
                <Link href="/interpreter/requests" className="text-[#A8E6CF] text-sm hover:text-[#8DD5B8] transition-colors">
                  View all →
                </Link>
              </div>
              <div className="space-y-3">
                {recentRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-800">{request.patient}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600 text-sm">{request.hospital}</span>
                      </div>
                      <div className="text-gray-500 text-sm">
                        {request.date} {request.time}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      request.status === 'confirmed' 
                        ? 'bg-green-100 text-green-600'
                        : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {request.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="px-4 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Performance Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="text-gray-800 font-medium">
                    {Math.round((interpreterStats.completedRequests / interpreterStats.totalRequests) * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Reviews</span>
                  <span className="text-gray-800 font-medium">{interpreterStats.totalReviews}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Average Rating</span>
                  <div className="flex items-center">
                    <span className="text-gray-800 font-medium mr-2">{interpreterStats.averageRating}</span>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className={`ri-star-${i < Math.floor(interpreterStats.averageRating) ? 'fill' : 'line'}`}></i>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <InterpreterBottomNavigation />
      </div>
    </RoleGuard>
  );
}

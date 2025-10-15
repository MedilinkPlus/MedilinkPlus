'use client';

import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import RoleGuard from '@/components/RoleGuard';
import Link from 'next/link';

export default function InterpreterHomePage() {
  return (
    <RoleGuard allowedRoles={['interpreter']} redirectTo="/auth/login">
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />

        <main className="pt-4">
          <div className="px-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Interpreter Home</h1>
            <p className="text-gray-600">Manage your profile, availability, and requests</p>
          </div>

          <div className="px-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/interpreter/profile" className="p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="w-12 h-12 flex items-center justify-center bg-[#A8E6CF] rounded-full mr-3">
                  <i className="ri-user-voice-line text-white text-xl"></i>
                </div>
                <div>
                  <div className="text-gray-900 font-semibold">Profile</div>
                  <div className="text-gray-500 text-sm">Update info, specialties, languages</div>
                </div>
              </div>
            </Link>

            <Link href="/reservations" className="p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="w-12 h-12 flex items-center justify-center bg-[#FFD3B6] rounded-full mr-3">
                  <i className="ri-calendar-check-line text-white text-xl"></i>
                </div>
                <div>
                  <div className="text-gray-900 font-semibold">My Requests</div>
                  <div className="text-gray-500 text-sm">View assigned and pending reservations</div>
                </div>
              </div>
            </Link>

            <Link href="/compare" className="p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="w-12 h-12 flex items-center justify-center bg-[#E0BBE4] rounded-full mr-3">
                  <i className="ri-bar-chart-2-line text-white text-xl"></i>
                </div>
                <div>
                  <div className="text-gray-900 font-semibold">Fees Reference</div>
                  <div className="text-gray-500 text-sm">Check hospital/treatment fee ranges</div>
                </div>
              </div>
            </Link>

            <Link href="/profile" className="p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="w-12 h-12 flex items-center justify-center bg-[#A8E6CF]/60 rounded-full mr-3">
                  <i className="ri-settings-3-line text-white text-xl"></i>
                </div>
                <div>
                  <div className="text-gray-900 font-semibold">Account Settings</div>
                  <div className="text-gray-500 text-sm">Manage account and preferences</div>
                </div>
              </div>
            </Link>
          </div>
        </main>

        <BottomNavigation />
      </div>
    </RoleGuard>
  );
}



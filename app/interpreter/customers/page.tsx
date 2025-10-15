
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import InterpreterBottomNavigation from '@/components/InterpreterBottomNavigation';

export default function InterpreterCustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const customers = [
    {
      id: 1,
      name: 'Siriporn Thanakit',
      email: 'siriporn.t@email.com',
      phone: '+66-81-234-5678',
      nationality: 'Thai',
      age: 32,
      gender: 'Female',
      joinDate: '2024-01-15',
      totalVisits: 5,
      completedReservations: 4,
      upcomingReservations: 1,
      lastVisit: '2024-02-10',
      status: 'active',
      preferredHospitals: ['Seoul Dental Excellence', 'Gangnam Beauty Clinic'],
      treatments: ['Dental Check-up', 'Teeth Whitening', 'Orthodontics'],
      notes: 'Prefers morning appointments. Speaks basic English.',
      lineId: '@siriporn_t',
      emergencyContact: '+66-82-345-6789'
    },
    {
      id: 2,
      name: 'Panida Sukumarn',
      email: 'panida.s@email.com',
      phone: '+66-82-345-6789',
      nationality: 'Thai',
      age: 28,
      gender: 'Female',
      joinDate: '2024-01-20',
      totalVisits: 3,
      completedReservations: 2,
      upcomingReservations: 1,
      lastVisit: '2024-02-08',
      status: 'active',
      preferredHospitals: ['Gangnam Beauty Clinic'],
      treatments: ['Plastic Surgery Consultation', 'Rhinoplasty'],
      notes: 'First-time plastic surgery patient. Requires detailed explanations.',
      lineId: '@panida_beauty',
      emergencyContact: '+66-83-456-7890'
    },
    {
      id: 3,
      name: 'Nattaya Kamnoet',
      email: 'nattaya.k@email.com',
      phone: '+66-83-456-7890',
      nationality: 'Thai',
      age: 35,
      gender: 'Female',
      joinDate: '2024-01-08',
      totalVisits: 8,
      completedReservations: 8,
      upcomingReservations: 0,
      lastVisit: '2024-01-28',
      status: 'active',
      preferredHospitals: ['Myeongdong Medical Center', 'Seoul National University Hospital'],
      treatments: ['General Surgery', 'Follow-up Appointments'],
      notes: 'Regular patient. Post-surgery recovery going well.',
      lineId: '@nattaya_k',
      emergencyContact: '+66-84-567-8901'
    },
    {
      id: 4,
      name: 'Waranya Srisuk',
      email: 'waranya.s@email.com',
      phone: '+66-84-567-8901',
      nationality: 'Thai',
      age: 29,
      gender: 'Female',
      joinDate: '2024-01-25',
      totalVisits: 2,
      completedReservations: 1,
      upcomingReservations: 0,
      lastVisit: '2024-02-01',
      status: 'inactive',
      preferredHospitals: ['Apgujeong Skin Clinic'],
      treatments: ['Skin Analysis', 'Acne Treatment'],
      notes: 'Cancelled recent appointment due to travel restrictions.',
      lineId: '@waranya_skin',
      emergencyContact: '+66-85-678-9012'
    },
    {
      id: 5,
      name: 'Aranya Srisawat',
      email: 'aranya.s@email.com',
      phone: '+66-87-111-2222',
      nationality: 'Thai',
      age: 31,
      gender: 'Female',
      joinDate: '2024-01-10',
      totalVisits: 6,
      completedReservations: 5,
      upcomingReservations: 1,
      lastVisit: '2024-02-12',
      status: 'active',
      preferredHospitals: ['Seoul Dental Excellence', 'Gangnam Beauty Clinic'],
      treatments: ['Dental Implant', 'Cosmetic Surgery'],
      notes: 'VIP customer. Prefers premium services.',
      lineId: '@aranya_vip',
      emergencyContact: '+66-88-222-3333'
    },
    {
      id: 6,
      name: 'Kamon Jitsawat',
      email: 'kamon.j@email.com',
      phone: '+66-88-333-4444',
      nationality: 'Thai',
      age: 26,
      gender: 'Male',
      joinDate: '2024-01-18',
      totalVisits: 2,
      completedReservations: 1,
      upcomingReservations: 1,
      lastVisit: '2024-02-05',
      status: 'active',
      preferredHospitals: ['Seoul National University Hospital'],
      treatments: ['Health Check-up', 'Cardiology Consultation'],
      notes: 'Health-conscious young professional. Speaks good English.',
      lineId: '@kamon_health',
      emergencyContact: '+66-89-444-5555'
    }
  ];

  const getFilteredCustomers = () => {
    let filtered = customers.filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.phone.includes(searchTerm);
      
      const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });

    // Sort customers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'visits':
          return b.totalVisits - a.totalVisits;
        case 'recent':
        default:
          return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
      }
    });

    return filtered;
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600';
  };

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    totalVisits: customers.reduce((sum, c) => sum + c.totalVisits, 0),
    avgVisits: Math.round(customers.reduce((sum, c) => sum + c.totalVisits, 0) / customers.length)
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />
        <main className="pt-4 px-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A8E6CF]"></div>
          </div>
        </main>
        <InterpreterBottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />

      <main className="pt-4">
        <div className="px-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Customer Management</h1>
          <p className="text-gray-600 text-sm">Manage customers who use your interpreter services</p>
        </div>

        {/* Stats Cards */}
        <div className="px-4 mb-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs mb-1">Total Customers</p>
                  <p className="text-2xl font-bold text-[#A8E6CF]">{stats.total}</p>
                </div>
                <div className="w-10 h-10 flex items-center justify-center bg-[#A8E6CF]/20 rounded-full">
                  <i className="ri-user-line text-[#A8E6CF] text-lg"></i>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs mb-1">Active Customers</p>
                  <p className="text-2xl font-bold text-[#FFD3B6]">{stats.active}</p>
                </div>
                <div className="w-10 h-10 flex items-center justify-center bg-[#FFD3B6]/20 rounded-full">
                  <i className="ri-user-heart-line text-[#FFD3B6] text-lg"></i>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs mb-1">Total Visits</p>
                  <p className="text-2xl font-bold text-[#E0BBE4]">{stats.totalVisits}</p>
                </div>
                <div className="w-10 h-10 flex items-center justify-center bg-[#E0BBE4]/20 rounded-full">
                  <i className="ri-calendar-check-line text-[#E0BBE4] text-lg"></i>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs mb-1">Avg Visits</p>
                  <p className="text-2xl font-bold text-blue-500">{stats.avgVisits}</p>
                </div>
                <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-full">
                  <i className="ri-bar-chart-line text-blue-500 text-lg"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="px-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-search-line text-gray-400"></i>
                  </div>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A8E6CF] focus:border-transparent text-sm"
                  placeholder="Search by name, email, or phone number..."
                  suppressHydrationWarning={true}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A8E6CF] focus:border-transparent text-sm pr-8"
                  suppressHydrationWarning={true}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Customers</option>
                  <option value="inactive">Inactive Customers</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A8E6CF] focus:border-transparent text-sm pr-8"
                  suppressHydrationWarning={true}
                >
                  <option value="recent">Recent Visit</option>
                  <option value="name">Name</option>
                  <option value="visits">Visit Count</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Cards */}
        <div className="px-4">
          {getFilteredCustomers().length > 0 ? (
            <div className="space-y-4">
              {getFilteredCustomers().map((customer) => (
                <div key={customer.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4">
                    <div className="flex items-center mb-3 sm:mb-0">
                      <div className="w-12 h-12 flex items-center justify-center bg-[#A8E6CF]/20 rounded-full mr-3 flex-shrink-0">
                        <i className="ri-user-line text-[#A8E6CF] text-lg"></i>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm truncate">{customer.name}</h3>
                        <p className="text-gray-600 text-xs">{customer.nationality}, {customer.age}y, {customer.gender}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
                          <div className="flex items-center text-gray-600 text-xs">
                            <div className="w-3 h-3 flex items-center justify-center mr-1">
                              <i className="ri-mail-line"></i>
                            </div>
                            <span className="truncate">{customer.email}</span>
                          </div>
                          <div className="flex items-center text-gray-600 text-xs">
                            <div className="w-3 h-3 flex items-center justify-center mr-1">
                              <i className="ri-phone-line"></i>
                            </div>
                            <span>{customer.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                        {customer.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                      <p className="text-gray-500 text-xs mt-1">Joined: {customer.joinDate}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-gray-600 text-xs mb-1">Total Visits</p>
                      <p className="text-lg font-semibold text-[#A8E6CF]">{customer.totalVisits}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-gray-600 text-xs mb-1">Completed</p>
                      <p className="text-lg font-semibold text-[#FFD3B6]">{customer.completedReservations}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-gray-600 text-xs mb-1">Upcoming</p>
                      <p className="text-lg font-semibold text-[#E0BBE4]">{customer.upcomingReservations}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-gray-600 text-xs mb-1">Last Visit</p>
                      <p className="text-sm font-semibold text-blue-500">{customer.lastVisit}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Preferred Hospitals</p>
                      <div className="flex flex-wrap gap-1">
                        {customer.preferredHospitals.map((hospital, index) => (
                          <span key={index} className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                            {hospital}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Main Treatments</p>
                      <div className="flex flex-wrap gap-1">
                        {customer.treatments.map((treatment, index) => (
                          <span key={index} className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                            {treatment}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Notes</p>
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{customer.notes}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-gray-600 mb-3 sm:mb-0">
                      <div className="flex items-center">
                        <div className="w-4 h-4 flex items-center justify-center mr-1">
                          <i className="ri-line-fill text-green-500"></i>
                        </div>
                        <span>{customer.lineId}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 flex items-center justify-center mr-1">
                          <i className="ri-contacts-line text-orange-500"></i>
                        </div>
                        <span>{customer.emergencyContact}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Link
                        href={`/interpreter/customers/${customer.id}`}
                        className="flex-1 sm:flex-none bg-[#A8E6CF] text-white px-4 py-2 rounded-lg text-sm font-medium text-center cursor-pointer whitespace-nowrap"
                      >
                        View Timeline
                      </Link>
                      <button 
                        className="flex-1 sm:flex-none bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer whitespace-nowrap"
                        suppressHydrationWarning={true}
                      >
                        <div className="w-4 h-4 flex items-center justify-center mr-1 inline-flex">
                          <i className="ri-phone-line"></i>
                        </div>
                        Contact
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
              <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full mx-auto mb-4">
                <i className="ri-user-line text-gray-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No customers found</h3>
              <p className="text-gray-600">No customers match your search criteria.</p>
            </div>
          )}
        </div>
      </main>

      <InterpreterBottomNavigation />
    </div>
  );
}

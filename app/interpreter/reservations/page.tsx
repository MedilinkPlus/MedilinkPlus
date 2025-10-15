
'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import InterpreterBottomNavigation from '@/components/InterpreterBottomNavigation';
import Link from 'next/link';

export default function InterpreterReservationsPage() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [customerFilter, setCustomerFilter] = useState('All');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [sortBy, setSortBy] = useState('date');
  const [isClient, setIsClient] = useState(false);

  // 이번 달 첫째 날과 마지막 날 계산
  const getCurrentMonthRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    return {
      from: firstDay.toISOString().split('T')[0],
      to: lastDay.toISOString().split('T')[0]
    };
  };

  // Set default dates to current month and enable client-side rendering
  useEffect(() => {
    setIsClient(true);
    const currentMonth = getCurrentMonthRange();
    setDateRange(currentMonth);
  }, []);

  const reservations = [
    {
      id: 1,
      reservationId: 'R-2024-001',
      customerName: 'Siriporn T.',
      date: '2024-02-28',
      time: '10:00 AM',
      hospital: 'Seoul Dental Excellence',
      department: 'Dental Care',
      doctor: 'Dr. Park Min-jun',
      treatment: 'Dental Implant Follow-up',
      status: 'confirmed',
      fee: 80000,
      duration: '1.5 hours',
      location: 'Room 205',
      notes: 'Post-implant check-up, patient may need additional care instructions'
    },
    {
      id: 2,
      reservationId: 'R-2024-002',
      customerName: 'Panida S.',
      date: '2024-03-05',
      time: '2:30 PM',
      hospital: 'Gangnam Beauty Clinic',
      department: 'Plastic Surgery',
      doctor: 'Dr. Kim So-young',
      treatment: 'Rhinoplasty Pre-surgery Consultation',
      status: 'confirmed',
      fee: 100000,
      duration: '2 hours',
      location: 'Consultation Room B',
      notes: 'First consultation for rhinoplasty, detailed explanation needed'
    },
    {
      id: 3,
      reservationId: 'R-2024-003',
      customerName: 'Wirat M.',
      date: '2024-02-26',
      time: '9:00 AM',
      hospital: 'Samsung Medical Center',
      department: 'Cardiology',
      doctor: 'Dr. Lee Chang-woo',
      treatment: 'Heart Check-up',
      status: 'confirmed',
      fee: 120000,
      duration: '1 hour',
      location: 'Cardiology Wing, Room 301',
      notes: 'Routine cardiology check-up, ECG and consultation'
    },
    {
      id: 4,
      reservationId: 'R-2024-004',
      customerName: 'Malee T.',
      date: '2024-02-24',
      time: '11:30 AM',
      hospital: 'Seoul Dental Excellence',
      department: 'Dental Care',
      doctor: 'Dr. Jung Hye-jin',
      treatment: 'Cavity Treatment',
      status: 'confirmed',
      fee: 60000,
      duration: '1 hour',
      location: 'Treatment Room 3',
      notes: 'Follow-up cavity treatment, second session'
    },
    {
      id: 5,
      reservationId: 'R-2024-005',
      customerName: 'Nattaya K.',
      date: '2024-02-20',
      time: '3:00 PM',
      hospital: 'Myeongdong Medical Center',
      department: 'Dermatology',
      doctor: 'Dr. Choi Min-ho',
      treatment: 'Skin Consultation',
      status: 'completed',
      fee: 70000,
      duration: '45 minutes',
      location: 'Dermatology Clinic',
      notes: 'Completed skin treatment consultation'
    },
    {
      id: 6,
      reservationId: 'R-2024-006',
      customerName: 'Lawan P.',
      date: '2024-02-18',
      time: '1:00 PM',
      hospital: 'Apgujeong Skin Clinic',
      department: 'Dermatology',
      doctor: 'Dr. Yoon Ji-hye',
      treatment: 'Laser Treatment',
      status: 'completed',
      fee: 90000,
      duration: '1.5 hours',
      location: 'Laser Treatment Room',
      notes: 'Completed laser skin treatment session'
    }
  ];

  // Get unique customers for filter dropdown
  const uniqueCustomers = [...new Set(reservations.map(res => res.customerName))];

  const getFilteredReservations = () => {
    let filtered = reservations;

    // Status 필터링
    if (statusFilter !== 'All') {
      filtered = filtered.filter(res => res.status === statusFilter.toLowerCase());
    }

    // Customer 필터링
    if (customerFilter !== 'All') {
      filtered = filtered.filter(res => res.customerName === customerFilter);
    }

    // 날짜 범위 필터링
    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter(res => {
        const resDate = new Date(res.date);
        const fromDate = new Date(dateRange.from);
        const toDate = new Date(dateRange.to);
        return resDate >= fromDate && resDate <= toDate;
      });
    }

    // 정렬
    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy === 'hospital') {
      filtered.sort((a, b) => a.hospital.localeCompare(b.hospital));
    } else if (sortBy === 'fee') {
      filtered.sort((a, b) => b.fee - a.fee);
    } else if (sortBy === 'customer') {
      filtered.sort((a, b) => a.customerName.localeCompare(b.customerName));
    }

    return filtered;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-600';
      case 'completed':
        return 'bg-blue-100 text-blue-600';
      case 'cancelled':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  const filteredReservations = getFilteredReservations();
  const totalEarnings = filteredReservations
    .filter(res => res.status === 'completed')
    .reduce((sum, res) => sum + res.fee, 0);

  // Show loading state until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />
        <main className="pt-4">
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
          <h1 className="text-2xl font-bold text-gray-800 mb-2">My Reservations</h1>
          <p className="text-gray-600 text-sm">Manage your interpreter appointments</p>
        </div>

        {/* Summary Cards */}
        <div className="px-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="w-10 h-10 flex items-center justify-center bg-[#A8E6CF]/20 rounded-full mr-3">
                  <i className="ri-calendar-check-line text-[#A8E6CF]"></i>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">This Month</p>
                  <p className="font-bold text-gray-800">{filteredReservations.filter(res => res.status === 'confirmed').length} bookings</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="w-10 h-10 flex items-center justify-center bg-[#FFD3B6]/20 rounded-full mr-3">
                  <i className="ri-money-dollar-circle-line text-[#FFD3B6]"></i>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Total Earned</p>
                  <p className="font-bold text-gray-800 text-sm">{formatCurrency(totalEarnings)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="grid grid-cols-1 gap-4">
              {/* Status and Customer Filters - Same Level */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#A8E6CF] pr-8"
                    suppressHydrationWarning={true}
                  >
                    <option value="All">All Status</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
                  <select
                    value={customerFilter}
                    onChange={(e) => setCustomerFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#A8E6CF] pr-8"
                    suppressHydrationWarning={true}
                  >
                    <option value="All">All Customers</option>
                    {uniqueCustomers.map((customer) => (
                      <option key={customer} value={customer}>{customer}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">From</label>
                    <input
                      type="date"
                      value={dateRange.from}
                      onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#A8E6CF]"
                      suppressHydrationWarning={true}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">To</label>
                    <input
                      type="date"
                      value={dateRange.to}
                      onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#A8E6CF]"
                      suppressHydrationWarning={true}
                    />
                  </div>
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#A8E6CF] pr-8"
                  suppressHydrationWarning={true}
                >
                  <option value="date">By date</option>
                  <option value="hospital">By hospital</option>
                  <option value="fee">By fee</option>
                  <option value="customer">By customer</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Reservations List */}
        <div className="px-4">
          {filteredReservations.length > 0 ? (
            <div className="space-y-4">
              {filteredReservations.map((reservation) => (
                <div key={reservation.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center mb-1">
                        <h3 className="font-semibold text-gray-800 text-sm mr-2">{reservation.customerName}</h3>
                        <span className="text-gray-500 text-xs">#{reservation.reservationId}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 flex items-center justify-center mr-1">
                          <i className="ri-calendar-line text-[#A8E6CF] text-sm"></i>
                        </div>
                        <span className="text-gray-600 text-sm font-medium">
                          {reservation.date} • {reservation.time}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                      {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center mb-1">
                      <div className="w-4 h-4 flex items-center justify-center mr-2">
                        <i className="ri-hospital-line text-[#FFD3B6] text-sm"></i>
                      </div>
                      <span className="text-gray-700 text-sm font-medium">{reservation.hospital}</span>
                    </div>

                    <div className="flex items-center mb-1">
                      <div className="w-4 h-4 flex items-center justify-center mr-2">
                        <i className="ri-stethoscope-line text-[#E0BBE4] text-sm"></i>
                      </div>
                      <span className="text-gray-600 text-sm">{reservation.department} • {reservation.treatment}</span>
                    </div>

                    <div className="flex items-center mb-1">
                      <div className="w-4 h-4 flex items-center justify-center mr-2">
                        <i className="ri-user-line text-gray-400 text-sm"></i>
                      </div>
                      <span className="text-gray-600 text-sm">{reservation.doctor}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div className="flex items-center">
                        <div className="w-4 h-4 flex items-center justify-center mr-2">
                          <i className="ri-time-line text-gray-400 text-sm"></i>
                        </div>
                        <span className="text-gray-600 text-sm">{reservation.duration}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 flex items-center justify-center mr-2">
                          <i className="ri-money-dollar-circle-line text-green-500 text-sm"></i>
                        </div>
                        <span className="text-gray-600 text-sm font-medium">{formatCurrency(reservation.fee)}</span>
                      </div>
                    </div>
                  </div>

                  {reservation.notes && (
                    <div className="mb-3">
                      <p className="text-gray-600 text-sm bg-gray-50 p-2 rounded-lg">
                        <i className="ri-information-line text-gray-400 mr-1"></i>
                        {reservation.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Link
                      href={`/interpreter/reservations/${reservation.id}`}
                      className="flex-1 bg-[#A8E6CF] text-white text-center py-2 rounded-full text-sm font-medium cursor-pointer whitespace-nowrap"
                    >
                      View Details
                    </Link>
                    {reservation.status === 'confirmed' && (
                      <Link
                        href={`/interpreter/customers/${reservation.id}`}
                        className="flex-1 bg-gray-100 text-gray-700 text-center py-2 rounded-full text-sm font-medium cursor-pointer whitespace-nowrap"
                      >
                        Customer Info
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
              <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded-full mx-auto mb-4">
                <i className="ri-calendar-line text-gray-400 text-2xl"></i>
              </div>
              <h3 className="font-medium text-gray-800 mb-2">No reservations found</h3>
              <p className="text-gray-600 text-sm">
                {statusFilter !== 'All' || customerFilter !== 'All' || dateRange.from || dateRange.to
                  ? 'Try adjusting your filters to see more results'
                  : 'Your confirmed reservations will appear here'
                }
              </p>
            </div>
          )}
        </div>
      </main>

      <InterpreterBottomNavigation />
    </div>
  );
}
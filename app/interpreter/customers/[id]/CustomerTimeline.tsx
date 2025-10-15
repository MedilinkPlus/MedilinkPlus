
'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import InterpreterBottomNavigation from '@/components/InterpreterBottomNavigation';
import Link from 'next/link';

interface CustomerTimelineProps {
  params: { id: string };
}

export default function CustomerTimelinePage({ params }: CustomerTimelineProps) {
  const customerId = params.id;

  const customers = {
    '1': {
      id: 1,
      name: 'Siriporn T.',
      anonymizedId: 'ST-2024-001',
      joinedDate: '2024-01-15',
      totalAppointments: 3,
      status: 'active',
      phone: '+66-81-234-5678',
      email: 'siriporn.t@email.com',
      lineId: 'siriporn_thai',
      age: 32,
      gender: 'Female',
      nationality: 'Thai'
    }
  };

  const timelineEvents = [
    {
      id: 1,
      type: 'request_created',
      title: 'Initial Request',
      description: 'Customer requested interpreter services for dental consultation',
      date: '2024-01-15',
      time: '10:30 AM',
      status: 'completed',
      icon: 'ri-mail-line',
      color: 'bg-blue-500'
    },
    {
      id: 2,
      type: 'request_accepted',
      title: 'Request Accepted',
      description: 'You accepted the interpreter request',
      date: '2024-01-15',
      time: '11:45 AM',
      status: 'completed',
      icon: 'ri-check-line',
      color: 'bg-green-500'
    },
    {
      id: 3,
      type: 'reservation_created',
      title: 'Reservation Scheduled',
      description: 'Appointment booked at Seoul Dental Excellence for dental consultation',
      date: '2024-01-16',
      time: '2:00 PM',
      status: 'completed',
      icon: 'ri-calendar-line',
      color: 'bg-[#A8E6CF]',
      reservationId: 'R001'
    },
    {
      id: 4,
      type: 'appointment_completed',
      title: 'First Appointment Completed',
      description: 'Dental consultation with Dr. Park completed successfully',
      date: '2024-01-20',
      time: '10:00 AM',
      status: 'completed',
      icon: 'ri-hospital-line',
      color: 'bg-[#FFD3B6]',
      reservationId: 'R001'
    },
    {
      id: 5,
      type: 'review_posted',
      title: 'Review Posted',
      description: 'Customer posted 5-star review for interpreter services',
      date: '2024-01-21',
      time: '3:30 PM',
      status: 'completed',
      icon: 'ri-star-line',
      color: 'bg-yellow-500'
    },
    {
      id: 6,
      type: 'followup_scheduled',
      title: 'Follow-up Scheduled',
      description: 'Follow-up appointment scheduled for dental implant procedure',
      date: '2024-01-25',
      time: '1:15 PM',
      status: 'completed',
      icon: 'ri-calendar-check-line',
      color: 'bg-[#E0BBE4]',
      reservationId: 'R002'
    },
    {
      id: 7,
      type: 'appointment_completed',
      title: 'Follow-up Completed',
      description: 'Dental implant consultation completed',
      date: '2024-02-05',
      time: '11:00 AM',
      status: 'completed',
      icon: 'ri-hospital-line',
      color: 'bg-[#FFD3B6]',
      reservationId: 'R002'
    },
    {
      id: 8,
      type: 'followup_scheduled',
      title: 'Next Follow-up Scheduled',
      description: 'Post-implant check-up scheduled',
      date: '2024-02-14',
      time: '4:00 PM',
      status: 'scheduled',
      icon: 'ri-calendar-line',
      color: 'bg-[#A8E6CF]',
      reservationId: 'R003'
    },
    {
      id: 9,
      type: 'appointment_upcoming',
      title: 'Upcoming Appointment',
      description: 'Dental implant follow-up check scheduled',
      date: '2024-02-28',
      time: '10:00 AM',
      status: 'upcoming',
      icon: 'ri-time-line',
      color: 'bg-blue-400',
      reservationId: 'R003'
    }
  ];

  const customer = customers[customerId as keyof typeof customers];

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />
        <main className="pt-4">
          <div className="px-4 text-center py-20">
            <h1 className="text-xl font-bold text-gray-800">Customer not found</h1>
          </div>
        </main>
        <InterpreterBottomNavigation />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'scheduled': return 'text-[#A8E6CF]';
      case 'upcoming': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      
      <main className="pt-4">
        <div className="px-4 mb-6">
          <Link href="/interpreter/customers" className="flex items-center text-gray-600 mb-4 cursor-pointer whitespace-nowrap">
            <div className="w-4 h-4 flex items-center justify-center mr-2">
              <i className="ri-arrow-left-line"></i>
            </div>
            <span className="text-sm">Back to Customers</span>
          </Link>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-[#A8E6CF]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-user-heart-line text-[#A8E6CF] text-2xl"></i>
              </div>
              <h1 className="text-xl font-bold text-gray-800">{customer.name}</h1>
              <p className="text-gray-500 text-sm">Customer ID: {customer.anonymizedId}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full mx-auto mb-1">
                  <i className="ri-calendar-line text-blue-600"></i>
                </div>
                <p className="text-gray-500">Member Since</p>
                <p className="font-semibold text-gray-800">{customer.joinedDate}</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 flex items-center justify-center bg-green-100 rounded-full mx-auto mb-1">
                  <i className="ri-hospital-line text-green-600"></i>
                </div>
                <p className="text-gray-500">Total Visits</p>
                <p className="font-semibold text-gray-800">{customer.totalAppointments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="px-4 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Customer Information</h2>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 flex items-center justify-center mr-2">
                    <i className="ri-user-line text-gray-400"></i>
                  </div>
                  <span className="text-gray-500">Age & Gender</span>
                </div>
                <p className="font-medium text-gray-800">{customer.age} years, {customer.gender}</p>
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 flex items-center justify-center mr-2">
                    <i className="ri-global-line text-gray-400"></i>
                  </div>
                  <span className="text-gray-500">Nationality</span>
                </div>
                <p className="font-medium text-gray-800">{customer.nationality}</p>
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 flex items-center justify-center mr-2">
                    <i className="ri-phone-line text-gray-400"></i>
                  </div>
                  <span className="text-gray-500">Phone</span>
                </div>
                <p className="font-medium text-gray-800">{customer.phone}</p>
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 flex items-center justify-center mr-2">
                    <i className="ri-chat-3-line text-gray-400"></i>
                  </div>
                  <span className="text-gray-500">LINE ID</span>
                </div>
                <p className="font-medium text-gray-800">{customer.lineId}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="px-4 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Customer Timeline</h2>
          
          <div className="space-y-4">
            {timelineEvents.map((event, index) => (
              <div key={event.id} className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className={`w-10 h-10 rounded-full ${event.color} flex items-center justify-center`}>
                    <i className={`${event.icon} text-white`}></i>
                  </div>
                  {index < timelineEvents.length - 1 && (
                    <div className="w-0.5 h-6 bg-gray-200 mt-2"></div>
                  )}
                </div>
                
                <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">{event.title}</h3>
                      <p className="text-gray-600 text-sm">{event.description}</p>
                    </div>
                    <span className={`text-xs font-medium ${getStatusColor(event.status)}`}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                      <div className="w-3 h-3 flex items-center justify-center mr-1">
                        <i className="ri-calendar-line"></i>
                      </div>
                      <span>{event.date}</span>
                      <span className="mx-1">•</span>
                      <div className="w-3 h-3 flex items-center justify-center mr-1">
                        <i className="ri-time-line"></i>
                      </div>
                      <span>{event.time}</span>
                    </div>
                    
                    {event.reservationId && (
                      <div className="flex space-x-2">
                        <Link
                          href={`/reservations/${event.reservationId}`}
                          className="bg-[#A8E6CF] text-white px-3 py-1 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap"
                        >
                          Open Reservation
                        </Link>
                        {event.type === 'followup_scheduled' && event.status === 'scheduled' && (
                          <Link
                            href={`/interpreter/followup/${event.id}`}
                            className="bg-[#FFD3B6] text-white px-3 py-1 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap"
                          >
                            Open Follow-up
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <InterpreterBottomNavigation />
    </div>
  );
}

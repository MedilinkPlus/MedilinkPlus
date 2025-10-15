
'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import InterpreterBottomNavigation from '@/components/InterpreterBottomNavigation';
import Link from 'next/link';

interface InterpreterReservationDetailProps {
  reservationId: string;
}

export default function InterpreterReservationDetail({ reservationId }: InterpreterReservationDetailProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    time: '',
    reason: ''
  });

  const reservations = {
    '1': {
      id: 1,
      reservationId: 'R-2024-001',
      customerName: 'Siriporn T.',
      customerId: 'ST-2024-001',
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
      address: '123 Gangnam-daero, Gangnam-gu, Seoul',
      hospitalPhone: '+82-2-1234-5678',
      notes: 'Post-implant check-up, patient may need additional care instructions',
      customerPhone: '+66-81-234-5678',
      customerEmail: 'siriporn.t@email.com',
      customerLineId: 'siriporn_thai',
      specialRequests: 'Customer prefers detailed explanations about post-care',
      medicalHistory: 'Previous dental work in 2023, no allergies reported',
      interpreterNotes: ''
    },
    '2': {
      id: 2,
      reservationId: 'R-2024-002',
      customerName: 'Panida S.',
      customerId: 'PS-2024-002',
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
      address: '456 Apgujeong-ro, Gangnam-gu, Seoul',
      hospitalPhone: '+82-2-2345-6789',
      notes: 'First consultation for rhinoplasty, detailed explanation needed',
      customerPhone: '+66-82-345-6789',
      customerEmail: 'panida.s@email.com',
      customerLineId: 'panida_beauty',
      specialRequests: 'Wants to understand all risks and recovery process',
      medicalHistory: 'No previous surgeries, good overall health',
      interpreterNotes: ''
    }
  };

  const reservation = reservations[reservationId as keyof typeof reservations];

  if (!reservation) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />
        <main className="pt-4">
          <div className="px-4 text-center py-20">
            <h1 className="text-xl font-bold text-gray-800">Reservation not found</h1>
          </div>
        </main>
        <InterpreterBottomNavigation />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-600';
      case 'completed': return 'bg-blue-100 text-blue-600';
      case 'cancelled': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  const handleRescheduleSubmit = () => {
    if (!rescheduleData.date || !rescheduleData.time || !rescheduleData.reason) {
      alert('Please fill in all required fields');
      return;
    }

    // Here you would typically send the reschedule request to your backend
    alert(`Reschedule request submitted for ${reservation.customerName}. New date: ${rescheduleData.date} at ${rescheduleData.time}. Customer will be notified.`);
    
    setShowRescheduleModal(false);
    setRescheduleData({ date: '', time: '', reason: '' });
  };

  const handleCancelReservation = () => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (reason) {
      alert(`Reservation cancelled. Customer ${reservation.customerName} will be notified. Reason: ${reason}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      
      <main className="pt-4">
        <div className="px-4 mb-6">
          <Link href="/interpreter/reservations" className="flex items-center text-gray-600 mb-4 cursor-pointer whitespace-nowrap">
            <div className="w-4 h-4 flex items-center justify-center mr-2">
              <i className="ri-arrow-left-line"></i>
            </div>
            <span className="text-sm">Back to Reservations</span>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Reservation Details</h1>
              <p className="text-gray-600 text-sm">#{reservation.reservationId}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}>
              {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Customer & Appointment Info */}
        <div className="px-4 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-[#A8E6CF]/20 rounded-full flex items-center justify-center mr-4">
                <i className="ri-user-heart-line text-[#A8E6CF] text-xl"></i>
              </div>
              <div>
                <h2 className="font-bold text-gray-800">{reservation.customerName}</h2>
                <p className="text-gray-500 text-sm">ID: {reservation.customerId}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center">
                <div className="w-5 h-5 flex items-center justify-center mr-3">
                  <i className="ri-calendar-line text-[#A8E6CF]"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{reservation.date} at {reservation.time}</p>
                  <p className="text-gray-500 text-sm">Duration: {reservation.duration}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-5 h-5 flex items-center justify-center mr-3 mt-0.5">
                  <i className="ri-hospital-line text-[#FFD3B6]"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{reservation.hospital}</p>
                  <p className="text-gray-600 text-sm">{reservation.department}</p>
                  <p className="text-gray-500 text-sm">{reservation.location}</p>
                  <p className="text-gray-500 text-xs">{reservation.address}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-5 h-5 flex items-center justify-center mr-3">
                  <i className="ri-user-line text-[#E0BBE4]"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{reservation.doctor}</p>
                  <p className="text-gray-600 text-sm">{reservation.treatment}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fee Information */}
        <div className="px-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 flex items-center justify-center bg-green-100 rounded-full mr-3">
                  <i className="ri-money-dollar-circle-line text-green-600"></i>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Interpreter Fee</p>
                  <p className="font-bold text-gray-800 text-lg">{formatCurrency(reservation.fee)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-xs">Payment Status</p>
                <p className="text-green-600 text-sm font-medium">
                  {reservation.status === 'completed' ? 'Paid' : 'Pending'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="px-4 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Contact Information</h3>
          <div className="space-y-4">
            {/* Hospital Contact */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                <div className="w-5 h-5 flex items-center justify-center mr-2">
                  <i className="ri-hospital-line text-[#FFD3B6]"></i>
                </div>
                Hospital Contact
              </h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 flex items-center justify-center mr-2">
                    <i className="ri-phone-line text-gray-400"></i>
                  </div>
                  <span className="text-gray-700 text-sm">{reservation.hospitalPhone}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 flex items-center justify-center mr-2">
                    <i className="ri-map-pin-line text-gray-400"></i>
                  </div>
                  <span className="text-gray-700 text-sm">{reservation.address}</span>
                </div>
              </div>
            </div>

            {/* Customer Contact */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                <div className="w-5 h-5 flex items-center justify-center mr-2">
                  <i className="ri-user-line text-[#A8E6CF]"></i>
                </div>
                Customer Contact
              </h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 flex items-center justify-center mr-2">
                    <i className="ri-phone-line text-gray-400"></i>
                  </div>
                  <span className="text-gray-700 text-sm">{reservation.customerPhone}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 flex items-center justify-center mr-2">
                    <i className="ri-mail-line text-gray-400"></i>
                  </div>
                  <span className="text-gray-700 text-sm">{reservation.customerEmail}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 flex items-center justify-center mr-2">
                    <i className="ri-chat-3-line text-gray-400"></i>
                  </div>
                  <span className="text-gray-700 text-sm">{reservation.customerLineId}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="px-4 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Medical Information</h3>
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h4 className="font-medium text-gray-800 mb-2">Special Requests</h4>
              <p className="text-gray-600 text-sm">{reservation.specialRequests}</p>
            </div>
            
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h4 className="font-medium text-gray-800 mb-2">Medical History Notes</h4>
              <p className="text-gray-600 text-sm">{reservation.medicalHistory}</p>
            </div>
            
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h4 className="font-medium text-gray-800 mb-2">Appointment Notes</h4>
              <p className="text-gray-600 text-sm">{reservation.notes}</p>
            </div>
          </div>
        </div>

        {/* Interpreter Notes */}
        <div className="px-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-800">My Notes</h3>
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="text-[#A8E6CF] text-sm font-medium cursor-pointer whitespace-nowrap"
              >
                {showNotes ? 'Hide' : 'Add Notes'}
              </button>
            </div>
            
            {showNotes && (
              <div>
                <textarea
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#A8E6CF] h-20 resize-none"
                  placeholder="Add your notes about this appointment..."
                  maxLength={300}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">0/300 characters</span>
                  <button className="bg-[#A8E6CF] text-white px-3 py-1 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap">
                    Save Notes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 mb-8">
          <div className="space-y-3">
            <Link
              href={`/interpreter/customers/${reservation.customerId}`}
              className="w-full bg-[#A8E6CF] text-white text-center py-3 rounded-xl font-medium cursor-pointer whitespace-nowrap block"
            >
              View Customer Timeline
            </Link>
            
            {reservation.status === 'confirmed' && (
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowRescheduleModal(true)}
                  className="bg-gray-100 text-gray-700 py-3 rounded-xl font-medium cursor-pointer whitespace-nowrap"
                >
                  Reschedule
                </button>
                <button 
                  onClick={handleCancelReservation}
                  className="bg-red-100 text-red-600 py-3 rounded-xl font-medium cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Reschedule Appointment</h3>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full cursor-pointer whitespace-nowrap"
              >
                <i className="ri-close-line text-gray-600"></i>
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-blue-50 p-4 rounded-2xl">
                <div className="flex items-center mb-2">
                  <div className="w-5 h-5 flex items-center justify-center mr-2">
                    <i className="ri-information-line text-blue-600"></i>
                  </div>
                  <p className="text-blue-800 font-medium text-sm">Current Appointment</p>
                </div>
                <p className="text-blue-700 text-sm">
                  {reservation.date} at {reservation.time}
                </p>
                <p className="text-blue-600 text-xs">
                  {reservation.hospital} - {reservation.treatment}
                </p>
              </div>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Date *
                </label>
                <input
                  type="date"
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] text-sm"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Time *
                </label>
                <input
                  type="time"
                  value={rescheduleData.time}
                  onChange={(e) => setRescheduleData({...rescheduleData, time: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rescheduling *
                </label>
                <textarea
                  value={rescheduleData.reason}
                  onChange={(e) => setRescheduleData({...rescheduleData, reason: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] text-sm h-24 resize-none"
                  placeholder="Please explain why you need to reschedule this appointment..."
                  maxLength={200}
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  {rescheduleData.reason.length}/200 characters
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-2xl">
                <div className="flex items-start">
                  <div className="w-5 h-5 flex items-center justify-center mr-2 mt-0.5">
                    <i className="ri-alert-line text-yellow-600"></i>
                  </div>
                  <div>
                    <p className="text-yellow-800 font-medium text-sm mb-1">Important Notice</p>
                    <p className="text-yellow-700 text-xs">
                      The customer and hospital will be notified of this reschedule request. 
                      Please ensure the new time works for all parties before submitting.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRescheduleSubmit}
                  className="flex-1 px-4 py-3 bg-[#A8E6CF] text-white rounded-xl font-medium cursor-pointer whitespace-nowrap"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <InterpreterBottomNavigation />
    </div>
  );
}

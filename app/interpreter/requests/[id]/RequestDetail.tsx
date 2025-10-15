'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import InterpreterBottomNavigation from '@/components/InterpreterBottomNavigation';
import Link from 'next/link';

interface RequestDetailProps {
  requestId: string;
}

export default function RequestDetail({ requestId }: RequestDetailProps) {
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const requests = {
    '1': {
      id: 1,
      customerName: 'Nattaya K.',
      customerAge: 28,
      customerGender: 'Female',
      customerLineId: 'nattaya_bkk',
      pastReservations: 3,
      requestedDate: '2024-02-15',
      requestedTime: '11:00 AM',
      preferredTimeRange: '10:00 AM - 12:00 PM',
      hospital: 'Myeongdong Medical Center',
      department: 'Dermatology',
      doctorPreference: 'Dr. Park (if available)',
      notes: 'Need consultation about skin treatment options. I have acne scarring and would like to discuss laser treatment possibilities. Prefer morning appointments.',
      specialRequests: 'Please bring medical history translation if possible',
      createdAt: '2024-02-12T10:30:00',
      status: 'pending',
      urgency: 'normal'
    },
    '2': {
      id: 2,
      customerName: 'Somchai P.',
      customerAge: 35,
      customerGender: 'Male',
      customerLineId: 'somchai_bkk',
      pastReservations: 1,
      requestedDate: '2024-02-16',
      requestedTime: '3:00 PM',
      preferredTimeRange: '2:00 PM - 4:00 PM',
      hospital: 'Samsung Medical Center',
      department: 'General Surgery',
      doctorPreference: 'Any available surgeon',
      notes: 'Pre-surgery consultation for appendix removal. Need detailed explanation of procedure.',
      specialRequests: 'Please arrange for Thai translation materials',
      createdAt: '2024-02-12T14:15:00',
      status: 'pending',
      urgency: 'high'
    },
    '3': {
      id: 3,
      customerName: 'Siriporn T.',
      customerAge: 32,
      customerGender: 'Female',
      customerLineId: 'siriporn_thai',
      pastReservations: 3,
      requestedDate: '2024-02-14',
      requestedTime: '10:00 AM',
      preferredTimeRange: '9:00 AM - 11:00 AM',
      hospital: 'Seoul Dental Excellence',
      department: 'Dental Care',
      doctorPreference: 'Dr. Kim (regular dentist)',
      notes: 'Follow-up after dental implant procedure. Check healing progress.',
      specialRequests: 'Morning appointment preferred due to work schedule',
      createdAt: '2024-02-11T16:20:00',
      status: 'accepted',
      urgency: 'normal'
    },
    '4': {
      id: 4,
      customerName: 'Panida S.',
      customerAge: 29,
      customerGender: 'Female',
      customerLineId: 'panida_beauty',
      pastReservations: 0,
      requestedDate: '2024-02-13',
      requestedTime: '2:30 PM',
      preferredTimeRange: '1:00 PM - 4:00 PM',
      hospital: 'Gangnam Beauty Clinic',
      department: 'Plastic Surgery',
      doctorPreference: 'Dr. Lee (rhinoplasty specialist)',
      notes: 'Initial consultation for rhinoplasty. First-time patient, very nervous about procedure.',
      specialRequests: 'Need detailed explanation of costs and recovery time',
      createdAt: '2024-02-10T11:45:00',
      status: 'accepted',
      urgency: 'normal'
    },
    '5': {
      id: 5,
      customerName: 'Wirat M.',
      customerAge: 45,
      customerGender: 'Male',
      customerLineId: 'wirat_health',
      pastReservations: 2,
      requestedDate: '2024-02-12',
      requestedTime: '9:00 AM',
      preferredTimeRange: '8:00 AM - 10:00 AM',
      hospital: 'Samsung Medical Center',
      department: 'Cardiology',
      doctorPreference: 'Dr. Choi (cardiologist)',
      notes: 'Heart check-up following previous ECG results. Family history of heart disease.',
      specialRequests: 'Please bring previous medical records',
      createdAt: '2024-02-09T13:30:00',
      status: 'rejected',
      urgency: 'normal'
    }
  };

  const request = requests[requestId as keyof typeof requests];

  const handleAccept = () => {
    setShowAcceptModal(true);
    setTimeout(() => {
      setShowAcceptModal(false);
    }, 3000);
  };

  const handleReject = () => {
    setShowRejectModal(true);
    setTimeout(() => {
      setShowRejectModal(false);
    }, 2000);
  };

  const formatCreatedAt = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Request not found</h2>
          <Link href="/interpreter/requests" className="text-[#A8E6CF] cursor-pointer whitespace-nowrap">
            Back to requests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      
      <main className="pt-4">
        <div className="px-4 mb-6">
          <Link href="/interpreter/requests" className="flex items-center text-gray-600 mb-4 cursor-pointer whitespace-nowrap">
            <div className="w-4 h-4 flex items-center justify-center mr-2">
              <i className="ri-arrow-left-line"></i>
            </div>
            <span className="text-sm">Back to Requests</span>
          </Link>
          
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Request Details</h1>
            <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-sm font-medium">
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Customer Information */}
        <div className="px-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <div className="w-5 h-5 flex items-center justify-center mr-2">
                <i className="ri-user-line text-[#A8E6CF]"></i>
              </div>
              Customer Information
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-gray-600 text-sm w-24">Name:</span>
                <span className="text-gray-800 font-medium text-sm">{request.customerName}</span>
              </div>
              
              <div className="flex items-center">
                <span className="text-gray-600 text-sm w-24">Age:</span>
                <span className="text-gray-800 text-sm">{request.customerAge} years old</span>
              </div>
              
              <div className="flex items-center">
                <span className="text-gray-600 text-sm w-24">Gender:</span>
                <span className="text-gray-800 text-sm">{request.customerGender}</span>
              </div>
              
              {request.customerLineId && (
                <div className="flex items-center">
                  <span className="text-gray-600 text-sm w-24">LINE ID:</span>
                  <div className="flex items-center">
                    <div className="w-4 h-4 flex items-center justify-center mr-1">
                      <i className="ri-chat-3-line text-green-500"></i>
                    </div>
                    <span className="text-gray-800 text-sm">{request.customerLineId}</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center">
                <span className="text-gray-600 text-sm w-24">History:</span>
                <span className="text-gray-800 text-sm">{request.pastReservations} past reservations</span>
              </div>
            </div>
          </div>
        </div>

        {/* Request Information */}
        <div className="px-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <div className="w-5 h-5 flex items-center justify-center mr-2">
                <i className="ri-calendar-line text-[#FFD3B6]"></i>
              </div>
              Appointment Request
            </h3>
            
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 text-sm block mb-1">Preferred Date & Time:</span>
                <div className="bg-[#A8E6CF]/10 p-3 rounded-lg">
                  <p className="font-medium text-gray-800">{request.requestedDate}</p>
                  <p className="text-gray-700 text-sm">Preferred: {request.requestedTime}</p>
                  <p className="text-gray-600 text-xs">Flexible time: {request.preferredTimeRange}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <span className="text-gray-600 text-sm w-20">Hospital:</span>
                <span className="text-gray-800 font-medium text-sm">{request.hospital}</span>
              </div>
              
              <div className="flex items-center">
                <span className="text-gray-600 text-sm w-20">Department:</span>
                <span className="text-gray-800 text-sm">{request.department}</span>
              </div>
              
              {request.doctorPreference && (
                <div className="flex items-center">
                  <span className="text-gray-600 text-sm w-20">Doctor:</span>
                  <span className="text-gray-800 text-sm">{request.doctorPreference}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notes and Special Requests */}
        <div className="px-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <div className="w-5 h-5 flex items-center justify-center mr-2">
                <i className="ri-file-text-line text-[#E0BBE4]"></i>
              </div>
              Additional Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <span className="text-gray-600 text-sm block mb-2">Customer Notes:</span>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-800 text-sm">{request.notes}</p>
                </div>
              </div>
              
              {request.specialRequests && (
                <div>
                  <span className="text-gray-600 text-sm block mb-2">Special Requests:</span>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-blue-800 text-sm">{request.specialRequests}</p>
                  </div>
                </div>
              )}
              
              <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                Request submitted: {formatCreatedAt(request.createdAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {request.status === 'pending' && (
          <div className="px-4 mb-8">
            <div className="flex space-x-4">
              <button
                onClick={handleReject}
                className="flex-1 bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-2xl font-semibold cursor-pointer whitespace-nowrap"
              >
                Reject Request
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 bg-[#FFB6C1] text-white py-4 rounded-2xl font-semibold cursor-pointer whitespace-nowrap"
              >
                Accept Request
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Accept Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <div className="w-16 h-16 flex items-center justify-center bg-[#FFB6C1] rounded-full mx-auto mb-4">
              <i className="ri-check-line text-white text-2xl"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Request Accepted!</h3>
            <p className="text-gray-600 text-sm mb-4">
              Reservation will be coordinated. You'll be notified with confirmation details.
            </p>
            <div className="flex space-x-3">
              <Link
                href="/interpreter/dashboard"
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-full text-sm font-medium cursor-pointer whitespace-nowrap text-center"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/interpreter/reservations/create"
                className="flex-1 bg-[#FFB6C1] text-white py-2 rounded-full text-sm font-medium cursor-pointer whitespace-nowrap text-center"
              >
                Create Reservation
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <div className="w-16 h-16 flex items-center justify-center bg-red-500 rounded-full mx-auto mb-4">
              <i className="ri-close-line text-white text-2xl"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Request Rejected</h3>
            <p className="text-gray-600 text-sm">The customer will be notified of your decision.</p>
          </div>
        </div>
      )}
      
      <InterpreterBottomNavigation />
    </div>
  );
}
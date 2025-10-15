
'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import InterpreterBottomNavigation from '@/components/InterpreterBottomNavigation';
import Link from 'next/link';

export default function InterpreterRequestsPage() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [requests, setRequests] = useState([
    {
      id: 1,
      customerName: 'Nattaya K.',
      requestedDate: '2024-02-15',
      requestedTime: '11:00 AM',
      hospital: 'Myeongdong Medical Center',
      department: 'Dermatology',
      notes: 'Need consultation about skin treatment options',
      createdAt: '2024-02-12T10:30:00',
      status: 'pending'
    },
    {
      id: 2,
      customerName: 'Somchai P.',
      requestedDate: '2024-02-16',
      requestedTime: '3:00 PM',
      hospital: 'Not specified',
      department: 'General Surgery',
      notes: 'Pre-surgery consultation, prefer afternoon appointment',
      createdAt: '2024-02-12T14:15:00',
      status: 'pending'
    },
    {
      id: 3,
      customerName: 'Siriporn T.',
      requestedDate: '2024-02-14',
      requestedTime: '10:00 AM',
      hospital: 'Seoul Dental Excellence',
      department: 'Dental Care',
      notes: 'Follow-up after dental implant procedure',
      createdAt: '2024-02-11T16:20:00',
      status: 'accepted'
    },
    {
      id: 4,
      customerName: 'Panida S.',
      requestedDate: '2024-02-13',
      requestedTime: '2:30 PM',
      hospital: 'Gangnam Beauty Clinic',
      department: 'Plastic Surgery',
      notes: 'Initial consultation for rhinoplasty',
      createdAt: '2024-02-10T11:45:00',
      status: 'accepted'
    },
    {
      id: 5,
      customerName: 'Wirat M.',
      requestedDate: '2024-02-12',
      requestedTime: '9:00 AM',
      hospital: 'Samsung Medical Center',
      department: 'Cardiology',
      notes: 'Heart check-up, morning preferred',
      createdAt: '2024-02-09T13:30:00',
      status: 'rejected'
    }
  ]);

  const getFilteredRequests = () => {
    let filtered = requests;

    if (statusFilter !== 'All') {
      filtered = filtered.filter(req => req.status === statusFilter.toLowerCase());
    }

    if (dateFilter === 'upcoming') {
      const today = new Date();
      filtered = filtered.filter(req => new Date(req.requestedDate) >= today);
    } else if (dateFilter === 'past') {
      const today = new Date();
      filtered = filtered.filter(req => new Date(req.requestedDate) < today);
    }

    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(a.requestedDate).getTime() - new Date(b.requestedDate).getTime());
    }

    return filtered;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-600';
      case 'accepted': return 'bg-green-100 text-green-600';
      case 'rejected': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatCreatedAt = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return date.toLocaleDateString();
  };

  const handleRejectRequest = (requestId: number) => {
    setSelectedRequestId(requestId);
    setShowRejectModal(true);
  };

  const handleAcceptRequest = (requestId: number) => {
    setRequests(prevRequests =>
      prevRequests.map(req =>
        req.id === requestId ? { ...req, status: 'accepted' } : req
      )
    );
  };

  const confirmRejectRequest = () => {
    if (selectedRequestId && rejectReason.trim()) {
      setRequests(prevRequests =>
        prevRequests.map(req =>
          req.id === selectedRequestId ? { ...req, status: 'rejected' } : req
        )
      );
      setShowRejectModal(false);
      setSelectedRequestId(null);
      setRejectReason('');
    }
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedRequestId(null);
    setRejectReason('');
  };

  const filteredRequests = getFilteredRequests();
  const selectedRequest = requests.find(req => req.id === selectedRequestId);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      
      <main className="pt-4">
        <div className="px-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Customer Requests</h1>
          <p className="text-gray-600 text-sm">Manage incoming interpreter requests</p>
        </div>

        {/* Filters */}
        <div className="px-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Pending', 'Accepted', 'Rejected'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1 rounded-full text-sm cursor-pointer whitespace-nowrap ${
                        statusFilter === status
                          ? 'bg-[#A8E6CF] text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#A8E6CF] pr-8"
                  >
                    <option value="All">All dates</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="past">Past</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#A8E6CF] pr-8"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="date">By appointment date</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LINE Alert Reminder */}
        <div className="px-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3">
            <div className="flex items-start">
              <div className="w-5 h-5 flex items-center justify-center mr-2 mt-0.5">
                <i className="ri-information-line text-blue-500"></i>
              </div>
              <p className="text-blue-700 text-sm">
                When new customer requests arrive, you'll get a LINE alert if connected.
              </p>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="px-4">
          {filteredRequests.length > 0 ? (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">{request.customerName}</h3>
                      <p className="text-gray-500 text-xs">{formatCreatedAt(request.createdAt)}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center mb-1">
                      <div className="w-4 h-4 flex items-center justify-center mr-2">
                        <i className="ri-calendar-line text-[#A8E6CF] text-sm"></i>
                      </div>
                      <span className="text-gray-700 text-sm font-medium">
                        {request.requestedDate} at {request.requestedTime}
                      </span>
                    </div>
                    
                    <div className="flex items-center mb-1">
                      <div className="w-4 h-4 flex items-center justify-center mr-2">
                        <i className="ri-hospital-line text-[#FFD3B6] text-sm"></i>
                      </div>
                      <span className="text-gray-600 text-sm">{request.hospital}</span>
                    </div>
                    
                    <div className="flex items-center mb-2">
                      <div className="w-4 h-4 flex items-center justify-center mr-2">
                        <i className="ri-stethoscope-line text-[#E0BBE4] text-sm"></i>
                      </div>
                      <span className="text-gray-600 text-sm">{request.department}</span>
                    </div>
                    
                    {request.notes && (
                      <p className="text-gray-600 text-sm bg-gray-50 p-2 rounded-lg">
                        "{request.notes}"
                      </p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link
                      href={`/interpreter/requests/${request.id}`}
                      className="flex-1 bg-gray-100 text-gray-700 text-center py-2 rounded-full text-sm font-medium cursor-pointer whitespace-nowrap"
                    >
                      View Details
                    </Link>
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-full text-sm font-medium cursor-pointer whitespace-nowrap"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          className="flex-1 bg-[#FFB6C1] text-white py-2 rounded-full text-sm font-medium cursor-pointer whitespace-nowrap"
                        >
                          Accept
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
              <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded-full mx-auto mb-4">
                <i className="ri-mail-line text-gray-400 text-2xl"></i>
              </div>
              <h3 className="font-medium text-gray-800 mb-2">No requests found</h3>
              <p className="text-gray-600 text-sm">Try adjusting your filters to see more results</p>
            </div>
          )}
        </div>
      </main>

      {/* Reject Request Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Reject Request</h3>
              <button
                onClick={closeRejectModal}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full cursor-pointer whitespace-nowrap"
              >
                <i className="ri-close-line text-gray-600"></i>
              </button>
            </div>

            <div className="mb-4">
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <h4 className="font-medium text-gray-800 mb-2">{selectedRequest.customerName}</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center">
                    <div className="w-4 h-4 flex items-center justify-center mr-2">
                      <i className="ri-calendar-line text-[#A8E6CF]"></i>
                    </div>
                    <span>{selectedRequest.requestedDate} at {selectedRequest.requestedTime}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 flex items-center justify-center mr-2">
                      <i className="ri-hospital-line text-[#FFD3B6]"></i>
                    </div>
                    <span>{selectedRequest.hospital}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 flex items-center justify-center mr-2">
                      <i className="ri-stethoscope-line text-[#E0BBE4]"></i>
                    </div>
                    <span>{selectedRequest.department}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for rejection (required)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-red-400 h-24 resize-none text-sm"
                  placeholder="Please provide a brief reason for rejecting this request..."
                  maxLength={200}
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {rejectReason.length}/200
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={closeRejectModal}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={confirmRejectRequest}
                disabled={!rejectReason.trim()}
                className={`flex-1 py-3 rounded-xl font-medium cursor-pointer whitespace-nowrap ${
                  rejectReason.trim()
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}
      
      <InterpreterBottomNavigation />
    </div>
  );
}

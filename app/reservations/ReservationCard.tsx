
'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Reservation } from '@/types/supabase';

interface ReservationCardProps {
  reservation: Reservation;
  onCancel?: (reservationId: string) => Promise<void>;
  onStatusChange?: (reservationId: string, newStatus: string) => Promise<void>;
}

export default function ReservationCard({ reservation, onCancel, onStatusChange }: ReservationCardProps) {
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    time: '',
    reason: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-[#A8E6CF]/20 text-[#A8E6CF]';
      case 'pending':
        return 'bg-[#FFD3B6]/20 text-[#FFD3B6]';
      case 'completed':
        return 'bg-gray-100 text-gray-600';
      case 'cancelled':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'ri-check-line';
      case 'pending':
        return 'ri-time-line';
      case 'completed':
        return 'ri-check-double-line';
      case 'cancelled':
        return 'ri-close-line';
      default:
        return 'ri-time-line';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const handleReschedule = () => {
    setShowRescheduleModal(true);
  };

  const handleRescheduleSubmit = () => {
    if (!rescheduleData.date || !rescheduleData.time) {
      alert('Please select both date and time for rescheduling.');
      return;
    }
    
    alert(`Reschedule request submitted successfully! New appointment: ${rescheduleData.date} at ${rescheduleData.time}. You will receive confirmation shortly.`);
    setShowRescheduleModal(false);
    setRescheduleData({ date: '', time: '', reason: '' });
  };

  const handleCancel = async () => {
    if (onCancel && window.confirm('정말로 이 예약을 취소하시겠습니까?')) {
      setIsUpdating(true);
      try {
        await onCancel(reservation.id);
      } catch (error) {
        console.error('예약 취소 실패:', error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (onStatusChange && window.confirm(`예약 상태를 ${newStatus}로 변경하시겠습니까?`)) {
      setIsUpdating(true);
      try {
        await onStatusChange(reservation.id, newStatus);
      } catch (error) {
        console.error('상태 변경 실패:', error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const availableTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  // 기본 이미지 URL
  const defaultImage = 'https://readdy.ai/api/search-image?query=Modern%20hospital%20building%20exterior%2C%20clean%20medical%20facility%2C%20professional%20healthcare%20center&width=300&height=200&orientation=landscape';

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex">
          <div 
            className="w-24 h-24 bg-cover bg-center bg-top flex-shrink-0"
            style={{ backgroundImage: `url(${defaultImage})` }}
          />
          
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">{reservation.treatment}</h3>
                <p className="text-gray-600 text-xs">Hospital ID: {reservation.hospital_id}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                {getStatusLabel(reservation.status)}
              </span>
            </div>
            
            <div className="space-y-1 mb-3">
              <div className="flex items-center text-xs text-gray-600">
                <div className="w-3 h-3 flex items-center justify-center mr-2">
                  <i className="ri-calendar-line"></i>
                </div>
                <span>{new Date(reservation.date).toLocaleDateString('ko-KR')} at {reservation.time}</span>
              </div>
              <div className="flex items-center text-xs text-gray-600">
                <div className="w-3 h-3 flex items-center justify-center mr-2">
                  <i className="ri-user-line"></i>
                </div>
                <span>Interpreter: {reservation.interpreter_id || 'Not assigned'}</span>
              </div>
              {reservation.estimated_cost && (
                <div className="flex items-center text-xs text-gray-600">
                  <div className="w-3 h-3 flex items-center justify-center mr-2">
                    <i className="ri-money-dollar-circle-line"></i>
                  </div>
                  <span>Estimated Cost: {reservation.estimated_cost}</span>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2">
              {reservation.status === 'confirmed' && (
                <>
                  <button 
                    onClick={handleReschedule}
                    disabled={isUpdating}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap hover:bg-gray-200 disabled:opacity-50 transition-colors"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => handleStatusChange('completed')}
                    disabled={isUpdating}
                    className="flex-1 bg-green-100 text-green-600 py-2 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap hover:bg-green-200 disabled:opacity-50 transition-colors"
                  >
                    Mark Complete
                  </button>
                </>
              )}
              {reservation.status === 'pending' && (
                <>
                  <button 
                    onClick={handleCancel}
                    disabled={isUpdating}
                    className="flex-1 bg-red-100 text-red-600 py-2 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap hover:bg-red-200 disabled:opacity-50 transition-colors"
                  >
                    {isUpdating ? 'Cancelling...' : 'Cancel'}
                  </button>
                  <button
                    onClick={() => handleStatusChange('confirmed')}
                    disabled={isUpdating}
                    className="flex-1 bg-[#A8E6CF] text-white py-2 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap hover:bg-[#8DD5B8] disabled:opacity-50 transition-colors"
                  >
                    {isUpdating ? 'Confirming...' : 'Confirm'}
                  </button>
                </>
              )}
              {reservation.status === 'completed' && (
                <Link href={`/reservations/${reservation.id}`} className="w-full bg-gray-100 text-gray-700 py-2 rounded-full text-xs font-medium text-center cursor-pointer whitespace-nowrap hover:bg-gray-200 transition-colors">
                  View Details
                </Link>
              )}
              {reservation.status === 'cancelled' && (
                <Link href="/hospitals" className="w-full bg-[#A8E6CF] text-white py-2 rounded-full text-xs font-medium text-center cursor-pointer whitespace-nowrap hover:bg-[#8DD5B8] transition-colors">
                  Book Again
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Reschedule Appointment</h3>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full cursor-pointer whitespace-nowrap"
              >
                <i className="ri-close-line text-gray-600"></i>
              </button>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">Current Appointment</h4>
              <div className="space-y-1">
                <p className="text-sm text-gray-700">{reservation.treatment}</p>
                <p className="text-sm text-gray-600">Hospital ID: {reservation.hospital_id}</p>
                <p className="text-sm text-gray-600">Date: {new Date(reservation.date).toLocaleDateString('ko-KR')}</p>
                <p className="text-sm text-gray-600">Time: {reservation.time}</p>
                <p className="text-sm text-gray-600">Interpreter: {reservation.interpreter_id || 'Not assigned'}</p>
              </div>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Date</label>
                <input
                  type="date"
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Time</label>
                <select
                  value={rescheduleData.time}
                  onChange={(e) => setRescheduleData({...rescheduleData, time: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] pr-8"
                >
                  <option value="">Select a time</option>
                  {availableTimes.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Reschedule (Optional)</label>
                <textarea
                  value={rescheduleData.reason}
                  onChange={(e) => setRescheduleData({...rescheduleData, reason: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] h-24 resize-none"
                  placeholder="Please let us know why you need to reschedule..."
                  maxLength={500}
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-start">
                  <div className="w-5 h-5 flex items-center justify-center mr-3 mt-0.5">
                    <i className="ri-information-line text-yellow-600"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-800 text-sm mb-1">Important Notice</h4>
                    <p className="text-yellow-700 text-xs">
                      • Reschedule requests are subject to availability<br/>
                      • You will receive confirmation within 24 hours<br/>
                      • No additional fees for rescheduling<br/>
                      • Please reschedule at least 24 hours before your appointment
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRescheduleSubmit}
                  className="flex-1 px-6 py-3 bg-[#A8E6CF] text-white rounded-xl cursor-pointer whitespace-nowrap"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

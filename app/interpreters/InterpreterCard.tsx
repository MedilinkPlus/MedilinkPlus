
'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Tables } from '@/types/supabase';

interface InterpreterCardProps {
  interpreter: Tables<'interpreters'> & {
    users?: {
      name: string;
      email: string;
      phone: string | null;
      avatar_url: string | null;
    };
  };
}

export default function InterpreterCard({ interpreter }: InterpreterCardProps) {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    name: '',
    phone: '',
    email: '',
    hospital: '',
    appointmentDate: '',
    appointmentTime: '',
    treatmentType: '',
    specialRequests: ''
  });

  const handleSendRequest = () => {
    setShowRequestModal(true);
  };

  const handleCloseModal = () => {
    setShowRequestModal(false);
    setRequestForm({
      name: '',
      phone: '',
      email: '',
      hospital: '',
      appointmentDate: '',
      appointmentTime: '',
      treatmentType: '',
      specialRequests: ''
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setRequestForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitRequest = () => {
    if (!requestForm.name || !requestForm.phone || !requestForm.email || !requestForm.appointmentDate) {
      alert('Please fill in all required fields');
      return;
    }

    // Simulate sending request
    alert(`Request sent to ${interpreter.users?.name || 'Interpreter'}! They will contact you within 24 hours.`);
    handleCloseModal();
  };

  // 이미지 URL 설정
  const imageUrl = interpreter.users?.avatar_url || '/images/default-avatar.png';

  // 경험 연도 표시
  const experienceText = interpreter.experience_years 
    ? `${interpreter.experience_years} years of experience`
    : 'Experience information not available';

  // 평점 표시
  const displayRating = interpreter.rating ? interpreter.rating.toFixed(1) : 'N/A';
  const reviewCount = interpreter.total_requests || 0;

  // 전문 분야 표시 (JSONB 배열에서 추출)
  const specializations = Array.isArray(interpreter.specializations) 
    ? interpreter.specializations 
    : [];

  // 병원 정보 (실제로는 별도 테이블에서 가져와야 함)
  const hospitals = ['Seoul Medical Center', 'Gangnam Clinic']; // 임시 데이터

  return (
    <>
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-start space-x-4">
          <div 
            className="w-16 h-16 rounded-full bg-cover bg-center flex-shrink-0"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-800">{interpreter.users?.name || 'Unknown'}</h3>
                <p className="text-gray-600 text-sm">
                  {interpreter.experience_years ? `${interpreter.experience_years} years` : 'Experience N/A'}
                </p>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-star-fill text-yellow-400 text-sm"></i>
                </div>
                <span className="text-sm text-gray-700 ml-1">{displayRating}</span>
                <span className="text-xs text-gray-500 ml-1">({reviewCount})</span>
              </div>
            </div>
            
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-1">{experienceText}</p>
              {specializations.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {specializations.slice(0, 3).map((specialization, index) => (
                    <span
                      key={index}
                      className="bg-[#A8E6CF]/20 text-[#A8E6CF] text-xs px-2 py-1 rounded-full"
                    >
                      {specialization}
                    </span>
                  ))}
                  {specializations.length > 3 && (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      +{specializations.length - 3} more
                    </span>
                  )}
                </div>
              )}
              <p className="text-xs text-gray-500">
                Main hospitals: {hospitals.slice(0, 2).join(', ')}
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Link
                href={`/interpreters/${interpreter.id}`}
                className="flex-1 bg-gray-100 text-gray-700 text-center py-2 rounded-full text-sm font-medium cursor-pointer whitespace-nowrap hover:bg-gray-200 transition-colors"
              >
                View Profile
              </Link>
              <button 
                onClick={handleSendRequest}
                className="flex-1 bg-[#A8E6CF] text-white text-center py-2 rounded-full text-sm font-medium cursor-pointer whitespace-nowrap hover:bg-[#8DD5B8] transition-colors"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div 
                  className="w-12 h-12 rounded-full bg-cover bg-center mr-3"
                  style={{ backgroundImage: `url(${imageUrl})` }}
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Request {interpreter.users?.name || 'Interpreter'}</h3>
                  <p className="text-gray-600 text-sm">Send a request for interpreter services</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full cursor-pointer whitespace-nowrap hover:bg-gray-200 transition-colors"
              >
                <i className="ri-close-line text-gray-600"></i>
              </button>
            </div>

            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={requestForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF]"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={requestForm.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF]"
                    placeholder="+66-xx-xxx-xxxx"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={requestForm.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF]"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hospital/Clinic</label>
                <select
                  value={requestForm.hospital}
                  onChange={(e) => handleInputChange('hospital', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] pr-8"
                >
                  <option value="">Select hospital/clinic</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital} value={hospital}>{hospital}</option>
                  ))}
                  <option value="other">Other (specify in special requests)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={requestForm.appointmentDate}
                    onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF]"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
                  <select
                    value={requestForm.appointmentTime}
                    onChange={(e) => handleInputChange('appointmentTime', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] pr-8"
                  >
                    <option value="">Select time</option>
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Treatment Type</label>
                <select
                  value={requestForm.treatmentType}
                  onChange={(e) => handleInputChange('treatmentType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] pr-8"
                >
                  <option value="">Select treatment type</option>
                  {specializations.map((specialty) => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                  <option value="consultation">General Consultation</option>
                  <option value="follow-up">Follow-up Appointment</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                <textarea
                  value={requestForm.specialRequests}
                  onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] h-24 resize-none"
                  placeholder="Any special requirements or additional information..."
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{requestForm.specialRequests.length}/500 characters</p>
              </div>

              <div className="bg-[#A8E6CF]/10 rounded-xl p-4">
                <div className="flex items-start">
                  <div className="w-5 h-5 flex items-center justify-center mr-3 mt-0.5">
                    <i className="ri-information-line text-[#A8E6CF]"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 text-sm mb-1">What happens next?</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• {interpreter.users?.name || 'Interpreter'} will review your request within 24 hours</li>
                      <li>• You'll receive confirmation via phone or email</li>
                      <li>• Service fee and payment details will be discussed</li>
                      <li>• Meet at the hospital/clinic on your appointment day</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl cursor-pointer whitespace-nowrap hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitRequest}
                  className="px-6 py-3 bg-[#A8E6CF] text-white rounded-xl cursor-pointer whitespace-nowrap hover:bg-[#8DD5B8] transition-colors"
                >
                  <div className="w-4 h-4 flex items-center justify-center mr-2 inline-flex">
                    <i className="ri-send-plane-line"></i>
                  </div>
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

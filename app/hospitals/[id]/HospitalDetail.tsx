'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import Link from 'next/link';
import { useHospital, useHospitalFees } from '@/hooks/useHospitals';
import { LoadingSpinner } from '@/components/system/LoadingSpinner';
import { ErrorMessage } from '@/components/system/ErrorMessage';
import { SuccessMessage } from '@/components/system/ErrorMessage';
import { reservationCreateSchema, type ReservationCreateInput } from '@/lib/validations';
import { ReservationService } from '@/services/reservationService';

interface HospitalDetailProps {
  hospitalId: string;
}

export default function HospitalDetail({ hospitalId }: HospitalDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [selectedInterpreter, setSelectedInterpreter] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 병원 정보 및 요금 데이터 훅 사용
  const { hospital, loading: hospitalLoading, error: hospitalError, refetch: refetchHospital } = useHospital(hospitalId);
  const { fees, loading: feesLoading, error: feesError, refetch: refetchFees } = useHospitalFees(hospitalId);

  // 기본 이미지 URL (실제 이미지가 없을 경우)
  const defaultImages = [
    'https://readdy.ai/api/search-image?query=Modern%20hospital%20building%20exterior%2C%20clean%20medical%20facility%2C%20professional%20healthcare%20center&width=500&height=300&orientation=landscape',
    'https://readdy.ai/api/search-image?query=Hospital%20interior%20waiting%20area%2C%20modern%20medical%20facility%2C%20clean%20environment&width=400&height=300&orientation=landscape',
    'https://readdy.ai/api/search-image?query=Medical%20treatment%20room%2C%20professional%20healthcare%20setting%2C%20modern%20equipment&width=400&height=300&orientation=landscape'
  ];

  // 이미지 갤러리 결정
  const galleryImages = hospital?.image_url ? [hospital.image_url, ...defaultImages.slice(1)] : defaultImages;

  // 통역사 목록 (실제 데이터로 교체 예정)
  const availableInterpreters = [
    {
      id: '1',
      name: 'Sarah Kim',
      languages: ['Korean', 'English'],
      rating: 4.9,
      experience: '5 years',
      price: '$50/hour',
      image: 'https://readdy.ai/api/search-image?query=Professional%20Korean%20female%20interpreter%20headshot%2C%20business%20attire%2C%20friendly%20smile%2C%20medical%20interpretation%20specialist%2C%20healthcare%20professional%20portrait&width=100&height=100&orientation=squarish'
    },
    {
      id: '2',
      name: 'Michael Park',
      languages: ['Korean', 'English', 'Japanese'],
      rating: 4.8,
      experience: '7 years',
      price: '$60/hour',
      image: 'https://readdy.ai/api/search-image?query=Professional%20Korean%20male%20interpreter%20headshot%2C%20business%20suit%2C%20confident%20expression%2C%20medical%20translation%20expert%2C%20healthcare%20professional%20portrait&width=100&height=100&orientation=squarish'
    },
    {
      id: '3',
      name: 'Jennifer Lee',
      languages: ['Korean', 'English', 'Chinese'],
      rating: 4.9,
      experience: '6 years',
      price: '$55/hour',
      image: 'https://readdy.ai/api/search-image?query=Professional%20Korean%20female%20interpreter%20headshot%2C%20medical%20attire%2C%20warm%20smile%2C%20healthcare%20interpretation%20specialist%2C%20professional%20medical%20portrait&width=100&height=100&orientation=squarish'
    }
  ];

  const availableTimeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  // 프로모션 데이터 (실제 데이터로 교체 예정)
  const promotions = [
    {
      title: 'First Visit Discount',
      description: 'Complete medical check-up with consultation',
      validUntil: '2024-03-31',
      originalPrice: '$200',
      discountPrice: '$150'
    },
    {
      title: 'Special Package Deal',
      description: 'Multiple services with interpreter included',
      validUntil: '2024-02-28',
      originalPrice: '$500',
      discountPrice: '$400'
    }
  ];

  const openBookingModal = () => {
    setShowBookingModal(true);
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    // 폼 초기화
    setSelectedService('');
    setSelectedInterpreter('');
    setSelectedDate('');
    setSelectedTime('');
    setPatientName('');
    setPatientPhone('');
    setPatientEmail('');
    setSpecialRequests('');
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const handleBookingSubmit = async () => {
    // 폼 검증
    if (!selectedService || !selectedInterpreter || !selectedDate || !selectedTime || 
        !patientName || !patientPhone || !patientEmail) {
      setSubmitError('모든 필수 항목을 입력해주세요.');
      return;
    }

    // Zod 스키마 검증
    const reservationData: ReservationCreateInput = {
      hospital_id: hospitalId,
      interpreter_id: selectedInterpreter,
      treatment: selectedService,
      date: selectedDate,
      time: selectedTime,
      notes: specialRequests || undefined,
      estimated_cost: fees?.find(f => f.service_name === selectedService)?.max_price?.toString() || undefined,
      special_requests: specialRequests || undefined
    };

    try {
      const validationResult = reservationCreateSchema.safeParse(reservationData);
      if (!validationResult.success) {
        setSubmitError('입력 데이터가 올바르지 않습니다.');
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      // TODO: 실제 사용자 ID 사용 (인증 구현 후)
      const tempUserId = 'temp-user-id';
      await ReservationService.createReservation(reservationData, tempUserId);

      setSubmitSuccess(true);
      setTimeout(() => {
        closeBookingModal();
      }, 2000);

    } catch (error: any) {
      setSubmitError(error.message || '예약 생성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 로딩 상태
  if (hospitalLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />
        <main className="pt-4">
          <LoadingSpinner size="lg" text="병원 정보를 불러오는 중..." className="py-20" />
        </main>
        <BottomNavigation />
      </div>
    );
  }

  // 에러 상태
  if (hospitalError || !hospital) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />
        <main className="pt-4 px-4">
          <ErrorMessage 
            error={hospitalError || '병원을 찾을 수 없습니다.'} 
            onRetry={refetchHospital}
          />
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />

      <main>
        {/* 병원 이미지 헤더 */}
        <div className="relative">
          <div 
            className="h-64 bg-cover bg-center"
            style={{ backgroundImage: `url(${galleryImages[currentImageIndex]})` }}
          >
            <div className="absolute inset-0 bg-black/30"></div>
            <Link href="/hospitals" className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center bg-white/90 rounded-full cursor-pointer whitespace-nowrap">
              <i className="ri-arrow-left-line text-gray-800"></i>
            </Link>
            <button className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/90 rounded-full cursor-pointer whitespace-nowrap">
              <i className="ri-heart-line text-gray-800"></i>
            </button>
          </div>
        </div>

        {/* 병원 기본 정보 */}
        <div className="px-4 -mt-8 relative z-10">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{hospital.name}</h1>
                <p className="text-gray-600 mb-1">{hospital.specialty || 'General Medicine'}</p>
                <div className="flex items-center">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-map-pin-line text-gray-500"></i>
                  </div>
                  <span className="text-sm text-gray-500 ml-1">{hospital.address}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center mb-1">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-star-fill text-yellow-400"></i>
                  </div>
                  <span className="text-lg font-semibold text-gray-800 ml-1">
                    {hospital.rating ? hospital.rating.toFixed(1) : 'N/A'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  ({hospital.total_reservations || 0} reservations)
                </p>
              </div>
            </div>

            {/* 병원 상태 표시 */}
            <div className="mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                hospital.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  hospital.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                }`}></div>
                {hospital.status === 'active' ? '운영중' : '운영중단'}
              </span>
            </div>

            <div className="flex space-x-3 mb-4">
              <button 
                onClick={() => {
                  const addr = (hospital.address || '').trim();
                  if (!addr) return;
                  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
                  try { window.open(url, '_blank', 'noopener,noreferrer'); } catch {}
                }}
                disabled={!hospital.address}
                className={`flex items-center justify-center flex-1 py-3 rounded-full text-sm font-medium cursor-pointer whitespace-nowrap transition-colors ${hospital.address ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                <div className="w-4 h-4 flex items-center justify-center mr-2">
                  <i className="ri-map-pin-line"></i>
                </div>
                View on Map
              </button>
              <button 
                onClick={openBookingModal}
                disabled={hospital.status !== 'active'}
                className={`flex items-center justify-center flex-1 py-3 rounded-full text-sm font-medium cursor-pointer whitespace-nowrap transition-colors ${
                  hospital.status === 'active'
                    ? 'bg-[#A8E6CF] text-white hover:bg-[#8DD5B8]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center mr-2">
                  <i className="ri-calendar-line"></i>
                </div>
                {hospital.status === 'active' ? 'Book via Interpreter' : '운영중단'}
              </button>
            </div>
          </div>
        </div>

        {/* 요금 정보 */}
        <div className="px-4 mt-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Consultation Fees</h3>
            {feesLoading ? (
              <LoadingSpinner size="md" text="요금 정보를 불러오는 중..." />
            ) : feesError ? (
              <ErrorMessage error={feesError} onRetry={refetchFees} />
            ) : fees && fees.length > 0 ? (
              <div className="space-y-3">
                {fees.map((fee, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{fee.service_name}</p>
                      <p className="text-xs text-gray-500">
                        {fee.min_price && fee.max_price 
                          ? `${fee.currency} ${fee.min_price} - ${fee.max_price}`
                          : fee.currency && fee.min_price
                          ? `${fee.currency} ${fee.min_price}`
                          : '가격 문의'
                        }
                      </p>
                    </div>
                    <span className="font-semibold text-[#A8E6CF]">
                      {fee.currency} {fee.min_price || '문의'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">요금 정보가 없습니다.</p>
            )}
          </div>
        </div>

        {/* 프로모션 정보 */}
        <div className="px-4 mt-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Current Promotions</h3>
            <div className="space-y-4">
              {promotions.map((promo, index) => (
                <div key={index} className="bg-gradient-to-r from-[#A8E6CF]/10 to-[#FFD3B6]/10 rounded-xl p-4">
                  <h4 className="font-medium text-gray-800 mb-2">{promo.title}</h4>
                  <p className="text-gray-600 text-sm mb-2">{promo.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 line-through text-sm">{promo.originalPrice}</span>
                      <span className="font-semibold text-[#A8E6CF] text-lg">{promo.discountPrice}</span>
                    </div>
                    <span className="text-xs text-gray-500">Valid until {promo.validUntil}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 병원 갤러리 */}
        <div className="px-4 mt-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Hospital Gallery</h3>
            <div className="relative mb-4">
              <div 
                className="h-48 bg-cover bg-center rounded-xl"
                style={{ backgroundImage: `url(${galleryImages[currentImageIndex]})` }}
              />
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {galleryImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full cursor-pointer whitespace-nowrap ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {galleryImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className="cursor-pointer whitespace-nowrap"
                >
                  <div 
                    className={`h-16 bg-cover bg-center rounded-lg border-2 ${
                      index === currentImageIndex ? 'border-[#A8E6CF]' : 'border-transparent'
                    }`}
                    style={{ backgroundImage: `url(${image})` }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 연락처 정보 */}
        <div className="px-4 mt-6 mb-8">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-8 h-8 flex items-center justify-center bg-[#A8E6CF]/20 rounded-full mr-3">
                  <i className="ri-map-pin-line text-[#A8E6CF]"></i>
                </div>
                <span className="text-gray-700 text-sm">{hospital.address}</span>
              </div>
              {hospital.phone && (
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-[#FFD3B6]/20 rounded-full mr-3">
                    <i className="ri-phone-line text-[#FFD3B6]"></i>
                  </div>
                  <span className="text-gray-700 text-sm">{hospital.phone}</span>
                </div>
              )}
              {hospital.hours && (
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-[#E0BBE4]/20 rounded-full mr-3">
                    <i className="ri-time-line text-[#E0BBE4]"></i>
                  </div>
                  <span className="text-gray-700 text-sm">{hospital.hours}</span>
                </div>
              )}
              {hospital.website && (
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full mr-3">
                    <i className="ri-global-line text-blue-500"></i>
                  </div>
                  <a 
                    href={hospital.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 text-sm hover:underline cursor-pointer"
                  >
                    {hospital.website}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 예약 모달 */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Book Appointment with Interpreter</h3>
              <button
                onClick={closeBookingModal}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full cursor-pointer whitespace-nowrap"
              >
                <i className="ri-close-line text-gray-600"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* 성공/에러 메시지 */}
              {submitSuccess && (
                <SuccessMessage message="예약이 성공적으로 생성되었습니다!" />
              )}
              {submitError && (
                <ErrorMessage error={submitError} />
              )}

              {/* 고객 정보 */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <div className="w-5 h-5 flex items-center justify-center mr-2">
                    <i className="ri-user-line text-[#A8E6CF]"></i>
                  </div>
                  Customer Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF]"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF]"
                      placeholder="+66-xx-xxx-xxxx"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF]"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* 서비스 선택 */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <div className="w-5 h-5 flex items-center justify-center mr-2">
                    <i className="ri-stethoscope-line text-[#FFD3B6]"></i>
                  </div>
                  Select Service *
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {fees && fees.length > 0 ? (
                    fees.map((fee, index) => (
                      <label key={index} className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="service"
                          value={fee.service_name}
                          checked={selectedService === fee.service_name}
                          onChange={(e) => setSelectedService(e.target.value)}
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-800">{fee.service_name}</p>
                              <p className="text-sm text-gray-600">
                                {fee.currency} {fee.min_price} - {fee.max_price}
                              </p>
                            </div>
                            <span className="font-semibold text-[#A8E6CF]">
                              {fee.currency} {fee.min_price}
                            </span>
                          </div>
                        </div>
                      </label>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-4">사용 가능한 서비스가 없습니다.</p>
                  )}
                </div>
              </div>

              {/* 통역사 선택 */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <div className="w-5 h-5 flex items-center justify-center mr-2">
                    <i className="ri-translate-2 text-[#E0BBE4]"></i>
                  </div>
                  Choose Interpreter *
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {availableInterpreters.map((interpreter) => (
                    <label key={interpreter.id} className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="interpreter"
                        value={interpreter.id}
                        checked={selectedInterpreter === interpreter.id}
                        onChange={(e) => setSelectedInterpreter(e.target.value)}
                        className="mr-3"
                      />
                      <div className="flex items-center flex-1">
                        <img
                          src={interpreter.image}
                          alt={interpreter.name}
                          className="w-12 h-12 rounded-full object-cover mr-4"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-800">{interpreter.name}</p>
                              <p className="text-sm text-gray-600">{interpreter.languages.join(', ')}</p>
                              <div className="flex items-center mt-1">
                                <div className="w-4 h-4 flex items-center justify-center">
                                  <i className="ri-star-fill text-yellow-400"></i>
                                </div>
                                <span className="text-sm text-gray-600 ml-1">{interpreter.rating} • {interpreter.experience}</span>
                              </div>
                            </div>
                            <span className="font-semibold text-blue-600">{interpreter.price}</span>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* 날짜 및 시간 선택 */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <div className="w-5 h-5 flex items-center justify-center mr-2">
                    <i className="ri-calendar-line text-green-600"></i>
                  </div>
                  Select Date & Time *
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] pr-8"
                    >
                      <option value="">Select time slot</option>
                      {availableTimeSlots.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 특별 요청사항 */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <div className="w-5 h-5 flex items-center justify-center mr-2">
                    <i className="ri-message-line text-purple-600"></i>
                  </div>
                  Special Requests (Optional)
                </h4>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] h-24 resize-none"
                  placeholder="Any special requirements, medical conditions, or preferences..."
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{specialRequests.length}/500 characters</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={closeBookingModal}
                disabled={isSubmitting}
                className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl cursor-pointer whitespace-nowrap hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBookingSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 bg-[#A8E6CF] text-white rounded-xl cursor-pointer whitespace-nowrap hover:bg-[#8DD5B8] disabled:opacity-50 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Submitting...</span>
                  </>
                ) : (
                  'Submit Booking Request'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}

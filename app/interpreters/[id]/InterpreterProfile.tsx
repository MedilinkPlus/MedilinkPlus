'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import Link from 'next/link';
import { useInterpreter } from '@/hooks/useInterpreter';
import { LoadingSpinner } from '@/components/system/LoadingSpinner';
import { ErrorMessage } from '@/components/system/ErrorMessage';

interface InterpreterProfileProps {
  interpreterId: string;
}

export default function InterpreterProfile({ interpreterId }: InterpreterProfileProps) {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 통역사 데이터 훅 사용
  const { interpreter, loading, error, refetch } = useInterpreter(interpreterId);

  // 기본 이미지 설정
  const defaultImage = 'https://readdy.ai/api/search-image?query=Professional%20medical%20interpreter%2C%20friendly%20smile%2C%20business%20casual%20attire%2C%20medical%20facility%20background%2C%20professional%20headshot%2C%20confident%20expression%2C%20healthcare%20worker&width=300&height=300&orientation=squarish';
  const imageUrl = interpreter?.avatar_url || defaultImage;

  // 전문 분야 표시 (specializations 필드 사용)
  const specializations = Array.isArray(interpreter?.specializations) 
    ? interpreter.specializations 
    : [];

  // 경험 연도 표시
  const experienceText = interpreter?.experience_years 
    ? `${interpreter.experience_years} years of experience`
    : 'Experience information not available';

  // 평점 표시
  const displayRating = interpreter?.rating ? interpreter.rating.toFixed(1) : 'N/A';
  const reviewCount = interpreter?.total_requests || 0;

  const handleSendRequest = async () => {
    setIsSubmitting(true);
    // 실제로는 API 호출을 통해 예약 요청을 처리해야 함
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setShowRequestModal(false);
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />
        <main className="pt-4">
          <div className="px-4 mb-6">
            <Link href="/interpreters" className="flex items-center text-gray-600 mb-4 cursor-pointer whitespace-nowrap">
              <div className="w-4 h-4 flex items-center justify-center mr-2">
                <i className="ri-arrow-left-line"></i>
              </div>
              <span className="text-sm">Back to Interpreters</span>
            </Link>
          </div>
          <LoadingSpinner size="lg" text="통역사 정보를 불러오는 중..." className="py-20" />
        </main>
        <BottomNavigation />
      </div>
    );
  }

  // 에러 상태
  if (error || !interpreter) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />
        <main className="pt-4">
          <div className="px-4 mb-6">
            <Link href="/interpreters" className="flex items-center text-gray-600 mb-4 cursor-pointer whitespace-nowrap">
              <div className="w-4 h-4 flex items-center justify-center mr-2">
                <i className="ri-arrow-left-line"></i>
              </div>
              <span className="text-sm">Back to Interpreters</span>
            </Link>
          </div>
          <ErrorMessage 
            error={error || 'Interpreter not found'} 
            onRetry={refetch}
          />
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      
      <main className="pt-4">
        <div className="px-4 mb-6">
          <Link href="/interpreters" className="flex items-center text-gray-600 mb-4 cursor-pointer whitespace-nowrap hover:text-gray-800 transition-colors">
            <div className="w-4 h-4 flex items-center justify-center mr-2">
              <i className="ri-arrow-left-line"></i>
            </div>
            <span className="text-sm">Back to Interpreters</span>
          </Link>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <div 
              className="w-24 h-24 rounded-full bg-cover bg-center mx-auto mb-4"
              style={{ backgroundImage: `url(${imageUrl})` }}
            />
            
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{interpreter.name}</h1>
            <p className="text-gray-600 mb-1">{experienceText}</p>
            
            <div className="flex items-center justify-center mb-4">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-star-fill text-yellow-400"></i>
              </div>
              <span className="text-lg font-semibold text-gray-800 ml-1">{displayRating}</span>
              <span className="text-gray-500 ml-1">({reviewCount} reviews)</span>
            </div>
            
            <div className="flex justify-center space-x-4 mb-6">
              <div className="text-center">
                <div className="w-10 h-10 flex items-center justify-center bg-[#A8E6CF] rounded-full mx-auto mb-1">
                  <i className="ri-phone-line text-white"></i>
                </div>
                <p className="text-xs text-gray-600">Phone</p>
                <p className="text-xs font-medium">{interpreter.phone || 'N/A'}</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 flex items-center justify-center bg-[#00C300] rounded-full mx-auto mb-1">
                  <i className="ri-chat-3-line text-white"></i>
                </div>
                <p className="text-xs text-gray-600">LINE</p>
                <p className="text-xs font-medium">N/A</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* 전문 분야 */}
        {specializations.length > 0 && (
          <div className="px-4 mb-6">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3">Specializations</h3>
              <div className="flex flex-wrap gap-2">
                {specializations.map((specialization: string, index: number) => (
                  <span
                    key={index}
                    className="bg-[#A8E6CF]/20 text-[#A8E6CF] text-sm px-3 py-1 rounded-full"
                  >
                    {specialization}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* 예약 요청 버튼 */}
        <div className="px-4 mb-8">
          <button
            onClick={() => setShowRequestModal(true)}
            className="w-full bg-[#A8E6CF] text-white py-4 rounded-2xl font-semibold text-lg cursor-pointer whitespace-nowrap hover:bg-[#8DD5B8] transition-colors"
          >
            Send Request
          </button>
        </div>
      </main>

      {/* 예약 요청 모달 */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <div className="w-16 h-16 flex items-center justify-center bg-[#A8E6CF] rounded-full mx-auto mb-4">
              <i className="ri-check-line text-white text-2xl"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Request Sent!</h3>
            <p className="text-gray-600 text-sm">{interpreter.name} will contact you within 24 hours</p>
            <button
              onClick={handleSendRequest}
              disabled={isSubmitting}
              className="mt-4 px-6 py-2 bg-[#A8E6CF] text-white rounded-xl cursor-pointer whitespace-nowrap hover:bg-[#8DD5B8] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  Sending...
                </div>
              ) : (
                'Close'
              )}
            </button>
          </div>
        </div>
      )}
      
      <BottomNavigation />
    </div>
  );
}

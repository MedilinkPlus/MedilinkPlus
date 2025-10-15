
'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import HospitalCard from './HospitalCard';
import HospitalFilters from './HospitalFilters';
import { useHospitals } from '@/hooks/useHospitals';
import { LoadingSpinner } from '@/components/system/LoadingSpinner';
import { ErrorMessage } from '@/components/system/ErrorMessage';
import { NoHospitals, NoSearchResults } from '@/components/system/EmptyState';
import type { HospitalSearchInput } from '@/lib/validations';

export default function HospitalsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMapModal, setShowMapModal] = useState(false);
  const [searchFilters, setSearchFilters] = useState<HospitalSearchInput>({
    page: 1,
    limit: 20
  });

  // 병원 데이터 훅 사용
  const {
    hospitals,
    loading,
    error,
    total,
    page,
    totalPages,
    fetchHospitals,
    fetchNextPage,
    fetchPreviousPage,
    goToPage,
    searchHospitals,
    clearSearch,
    isSearching
  } = useHospitals({ page: 1, limit: 20, autoFetch: true });

  // 검색 처리
  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchHospitals({
        search_term: searchQuery.trim(),
        page: 1,
        limit: 20
      });
    } else {
      clearSearch();
    }
  };

  // 검색어 변경 시 자동 검색 (디바운싱)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else if (isSearching) {
        clearSearch();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 필터 변경 처리
  const handleFilterChange = useCallback((filters: Partial<HospitalSearchInput>) => {
    setSearchFilters(prev => {
      const next = { ...prev, ...filters, page: 1 } as HospitalSearchInput
      // Trigger search with the next filters
      searchHospitals(next)
      return next
    })
  }, [searchHospitals]);

  // 페이지네이션 처리
  const handlePageChange = (newPage: number) => {
    goToPage(newPage);
  };

  const openMapModal = () => {
    setShowMapModal(true);
  };

  const closeMapModal = () => {
    setShowMapModal(false);
  };

  // 로딩 상태
  if (loading && hospitals.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />
        <main className="pt-4">
          <div className="px-4 mb-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Medical Facilities</h1>
            <p className="text-gray-600 text-sm mb-4">Top-rated hospitals and clinics in Seoul</p>
          </div>
          <LoadingSpinner size="lg" text="병원 정보를 불러오는 중..." className="py-20" />
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />

      <main className="pt-4">
        <div className="px-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Medical Facilities</h1>
          <p className="text-gray-600 text-sm mb-4">Top-rated hospitals and clinics in Seoul</p>

          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 flex items-center justify-center">
              <i className="ri-search-line text-gray-400"></i>
            </div>
            <input
              type="text"
              placeholder="Search hospitals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:border-[#A8E6CF]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center bg-gray-300 rounded-full text-white text-xs hover:bg-gray-400"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <HospitalFilters onFilterChange={handleFilterChange} />

        {/* 에러 상태 */}
        {error && (
          <div className="px-4 mb-4">
            <ErrorMessage 
              error={error} 
              onRetry={isSearching ? clearSearch : fetchHospitals}
            />
          </div>
        )}

        <div className="px-4 mb-4 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {isSearching ? `${hospitals.length} 검색 결과` : `${total} 병원`}
          </span>
          <button 
            onClick={openMapModal}
            className="flex items-center bg-[#A8E6CF] text-white px-4 py-2 rounded-full text-sm cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center mr-2">
              <i className="ri-map-pin-line"></i>
            </div>
            View on Map
          </button>
        </div>

        {/* 병원 목록 */}
        <div className="px-4 space-y-4 mb-8">
          {hospitals.length === 0 ? (
            isSearching ? (
              <NoSearchResults 
                searchTerm={searchQuery} 
                onClear={() => {
                  setSearchQuery('');
                  clearSearch();
                }} 
              />
            ) : (
              <NoHospitals onRefresh={fetchHospitals} />
            )
          ) : (
            <>
              {hospitals.map((hospital) => (
                <HospitalCard key={hospital.id} hospital={hospital} />
              ))}
              
              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 py-4">
                  <button
                    onClick={() => fetchPreviousPage()}
                    disabled={page <= 1}
                    className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    이전
                  </button>
                  
                  <span className="px-3 py-2 text-sm text-gray-600">
                    {page} / {totalPages}
                  </span>
                  
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={page >= totalPages}
                    className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* 추가 로딩 인디케이터 */}
        {loading && hospitals.length > 0 && (
          <div className="px-4 mb-4">
            <LoadingSpinner size="md" text="추가 데이터를 불러오는 중..." />
          </div>
        )}
      </main>

      {/* 지도 모달 */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Hospital Locations</h3>
              <button
                onClick={closeMapModal}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full cursor-pointer whitespace-nowrap"
              >
                <i className="ri-close-line text-gray-600"></i>
              </button>
            </div>

            <div className="flex-1 relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d101332.88105477017!2d126.977969!3d37.566535!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357ca28b61c565cd%3A0x858aedb4e4ea83eb!2sSeoul%2C%20South%20Korea!5e0!3m2!1sen!2s!4v1699999999999!5m2!1sen!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-b-2xl"
              />

              <div className="absolute top-4 left-4 bg-white rounded-xl shadow-lg p-3 max-w-xs">
                <div className="flex items-center mb-2">
                  <div className="w-6 h-6 flex items-center justify-center bg-[#A8E6CF] rounded-full mr-2">
                    <i className="ri-hospital-line text-white text-sm"></i>
                  </div>
                  <span className="font-medium text-gray-800 text-sm">Seoul Medical District</span>
                </div>
                <p className="text-xs text-gray-600">{hospitals.length} hospitals in this area</p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                {hospitals.map((hospital) => (
                  <div key={hospital.id} className="flex items-center bg-white rounded-lg p-2">
                    <div className="w-6 h-6 flex items-center justify-center bg-[#A8E6CF]/20 rounded-full mr-2">
                      <i className="ri-map-pin-fill text-[#A8E6CF] text-xs"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-xs truncate">{hospital.name}</p>
                      <p className="text-gray-500 text-xs">{hospital.specialty || 'General'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}

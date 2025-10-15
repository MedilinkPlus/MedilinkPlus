'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import InterpreterFilters from './InterpreterFilters';
import InterpreterCard from './InterpreterCard';
import { useInterpreters } from '@/hooks/useInterpreters';
import { LoadingSpinner } from '@/components/system/LoadingSpinner';
import { ErrorMessage } from '@/components/system/ErrorMessage';
import { NoSearchResults } from '@/components/system/EmptyState';

export default function InterpretersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    specialtyFilter: '',
    minRating: 0,
    minExperience: 0
  });

  // 통역사 데이터 훅 사용
  const { 
    interpreters, 
    loading, 
    error, 
    total,
    page,
    totalPages,
    fetchInterpreters,
    fetchNextPage,
    fetchPreviousPage,
    goToPage,
    searchInterpreters,
    filterInterpreters,
    clearFilters,
    isSearching
  } = useInterpreters({ 
    autoFetch: true,
    limit: 20
  });

  // 검색 처리
  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchInterpreters(searchQuery.trim());
    } else {
      clearFilters();
    }
  };

  // 검색어 변경 시 디바운스 처리
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else if (isSearching) {
        clearFilters();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 필터 변경 처리
  const handleFilterChange = (filters: Partial<typeof searchFilters>) => {
    const newFilters = { ...searchFilters, ...filters };
    setSearchFilters(newFilters);
    filterInterpreters(newFilters);
  };

  // 페이지 변경 처리
  const handlePageChange = (newPage: number) => {
    goToPage(newPage);
  };

  // 로딩 상태
  if (loading && interpreters.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />
        <main className="pt-4">
          <div className="px-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Medical Interpreters</h1>
            <p className="text-gray-600 text-sm mb-4">Find certified interpreters for your medical journey</p>
          </div>
          <LoadingSpinner size="lg" text="통역사 정보를 불러오는 중..." className="py-20" />
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      
      <main className="pt-4">
        <div className="px-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Medical Interpreters</h1>
          <p className="text-gray-600 text-sm mb-4">Find certified interpreters for your medical journey</p>
        </div>

        {/* 검색 바 */}
        <div className="px-4 mb-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 flex items-center justify-center">
              <i className="ri-search-line text-gray-400"></i>
            </div>
            <input
              type="text"
              placeholder="Search interpreters by name or specialty..."
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
        
        {/* 에러 상태 */}
        {error && (
          <div className="px-4 mb-4">
            <ErrorMessage error={error} onRetry={fetchInterpreters} />
          </div>
        )}

        {/* 통역사 수 표시 */}
        <div className="px-4 mb-4 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {isSearching ? `${interpreters.length} 검색 결과` : `${total} 통역사`}
          </span>
          {isSearching && (
            <button
              onClick={clearFilters}
              className="text-[#A8E6CF] text-sm cursor-pointer hover:text-[#8DD5B8]"
            >
              Clear Search
            </button>
          )}
        </div>
        
        {/* 필터 */}
        <InterpreterFilters onFilterChange={handleFilterChange} />
        
        {/* 통역사 목록 */}
        <div className="px-4 space-y-4">
          {interpreters.length === 0 ? (
            isSearching ? (
              <NoSearchResults
                searchTerm={searchQuery}
                onClear={() => {
                  setSearchQuery('');
                  clearFilters();
                }}
              />
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full mx-auto mb-4">
                  <i className="ri-translate-2 text-gray-400 text-2xl"></i>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">No interpreters available</h3>
                <p className="text-gray-600 text-sm">
                  Please check back later or contact support for assistance.
                </p>
              </div>
            )
          ) : (
            <>
              {interpreters.map((interpreter) => (
                <InterpreterCard key={interpreter.id} interpreter={interpreter} />
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

        {/* 추가 로딩 상태 */}
        {loading && interpreters.length > 0 && (
          <div className="px-4 mb-4">
            <LoadingSpinner size="md" text="추가 데이터를 불러오는 중..." />
          </div>
        )}
        
        {/* 인증 배지 */}
        <div className="px-4 mt-8 mb-8">
          <div className="bg-[#A8E6CF]/10 rounded-2xl p-4 text-center">
            <div className="w-12 h-12 flex items-center justify-center bg-[#A8E6CF] rounded-full mx-auto mb-3">
              <i className="ri-shield-check-line text-white text-xl"></i>
            </div>
            <h3 className="font-bold text-gray-800 mb-2">All interpreters are certified</h3>
            <p className="text-gray-600 text-sm">Licensed medical interpreters with hospital partnerships</p>
          </div>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
}
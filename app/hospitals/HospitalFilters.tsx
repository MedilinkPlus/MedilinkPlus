'use client';

import { useState, useEffect } from 'react';
import type { HospitalSearchInput } from '@/lib/validations';

interface HospitalFiltersProps {
  onFilterChange: (filters: Partial<HospitalSearchInput>) => void;
}

export default function HospitalFilters({ onFilterChange }: HospitalFiltersProps) {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [showPromotions, setShowPromotions] = useState(false);

  const specialties = [
    'Dental Care', 'Plastic Surgery', 'Dermatology', 
    'General Surgery', 'Cardiology', 'Orthopedics',
    'Neurology', 'Oncology', 'Pediatrics'
  ];

  const ratingOptions = [
    { value: 4.5, label: '4.5+ Stars' },
    { value: 4.0, label: '4.0+ Stars' },
    { value: 3.5, label: '3.5+ Stars' }
  ];

  const priceRanges = [
    { value: 1000, label: 'Under $1,000' },
    { value: 2000, label: 'Under $2,000' },
    { value: 5000, label: 'Under $5,000' }
  ];

  // 필터 변경 시 부모 컴포넌트에 알림
  useEffect(() => {
    const filters: Partial<HospitalSearchInput> = {};
    
    if (selectedSpecialty) {
      filters.specialty_filter = selectedSpecialty;
    }
    
    if (selectedRating) {
      filters.min_rating = selectedRating;
    }
    
    if (selectedPriceRange) {
      filters.max_price_filter = selectedPriceRange;
    }

    onFilterChange(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSpecialty, selectedRating, selectedPriceRange]);

  // 모든 필터 초기화
  const clearAllFilters = () => {
    setSelectedSpecialty('');
    setSelectedRating(null);
    setSelectedPriceRange(null);
    setShowPromotions(false);
  };

  return (
    <div className="px-4 mb-6">
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-800">Filters</h3>
          <button 
            onClick={clearAllFilters}
            className="text-[#A8E6CF] text-sm cursor-pointer whitespace-nowrap hover:text-[#8DD5B8]"
          >
            Clear All
          </button>
        </div>
        
        <div className="space-y-4">
          {/* 전문분야 필터 */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Specialty</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSpecialty('')}
                className={`px-3 py-1 rounded-full text-xs cursor-pointer whitespace-nowrap ${
                  selectedSpecialty === ''
                    ? 'bg-[#A8E6CF] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {specialties.map((specialty) => (
                <button
                  key={specialty}
                  onClick={() => setSelectedSpecialty(specialty)}
                  className={`px-3 py-1 rounded-full text-xs cursor-pointer whitespace-nowrap ${
                    selectedSpecialty === specialty
                      ? 'bg-[#A8E6CF] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>
          </div>
          
          {/* 평점 필터 */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Minimum Rating</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedRating(null)}
                className={`px-3 py-1 rounded-full text-xs cursor-pointer whitespace-nowrap ${
                  selectedRating === null
                    ? 'bg-[#FFD3B6] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Any Rating
              </button>
              {ratingOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedRating(option.value)}
                  className={`px-3 py-1 rounded-full text-xs cursor-pointer whitespace-nowrap ${
                    selectedRating === option.value
                      ? 'bg-[#FFD3B6] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* 가격 범위 필터 */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Maximum Price</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedPriceRange(null)}
                className={`px-3 py-1 rounded-full text-xs cursor-pointer whitespace-nowrap ${
                  selectedPriceRange === null
                    ? 'bg-[#E0BBE4] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Any Price
              </button>
              {priceRanges.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedPriceRange(option.value)}
                  className={`px-3 py-1 rounded-full text-xs cursor-pointer whitespace-nowrap ${
                    selectedPriceRange === option.value
                      ? 'bg-[#E0BBE4] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* 프로모션 필터 (향후 구현) */}
          <div className="flex items-center">
            <button
              onClick={() => setShowPromotions(!showPromotions)}
              className={`flex items-center px-3 py-2 rounded-full text-sm cursor-pointer whitespace-nowrap ${
                showPromotions
                  ? 'bg-[#E0BBE4] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="w-4 h-4 flex items-center justify-center mr-2">
                <i className="ri-gift-line"></i>
              </div>
              Show Promotions Only
            </button>
          </div>
        </div>

        {/* 활성 필터 표시 */}
        {(selectedSpecialty || selectedRating || selectedPriceRange) && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Active Filters:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedSpecialty && (
                <span className="px-2 py-1 bg-[#A8E6CF]/20 text-[#A8E6CF] text-xs rounded-full">
                  {selectedSpecialty}
                </span>
              )}
              {selectedRating && (
                <span className="px-2 py-1 bg-[#FFD3B6]/20 text-[#FFD3B6] text-xs rounded-full">
                  {selectedRating}+ Stars
                </span>
              )}
              {selectedPriceRange && (
                <span className="px-2 py-1 bg-[#E0BBE4]/20 text-[#E0BBE4] text-xs rounded-full">
                  Under ${selectedPriceRange.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
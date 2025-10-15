'use client';

import { useState, useEffect } from 'react';

interface InterpreterFiltersProps {
  onFilterChange: (filters: {
    specialtyFilter: string;
    minRating: number;
    minExperience: number;
  }) => void;
}

export default function InterpreterFilters({ onFilterChange }: InterpreterFiltersProps) {
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedRating, setSelectedRating] = useState('All');
  const [selectedExperience, setSelectedExperience] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const specialties = ['All', 'Dental Care', 'Plastic Surgery', 'General Surgery', 'Dermatology', 'Cardiology', 'Orthopedics', 'Neurology', 'Oncology', 'Pediatrics'];
  const ratings = [
    { value: 'All', label: 'All Ratings' },
    { value: '4.0', label: '4.0+' },
    { value: '4.5', label: '4.5+' },
    { value: '4.7', label: '4.7+' },
    { value: '4.9', label: '4.9+' }
  ];
  const experiences = [
    { value: 'All', label: 'All Experience' },
    { value: '1', label: '1+ years' },
    { value: '3', label: '3+ years' },
    { value: '5', label: '5+ years' },
    { value: '7', label: '7+ years' }
  ];

  // 필터 변경 시 onFilterChange 호출
  useEffect(() => {
    const filters = {
      specialtyFilter: selectedSpecialty === 'All' ? '' : selectedSpecialty,
      minRating: selectedRating === 'All' ? 0 : parseFloat(selectedRating),
      minExperience: selectedExperience === 'All' ? 0 : parseInt(selectedExperience)
    };
    onFilterChange(filters);
  }, [selectedSpecialty, selectedRating, selectedExperience, onFilterChange]);

  const clearAllFilters = () => {
    setSelectedSpecialty('All');
    setSelectedRating('All');
    setSelectedExperience('All');
  };

  return (
    <div className="px-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center bg-white px-4 py-2 rounded-full border border-gray-200 cursor-pointer whitespace-nowrap hover:bg-gray-50 transition-colors"
        >
          <div className="w-4 h-4 flex items-center justify-center mr-2">
            <i className="ri-filter-line text-gray-600"></i>
          </div>
          <span className="text-sm text-gray-700">Filters</span>
        </button>
        
        <div className="flex items-center space-x-2">
          {(selectedSpecialty !== 'All' || selectedRating !== 'All' || selectedExperience !== 'All') && (
            <button
              onClick={clearAllFilters}
              className="text-[#A8E6CF] text-sm cursor-pointer hover:text-[#8DD5B8]"
            >
              Clear All
            </button>
          )}
        </div>
      </div>
      
      {showFilters && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-4">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Specialty</h4>
            <div className="flex flex-wrap gap-2">
              {specialties.map((specialty) => (
                <button
                  key={specialty}
                  onClick={() => setSelectedSpecialty(specialty)}
                  className={`px-3 py-1 rounded-full text-sm cursor-pointer whitespace-nowrap transition-colors ${
                    selectedSpecialty === specialty
                      ? 'bg-[#A8E6CF] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Minimum Rating</h4>
            <div className="flex flex-wrap gap-2">
              {ratings.map((rating) => (
                <button
                  key={rating.value}
                  onClick={() => setSelectedRating(rating.value)}
                  className={`px-3 py-1 rounded-full text-sm cursor-pointer whitespace-nowrap transition-colors ${
                    selectedRating === rating.value
                      ? 'bg-[#FFD3B6] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {rating.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Minimum Experience</h4>
            <div className="flex flex-wrap gap-2">
              {experiences.map((experience) => (
                <button
                  key={experience.value}
                  onClick={() => setSelectedExperience(experience.value)}
                  className={`px-3 py-1 rounded-full text-sm cursor-pointer whitespace-nowrap transition-colors ${
                    selectedExperience === experience.value
                      ? 'bg-[#E0BBE4] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {experience.label}
                </button>
              ))}
            </div>
          </div>

          {/* 활성 필터 표시 */}
          {(selectedSpecialty !== 'All' || selectedRating !== 'All' || selectedExperience !== 'All') && (
            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Active Filters:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedSpecialty !== 'All' && (
                  <span className="px-2 py-1 bg-[#A8E6CF]/20 text-[#A8E6CF] text-xs rounded-full">
                    {selectedSpecialty}
                  </span>
                )}
                {selectedRating !== 'All' && (
                  <span className="px-2 py-1 bg-[#FFD3B6]/20 text-[#FFD3B6] text-xs rounded-full">
                    {selectedRating}+ Stars
                  </span>
                )}
                {selectedExperience !== 'All' && (
                  <span className="px-2 py-1 bg-[#E0BBE4]/20 text-[#E0BBE4] text-xs rounded-full">
                    {selectedExperience}+ years
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
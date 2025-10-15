'use client';

import React from 'react';

export interface FilterOption {
  value: string;
  label: string;
}

export interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: {
    name: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
    placeholder?: string;
  }[];
  className?: string;
  showSearch?: boolean;
  showFilters?: boolean;
}

export default function SearchFilter({
  searchTerm,
  onSearchChange,
  searchPlaceholder = '검색어를 입력하세요...',
  filters = [],
  className = '',
  showSearch = true,
  showFilters = true
}: SearchFilterProps) {
  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* 검색 입력 */}
        {showSearch && (
          <div className="flex-1">
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                <i className="ri-search-line text-gray-400"></i>
              </div>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] focus:ring-2 focus:ring-[#A8E6CF]/20"
              />
            </div>
          </div>
        )}

        {/* 필터 옵션들 */}
        {showFilters && filters.map((filter) => (
          <select
            key={filter.name}
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] focus:ring-2 focus:ring-[#A8E6CF]/20"
          >
            <option value="">{filter.placeholder || '선택하세요'}</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ))}
      </div>
    </div>
  );
}

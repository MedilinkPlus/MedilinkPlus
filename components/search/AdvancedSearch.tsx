'use client'

import { useState, useEffect, useCallback } from 'react'
import { LoadingSpinner } from '@/components/system/LoadingSpinner'
import { ErrorMessage } from '@/components/system/ErrorMessage'
import { supabase } from '@/supabase/supabaseClient'
import type { Tables } from '@/types/supabase'

interface SearchFilters {
  specialty: string
  minRating: number
  maxPrice: number
  location: string
}

interface AdvancedSearchProps {
  onResultsUpdate?: (results: Tables<'hospitals'>[]) => void
  className?: string
}

export default function AdvancedSearch({ onResultsUpdate, className = "" }: AdvancedSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({
    specialty: '',
    minRating: 0,
    maxPrice: 1000000,
    location: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  // 간단한 디바운스 구현
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const performSearch = useCallback(async () => {
    if (!debouncedSearchTerm.trim() && !Object.values(filters).some(v => v !== '' && v !== 0)) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('hospitals')
        .select('*')
        .eq('status', 'active')

      // 검색어 필터
      if (debouncedSearchTerm.trim()) {
        query = query.or(`name.ilike.%${debouncedSearchTerm}%,specialty.ilike.%${debouncedSearchTerm}%`)
      }

      // 전문 분야 필터
      if (filters.specialty) {
        query = query.eq('specialty', filters.specialty)
      }

      // 최소 평점 필터
      if (filters.minRating > 0) {
        query = query.gte('rating', filters.minRating)
      }

      // 최대 가격 필터
      if (filters.maxPrice < 1000000) {
        query = query.lte('max_price', filters.maxPrice)
      }

      // 위치 필터
      if (filters.location) {
        query = query.ilike('address', `%${filters.location}%`)
      }

      const { data, error: searchError } = await query

      if (searchError) throw searchError

      onResultsUpdate?.(data || [])
    } catch (err: any) {
      setError('검색 중 오류가 발생했습니다.')
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearchTerm, filters, onResultsUpdate])

  useEffect(() => {
    performSearch()
  }, [performSearch])

  const handleFilterChange = (key: keyof SearchFilters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      specialty: '',
      minRating: 0,
      maxPrice: 1000000,
      location: ''
    })
    setSearchTerm('')
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">고급 검색</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          필터 초기화
        </button>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorMessage error={error} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 검색어 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            검색어
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="병원명 또는 전문분야"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* 전문 분야 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            전문 분야
          </label>
          <select
            value={filters.specialty}
            onChange={(e) => handleFilterChange('specialty', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">전체</option>
            <option value="cardiology">심장학</option>
            <option value="neurology">신경학</option>
            <option value="orthopedics">정형외과</option>
            <option value="pediatrics">소아과</option>
            <option value="dermatology">피부과</option>
            <option value="oncology">종양학</option>
          </select>
        </div>

        {/* 최소 평점 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            최소 평점
          </label>
          <select
            value={filters.minRating}
            onChange={(e) => handleFilterChange('minRating', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={0}>전체</option>
            <option value={3.0}>3.0 이상</option>
            <option value={3.5}>3.5 이상</option>
            <option value={4.0}>4.0 이상</option>
            <option value={4.5}>4.5 이상</option>
          </select>
        </div>

        {/* 최대 가격 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            최대 가격
          </label>
          <select
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={1000000}>제한 없음</option>
            <option value={100000}>10만원 이하</option>
            <option value={300000}>30만원 이하</option>
            <option value={500000}>50만원 이하</option>
            <option value={1000000}>100만원 이하</option>
          </select>
        </div>
      </div>

      {/* 위치 검색 */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          위치
        </label>
        <input
          type="text"
          value={filters.location}
          onChange={(e) => handleFilterChange('location', e.target.value)}
          placeholder="도시 또는 지역명"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* 검색 상태 */}
      {loading && (
        <div className="mt-4 flex items-center justify-center">
          <LoadingSpinner size="sm" text="검색 중..." />
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

interface FilterOption {
  value: string
  label: string
  count?: number
}

interface SearchFilter {
  key: string
  label: string
  type: 'select' | 'multiselect' | 'range' | 'date' | 'boolean'
  options?: FilterOption[]
  min?: number
  max?: number
  step?: number
  placeholder?: string
}

interface AdvancedSearchFiltersProps {
  filters: SearchFilter[]
  onFiltersChange: (filters: Record<string, any>) => void
  className?: string
  showAdvanced?: boolean
}

export default function AdvancedSearchFilters({
  filters,
  onFiltersChange,
  className = "",
  showAdvanced = false
}: AdvancedSearchFiltersProps) {
  const [filterValues, setFilterValues] = useState<Record<string, any>>({})
  const [isAdvancedVisible, setIsAdvancedVisible] = useState(showAdvanced)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  // 디바운스된 검색어
  const debounceTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [searchTerm])

  // 필터 값 변경 처리
  const handleFilterChange = useCallback((key: string, value: any) => {
    const newFilters = { ...filterValues, [key]: value }
    setFilterValues(newFilters)
    onFiltersChange(newFilters)
  }, [filterValues, onFiltersChange])

  // 검색어 변경 처리
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
    handleFilterChange('search', value)
  }, [handleFilterChange])

  // 필터 초기화
  const resetFilters = useCallback(() => {
    const resetValues: Record<string, any> = {}
    filters.forEach(filter => {
      if (filter.type === 'multiselect') {
        resetValues[filter.key] = []
      } else if (filter.type === 'range') {
        resetValues[filter.key] = { min: filter.min, max: filter.max }
      } else if (filter.type === 'boolean') {
        resetValues[filter.key] = false
      } else {
        resetValues[filter.key] = ''
      }
    })
    resetValues.search = ''
    setFilterValues(resetValues)
    setSearchTerm('')
    onFiltersChange(resetValues)
  }, [filters, onFiltersChange])

  // 필터 옵션 렌더링
  const renderFilterInput = (filter: SearchFilter) => {
    switch (filter.type) {
      case 'select':
        return (
          <select
            value={filterValues[filter.key] || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{filter.placeholder || '선택하세요'}</option>
            {filter.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} {option.count !== undefined && `(${option.count})`}
              </option>
            ))}
          </select>
        )

      case 'multiselect':
        return (
          <div className="space-y-2">
            {filter.options?.map((option) => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filterValues[filter.key]?.includes(option.value) || false}
                  onChange={(e) => {
                    const currentValues = filterValues[filter.key] || []
                    const newValues = e.target.checked
                      ? [...currentValues, option.value]
                      : currentValues.filter((v: string) => v !== option.value)
                    handleFilterChange(filter.key, newValues)
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  {option.label} {option.count !== undefined && `(${option.count})`}
                </span>
              </label>
            ))}
          </div>
        )

      case 'range':
        const currentRange = filterValues[filter.key] || { min: filter.min, max: filter.max }
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min={filter.min}
                max={filter.max}
                step={filter.step || 1}
                value={currentRange.min || ''}
                onChange={(e) => handleFilterChange(filter.key, {
                  ...currentRange,
                  min: e.target.value ? Number(e.target.value) : filter.min
                })}
                placeholder={filter.min?.toString()}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <span className="text-gray-500">~</span>
              <input
                type="number"
                min={filter.min}
                max={filter.max}
                step={filter.step || 1}
                value={currentRange.max || ''}
                onChange={(e) => handleFilterChange(filter.key, {
                  ...currentRange,
                  max: e.target.value ? Number(e.target.value) : filter.max
                })}
                placeholder={filter.max?.toString()}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <div className="text-xs text-gray-500">
              {filter.min} ~ {filter.max}
            </div>
          </div>
        )

      case 'date':
        return (
          <input
            type="date"
            value={filterValues[filter.key] || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        )

      case 'boolean':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filterValues[filter.key] || false}
              onChange={(e) => handleFilterChange(filter.key, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">활성화</span>
          </label>
        )

      default:
        return null
    }
  }

  // 활성 필터 개수 계산
  const activeFiltersCount = Object.keys(filterValues).filter(key => {
    const value = filterValues[key]
    if (key === 'search') return value && value.trim() !== ''
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'object') return value.min !== undefined || value.max !== undefined
    return value !== '' && value !== false
  }).length

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">고급 검색</h3>
          <div className="flex items-center space-x-2">
            {activeFiltersCount > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {activeFiltersCount}개 활성
              </span>
            )}
            <button
              onClick={() => setIsAdvancedVisible(!isAdvancedVisible)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {isAdvancedVisible ? '간단히' : '고급'}
            </button>
          </div>
        </div>

        {/* 기본 검색 */}
        <div className="mt-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="검색어를 입력하세요..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* 고급 필터 */}
      {isAdvancedVisible && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter) => (
              <div key={filter.key} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {filter.label}
                </label>
                {renderFilterInput(filter)}
              </div>
            ))}
          </div>

          {/* 필터 액션 */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              필터 초기화
            </button>
            <div className="text-sm text-gray-500">
              {activeFiltersCount}개 필터 적용됨
            </div>
          </div>
        </div>
      )}

      {/* 활성 필터 표시 */}
      {activeFiltersCount > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">활성 필터:</span>
            {Object.entries(filterValues).map(([key, value]) => {
              if (key === 'search' && value && value.trim() !== '') {
                return (
                  <span key={key} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    검색: {value}
                    <button
                      onClick={() => handleFilterChange(key, '')}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )
              }
              if (Array.isArray(value) && value.length > 0) {
                return (
                  <span key={key} className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {key}: {value.join(', ')}
                    <button
                      onClick={() => handleFilterChange(key, [])}
                      className="ml-1 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                )
              }
              if (typeof value === 'object' && value !== null && (value.min !== undefined || value.max !== undefined)) {
                const filter = filters.find(f => f.key === key)
                if (filter?.type === 'range') {
                  return (
                    <span key={key} className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      {filter.label}: {value.min || filter.min} ~ {value.max || filter.max}
                      <button
                        onClick={() => handleFilterChange(key, { min: filter.min, max: filter.max })}
                        className="ml-1 text-purple-600 hover:text-purple-800"
                      >
                        ×
                      </button>
                    </span>
                  )
                }
              }
              if (value !== '' && value !== false && key !== 'search') {
                const filter = filters.find(f => f.key === key)
                const option = filter?.options?.find(opt => opt.value === value)
                return (
                  <span key={key} className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    {filter?.label}: {option?.label || value}
                    <button
                      onClick={() => handleFilterChange(key, filter?.type === 'boolean' ? false : '')}
                      className="ml-1 text-yellow-600 hover:text-yellow-800"
                    >
                      ×
                    </button>
                  </span>
                )
              }
              return null
            })}
          </div>
        </div>
      )}
    </div>
  )
}

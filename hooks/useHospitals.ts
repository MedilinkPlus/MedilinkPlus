import { useState, useEffect, useCallback } from 'react'
import { HospitalService } from '@/services/hospitalService'
import type { Hospital } from '@/types/supabase'
import type { HospitalSearchInput } from '@/lib/validations'
import type { Tables } from '@/types/supabase'

interface UseHospitalsOptions {
  page?: number
  limit?: number
  autoFetch?: boolean
}

interface UseHospitalsReturn {
  hospitals: Hospital[]
  loading: boolean
  error: string | null
  total: number
  page: number
  totalPages: number
  fetchHospitals: () => Promise<void>
  fetchNextPage: () => Promise<void>
  fetchPreviousPage: () => Promise<void>
  goToPage: (page: number) => Promise<void>
  searchHospitals: (params: HospitalSearchInput) => Promise<void>
  clearSearch: () => void
  isSearching: boolean
}

export function useHospitals(options: UseHospitalsOptions = {}): UseHospitalsReturn {
  const { page: initialPage = 1, limit = 20, autoFetch = true } = options
  
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(0)
  const [isSearching, setIsSearching] = useState(false)

  const fetchHospitals = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await HospitalService.getHospitals(page, limit)
      
      setHospitals(result.hospitals)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch (err: any) {
      setError(err.message || '병원 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [page, limit])

  const searchHospitals = useCallback(async (params: HospitalSearchInput) => {
    try {
      setLoading(true)
      setError(null)
      setIsSearching(true)
      
      const results = await HospitalService.searchHospitals(params) as Tables<'hospitals'>[]
      
      setHospitals(results || [])
      const resultsCount = (results || []).length
      setTotal(resultsCount)
      setTotalPages(Math.ceil(resultsCount / limit))
      setPage(1)
    } catch (err: any) {
      setError(err.message || '병원 검색에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [limit])

  const clearSearch = useCallback(() => {
    setIsSearching(false)
    setPage(1)
    fetchHospitals()
  }, [fetchHospitals])

  const fetchNextPage = useCallback(async () => {
    if (page < totalPages) {
      setPage(prev => prev + 1)
    }
  }, [page, totalPages])

  const fetchPreviousPage = useCallback(async () => {
    if (page > 1) {
      setPage(prev => prev - 1)
    }
  }, [page])

  const goToPage = useCallback(async (targetPage: number) => {
    if (targetPage >= 1 && targetPage <= totalPages) {
      setPage(targetPage)
    }
  }, [totalPages])

  // 페이지 변경 시 자동으로 데이터 다시 불러오기
  useEffect(() => {
    if (autoFetch && !isSearching) {
      fetchHospitals()
    }
  }, [page, autoFetch, isSearching, fetchHospitals])

  // 초기 로딩
  useEffect(() => {
    if (autoFetch) {
      fetchHospitals()
    }
  }, [autoFetch, fetchHospitals])

  return {
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
  }
}

// 병원 상세 정보 훅
export function useHospital(id: string | null) {
  const [hospital, setHospital] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHospital = useCallback(async () => {
    if (!id) return
    // Validate UUID format to avoid Supabase UUID casting errors
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      setError('잘못된 병원 ID 형식입니다.')
      setHospital(null)
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      const data = await HospitalService.getHospitalById(id)
      setHospital(data)
    } catch (err: any) {
      setError(err.message || '병원 정보를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchHospital()
  }, [fetchHospital])

  return {
    hospital,
    loading,
    error,
    refetch: fetchHospital
  }
}

// 병원 요금 정보 훅
export function useHospitalFees(hospitalId: string | null) {
  const [fees, setFees] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFees = useCallback(async () => {
    if (!hospitalId) return
    // Validate UUID to avoid Supabase errors when given numeric IDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(hospitalId)) {
      setError('잘못된 병원 ID 형식입니다.')
      setFees([])
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      const data = await HospitalService.getHospitalFees(hospitalId)
      setFees(data)
    } catch (err: any) {
      setError(err.message || '요금 정보를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [hospitalId])

  useEffect(() => {
    fetchFees()
  }, [fetchFees])

  return {
    fees,
    loading,
    error,
    refetch: fetchFees
  }
}

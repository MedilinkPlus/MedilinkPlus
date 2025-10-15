import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/supabase/supabaseClient'
import { handleSupabaseError } from '@/lib/errors'
import type { Interpreter } from '@/types/supabase'

interface UseInterpretersOptions {
  page?: number
  limit?: number
  autoFetch?: boolean
  searchTerm?: string
  specialtyFilter?: string
  minRating?: number
  minExperience?: number
}

interface UseInterpretersReturn {
  interpreters: Interpreter[]
  loading: boolean
  error: string | null
  total: number
  page: number
  totalPages: number
  fetchInterpreters: () => Promise<void>
  fetchNextPage: () => Promise<void>
  fetchPreviousPage: () => Promise<void>
  goToPage: (page: number) => Promise<void>
  searchInterpreters: (searchTerm: string) => Promise<void>
  filterInterpreters: (filters: Partial<UseInterpretersOptions>) => Promise<void>
  clearFilters: () => void
  isSearching: boolean
}

export function useInterpreters(options: UseInterpretersOptions = {}): UseInterpretersReturn {
  const { 
    page: initialPage = 1, 
    limit = 20, 
    autoFetch = true,
    searchTerm: initialSearchTerm,
    specialtyFilter: initialSpecialtyFilter,
    minRating: initialMinRating,
    minExperience: initialMinExperience
  } = options
  
  const [interpreters, setInterpreters] = useState<Interpreter[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  const [currentFilters, setCurrentFilters] = useState({
    searchTerm: initialSearchTerm || '',
    specialtyFilter: initialSpecialtyFilter || '',
    minRating: initialMinRating || 0,
    minExperience: initialMinExperience || 0
  })

  const fetchInterpreters = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      let query = supabase
        .from('interpreters')
        .select(`
          *,
          users!inner(
            id,
            name,
            email,
            phone,
            avatar_url
          )
        `)
        .eq('status', 'active')
        .range((page - 1) * limit, page * limit - 1)

      // 필터 적용
      if (currentFilters.specialtyFilter) {
        query = query.contains('specialties', [currentFilters.specialtyFilter])
      }
      
      if (currentFilters.minRating > 0) {
        query = query.gte('rating', currentFilters.minRating)
      }
      
      if (currentFilters.minExperience > 0) {
        query = query.gte('experience_years', currentFilters.minExperience)
      }

      const { data, error: fetchError, count } = await query

      if (fetchError) throw fetchError

      // 사용자 정보와 통역사 정보 결합
      const combinedInterpreters = data?.map(interpreter => {
        const base = (interpreter || {}) as any
        return {
          ...base,
          name: base.users?.name || 'Unknown',
          email: base.users?.email || '',
          phone: base.users?.phone || '',
          avatar_url: base.users?.avatar_url || ''
        }
      }) || []

      setInterpreters(combinedInterpreters)
      setTotal(count || 0)
      setTotalPages(Math.ceil((count || 0) / limit))
    } catch (err: any) {
      const domainError = handleSupabaseError(err)
      setError(domainError.message)
    } finally {
      setLoading(false)
    }
  }, [page, limit, currentFilters])

  const searchInterpreters = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      await fetchInterpreters()
      return
    }

    try {
      setLoading(true)
      setError(null)
      setIsSearching(true)
      
      const { data, error: searchError, count } = await supabase
        .from('interpreters')
        .select(`
          *,
          users!inner(
            id,
            name,
            email,
            phone,
            avatar_url
          )
        `)
        .eq('status', 'active')
        .or(`users.name.ilike.%${searchTerm}%,specialties.cs.{${searchTerm}}`)
        .range(0, limit - 1)

      if (searchError) throw searchError

      const combinedInterpreters = data?.map(interpreter => {
        const base = (interpreter || {}) as any
        return {
          ...base,
          name: base.users?.name || 'Unknown',
          email: base.users?.email || '',
          phone: base.users?.phone || '',
          avatar_url: base.users?.avatar_url || ''
        }
      }) || []

      setInterpreters(combinedInterpreters)
      setTotal(count || 0)
      setTotalPages(Math.ceil((count || 0) / limit))
      setPage(1)
    } catch (err: any) {
      const domainError = handleSupabaseError(err)
      setError(domainError.message)
    } finally {
      setLoading(false)
    }
  }, [limit])

  const filterInterpreters = useCallback(async (filters: Partial<UseInterpretersOptions>) => {
    try {
      setLoading(true)
      setError(null)
      
      const newFilters = { ...currentFilters, ...filters }
      setCurrentFilters(newFilters)
      setPage(1)
      
      let query = supabase
        .from('interpreters')
        .select(`
          *,
          users!inner(
            id,
            name,
            email,
            phone,
            avatar_url
          )
        `)
        .eq('status', 'active')
        .range(0, limit - 1)

      // 필터 적용
      if (newFilters.specialtyFilter) {
        query = query.contains('specialties', [newFilters.specialtyFilter])
      }
      
      if (newFilters.minRating > 0) {
        query = query.gte('rating', newFilters.minRating)
      }
      
      if (newFilters.minExperience > 0) {
        query = query.gte('experience_years', newFilters.minExperience)
      }

      const { data, error: filterError, count } = await query

      if (filterError) throw filterError

      const combinedInterpreters = data?.map(interpreter => {
        const base = (interpreter || {}) as any
        return {
          ...base,
          name: base.users?.name || 'Unknown',
          email: base.users?.email || '',
          phone: base.users?.phone || '',
          avatar_url: base.users?.avatar_url || ''
        }
      }) || []

      setInterpreters(combinedInterpreters)
      setTotal(count || 0)
      setTotalPages(Math.ceil((count || 0) / limit))
    } catch (err: any) {
      const domainError = handleSupabaseError(err)
      setError(domainError.message)
    } finally {
      setLoading(false)
    }
  }, [currentFilters, limit])

  const clearFilters = useCallback(() => {
    setCurrentFilters({
      searchTerm: '',
      specialtyFilter: '',
      minRating: 0,
      minExperience: 0
    })
    setPage(1)
    setIsSearching(false)
  }, [])

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

  const goToPage = useCallback(async (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }, [totalPages])

  // 페이지 변경 시 데이터 재로드
  useEffect(() => {
    if (page !== initialPage) {
      fetchInterpreters()
    }
  }, [page, fetchInterpreters, initialPage])

  // 초기 로딩
  useEffect(() => {
    if (autoFetch) {
      fetchInterpreters()
    }
  }, [autoFetch, fetchInterpreters])

  return {
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
  }
}

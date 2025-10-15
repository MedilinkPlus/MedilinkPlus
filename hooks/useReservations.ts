import { useState, useEffect, useCallback } from 'react'
import { ReservationService } from '@/services/reservationService'
import type { Reservation, UserReservation } from '@/types/supabase'
import type { ReservationCreateInput, ReservationUpdateInput, ReservationFilterInput } from '@/lib/validations'

interface UseReservationsOptions {
  userId?: string
  userRole?: string
  page?: number
  limit?: number
  autoFetch?: boolean
}

interface UseReservationsReturn {
  reservations: Reservation[]
  loading: boolean
  error: string | null
  total: number
  page: number
  totalPages: number
  fetchReservations: () => Promise<void>
  fetchNextPage: () => Promise<void>
  fetchPreviousPage: () => Promise<void>
  goToPage: (page: number) => Promise<void>
  filterReservations: (filters: ReservationFilterInput) => Promise<void>
  clearFilters: () => void
  isFiltering: boolean
  createReservation: (data: ReservationCreateInput) => Promise<Reservation | null>
  updateReservation: (id: string, data: ReservationUpdateInput) => Promise<Reservation | null>
  cancelReservation: (id: string, reason: string) => Promise<boolean>
  changeStatus: (id: string, status: Reservation['status']) => Promise<boolean>
}

export function useReservations(options: UseReservationsOptions = {}): UseReservationsReturn {
  const { 
    userId, 
    userRole = 'user', 
    page: initialPage = 1, 
    limit = 20, 
    autoFetch = true 
  } = options
  
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(0)
  const [isFiltering, setIsFiltering] = useState(false)
  const [currentFilters, setCurrentFilters] = useState<ReservationFilterInput>({
    page: initialPage,
    limit
  })

  const fetchReservations = useCallback(async () => {
    if (!userId) return
    
    try {
      setLoading(true)
      setError(null)
      
      const result = await ReservationService.getFilteredReservations(
        { ...currentFilters, page, limit },
        userRole,
        userId
      )
      
      setReservations(result.reservations)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch (err: any) {
      setError(err.message || '예약 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [userId, userRole, page, limit, currentFilters])

  const filterReservations = useCallback(async (filters: ReservationFilterInput) => {
    if (!userId) return
    
    try {
      setLoading(true)
      setError(null)
      setIsFiltering(true)
      
      const newFilters = { ...filters, page: 1, limit }
      setCurrentFilters(newFilters)
      setPage(1)
      
      const result = await ReservationService.getFilteredReservations(
        newFilters,
        userRole,
        userId
      )
      
      setReservations(result.reservations)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch (err: any) {
      setError(err.message || '예약 필터링에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [userId, userRole, limit])

  const clearFilters = useCallback(() => {
    setIsFiltering(false)
    setCurrentFilters({ page: 1, limit })
    setPage(1)
  }, [limit])

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

  const createReservation = useCallback(async (data: ReservationCreateInput): Promise<Reservation | null> => {
    if (!userId) return null
    
    try {
      setLoading(true)
      setError(null)
      
      const newReservation = await ReservationService.createReservation(data, userId)
      
      // 낙관적 업데이트: 새 예약을 목록 맨 위에 추가
      setReservations(prev => [newReservation, ...prev])
      setTotal(prev => prev + 1)
      
      return newReservation
    } catch (err: any) {
      setError(err.message || '예약 생성에 실패했습니다.')
      return null
    } finally {
      setLoading(false)
    }
  }, [userId])

  const updateReservation = useCallback(async (id: string, data: ReservationUpdateInput): Promise<Reservation | null> => {
    try {
      setLoading(true)
      setError(null)
      
      const updatedReservation = await ReservationService.updateReservation(id, data)
      
      // 낙관적 업데이트: 목록에서 해당 예약 업데이트
      setReservations(prev => 
        prev.map(res => res.id === id ? updatedReservation : res)
      )
      
      return updatedReservation
    } catch (err: any) {
      setError(err.message || '예약 수정에 실패했습니다.')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const cancelReservation = useCallback(async (id: string, reason: string): Promise<boolean> => {
    if (!userId) return false
    
    try {
      setLoading(true)
      setError(null)
      
      await ReservationService.cancelReservation(id, reason, userId)
      
      // 낙관적 업데이트: 목록에서 해당 예약 상태 변경
      setReservations(prev => 
        prev.map(res => 
          res.id === id 
            ? { ...res, status: 'cancelled' as const, cancellation_reason: reason }
            : res
        )
      )
      
      return true
    } catch (err: any) {
      setError(err.message || '예약 취소에 실패했습니다.')
      return false
    } finally {
      setLoading(false)
    }
  }, [userId])

  const changeStatus = useCallback(async (id: string, status: Reservation['status']): Promise<boolean> => {
    if (!userId) return false
    
    try {
      setLoading(true)
      setError(null)
      
      await ReservationService.changeReservationStatus(id, status, userId, userRole)
      
      // 낙관적 업데이트: 목록에서 해당 예약 상태 변경
      setReservations(prev => 
        prev.map(res => 
          res.id === id ? { ...res, status } : res
        )
      )
      
      return true
    } catch (err: any) {
      setError(err.message || '상태 변경에 실패했습니다.')
      return false
    } finally {
      setLoading(false)
    }
  }, [userId, userRole])

  // 페이지 변경 시 자동으로 데이터 다시 불러오기
  useEffect(() => {
    if (autoFetch && userId) {
      fetchReservations()
    }
  }, [page, autoFetch, userId, fetchReservations])

  // 초기 로딩
  useEffect(() => {
    if (autoFetch && userId) {
      fetchReservations()
    }
  }, [autoFetch, userId, fetchReservations])

  return {
    reservations,
    loading,
    error,
    total,
    page,
    totalPages,
    fetchReservations,
    fetchNextPage,
    fetchPreviousPage,
    goToPage,
    filterReservations,
    clearFilters,
    isFiltering,
    createReservation,
    updateReservation,
    cancelReservation,
    changeStatus
  }
}

// 사용자 예약 목록 훅 (간단한 버전)
export function useUserReservations(userId: string | null, statusFilter?: string) {
  const [reservations, setReservations] = useState<UserReservation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUserReservations = useCallback(async () => {
    if (!userId) return
    
    try {
      setLoading(true)
      setError(null)
      
      const data = await ReservationService.getUserReservations(userId, statusFilter)
      setReservations(data)
    } catch (err: any) {
      setError(err.message || '예약 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [userId, statusFilter])

  useEffect(() => {
    fetchUserReservations()
  }, [fetchUserReservations])

  return {
    reservations,
    loading,
    error,
    refetch: fetchUserReservations
  }
}

// 예약 상세 정보 훅
export function useReservation(id: string | null) {
  const [reservation, setReservation] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReservation = useCallback(async () => {
    if (!id) return
    
    try {
      setLoading(true)
      setError(null)
      
      const data = await ReservationService.getReservationById(id)
      setReservation(data)
    } catch (err: any) {
      setError(err.message || '예약 정보를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchReservation()
  }, [fetchReservation])

  return {
    reservation,
    loading,
    error,
    refetch: fetchReservation
  }
}

// 예약 통계 훅
export function useReservationStats(userId: string | null, userRole: string = 'user') {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    if (!userId) return
    
    try {
      setLoading(true)
      setError(null)
      
      const data = await ReservationService.getReservationStats(userId, userRole)
      setStats(data)
    } catch (err: any) {
      setError(err.message || '통계 정보를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [userId, userRole])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  }
}

import { supabase } from '@/supabase/supabaseClient'
import { handleSupabaseError } from '@/lib/errors'
import type { Reservation, Inserts, Updates, UserReservation } from '@/types/supabase'
import type { ReservationCreateInput, ReservationUpdateInput, ReservationFilterInput } from '@/lib/validations'

export class ReservationService {
  // 사용자 예약 목록 조회
  static async getUserReservations(userId: string, statusFilter?: string) {
    try {
      const { data, error } = await supabase.rpc('get_user_reservations', {
        user_uuid: userId,
        status_filter: statusFilter || null
      } as any)

      if (error) throw error

      return data || []
    } catch (error) {
      throw handleSupabaseError(error)
    }
  }

  // 예약 상세 조회
  static async getReservationById(id: string) {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          hospitals (*),
          users!reservations_patient_id_fkey (*),
          interpreters!reservations_interpreter_id_fkey (
            *,
            users!interpreters_user_id_fkey (*)
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      if (!data) throw new Error('예약을 찾을 수 없습니다.')

      return data
    } catch (error) {
      throw handleSupabaseError(error)
    }
  }

  // 예약 생성
  static async createReservation(reservationData: ReservationCreateInput, patientId: string) {
    try {
      const { data, error } = await (supabase
        .from('reservations') as any)
        .insert({
          ...reservationData,
          patient_id: patientId,
          status: 'pending',
          booking_date: new Date().toISOString(),
          admin_approval_required: false
        } as any)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      throw handleSupabaseError(error)
    }
  }

  // 예약 수정
  static async updateReservation(id: string, updateData: ReservationUpdateInput) {
    try {
      const { data, error } = await (supabase
        .from('reservations') as any)
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('예약을 찾을 수 없습니다.')

      return data
    } catch (error) {
      throw handleSupabaseError(error)
    }
  }

  // 예약 취소
  static async cancelReservation(id: string, reason: string, userId: string) {
    try {
      // 예약 소유자 확인
      const reservation = await this.getReservationById(id) as any
      if (reservation.patient_id !== userId) {
        throw new Error('예약을 취소할 권한이 없습니다.')
      }

      const { data, error } = await (supabase
        .from('reservations') as any)
        .update({
          status: 'cancelled',
          cancellation_reason: reason,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      throw handleSupabaseError(error)
    }
  }

  // 예약 상태 변경 (관리자/통역사용)
  static async changeReservationStatus(id: string, status: Reservation['status'], userId: string, userRole: string) {
    try {
      const reservation = await this.getReservationById(id) as any
      
      // 권한 확인
      if (userRole === 'admin' || 
          (userRole === 'interpreter' && reservation.interpreter_id === userId)) {
        // 상태 변경 로직 검증
        if (reservation.status === 'cancelled' && status !== 'cancelled') {
          throw new Error('취소된 예약은 다른 상태로 변경할 수 없습니다.')
        }
        
        if (reservation.status === 'completed' && status !== 'completed') {
          throw new Error('완료된 예약은 다른 상태로 변경할 수 없습니다.')
        }

        const { data, error } = await (supabase
          .from('reservations') as any)
          .update({
            status,
            updated_at: new Date().toISOString()
          } as any)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return data
      } else {
        throw new Error('예약 상태를 변경할 권한이 없습니다.')
      }
    } catch (error) {
      throw handleSupabaseError(error)
    }
  }

  // 예약 필터링 및 검색
  static async getFilteredReservations(filters: ReservationFilterInput, userRole: string, userId: string) {
    try {
      let query = supabase
        .from('reservations')
        .select(`
          *,
          hospitals (id, name, address),
          users!reservations_patient_id_fkey (id, name, phone),
          interpreters!reservations_interpreter_id_fkey (
            id,
            users!interpreters_user_id_fkey (id, name, phone)
          )
        `, { count: 'exact' })

      // 권한에 따른 필터링
      if (userRole === 'user') {
        query = query.eq('patient_id', userId)
      } else if (userRole === 'interpreter') {
        query = query.eq('interpreter_id', userId)
      }
      // admin은 모든 예약 조회 가능

      // 상태 필터
      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      // 날짜 범위 필터
      if (filters.date_from) {
        query = query.gte('date', filters.date_from)
      }
      if (filters.date_to) {
        query = query.lte('date', filters.date_to)
      }

      // 병원 필터
      if (filters.hospital_id) {
        query = query.eq('hospital_id', filters.hospital_id)
      }

      // 페이지네이션
      const from = (filters.page - 1) * filters.limit
      const to = from + filters.limit - 1

      const { data, error, count } = await query
        .order('date', { ascending: false })
        .order('time', { ascending: false })
        .range(from, to)
        

      if (error) throw error

      return {
        reservations: data || [],
        total: count || 0,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil((count || 0) / filters.limit)
      }
    } catch (error) {
      throw handleSupabaseError(error)
    }
  }

  // 통역사 배정
  static async assignInterpreter(reservationId: string, interpreterId: string, adminId: string) {
    try {
      // 관리자 권한 확인
      const { data: adminUser } = await supabase.auth.getUser()
      if (adminUser.user?.id !== adminId) {
        throw new Error('관리자 권한이 필요합니다.')
      }

      const { data, error } = await (supabase
        .from('reservations') as any)
        .update({
          interpreter_id: interpreterId,
          status: 'confirmed',
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', reservationId)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      throw handleSupabaseError(error)
    }
  }

  // 예약 충돌 확인
  static async checkBookingConflict(hospitalId: string, date: string, time: string, excludeReservationId?: string) {
    try {
      let query = supabase
        .from('reservations')
        .select('id, status')
        .eq('hospital_id', hospitalId)
        .eq('date', date)
        .eq('time', time)
        .in('status', ['pending', 'confirmed'])

      if (excludeReservationId) {
        query = query.neq('id', excludeReservationId)
      }

      const { data, error } = await query

      if (error) throw error

      return (data || []).length > 0
    } catch (error) {
      throw handleSupabaseError(error)
    }
  }

  // 예약 통계 조회
  static async getReservationStats(userId: string, userRole: string) {
    try {
      let query = supabase
        .from('reservations')
        .select('status')

      if (userRole === 'user') {
        query = query.eq('patient_id', userId)
      } else if (userRole === 'interpreter') {
        query = query.eq('interpreter_id', userId)
      }

      const { data, error } = await query

      if (error) throw error

      const rows = (data as any[]) || []
      const stats = {
        total: rows.length,
        pending: rows.filter(r => r.status === 'pending').length,
        confirmed: rows.filter(r => r.status === 'confirmed').length,
        completed: rows.filter(r => r.status === 'completed').length,
        cancelled: rows.filter(r => r.status === 'cancelled').length
      }

      return stats
    } catch (error) {
      throw handleSupabaseError(error)
    }
  }
}

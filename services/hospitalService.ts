import { supabase } from '@/supabase/supabaseClient'
import { handleSupabaseError } from '@/lib/errors'
import type { Hospital, Inserts, Updates } from '@/types/supabase'
import type { HospitalSearchInput } from '@/lib/validations'

export class HospitalService {
  // 병원 목록 조회 (페이지네이션)
  static async getHospitals(page: number = 1, limit: number = 20) {
    try {
      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, error, count } = await supabase
        .from('hospitals')
        .select('*', { count: 'exact' })
        .eq('status', 'active')
        .order('rating', { ascending: false, nullsFirst: false })
        .range(from, to)

      if (error) throw error

      return {
        hospitals: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    } catch (error) {
      throw handleSupabaseError(error)
    }
  }

  // 병원 상세 조회
  static async getHospitalById(id: string) {
    try {
      const { data, error } = await supabase
        .from('hospitals')
        .select(`
          *,
          fees (*),
          hospital_departments (*)
        `)
        .eq('id', id)
        .eq('status', 'active')
        .single()

      if (error) throw error
      if (!data) throw new Error('병원을 찾을 수 없습니다.')

      return data
    } catch (error) {
      throw handleSupabaseError(error)
    }
  }

  // 병원 검색 (Supabase 함수 사용)
  static async searchHospitals(params: HospitalSearchInput) {
    try {
      const { data, error } = await supabase.rpc('search_hospitals', {
        search_term: params.search_term || null,
        specialty_filter: params.specialty_filter || null,
        min_rating: params.min_rating || null,
        max_price_filter: params.max_price_filter || null
      } as any)

      if (error) throw error

      return data || []
    } catch (error) {
      throw handleSupabaseError(error)
    }
  }

  // 병원 생성 (관리자용)
  static async createHospital(hospitalData: Inserts<'hospitals'>) {
    try {
      const { data, error } = await (supabase
        .from('hospitals') as any)
        .insert(hospitalData as any)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      throw handleSupabaseError(error)
    }
  }

  // 병원 수정 (관리자용)
  static async updateHospital(id: string, updateData: Updates<'hospitals'>) {
    try {
      const { data, error } = await (supabase
        .from('hospitals') as any)
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('병원을 찾을 수 없습니다.')

      return data
    } catch (error) {
      throw handleSupabaseError(error)
    }
  }

  // 병원 삭제 (관리자용 - 상태 변경)
  static async deleteHospital(id: string) {
    try {
      const { data, error } = await (supabase
        .from('hospitals') as any)
        .update({ 
          status: 'inactive',
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('병원을 찾을 수 없습니다.')

      return data
    } catch (error) {
      throw handleSupabaseError(error)
    }
  }

  // 병원 요금 정보 조회
  static async getHospitalFees(hospitalId: string) {
    try {
      const { data, error } = await supabase
        .from('fees')
        .select('*')
        .eq('hospital_id', hospitalId)
        .order('min_price', { ascending: true })

      if (error) throw error

      return data || []
    } catch (error) {
      throw handleSupabaseError(error)
    }
  }

  // 병원 요금 정보 업데이트 (관리자용)
  static async updateHospitalFees(hospitalId: string, fees: any[]) {
    try {
      // 기존 요금 정보 삭제
      await supabase
        .from('fees')
        .delete()
        .eq('hospital_id', hospitalId)

      // 새로운 요금 정보 삽입
      if (fees.length > 0) {
        const { data, error } = await (supabase
          .from('fees') as any)
          .insert(fees.map(fee => ({ ...fee, hospital_id: hospitalId })) as any)
          .select()

        if (error) throw error
        return data
      }

      return []
    } catch (error) {
      throw handleSupabaseError(error)
    }
  }

  // 병원 통계 정보 조회
  static async getHospitalStats(hospitalId: string) {
    try {
      const { data, error } = await supabase
        .from('hospitals')
        .select(`
          id,
          name,
          rating,
          total_reservations,
          fees (min_price, max_price, currency)
        `)
        .eq('id', hospitalId)
        .single()

      if (error) throw error
      if (!data) throw new Error('병원을 찾을 수 없습니다.')

      return data
    } catch (error) {
      throw handleSupabaseError(error)
    }
  }

  // 병원별 예약 현황 조회
  static async getHospitalReservations(hospitalId: string, date?: string) {
    try {
      let query = supabase
        .from('reservations')
        .select(`
          *,
          users!reservations_patient_id_fkey (name, phone),
          interpreters!reservations_interpreter_id_fkey (
            users!interpreters_user_id_fkey (name, phone)
          )
        `)
        .eq('hospital_id', hospitalId)

      if (date) {
        query = query.eq('date', date)
      }

      const { data, error } = await query
        .order('date', { ascending: true })
        .order('time', { ascending: true })

      if (error) throw error

      return data || []
    } catch (error) {
      throw handleSupabaseError(error)
    }
  }
}

import { supabase } from '@/supabase/supabaseClient'
import { handleSupabaseError } from '@/lib/errors'

export type Fee = {
  id: string
  hospital_id: string
  treatment: string | null
  department?: string | null
  min_price: number
  max_price?: number
  currency: string
  duration?: string | null
  last_updated?: string
  created_at?: string
  updated_at?: string
}

export class FeeService {
  static async list(params?: { hospitalId?: string; search?: string; page?: number; limit?: number }) {
    try {
      const page = params?.page || 1
      const limit = params?.limit || 20
      const from = (page - 1) * limit
      const to = from + limit - 1

      let query = supabase.from('fees').select('*', { count: 'exact' })

      if (params?.hospitalId) {
        query = query.eq('hospital_id', params.hospitalId)
      }
      if (params?.search) {
        const search = `%${params.search}%`
        query = query.or(`treatment.ilike.${search},department.ilike.${search}`)
      }

      const { data, error, count } = await query.order('min_price', { ascending: true }).range(from, to)
      if (error) throw error
      return { fees: (data || []) as Fee[], total: count || 0, page, limit }
    } catch (error) {
      throw handleSupabaseError(error)
    }
  }

  static async create(input: Omit<Fee, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await (supabase.from('fees') as any)
        .insert({ ...input } as any)
        .select()
        .single()
      if (error) throw error
      return data as Fee
    } catch (error) {
      throw handleSupabaseError(error)
    }
  }

  static async update(id: string, updates: Partial<Omit<Fee, 'id'>>) {
    try {
      const { data, error } = await (supabase.from('fees') as any)
        .update({ ...updates, updated_at: new Date().toISOString() } as any)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Fee
    } catch (error) {
      throw handleSupabaseError(error)
    }
  }

  static async delete(id: string) {
    try {
      const { error } = await supabase.from('fees').delete().eq('id', id)
      if (error) throw error
    } catch (error) {
      throw handleSupabaseError(error)
    }
  }
}










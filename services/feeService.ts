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
      const res = await fetch('/api/admin/fees')
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to fetch fees')
      }
      const json = await res.json()
      return { fees: json.fees || [], total: json.fees?.length || 0, page: params?.page || 1, limit: params?.limit || 20 }
    } catch (error) {
      throw handleSupabaseError(error)
    }
  }

  static async create(input: Omit<Fee, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const res = await fetch('/api/admin/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to create fee')
      }
      const json = await res.json()
      return json.fee as Fee
    } catch (error) {
      throw handleSupabaseError(error)
    }
  }

  static async update(id: string, updates: Partial<Omit<Fee, 'id'>>) {
    try {
      const res = await fetch('/api/admin/fees/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to update fee')
      }
      const json = await res.json()
      return json.fee as Fee
    } catch (error) {
      throw handleSupabaseError(error)
    }
  }

  static async delete(id: string) {
    try {
      const res = await fetch(`/api/admin/fees/delete?id=${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to delete fee')
      }
    } catch (error) {
      throw handleSupabaseError(error)
    }
  }
}










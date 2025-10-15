import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/supabase/supabaseClient'
import { handleSupabaseError } from '@/lib/errors'
import type { Interpreter } from '@/types/supabase'

interface UseInterpreterReturn {
  interpreter: (Interpreter & {
    name: string;
    email: string;
    phone: string;
    avatar_url: string;
  }) | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useInterpreter(interpreterId: string | null): UseInterpreterReturn {
  const [interpreter, setInterpreter] = useState<(Interpreter & {
    name: string;
    email: string;
    phone: string;
    avatar_url: string;
  }) | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInterpreter = useCallback(async () => {
    if (!interpreterId) return

    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
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
        .eq('id', interpreterId)
        .eq('status', 'active')
        .single()

      if (fetchError) throw fetchError

      if (data) {
        // 사용자 정보와 통역사 정보 결합
        const combinedInterpreter = {
          ...(data || {}) as any,
          name: (data as any)?.users?.name || 'Unknown',
          email: (data as any)?.users?.email || '',
          phone: (data as any)?.users?.phone || '',
          avatar_url: (data as any)?.users?.avatar_url || ''
        }
        setInterpreter(combinedInterpreter)
      } else {
        setError('Interpreter not found')
      }
    } catch (err: any) {
      const domainError = handleSupabaseError(err)
      setError(domainError.message)
    } finally {
      setLoading(false)
    }
  }, [interpreterId])

  useEffect(() => {
    if (interpreterId) {
      fetchInterpreter()
    }
  }, [interpreterId, fetchInterpreter])

  return {
    interpreter,
    loading,
    error,
    refetch: fetchInterpreter
  }
}

import { useState, useEffect, useCallback } from 'react'
import { supabase, getUsersTable } from '@/supabase/supabaseClient'
import { handleSupabaseError } from '@/lib/errors'
import type { User } from '@supabase/supabase-js'
import type { Tables } from '@/types/supabase'

interface UseAuthReturn {
  user: User | null
  profile: Tables<'users'> | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, name: string, phone?: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Tables<'users'>>) => Promise<{ success: boolean; error?: string }>
  refreshProfile: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Tables<'users'> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 사용자 프로필 가져오기
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (profileError) throw profileError
      if (!data) {
        await createProfile(userId)
        return
      }
      setProfile(data)
    } catch (err: any) {
      console.error('Error fetching profile:', err)
      // 안전망: 실패 시에도 프로필 생성 시도
      await createProfile(userId)
    }
  }, [])

  // 새 프로필 생성
  const createProfile = useCallback(async (userId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const newProfile = {
        id: userId,
        email: userData.user.email || '',
        name: userData.user.user_metadata?.name || 'Unknown User',
        phone: userData.user.user_metadata?.phone || '',
        // Use role from auth metadata if provided (admin/interpreter), else default to 'user'
        role: (userData.user.user_metadata as any)?.role || 'user',
        avatar_url: null
      }

      // Call server API to upsert profile with service role to bypass RLS
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile)
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create profile')

      setProfile(json.profile)
    } catch (err: any) {
      console.error('Error creating profile:', err)
    }
  }, [])

  // 로그인
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) throw signInError

      if (data.user) {
        setUser(data.user)
        // expose user to window for immediate redirect resolution
        try { (window as any).supabaseUser = data.user } catch {}
        fetchProfile(data.user.id).catch(() => {})
        return { success: true }
      }

      return { success: false, error: 'Login failed' }
    } catch (err: any) {
      const domainError = handleSupabaseError(err)
      setError(domainError.message)
      return { success: false, error: domainError.message }
    } finally {
      setLoading(false)
    }
  }, [fetchProfile])

  // 회원가입
  const signUp = useCallback(async (email: string, password: string, name: string, phone?: string) => {
    try {
      setError(null)
      setLoading(true)

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone
          }
        }
      })

      if (signUpError) throw signUpError

      if (data.user) {
        setUser(data.user)
        await createProfile(data.user.id)
        return { success: true }
      }

      return { success: false, error: 'Sign up failed' }
    } catch (err: any) {
      const domainError = handleSupabaseError(err)
      setError(domainError.message)
      return { success: false, error: domainError.message }
    } finally {
      setLoading(false)
    }
  }, [createProfile])

  // 로그아웃
  const signOut = useCallback(async () => {
    try {
      setError(null)
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError

      setUser(null)
      setProfile(null)
    } catch (err: any) {
      const domainError = handleSupabaseError(err)
      setError(domainError.message)
    }
  }, [])

  // 프로필 업데이트
  const updateProfile = useCallback(async (updates: Partial<Tables<'users'>>) => {
    if (!user) return { success: false, error: 'User not authenticated' }

    try {
      setError(null)
      const { error: updateError } = await getUsersTable()
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (updateError) throw updateError

      // Use the returned updated profile to refresh local state
      const { data: updatedProfile } = await getUsersTable()
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(updatedProfile)
      return { success: true }
    } catch (err: any) {
      const domainError = handleSupabaseError(err)
      setError(domainError.message)
      return { success: false, error: domainError.message }
    }
  }, [user])

  // 프로필 새로고침
  const refreshProfile = useCallback(async () => {
    if (!user) return
    await fetchProfile(user.id)
  }, [user, fetchProfile])

  // 인증 상태 변경 감지
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.id)
        if (session?.user) {
          console.log('Setting user:', session.user.id)
          setUser(session.user)
          // Fire-and-forget profile fetch to avoid blocking state update in tests
          fetchProfile(session.user.id).catch(() => {})
        } else {
          console.log('Clearing user')
          setUser(null)
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  // 초기 사용자 상태 확인
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await (supabase.auth as any).getSession()
        if (session?.user) {
          setUser(session.user)
          fetchProfile(session.user.id).catch(() => {})
        }
      } catch (err) {
        console.error('Error checking user:', err)
      } finally {
        // Avoid extra state updates that trigger act() warnings in tests
        setLoading(false)
      }
    }

    checkUser()
  }, [fetchProfile])

  return {
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile
  }
}

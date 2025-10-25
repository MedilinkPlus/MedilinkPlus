import { createClient } from '@supabase/supabase-js'
import type { Database, Tables, Inserts, Updates } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Client-side Supabase client (anon key)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Server-side Supabase client (service role key) - for admin operations
export const createServerClient = () => {
  const serverSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!serverSupabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase configuration')
  }
  
  return createClient<Database>(serverSupabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Type-safe table accessors with explicit typing
export const getTable = <T extends keyof Database['public']['Tables']>(tableName: T) => {
  return supabase.from(tableName)
}

// Type-safe table operations with explicit return types
export const getFeesTable = () => supabase.from('fees') as any
export const getPromotionsTable = () => supabase.from('promotions') as any
export const getHospitalsTable = () => supabase.from('hospitals') as any
export const getUsersTable = () => supabase.from('users') as any
export const getInterpretersTable = () => supabase.from('interpreters') as any
export const getReservationsTable = () => supabase.from('reservations') as any

// Auth helper functions
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

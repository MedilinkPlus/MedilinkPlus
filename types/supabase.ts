export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          role: 'user' | 'admin' | 'interpreter'
          name: string
          phone: string | null
          language: string
          age: number | null
          gender: 'male' | 'female' | 'other' | null
          avatar_url: string | null
          member_since: string
          total_bookings: number
          favorite_hospitals_count: number
          total_reviews: number
          line_user_id: string | null
          notification_preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          role?: 'user' | 'admin' | 'interpreter'
          name: string
          phone?: string | null
          language?: string
          age?: number | null
          gender?: 'male' | 'female' | 'other' | null
          avatar_url?: string | null
          member_since?: string
          total_bookings?: number
          favorite_hospitals_count?: number
          total_reviews?: number
          line_user_id?: string | null
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          role?: 'user' | 'admin' | 'interpreter'
          name?: string
          phone?: string | null
          age?: number | null
          gender?: 'male' | 'female' | 'other' | null
          avatar_url?: string | null
          member_since?: string
          total_bookings?: number
          favorite_hospitals_count?: number
          total_reviews?: number
          line_user_id?: string | null
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      hospitals: {
        Row: {
          id: string
          name: string
          specialty: string | null
          address: string
          phone: string | null
          website: string | null
          hours: string | null
          status: 'active' | 'inactive'
          image_url: string | null
          rating: number | null
          total_reservations: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          specialty?: string | null
          address: string
          phone?: string | null
          website?: string | null
          hours?: string | null
          status?: 'active' | 'inactive'
          image_url?: string | null
          rating?: number | null
          total_reservations?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          specialty?: string | null
          address?: string
          phone?: string | null
          website?: string | null
          hours?: string | null
          status?: 'active' | 'inactive'
          image_url?: string | null
          rating?: number | null
          total_reservations?: number
          created_at?: string
          updated_at?: string
        }
      }
      reservations: {
        Row: {
          id: string
          patient_id: string
          hospital_id: string
          interpreter_id: string | null
          treatment: string
          date: string
          time: string
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          notes: string | null
          estimated_cost: string | null
          special_requests: string | null
          booking_date: string
          cancellation_reason: string | null
          admin_approval_required: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          hospital_id: string
          interpreter_id?: string | null
          treatment: string
          date: string
          time: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          notes?: string | null
          estimated_cost?: string | null
          special_requests?: string | null
          booking_date?: string
          cancellation_reason?: string | null
          admin_approval_required?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          hospital_id?: string
          interpreter_id?: string | null
          treatment?: string
          date?: string
          time?: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          notes?: string | null
          estimated_cost?: string | null
          special_requests?: string | null
          booking_date?: string
          cancellation_reason?: string | null
          admin_approval_required?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      interpreters: {
        Row: {
          id: string
          user_id: string
          languages: string[]
          specializations: string[]
          experience_years: number | null
          rating: number | null
          total_requests: number
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          languages: string[]
          specializations: string[]
          experience_years?: number | null
          rating?: number | null
          total_requests?: number
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          languages?: string[]
          specializations?: string[]
          experience_years?: number | null
          rating?: number | null
          total_requests?: number
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
      }
      fees: {
        Row: {
          id: string
          hospital_id: string
          department: string | null
          treatment: string | null
          min_price: number | null
          max_price: number | null
          currency: string
          duration: string | null
          last_updated: string
          created_at: string
        }
        Insert: {
          id?: string
          hospital_id: string
          department?: string | null
          treatment?: string | null
          min_price?: number | null
          max_price?: number | null
          currency?: string
          duration?: string | null
          last_updated?: string
          created_at?: string
        }
        Update: {
          id?: string
          hospital_id?: string
          department?: string | null
          treatment?: string | null
          min_price?: number | null
          max_price?: number | null
          currency?: string
          duration?: string | null
          last_updated?: string
          created_at?: string
        }
      }
      promotions: {
        Row: {
          id: string
          title: string
          hospital: string | null
          description: string | null
          discount: string
          original_price: string | null
          discount_price: string | null
          valid_from: string
          valid_until: string
          status: 'active' | 'expired'
          used_count: number
          banner_image: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          hospital?: string | null
          description?: string | null
          discount: string
          original_price?: string | null
          discount_price?: string | null
          valid_from: string
          valid_until: string
          status?: 'active' | 'expired'
          used_count?: number
          banner_image?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          hospital?: string | null
          description?: string | null
          discount?: string
          original_price?: string | null
          discount_price?: string | null
          valid_from?: string
          valid_until?: string
          status?: 'active' | 'expired'
          used_count?: number
          banner_image?: string | null
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          reservation_id: string
          user_id: string
          review_type: 'in_progress' | 'completed'
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          reservation_id: string
          user_id: string
          review_type?: 'in_progress' | 'completed'
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          reservation_id?: string
          user_id?: string
          review_type?: 'in_progress' | 'completed'
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          hospital_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          hospital_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          hospital_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      hospital_summary: {
        Row: {
          id: string | null
          name: string | null
          specialty: string | null
          rating: number | null
          total_reservations: number | null
          min_price: number | null
          max_price: number | null
        }
      }
      interpreter_summary: {
        Row: {
          id: string | null
          name: string | null
          languages: string[] | null
          specializations: string[] | null
          experience_years: number | null
          rating: number | null
          total_requests: number | null
        }
      }
    }
    Functions: {
      calculate_hospital_rating: {
        Args: {
          hospital_uuid: string
        }
        Returns: number
      }
      get_user_reservations: {
        Args: {
          user_uuid: string
          status_filter?: string
        }
        Returns: {
          id: string
          treatment: string
          appointment_date: string
          appointment_time: string
          status: string
          hospital_name: string
          interpreter_name: string
          estimated_cost: string
        }[]
      }
      search_hospitals: {
        Args: {
          search_term?: string
          specialty_filter?: string
          min_rating?: number
          max_price_filter?: number
        }
        Returns: {
          id: string
          name: string
          specialty: string
          address: string
          rating: number
          total_reservations: number
          image_url: string
          min_price: number
          max_price: number
        }[]
      }
    }
  }
}

// Helper types for common operations
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Specific table types
export type User = Tables<'users'>
export type Hospital = Tables<'hospitals'>
export type Reservation = Tables<'reservations'>
export type Interpreter = Tables<'interpreters'>
export type Fee = Tables<'fees'>
export type Promotion = Tables<'promotions'>
export type Review = Tables<'reviews'>
export type Favorite = Tables<'favorites'>

// Function return types
export type UserReservation = Database['public']['Functions']['get_user_reservations']['Returns'][0]
export type HospitalSearchResult = Database['public']['Functions']['search_hospitals']['Returns'][0]

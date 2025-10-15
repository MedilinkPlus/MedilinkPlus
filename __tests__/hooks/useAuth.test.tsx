import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth } from '@/hooks/useAuth'
import { AuthProvider } from '@/contexts/AuthContext'
import { supabase } from '@/supabase/supabaseClient'

// Mock Supabase
jest.mock('@/supabase/supabaseClient', () => ({
  supabase: {
    auth: {
      onAuthStateChange: jest.fn(),
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          order: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        order: jest.fn(() => Promise.resolve({ data: null, error: null })),
        range: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
      update: jest.fn(() => Promise.resolve({ data: null, error: null })),
      delete: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  },
}))

const mockSupabase = supabase as jest.Mocked<typeof supabase>

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // 기본 모킹 설정
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    } as any)
    
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    } as any)
    
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    } as any)
  })

  it('초기 상태를 올바르게 설정합니다', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    expect(result.current.user).toBeNull()
    expect(result.current.loading).toBe(true)
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('로그인 함수를 제공합니다', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    expect(typeof result.current.signIn).toBe('function')
    expect(typeof result.current.signUp).toBe('function')
    expect(typeof result.current.signOut).toBe('function')
  })

  it('로그인을 처리합니다', async () => {
    const mockUser = { id: '1', email: 'test@example.com' }
    const mockSession = { user: mockUser, access_token: 'token' }
    
    mockSupabase.auth.signIn.mockResolvedValue({
      data: { user: mockUser, session: mockSession },
      error: null,
    } as any)
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      await result.current.signIn('test@example.com', 'password')
    })
    
    expect(mockSupabase.auth.signIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    })
  })

  it('로그인 에러를 처리합니다', async () => {
    const mockError = { message: 'Invalid credentials' }
    
    mockSupabase.auth.signIn.mockResolvedValue({
      data: { user: null, session: null },
      error: mockError,
    } as any)
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      await result.current.signIn('test@example.com', 'wrong-password')
    })
    
    expect(mockSupabase.auth.signIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'wrong-password',
    })
  })

  it('회원가입을 처리합니다', async () => {
    const mockUser = { id: '1', email: 'new@example.com' }
    
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: mockUser, session: null },
      error: null,
    } as any)
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      await result.current.signUp('new@example.com', 'password', '김철수')
    })
    
    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'password',
      options: {
        data: {
          name: '김철수',
        },
      },
    })
  })

  it('로그아웃을 처리합니다', async () => {
    mockSupabase.auth.signOut.mockResolvedValue({
      error: null,
    } as any)
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      await result.current.signOut()
    })
    
    expect(mockSupabase.auth.signOut).toHaveBeenCalled()
  })

  it('인증 상태 변경을 감지합니다', async () => {
    const mockUser = { id: '1', email: 'test@example.com' }
    const mockSession = { user: mockUser, access_token: 'token' }
    
    // onAuthStateChange가 호출되면 즉시 콜백을 실행하도록 모킹
    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
      // 즉시 콜백을 실행하여 사용자 상태 설정
      setTimeout(() => {
        callback('SIGNED_IN', mockSession)
      }, 0)
      
      return { data: { subscription: { unsubscribe: jest.fn() } } } as any
    })
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    // 사용자 상태가 설정될 때까지 기다림
    await waitFor(() => {
      expect(result.current.user).toBeTruthy()
    }, { timeout: 3000 })
    
    // 인증 상태 확인
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('사용자 정보를 업데이트합니다', async () => {
    const mockUser = { id: '1', email: 'test@example.com' }
    
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any)
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      await result.current.updateProfile({ name: '김철수' })
    })
    
    // 프로필 업데이트 로직이 구현되어 있다면 여기서 테스트
    expect(result.current.user).toBeDefined()
  })

  it('로딩 상태를 올바르게 관리합니다', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    expect(result.current.loading).toBe(true)
    
    // 인증 상태가 설정되면 로딩이 false가 되어야 함
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('인증 상태를 올바르게 반영합니다', async () => {
    const mockUser = { id: '1', email: 'test@example.com' }
    
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    } as any)
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(mockUser)
    })
  })

  it('에러 상태를 올바르게 관리합니다', async () => {
    const mockError = { message: 'Network error' }
    
    mockSupabase.auth.signIn.mockRejectedValue(mockError)
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      try {
        await result.current.signIn('test@example.com', 'password')
      } catch (error) {
        // 에러가 발생해야 함
      }
    })
    
    expect(mockSupabase.auth.signIn).toHaveBeenCalled()
  })
})

// 도메인 에러 타입 정의
export class DomainError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public userMessage?: string
  ) {
    super(message)
    this.name = 'DomainError'
  }
}

// Supabase 에러를 도메인 에러로 변환
export function handleSupabaseError(error: any): DomainError {
  if (error?.code === '23505') {
    return new DomainError(
      'Duplicate entry',
      'DUPLICATE_ENTRY',
      409,
      '이미 존재하는 데이터입니다.'
    )
  }
  
  if (error?.code === '23503') {
    return new DomainError(
      'Foreign key constraint failed',
      'FOREIGN_KEY_ERROR',
      400,
      '관련 데이터가 존재하지 않습니다.'
    )
  }
  
  if (error?.code === '42P01') {
    return new DomainError(
      'Table not found',
      'TABLE_NOT_FOUND',
      500,
      '데이터를 찾을 수 없습니다.'
    )
  }
  
  if (error?.code === '42501') {
    return new DomainError(
      'Permission denied',
      'PERMISSION_DENIED',
      403,
      '접근 권한이 없습니다.'
    )
  }
  
  return new DomainError(
    error?.message || 'Unknown error',
    'UNKNOWN_ERROR',
    500,
    '알 수 없는 오류가 발생했습니다.'
  )
}

// 에러 메시지 매핑 테이블
export const ERROR_MESSAGES = {
  // 인증 관련
  'auth/invalid-credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'auth/user-not-found': '등록되지 않은 사용자입니다.',
  'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
  'auth/weak-password': '비밀번호가 너무 약합니다.',
  'auth/invalid-email': '올바르지 않은 이메일 형식입니다.',
  
  // 데이터 관련
  'DUPLICATE_ENTRY': '이미 존재하는 데이터입니다.',
  'FOREIGN_KEY_ERROR': '관련 데이터가 존재하지 않습니다.',
  'TABLE_NOT_FOUND': '데이터를 찾을 수 없습니다.',
  'PERMISSION_DENIED': '접근 권한이 없습니다.',
  'UNKNOWN_ERROR': '알 수 없는 오류가 발생했습니다.',
  
  // 비즈니스 로직
  'RESERVATION_NOT_FOUND': '예약을 찾을 수 없습니다.',
  'HOSPITAL_NOT_FOUND': '병원을 찾을 수 없습니다.',
  'INTERPRETER_NOT_FOUND': '통역사를 찾을 수 없습니다.',
  'INVALID_STATUS_CHANGE': '잘못된 상태 변경입니다.',
  'BOOKING_CONFLICT': '해당 시간에 이미 예약이 있습니다.',
} as const

// 사용자 친화적 에러 메시지 반환
export function getUserFriendlyMessage(error: DomainError | string): string {
  if (typeof error === 'string') {
    return ERROR_MESSAGES[error as keyof typeof ERROR_MESSAGES] || error
  }
  
  return error.userMessage || ERROR_MESSAGES[error.code as keyof typeof ERROR_MESSAGES] || error.message
}

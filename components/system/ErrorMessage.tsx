import { useState, useEffect } from 'react'

interface DomainError {
  code: string
  statusCode: number
  message: string
}

interface ErrorMessageProps {
  error: string | Error | DomainError
  onRetry?: () => void
  onClose?: () => void
  className?: string
  showDetails?: boolean
}

// 사용자 친화적인 에러 메시지 생성
const getUserFriendlyMessage = (error: string | Error | DomainError): string => {
  if (typeof error === 'string') {
    return error
  }

  if ('code' in error && 'statusCode' in error) {
    // DomainError인 경우
    const domainError = error as DomainError
    switch (domainError.code) {
      case 'AUTH_REQUIRED':
        return '로그인이 필요합니다.'
      case 'PERMISSION_DENIED':
        return '권한이 없습니다.'
      case 'RESOURCE_NOT_FOUND':
        return '요청한 리소스를 찾을 수 없습니다.'
      case 'VALIDATION_ERROR':
        return '입력 데이터가 올바르지 않습니다.'
      case 'NETWORK_ERROR':
        return '네트워크 연결을 확인해주세요.'
      case 'SERVER_ERROR':
        return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      default:
        return domainError.message || '알 수 없는 오류가 발생했습니다.'
    }
  }

  // 일반 Error 객체인 경우
  if (error instanceof Error) {
    return error.message || '오류가 발생했습니다.'
  }

  return '알 수 없는 오류가 발생했습니다.'
}

export default function ErrorMessage({ 
  error, 
  onRetry, 
  onClose,
  className = "", 
  showDetails = false 
}: ErrorMessageProps) {
  const [showFullError, setShowFullError] = useState(false)

  if (!error) return null

  const message = getUserFriendlyMessage(error)
  const isObject = typeof error === 'object' && error !== null
  const hasDetails = error instanceof Error || (isObject && 'code' in (error as object) && 'statusCode' in (error as object))

  return (
    <div 
      className={`bg-red-50 border border-red-200 rounded-xl p-4 ${className}`}
      role="alert"
      aria-label="Error message"
    >
      <div className="flex items-start space-x-3">
        {/* 에러 아이콘 */}
        <div className="flex-shrink-0">
          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
            <i className="ri-error-warning-line text-red-600 text-sm" data-testid="error-icon" />
          </div>
        </div>

        {/* 에러 내용 */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-red-800 mb-1">
            오류가 발생했습니다
          </h3>
          <span className="text-sm text-red-700 mb-3 block" data-testid="error-text" style={{ whiteSpace: 'pre-wrap' }}>
            {typeof error === 'string' ? error : message}
          </span>

          {/* 액션 버튼들 */}
          <div className="flex items-center space-x-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-black bg-[#A8E6CF] hover:bg-[#8DD5B8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <i className="ri-refresh-line mr-1" />
                재시도
              </button>
            )}

            {onClose && (
              <button
                onClick={onClose}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-gray-500 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <i className="ri-close-line mr-1" />
                닫기
              </button>
            )}

            {hasDetails && (
              <button
                onClick={() => setShowFullError(!showFullError)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-600 bg-transparent hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <i className={`ri-${showFullError ? 'eye-off' : 'eye'}-line mr-1`} />
                {showFullError ? '상세 정보 숨기기' : '상세 정보 보기'}
              </button>
            )}
          </div>

          {/* 상세 에러 정보 */}
          {showFullError && hasDetails && (
            <div className="mt-4 p-3 bg-red-100 rounded-lg">
              <h4 className="text-xs font-medium text-red-800 mb-2">상세 정보:</h4>
              <div className="text-xs text-red-700 space-y-1">
                {error instanceof Error && (
                  <>
                    <div><strong>Type:</strong> {error.name}</div>
                    <div><strong>Message:</strong> {error.message}</div>
                    {error.stack && (
                      <div><strong>Stack:</strong> <pre className="whitespace-pre-wrap">{error.stack}</pre></div>
                    )}
                  </>
                )}
                {'code' in error && 'statusCode' in error && (
                  <>
                    <div><strong>Code:</strong> {error.code}</div>
                    <div><strong>Status:</strong> {error.statusCode}</div>
                    <div><strong>Message:</strong> {error.message}</div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { ErrorMessage }

// 인라인 에러 메시지
export function InlineError({ 
  error, 
  className = '' 
}: { 
  error: string | Error | null
  className?: string 
}) {
  if (!error) return null

  const message = getUserFriendlyMessage(error)

  return (
    <p className={`text-sm text-red-600 mt-1 ${className}`}>
      {message}
    </p>
  )
}

// 경고 메시지
export function WarningMessage({ 
  message, 
  className = '' 
}: { 
  message: string
  className?: string 
}) {
  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-xl p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            주의사항
          </h3>
          <p className="mt-1 text-sm text-yellow-700">
            {message}
          </p>
        </div>
      </div>
    </div>
  )
}

// 성공 메시지
export function SuccessMessage({ 
  message, 
  className = '' 
}: { 
  message: string
  className?: string 
}) {
  return (
    <div className={`bg-green-50 border border-green-200 rounded-xl p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        
        <div className="flex-1">
          <h3 className="text-sm font-medium text-green-800">
            성공
          </h3>
          <p className="mt-1 text-sm text-green-700">
            {message}
          </p>
        </div>
      </div>
    </div>
  )
}

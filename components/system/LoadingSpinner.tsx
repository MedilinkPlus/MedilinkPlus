import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'accent' | 'blue'
  text?: string
  className?: string
}

export function LoadingSpinner({ size = 'md', color = 'primary', text, className = '' }: LoadingSpinnerProps) {
  const sizeClasses: Record<NonNullable<LoadingSpinnerProps['size']>, string> = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const colorClasses = {
    primary: 'text-[#A8E6CF]',
    secondary: 'text-[#FFD3B6]',
    accent: 'text-[#E0BBE4]',
    blue: 'text-blue-500'
  }

  return (
    <div className={`flex flex-col items-center justify-center`}>
      <div 
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-current ${colorClasses[color]} ${className}`}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className="mt-2 text-sm text-gray-600">{text}</p>
      )}
    </div>
  )
}

// 전체 화면 로딩
export function FullScreenLoading({ text = '로딩 중...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}

// 인라인 로딩
export function InlineLoading({ text, className = '' }: { text?: string; className?: string }) {
  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <div 
        className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-current"
        role="status"
        aria-label="Loading"
      />
      {text && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  )
}

// 버튼 로딩
export function ButtonLoading({ text = '처리 중...' }: { text?: string }) {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      <span>{text}</span>
    </div>
  )
}

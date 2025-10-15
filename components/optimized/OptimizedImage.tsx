'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { LoadingSpinner } from '@/components/system/LoadingSpinner'

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  quality?: number
  onLoad?: () => void
  onError?: () => void
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  quality = 75,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)

  // Intersection Observer로 뷰포트 진입 감지
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px', // 50px 전에 미리 로드
        threshold: 0.1
      }
    )

    if (imageRef.current) {
      observer.observe(imageRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  // 에러 상태일 때 플레이스홀더 표시
  if (hasError) {
    return (
      <div
        ref={imageRef}
        className={`flex items-center justify-center bg-gray-200 text-gray-500 ${className}`}
        style={{ width, height }}
      >
        <div className="text-center">
          <i className="ri-image-line text-2xl mb-2" />
          <p className="text-sm">이미지를 불러올 수 없습니다</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={imageRef} className={`relative ${className}`} style={{ width, height }}>
      {/* 로딩 스피너 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <LoadingSpinner size="md" />
        </div>
      )}

      {/* 이미지가 뷰포트에 진입했을 때만 렌더링 */}
      {isInView && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          priority={priority}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          sizes={sizes}
          quality={quality}
          onLoad={handleLoad}
          onError={handleError}
          // 성능 최적화 옵션
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}

      {/* 로딩 중일 때 스켈레톤 UI */}
      {!isInView && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  )
}

// 특정 용도별 최적화된 이미지 컴포넌트들
export function AvatarImage({ src, alt, size = 40, ...props }: {
  src: string
  alt: string
  size?: number
  [key: string]: any
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full object-cover"
      quality={60}
      sizes={`${size}px`}
      {...props}
    />
  )
}

export function ThumbnailImage({ src, alt, width = 200, height = 150, ...props }: {
  src: string
  alt: string
  width?: number
  height?: number
  [key: string]: any
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className="object-cover rounded-lg"
      quality={70}
      sizes={`(max-width: 768px) 100vw, ${width}px`}
      {...props}
    />
  )
}

export function HeroImage({ src, alt, width = 1200, height = 600, ...props }: {
  src: string
  alt: string
  width?: number
  height?: number
  [key: string]: any
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className="object-cover w-full"
      priority={true}
      quality={80}
      sizes="100vw"
      {...props}
    />
  )
}

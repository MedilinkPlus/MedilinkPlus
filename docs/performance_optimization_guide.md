# MediLink+ 성능 최적화 가이드

## 개요

MediLink+ 애플리케이션의 성능을 최적화하기 위해 다양한 기술과 컴포넌트를 구현했습니다. 이 가이드는 구현된 성능 최적화 기능들을 설명하고 사용법을 제공합니다.

## 구현된 성능 최적화 기능

### 1. 번들 분석 및 최적화

#### Next.js 번들 분석기
- `@next/bundle-analyzer` 설치 및 설정
- 빌드 시 번들 크기 분석 가능
- `npm run build:analyze` 명령어로 분석 실행

#### Webpack 최적화
- **트리 쉐이킹**: 사용하지 않는 코드 제거
- **청크 분할**: 벤더 라이브러리와 애플리케이션 코드 분리
- **사이드 이펙트 최적화**: 불필요한 부작용 제거

```typescript
// next.config.ts
webpack: (config, { dev, isServer }) => {
  if (!dev && !isServer) {
    // 트리 쉐이킹 최적화
    config.optimization.usedExports = true;
    config.optimization.sideEffects = false;

    // 청크 분할 최적화
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          enforce: true,
        },
      },
    };
  }
  return config;
}
```

### 2. 이미지 최적화

#### OptimizedImage 컴포넌트
- **지연 로딩**: IntersectionObserver를 사용한 뷰포트 기반 로딩
- **다중 포맷 지원**: WebP, AVIF 등 최신 이미지 포맷
- **에러 처리**: 로딩 실패 시 대체 UI 표시
- **전용 컴포넌트**: AvatarImage, ThumbnailImage, HeroImage

```typescript
// 사용 예시
import OptimizedImage from '@/components/performance/OptimizedImage'

<OptimizedImage
  src="/images/hospital.jpg"
  alt="병원 이미지"
  width={400}
  height={300}
  priority={false}
  className="rounded-lg"
/>
```

#### 이미지 최적화 설정
```typescript
// next.config.ts
images: {
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 60,
}
```

### 3. 가상화된 리스트 컴포넌트

#### VirtualizedList 컴포넌트
- **대용량 데이터 처리**: 수천 개의 아이템을 효율적으로 렌더링
- **뷰포트 기반 렌더링**: 화면에 보이는 아이템만 렌더링
- **전용 컴포넌트**: VirtualizedTable, VirtualizedGrid

```typescript
// 사용 예시
import VirtualizedList from '@/components/performance/VirtualizedList'

<VirtualizedList
  items={hospitals}
  itemHeight={80}
  renderItem={(hospital) => (
    <HospitalCard key={hospital.id} hospital={hospital} />
  )}
  className="h-96"
/>
```

#### 가상화 메트릭 훅
```typescript
import { useVirtualizationMetrics } from '@/components/performance/VirtualizedList'

const { renderCount, totalItems, performance } = useVirtualizationMetrics()
```

### 4. 캐싱 전략

#### useCache 훅
- **메모리 캐싱**: 빠른 접근을 위한 인메모리 저장
- **로컬 스토리지 캐싱**: 브라우저 재시작 후에도 유지
- **TTL 설정**: 캐시 만료 시간 관리
- **Stale-while-revalidate**: 백그라운드에서 데이터 갱신

```typescript
// 기본 사용법
import { useCache } from '@/hooks/useCache'

const { get, set, remove, clear } = useCache({
  ttl: 5 * 60 * 1000, // 5분
  maxSize: 100
})

// API 캐싱
const { get: getApiData, set: setApiData } = useApiCache({
  ttl: 10 * 60 * 1000 // 10분
})

// 로컬 스토리지 캐싱
const { get: getLocalData, set: setLocalData } = useLocalStorageCache({
  prefix: 'medilink'
})
```

### 5. 성능 모니터링

#### PerformanceMonitor 컴포넌트
- **Core Web Vitals 측정**: FCP, LCP, FID, CLS, TTFB
- **실시간 모니터링**: 성능 지표 실시간 추적
- **성능 점수**: 0-100점 기준 등급 시스템
- **메모리 및 네트워크**: 시스템 리소스 사용량 모니터링

```typescript
// 사용 예시
import PerformanceMonitor from '@/components/performance/PerformanceMonitor'

// 기본 모드 (플로팅 버튼)
<PerformanceMonitor />

// 상세 모드
<PerformanceMonitor showDetails={true} />
```

#### 성능 점수 기준
- **FCP**: ≤1.8초 (100점), ≤3초 (50점)
- **LCP**: ≤2.5초 (100점), ≤4초 (50점)
- **FID**: ≤100ms (100점), ≤300ms (50점)
- **CLS**: ≤0.1 (100점), ≤0.25 (50점)

### 6. 백그라운드 작업 처리

#### BackgroundWorker 컴포넌트
- **웹 워커 활용**: 메인 스레드 블로킹 방지
- **작업 관리**: 진행률 추적 및 상태 관리
- **작업 타입**: 데이터 처리, 이미지 압축, 파일 업로드, 동기화

```typescript
// 사용 예시
import BackgroundWorker from '@/components/performance/BackgroundWorker'

<BackgroundWorker />

// 작업 추가 (자동으로 워커에서 처리됨)
// - 데이터 처리
// - 이미지 압축
// - 파일 업로드
// - 동기화
```

## 성능 최적화 적용 가이드

### 1. 이미지 최적화 적용

#### 기존 이미지 컴포넌트 교체
```typescript
// Before
<img src="/image.jpg" alt="이미지" />

// After
import OptimizedImage from '@/components/performance/OptimizedImage'

<OptimizedImage
  src="/image.jpg"
  alt="이미지"
  width={400}
  height={300}
/>
```

#### 이미지 우선순위 설정
```typescript
// Above the fold 이미지
<OptimizedImage
  src="/hero-image.jpg"
  alt="히어로 이미지"
  priority={true}
  width={1200}
  height={600}
/>

// Below the fold 이미지
<OptimizedImage
  src="/content-image.jpg"
  alt="콘텐츠 이미지"
  priority={false}
  width={400}
  height={300}
/>
```

### 2. 가상화 적용

#### 대용량 리스트 최적화
```typescript
// Before
{hospitals.map(hospital => (
  <HospitalCard key={hospital.id} hospital={hospital} />
))}

// After
import VirtualizedList from '@/components/performance/VirtualizedList'

<VirtualizedList
  items={hospitals}
  itemHeight={120}
  renderItem={(hospital) => (
    <HospitalCard key={hospital.id} hospital={hospital} />
  )}
/>
```

#### 테이블 가상화
```typescript
import { VirtualizedTable } from '@/components/performance/VirtualizedList'

<VirtualizedTable
  data={reservations}
  columns={[
    { key: 'id', header: 'ID', width: 80 },
    { key: 'patient', header: '환자명', width: 120 },
    { key: 'hospital', header: '병원명', width: 200 },
    { key: 'date', header: '예약일', width: 120 },
    { key: 'status', header: '상태', width: 100 }
  ]}
  rowHeight={50}
/>
```

### 3. 캐싱 전략 적용

#### API 응답 캐싱
```typescript
import { useApiCache } from '@/hooks/useCache'

const { get: getCachedData, set: setCachedData } = useApiCache({
  ttl: 5 * 60 * 1000 // 5분
})

const fetchHospitals = async () => {
  // 캐시된 데이터 확인
  const cached = getCachedData('hospitals')
  if (cached) return cached

  // API 호출
  const data = await api.getHospitals()
  
  // 캐시에 저장
  setCachedData('hospitals', data)
  return data
}
```

#### 컴포넌트 상태 캐싱
```typescript
import { useCache } from '@/hooks/useCache'

const { get, set } = useCache({
  ttl: 10 * 60 * 1000 // 10분
})

const [filters, setFilters] = useState(() => {
  // 캐시된 필터 설정 복원
  return get('user-filters') || defaultFilters
})

// 필터 변경 시 캐시에 저장
useEffect(() => {
  set('user-filters', filters)
}, [filters, set])
```

### 4. 성능 모니터링 적용

#### 개발 환경에서 성능 추적
```typescript
// 개발 환경에서만 성능 모니터링 활성화
{process.env.NODE_ENV === 'development' && (
  <PerformanceMonitor showDetails={true} />
)}
```

#### 프로덕션 환경에서 성능 로깅
```typescript
import { logPerformance, logPageLoad } from '@/lib/monitoring'

// 페이지 로드 성능 측정
useEffect(() => {
  logPageLoad('hospital-list')
}, [])

// 사용자 액션 성능 측정
const handleSearch = async (query: string) => {
  const startTime = performance.now()
  
  try {
    const results = await searchHospitals(query)
    logPerformance('hospital-search', performance.now() - startTime)
    return results
  } catch (error) {
    logPerformance('hospital-search-error', performance.now() - startTime)
    throw error
  }
}
```

## 성능 최적화 체크리스트

### 빌드 최적화
- [ ] 번들 분석기 설정 완료
- [ ] Webpack 최적화 설정 완료
- [ ] 이미지 최적화 설정 완료
- [ ] 압축 설정 활성화

### 컴포넌트 최적화
- [ ] 대용량 이미지 → OptimizedImage 교체
- [ ] 대용량 리스트 → VirtualizedList 교체
- [ ] API 호출 → useCache 적용
- [ ] 불필요한 리렌더링 방지

### 모니터링 및 분석
- [ ] PerformanceMonitor 컴포넌트 배치
- [ ] Core Web Vitals 측정 활성화
- [ ] 성능 로깅 설정 완료
- [ ] 백그라운드 작업 모니터링

### 사용자 경험
- [ ] 로딩 상태 표시
- [ ] 에러 상태 처리
- [ ] 점진적 로딩 구현
- [ ] 반응형 이미지 최적화

## 성능 측정 도구

### 1. 개발자 도구
- **Chrome DevTools**: Performance, Memory, Network 탭
- **Lighthouse**: 성능, 접근성, SEO 점수
- **WebPageTest**: 실제 사용자 환경 시뮬레이션

### 2. 모니터링 도구
- **Sentry**: 에러 및 성능 모니터링
- **Vercel Analytics**: 웹 바이탈 측정
- **Custom Performance Monitor**: 실시간 성능 추적

### 3. 번들 분석
```bash
# 번들 분석 실행
npm run build:analyze

# 결과 확인
# - .next/analyze/ 폴더에서 HTML 파일 열기
# - 번들 크기 및 의존성 분석
```

## 성능 목표

### Core Web Vitals
- **FCP**: < 1.8초 (목표: < 1초)
- **LCP**: < 2.5초 (목표: < 1.5초)
- **FID**: < 100ms (목표: < 50ms)
- **CLS**: < 0.1 (목표: < 0.05)

### 사용자 경험
- **초기 로딩**: < 3초
- **페이지 전환**: < 1초
- **이미지 로딩**: < 2초
- **검색 응답**: < 500ms

### 기술적 목표
- **번들 크기**: < 500KB (gzipped)
- **메모리 사용량**: < 100MB
- **캐시 히트율**: > 80%
- **가상화 성능**: 1000+ 아이템 부드러운 스크롤

## 문제 해결

### 일반적인 성능 이슈

#### 1. 번들 크기 증가
```bash
# 번들 분석으로 원인 파악
npm run build:analyze

# 불필요한 의존성 제거
npm uninstall unused-package

# 동적 임포트 적용
const HeavyComponent = dynamic(() => import('./HeavyComponent'))
```

#### 2. 이미지 로딩 지연
```typescript
// 이미지 우선순위 설정
<OptimizedImage priority={true} />

// 적절한 크기 설정
<OptimizedImage
  sizes="(max-width: 768px) 100vw, 50vw"
  width={800}
  height={600}
/>
```

#### 3. 메모리 누수
```typescript
// 이벤트 리스너 정리
useEffect(() => {
  const handleResize = () => { /* ... */ }
  window.addEventListener('resize', handleResize)
  
  return () => {
    window.removeEventListener('resize', handleResize)
  }
}, [])

// 인터벌 정리
useEffect(() => {
  const interval = setInterval(() => { /* ... */ }, 1000)
  
  return () => {
    clearInterval(interval)
  }
}, [])
```

## 결론

MediLink+ 애플리케이션의 성능 최적화를 위해 다양한 기술과 컴포넌트를 구현했습니다. 이 가이드를 따라 단계적으로 적용하면 사용자 경험을 크게 향상시킬 수 있습니다.

주요 성과:
- **번들 크기 최적화**: 트리 쉐이킹 및 청크 분할
- **이미지 최적화**: 지연 로딩 및 다중 포맷 지원
- **가상화**: 대용량 데이터 효율적 렌더링
- **캐싱**: API 응답 및 사용자 설정 캐싱
- **모니터링**: 실시간 성능 추적 및 분석
- **백그라운드 작업**: 웹 워커를 통한 비동기 처리

지속적인 성능 모니터링과 최적화를 통해 최고의 사용자 경험을 제공하세요.

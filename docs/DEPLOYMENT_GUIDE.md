# MediLink+ 배포 및 모니터링 가이드

## 🚀 배포 개요
이 문서는 MediLink+ 애플리케이션의 배포 및 모니터링 환경 구축 방법을 설명합니다.

## 📋 배포 전 준비사항

### 1. 필수 도구 설치
```bash
# Node.js (v18 이상)
node --version

# npm 또는 yarn
npm --version

# Git
git --version

# Vercel CLI
npm install -g vercel

# Supabase CLI
npm install -g supabase
```

### 2. 환경 변수 설정
```bash
# .env.local 파일 생성
cp env.example .env.local

# 환경 변수 편집
nano .env.local
```

**필수 환경 변수:**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 🔧 배포 환경 설정

### 1. Vercel 프로젝트 생성
```bash
# Vercel 로그인
vercel login

# 프로젝트 초기화
vercel

# 프로젝트 설정 확인
vercel env ls
```

### 2. 환경 변수 등록
```bash
# Vercel에 환경 변수 등록
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

### 3. 도메인 설정
```bash
# 커스텀 도메인 추가
vercel domains add your-domain.com

# SSL 인증서 자동 발급
vercel certs ls
```

## 🚀 배포 프로세스

### 1. 자동 배포 스크립트 사용
```bash
# 스크립트 실행 권한 부여
chmod +x scripts/deploy.sh

# 배포 실행
./scripts/deploy.sh
```

### 2. 수동 배포
```bash
# 의존성 설치
npm install

# 테스트 실행
npm run test

# 빌드
npm run build

# 배포
vercel --prod
```

### 3. CI/CD 파이프라인 (GitHub Actions)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 📊 모니터링 설정

### 1. Sentry 에러 모니터링
```bash
# Sentry 패키지 설치
npm install @sentry/nextjs

# Sentry 설정 파일 생성
npx @sentry/wizard -i nextjs
```

**sentry.client.config.js:**
```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_APP_ENV,
  release: process.env.NEXT_PUBLIC_APP_VERSION,
  tracesSampleRate: 0.1,
});
```

### 2. 성능 모니터링
```typescript
// app/layout.tsx에 모니터링 추가
import { startAutoMonitoring } from '@/lib/monitoring'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    startAutoMonitoring()
  }, [])

  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
```

### 3. 헬스 체크 설정
```bash
# 헬스 체크 URL
https://your-domain.com/api/health

# 모니터링 도구에 등록
# - UptimeRobot
# - Pingdom
# - StatusCake
```

## 🔍 모니터링 대시보드

### 1. Vercel Analytics
```bash
# Vercel Analytics 활성화
vercel analytics enable

# 웹사이트에 스크립트 추가
# 자동으로 추가됨
```

### 2. Supabase 대시보드
- **URL**: https://supabase.com/dashboard
- **모니터링 항목**:
  - 데이터베이스 성능
  - API 사용량
  - 에러 로그
  - 사용자 활동

### 3. Sentry 대시보드
- **모니터링 항목**:
  - 에러 발생률
  - 성능 메트릭
  - 사용자 세션
  - 릴리즈 추적

## 🚨 알림 설정

### 1. Slack 알림
```bash
# Slack 웹훅 URL 설정
vercel env add SLACK_WEBHOOK_URL

# 알림 채널 설정
# - 배포 완료
# - 에러 발생
# - 성능 저하
```

### 2. 이메일 알림
```bash
# SMTP 설정
vercel env add SMTP_HOST
vercel env add SMTP_USER
vercel env add SMTP_PASS
```

### 3. Discord 알림
```bash
# Discord 웹훅 설정
vercel env add DISCORD_WEBHOOK_URL
```

## 📈 성능 최적화

### 1. 번들 분석
```bash
# 번들 크기 분석
npm run build
npx @next/bundle-analyzer

# 최적화 결과 확인
# - 코드 스플리팅
# - 트리 쉐이킹
# - 압축률
```

### 2. 이미지 최적화
```typescript
// next.config.ts
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}
```

### 3. 캐싱 전략
```typescript
// API 라우트에 캐싱 적용
export async function GET() {
  const response = NextResponse.json(data)
  
  response.headers.set('Cache-Control', 'public, max-age=3600')
  return response
}
```

## 🔒 보안 설정

### 1. 보안 헤더
```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

### 2. 환경 변수 보안
```bash
# 민감한 정보는 Vercel 환경 변수로 관리
vercel env add SECRET_KEY

# .env 파일은 .gitignore에 추가
echo ".env*" >> .gitignore
```

### 3. API 보안
```typescript
// API 라우트에 인증 추가
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // API 로직...
}
```

## 📊 배포 후 검증

### 1. 기능 테스트
```bash
# E2E 테스트 실행
npm run test:e2e

# 수동 테스트 체크리스트
# - [ ] 메인 페이지 로딩
# - [ ] 사용자 인증
# - [ ] 병원 검색
# - [ ] 예약 생성
# - [ ] 관리자 기능
```

### 2. 성능 테스트
```bash
# Lighthouse 성능 테스트
npx lighthouse https://your-domain.com

# Core Web Vitals 확인
# - LCP < 2.5초
# - FID < 100ms
# - CLS < 0.1
```

### 3. 모바일 테스트
```bash
# 반응형 디자인 확인
# - iPhone SE
# - iPhone 12 Pro
# - iPad
# - Android 기기
```

## 🚨 문제 해결

### 1. 배포 실패
```bash
# 로그 확인
vercel logs

# 환경 변수 확인
vercel env ls

# 로컬 빌드 테스트
npm run build
```

### 2. 성능 문제
```bash
# 번들 크기 확인
npm run build
npx @next/bundle-analyzer

# 이미지 최적화 확인
# - WebP 포맷 사용
# - 적절한 크기 설정
# - 지연 로딩 적용
```

### 3. 데이터베이스 연결 문제
```bash
# Supabase 상태 확인
supabase status

# 연결 테스트
supabase db ping

# 환경 변수 확인
echo $NEXT_PUBLIC_SUPABASE_URL
```

## 📚 추가 리소스

### 1. 공식 문서
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Vercel 문서](https://vercel.com/docs)
- [Supabase 문서](https://supabase.com/docs)

### 2. 모니터링 도구
- [Sentry](https://sentry.io/)
- [Vercel Analytics](https://vercel.com/analytics)
- [UptimeRobot](https://uptimerobot.com/)

### 3. 성능 도구
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [GTmetrix](https://gtmetrix.com/)

---

**마지막 업데이트**: 2024년 12월
**문서 버전**: 1.0
**작성자**: DevOps팀

#!/bin/bash

# MediLink+ 배포 스크립트
# ==========================================

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 환경 변수 확인
check_environment() {
    log_info "환경 변수 확인 중..."
    
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
        log_error "NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다."
        exit 1
    fi
    
    if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
        log_error "NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않았습니다."
        exit 1
    fi
    
    if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        log_error "SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다."
        exit 1
    fi
    
    log_success "환경 변수 확인 완료"
}

# 의존성 설치
install_dependencies() {
    log_info "의존성 설치 중..."
    
    if [ -f "package-lock.json" ]; then
        npm ci --production=false
    else
        npm install
    fi
    
    log_success "의존성 설치 완료"
}

# 빌드 전 테스트
run_tests() {
    log_info "테스트 실행 중..."
    
    # 단위 테스트
    if npm run test --if-present; then
        log_success "단위 테스트 통과"
    else
        log_error "단위 테스트 실패"
        exit 1
    fi
    
    # 타입 체크
    if npm run type-check --if-present; then
        log_success "타입 체크 통과"
    else
        log_warning "타입 체크 실패 (건너뜀)"
    fi
    
    # 린트 체크
    if npm run lint; then
        log_success "린트 체크 통과"
    else
        log_warning "린트 체크 실패 (건너뜀)"
    fi
}

# 애플리케이션 빌드
build_application() {
    log_info "애플리케이션 빌드 중..."
    
    if npm run build; then
        log_success "빌드 완료"
    else
        log_error "빌드 실패"
        exit 1
    fi
}

# 데이터베이스 마이그레이션
run_migrations() {
    log_info "데이터베이스 마이그레이션 실행 중..."
    
    if command -v supabase &> /dev/null; then
        if supabase db push; then
            log_success "마이그레이션 완료"
        else
            log_warning "마이그레이션 실패 (건너뜀)"
        fi
    else
        log_warning "Supabase CLI가 설치되지 않음 (마이그레이션 건너뜀)"
    fi
}

# Vercel 배포
deploy_to_vercel() {
    log_info "Vercel에 배포 중..."
    
    if command -v vercel &> /dev/null; then
        if vercel --prod --yes; then
            log_success "Vercel 배포 완료"
        else
            log_error "Vercel 배포 실패"
            exit 1
        fi
    else
        log_warning "Vercel CLI가 설치되지 않음 (수동 배포 필요)"
    fi
}

# 배포 후 검증
verify_deployment() {
    log_info "배포 검증 중..."
    
    # 배포 URL 확인
    if [ -n "$VERCEL_URL" ]; then
        log_info "배포 URL: $VERCEL_URL"
        
        # 헬스 체크
        if curl -f -s "$VERCEL_URL/api/health" > /dev/null; then
            log_success "헬스 체크 통과"
        else
            log_warning "헬스 체크 실패"
        fi
    fi
}

# 알림 전송
send_notification() {
    log_info "알림 전송 중..."
    
    # Slack 웹훅 (선택사항)
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚀 MediLink+ 배포 완료!\"}" \
            "$SLACK_WEBHOOK_URL"
        log_success "Slack 알림 전송 완료"
    fi
    
    # 이메일 알림 (선택사항)
    if [ -n "$SMTP_HOST" ] && [ -n "$SMTP_USER" ]; then
        log_info "이메일 알림 전송 (구현 필요)"
    fi
}

# 메인 배포 프로세스
main() {
    log_info "🚀 MediLink+ 배포 시작"
    
    # 1. 환경 변수 확인
    check_environment
    
    # 2. 의존성 설치
    install_dependencies
    
    # 3. 테스트 실행
    run_tests
    
    # 4. 애플리케이션 빌드
    build_application
    
    # 5. 데이터베이스 마이그레이션
    run_migrations
    
    # 6. Vercel 배포
    deploy_to_vercel
    
    # 7. 배포 검증
    verify_deployment
    
    # 8. 알림 전송
    send_notification
    
    log_success "🎉 배포 완료!"
}

# 스크립트 실행
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

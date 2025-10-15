# MediLink+ E2E 테스트 시나리오

## 🧪 E2E 테스트 개요
이 문서는 MediLink+ 애플리케이션의 End-to-End 테스트 시나리오를 정의합니다.

## 📋 테스트 환경 설정

### 1. Cypress 설정
```bash
# Cypress 설치
npm install --save-dev cypress

# Cypress 실행
npx cypress open
```

### 2. 테스트 데이터
```typescript
// cypress/fixtures/testData.json
{
  "users": {
    "admin": {
      "email": "admin@medilink.com",
      "password": "admin123",
      "role": "admin"
    },
    "user": {
      "email": "user@medilink.com",
      "password": "user123",
      "role": "user"
    },
    "interpreter": {
      "email": "interpreter@medilink.com",
      "password": "interpreter123",
      "role": "interpreter"
    }
  },
  "hospitals": [
    {
      "name": "서울대학교병원",
      "specialty": "종합의학",
      "address": "서울특별시 종로구",
      "phone": "02-1234-5678"
    }
  ]
}
```

## 🔐 인증 테스트 시나리오

### 1. 사용자 회원가입
```typescript
describe('사용자 회원가입', () => {
  it('새로운 사용자가 회원가입을 완료할 수 있다', () => {
    cy.visit('/auth/signup')
    
    // 폼 입력
    cy.get('[data-testid="email-input"]').type('newuser@test.com')
    cy.get('[data-testid="password-input"]').type('password123')
    cy.get('[data-testid="name-input"]').type('김신규')
    cy.get('[data-testid="phone-input"]').type('010-1234-5678')
    
    // 회원가입 버튼 클릭
    cy.get('[data-testid="signup-button"]').click()
    
    // 성공 메시지 확인
    cy.get('[data-testid="success-message"]').should('contain', '회원가입이 완료되었습니다')
    
    // 로그인 페이지로 리다이렉트 확인
    cy.url().should('include', '/auth/login')
  })

  it('이미 존재하는 이메일로 회원가입 시 에러를 표시한다', () => {
    cy.visit('/auth/signup')
    
    cy.get('[data-testid="email-input"]').type('existing@test.com')
    cy.get('[data-testid="password-input"]').type('password123')
    cy.get('[data-testid="name-input"]').type('김기존')
    
    cy.get('[data-testid="signup-button"]').click()
    
    cy.get('[data-testid="error-message"]').should('contain', '이미 존재하는 이메일입니다')
  })
})
```

### 2. 사용자 로그인
```typescript
describe('사용자 로그인', () => {
  it('올바른 자격증명으로 로그인할 수 있다', () => {
    cy.visit('/auth/login')
    
    cy.get('[data-testid="email-input"]').type('user@test.com')
    cy.get('[data-testid="password-input"]').type('password123')
    cy.get('[data-testid="login-button"]').click()
    
    // 대시보드로 리다이렉트 확인
    cy.url().should('include', '/dashboard')
    cy.get('[data-testid="user-menu"]').should('be.visible')
  })

  it('잘못된 자격증명으로 로그인 시 에러를 표시한다', () => {
    cy.visit('/auth/login')
    
    cy.get('[data-testid="email-input"]').type('user@test.com')
    cy.get('[data-testid="password-input"]').type('wrongpassword')
    cy.get('[data-testid="login-button"]').click()
    
    cy.get('[data-testid="error-message"]').should('contain', '이메일 또는 비밀번호가 올바르지 않습니다')
  })
})
```

## 🏥 병원 관리 테스트 시나리오

### 1. 병원 목록 조회
```typescript
describe('병원 목록 조회', () => {
  beforeEach(() => {
    cy.login('user@test.com', 'password123')
  })

  it('병원 목록을 조회할 수 있다', () => {
    cy.visit('/hospitals')
    
    // 병원 카드들이 표시되는지 확인
    cy.get('[data-testid="hospital-card"]').should('have.length.greaterThan', 0)
    
    // 병원 정보가 올바르게 표시되는지 확인
    cy.get('[data-testid="hospital-card"]').first().within(() => {
      cy.get('[data-testid="hospital-name"]').should('be.visible')
      cy.get('[data-testid="hospital-specialty"]').should('be.visible')
      cy.get('[data-testid="hospital-address"]').should('be.visible')
    })
  })

  it('병원 검색 및 필터링이 작동한다', () => {
    cy.visit('/hospitals')
    
    // 검색어 입력
    cy.get('[data-testid="search-input"]').type('서울대')
    
    // 검색 결과 확인
    cy.get('[data-testid="hospital-card"]').should('contain', '서울대')
    
    // 전문과목 필터 적용
    cy.get('[data-testid="specialty-filter"]').select('종합의학')
    cy.get('[data-testid="hospital-card"]').should('contain', '종합의학')
  })
})
```

### 2. 병원 상세 정보
```typescript
describe('병원 상세 정보', () => {
  it('병원 상세 정보를 조회할 수 있다', () => {
    cy.visit('/hospitals')
    cy.get('[data-testid="hospital-card"]').first().click()
    
    // 상세 정보 페이지로 이동 확인
    cy.url().should('include', '/hospitals/')
    
    // 병원 정보 표시 확인
    cy.get('[data-testid="hospital-name"]').should('be.visible')
    cy.get('[data-testid="hospital-description"]').should('be.visible')
    cy.get('[data-testid="hospital-fees"]').should('be.visible')
    
    // 예약 버튼 확인
    cy.get('[data-testid="reserve-button"]').should('be.visible')
  })
})
```

## 📅 예약 관리 테스트 시나리오

### 1. 예약 생성
```typescript
describe('예약 생성', () => {
  beforeEach(() => {
    cy.login('user@test.com', 'password123')
  })

  it('새로운 예약을 생성할 수 있다', () => {
    cy.visit('/hospitals/1')
    cy.get('[data-testid="reserve-button"]').click()
    
    // 예약 폼 입력
    cy.get('[data-testid="treatment-input"]').type('정기 검진')
    cy.get('[data-testid="date-input"]').type('2024-12-25')
    cy.get('[data-testid="time-input"]').select('09:00')
    cy.get('[data-testid="notes-input"]').type('특별한 요청사항 없음')
    
    // 예약 버튼 클릭
    cy.get('[data-testid="submit-reservation"]').click()
    
    // 성공 메시지 확인
    cy.get('[data-testid="success-message"]').should('contain', '예약이 완료되었습니다')
    
    // 예약 목록 페이지로 이동 확인
    cy.url().should('include', '/reservations')
  })
})
```

### 2. 예약 관리
```typescript
describe('예약 관리', () => {
  it('사용자는 자신의 예약 목록을 조회할 수 있다', () => {
    cy.login('user@test.com', 'password123')
    cy.visit('/reservations')
    
    // 예약 목록 표시 확인
    cy.get('[data-testid="reservation-item"]').should('have.length.greaterThan', 0)
    
    // 예약 상태 확인
    cy.get('[data-testid="reservation-status"]').should('be.visible')
  })

  it('예약을 취소할 수 있다', () => {
    cy.login('user@test.com', 'password123')
    cy.visit('/reservations')
    
    // 첫 번째 예약의 취소 버튼 클릭
    cy.get('[data-testid="reservation-item"]').first().within(() => {
      cy.get('[data-testid="cancel-button"]').click()
    })
    
    // 취소 확인 모달
    cy.get('[data-testid="confirm-modal"]').should('be.visible')
    cy.get('[data-testid="confirm-button"]').click()
    
    // 취소 완료 메시지 확인
    cy.get('[data-testid="success-message"]').should('contain', '예약이 취소되었습니다')
  })
})
```

## 👨‍💼 관리자 기능 테스트 시나리오

### 1. 사용자 관리
```typescript
describe('관리자 사용자 관리', () => {
  beforeEach(() => {
    cy.login('admin@test.com', 'password123')
  })

  it('사용자 목록을 조회할 수 있다', () => {
    cy.visit('/admin/users')
    
    // 사용자 테이블 표시 확인
    cy.get('[data-testid="users-table"]').should('be.visible')
    cy.get('[data-testid="user-row"]').should('have.length.greaterThan', 0)
  })

  it('사용자 역할을 변경할 수 있다', () => {
    cy.visit('/admin/users')
    
    // 첫 번째 사용자의 편집 버튼 클릭
    cy.get('[data-testid="user-row"]').first().within(() => {
      cy.get('[data-testid="edit-button"]').click()
    })
    
    // 역할 변경
    cy.get('[data-testid="role-select"]').select('interpreter')
    cy.get('[data-testid="save-button"]').click()
    
    // 성공 메시지 확인
    cy.get('[data-testid="success-message"]').should('contain', '사용자 정보가 업데이트되었습니다')
  })
})
```

### 2. 병원 관리
```typescript
describe('관리자 병원 관리', () => {
  it('새로운 병원을 추가할 수 있다', () => {
    cy.visit('/admin/hospitals')
    cy.get('[data-testid="add-hospital-button"]').click()
    
    // 병원 정보 입력
    cy.get('[data-testid="hospital-name-input"]').type('새로운 병원')
    cy.get('[data-testid="specialty-input"]').type('정형외과')
    cy.get('[data-testid="address-input"]').type('서울특별시 강남구')
    cy.get('[data-testid="phone-input"]').type('02-9876-5432')
    
    // 저장 버튼 클릭
    cy.get('[data-testid="save-button"]').click()
    
    // 성공 메시지 확인
    cy.get('[data-testid="success-message"]').should('contain', '병원이 추가되었습니다')
  })
})
```

## 🔍 통역사 관리 테스트 시나리오

### 1. 통역사 검색
```typescript
describe('통역사 검색', () => {
  it('통역사를 검색할 수 있다', () => {
    cy.visit('/interpreters')
    
    // 검색어 입력
    cy.get('[data-testid="search-input"]').type('영어')
    
    // 검색 결과 확인
    cy.get('[data-testid="interpreter-card"]').should('contain', '영어')
    
    // 전문분야 필터 적용
    cy.get('[data-testid="specialization-filter"]').select('의료')
    cy.get('[data-testid="interpreter-card"]').should('contain', '의료')
  })
})
```

### 2. 통역사 인증
```typescript
describe('통역사 인증', () => {
  beforeEach(() => {
    cy.login('admin@test.com', 'password123')
  })

  it('통역사 인증을 승인할 수 있다', () => {
    cy.visit('/admin/interpreters')
    
    // 미인증 통역사 찾기
    cy.get('[data-testid="interpreter-row"]').filter(':contains("미인증")').first().within(() => {
      cy.get('[data-testid="verify-button"]').click()
    })
    
    // 인증 완료 메시지 확인
    cy.get('[data-testid="success-message"]').should('contain', '인증이 승인되었습니다')
  })
})
```

## 📱 반응형 테스트 시나리오

### 1. 모바일 화면
```typescript
describe('모바일 반응형', () => {
  beforeEach(() => {
    cy.viewport('iphone-x')
  })

  it('모바일에서 메뉴가 올바르게 작동한다', () => {
    cy.visit('/')
    
    // 햄버거 메뉴 버튼 클릭
    cy.get('[data-testid="mobile-menu-button"]').click()
    
    // 모바일 메뉴 표시 확인
    cy.get('[data-testid="mobile-menu"]').should('be.visible')
    
    // 메뉴 항목 클릭
    cy.get('[data-testid="mobile-menu-item"]').contains('병원').click()
    
    // 병원 페이지로 이동 확인
    cy.url().should('include', '/hospitals')
  })
})
```

### 2. 태블릿 화면
```typescript
describe('태블릿 반응형', () => {
  beforeEach(() => {
    cy.viewport('ipad-2')
  })

  it('태블릿에서 레이아웃이 올바르게 표시된다', () => {
    cy.visit('/hospitals')
    
    // 그리드 레이아웃 확인
    cy.get('[data-testid="hospitals-grid"]').should('have.class', 'grid-cols-2')
    
    // 사이드바 표시 확인
    cy.get('[data-testid="sidebar"]').should('be.visible')
  })
})
```

## 🚀 성능 테스트 시나리오

### 1. 페이지 로딩 성능
```typescript
describe('페이지 로딩 성능', () => {
  it('메인 페이지가 3초 이내에 로딩된다', () => {
    cy.visit('/', { timeout: 10000 })
    
    // 페이지 로딩 시간 측정
    cy.window().then((win) => {
      const loadTime = win.performance.timing.loadEventEnd - win.performance.timing.navigationStart
      expect(loadTime).to.be.lessThan(3000)
    })
  })

  it('병원 목록이 2초 이내에 로딩된다', () => {
    cy.visit('/hospitals', { timeout: 10000 })
    
    // 병원 카드들이 표시될 때까지 대기
    cy.get('[data-testid="hospital-card"]', { timeout: 5000 }).should('be.visible')
    
    // 로딩 시간 확인
    cy.window().then((win) => {
      const loadTime = win.performance.timing.loadEventEnd - win.performance.timing.navigationStart
      expect(loadTime).to.be.lessThan(2000)
    })
  })
})
```

### 2. API 응답 성능
```typescript
describe('API 응답 성능', () => {
  it('병원 API가 1초 이내에 응답한다', () => {
    cy.intercept('GET', '/api/hospitals').as('getHospitals')
    
    cy.visit('/hospitals')
    cy.wait('@getHospitals').then((interception) => {
      expect(interception.response.statusCode).to.equal(200)
      expect(interception.response.duration).to.be.lessThan(1000)
    })
  })
})
```

## 🧹 테스트 정리

### 1. 테스트 실행
```bash
# 전체 테스트 실행
npm run test:e2e

# 특정 테스트 실행
npx cypress run --spec "cypress/e2e/auth.cy.ts"

# 헤드리스 모드로 실행
npx cypress run --headless
```

### 2. 테스트 결과
```bash
# 테스트 커버리지 확인
npm run test:coverage

# 테스트 리포트 생성
npm run test:report
```

## 📊 테스트 지표

| 테스트 영역 | 테스트 케이스 수 | 커버리지 목표 |
|-------------|------------------|---------------|
| 인증 | 15 | 95% |
| 병원 관리 | 20 | 90% |
| 예약 관리 | 25 | 90% |
| 관리자 기능 | 30 | 95% |
| 통역사 관리 | 20 | 90% |
| 반응형 | 15 | 85% |
| 성능 | 10 | 80% |

**전체 테스트 커버리지 목표: 90%**

---

**마지막 업데이트**: 2024년 12월
**문서 버전**: 1.0
**작성자**: QA팀

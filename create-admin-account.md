# Admin 계정 생성 가이드

## 방법 1: 웹 인터페이스로 계정 생성

1. **회원가입 페이지로 이동**
   - http://localhost:3000/auth/signup

2. **계정 정보 입력**
   - Email: `ki.oksun@gmail.com`
   - Password: `asdf1234`
   - Name: `Admin User`
   - Phone: `68888315`

3. **회원가입 완료 후 관리자 권한 부여**
   - Supabase Dashboard → Authentication → Users
   - 해당 계정을 찾아서 User Metadata에 `role: "admin"` 추가
   - 또는 Database → users 테이블에서 role을 'admin'으로 변경

## 방법 2: Supabase Dashboard에서 직접 생성

1. **Supabase Dashboard 접속**
   - Authentication → Users → Add user

2. **사용자 정보 입력**
   - Email: `ki.oksun@gmail.com`
   - Password: `asdf1234`
   - User Metadata: `{"role": "admin", "name": "Admin User", "phone": "68888315"}`

3. **Database에서 users 테이블 업데이트**
   - Database → users 테이블에서 해당 사용자 찾기
   - role을 'admin'으로 변경
   - name과 phone 정보 추가

## 방법 3: SQL로 직접 생성 (고급)

```sql
-- Supabase Dashboard → SQL Editor에서 실행
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'ki.oksun@gmail.com',
  crypt('asdf1234', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "admin", "name": "Admin User", "phone": "68888315"}',
  false
);

-- users 테이블에도 추가
INSERT INTO users (
  id,
  email,
  password_hash,
  role,
  name,
  phone,
  language,
  member_since
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'ki.oksun@gmail.com'),
  'ki.oksun@gmail.com',
  crypt('asdf1234', gen_salt('bf')),
  'admin',
  'Admin User',
  '68888315',
  'ko',
  CURRENT_DATE
);
```

## 확인 방법

계정 생성 후:
1. http://localhost:3000/auth/login 에서 로그인 테스트
2. http://localhost:3000/admin 에서 관리자 페이지 접근 가능한지 확인


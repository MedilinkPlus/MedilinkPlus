-- 보안 강화를 위한 추가 RLS 정책
-- ==========================================

-- 1. 통역사 테이블 보안 강화
-- 통역사는 자신의 정보만 수정 가능
CREATE POLICY "Interpreters can update own profile" ON interpreters
    FOR UPDATE USING (auth.uid() = user_id);

-- 통역사는 자신의 정보만 조회 가능
CREATE POLICY "Interpreters can view own profile" ON interpreters
    FOR SELECT USING (auth.uid() = user_id);

-- 2. 예약 테이블 보안 강화
-- 사용자는 자신의 예약만 조회/수정 가능
CREATE POLICY "Users can view own reservations" ON reservations
    FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Users can update own reservations" ON reservations
    FOR UPDATE USING (auth.uid() = patient_id);

-- 통역사는 자신에게 배정된 예약만 조회 가능
CREATE POLICY "Interpreters can view assigned reservations" ON reservations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM interpreters WHERE id = interpreter_id AND user_id = auth.uid()
        )
    );

-- 3. 리뷰 테이블 보안 강화
-- 사용자는 자신이 작성한 리뷰만 수정/삭제 가능
CREATE POLICY "Users can manage own reviews" ON reviews
    FOR ALL USING (auth.uid() = user_id);

-- 4. 즐겨찾기 테이블 보안 강화
-- 사용자는 자신의 즐겨찾기만 관리 가능
CREATE POLICY "Users can manage own favorites" ON favorites
    FOR ALL USING (auth.uid() = user_id);

-- 5. 프로모션 테이블 보안 강화
-- 활성 프로모션만 공개 조회 가능
CREATE POLICY "Anyone can view active promotions" ON promotions
    FOR SELECT USING (is_active = true AND valid_until >= NOW());

-- 6. 사용자 프로필 테이블 보안 강화
-- 사용자는 자신의 프로필만 수정 가능
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- 사용자는 자신의 프로필만 조회 가능
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

-- 관리자는 모든 프로필 조회 가능
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 7. 세션 관리 보안
-- 비활성 사용자 세션 자동 만료 (30일)
CREATE OR REPLACE FUNCTION cleanup_inactive_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM auth.sessions 
    WHERE last_accessed < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 감사 로그 테이블 생성
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES auth.users(id),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- 감사 로그 RLS 정책
CREATE POLICY "Admins can view audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 9. API 요청 제한을 위한 함수
CREATE OR REPLACE FUNCTION check_rate_limit(
    user_id UUID,
    action_name TEXT,
    max_requests INTEGER DEFAULT 100,
    time_window INTERVAL DEFAULT '1 hour'
)
RETURNS BOOLEAN AS $$
DECLARE
    request_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO request_count
    FROM audit_logs
    WHERE user_id = $1 
    AND action = $2
    AND timestamp > NOW() - $4;
    
    RETURN request_count < $3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. 민감한 데이터 암호화 함수
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 전화번호 암호화 함수
CREATE OR REPLACE FUNCTION encrypt_phone(phone TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(encrypt(phone::bytea, current_setting('app.encryption_key')::bytea, 'aes'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 전화번호 복호화 함수
CREATE OR REPLACE FUNCTION decrypt_phone(encrypted_phone TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN convert_from(decrypt(decode(encrypted_phone, 'hex'), current_setting('app.encryption_key')::bytea, 'aes'), 'utf8');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. SQL 인젝션 방지를 위한 입력 검증 함수
CREATE OR REPLACE FUNCTION validate_input(input_text TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- SQL 인젝션 패턴 검사
    IF input_text ~* '(union|select|insert|update|delete|drop|create|alter|exec|execute|script|javascript|vbscript|onload|onerror|onclick)' THEN
        RETURN FALSE;
    END IF;
    
    -- XSS 패턴 검사
    IF input_text ~* '(<script|javascript:|vbscript:|onload|onerror|onclick)' THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. 보안 인덱스 생성
-- 사용자 인증 시도 추적을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_auth_logs_user_timestamp ON audit_logs(user_id, timestamp);

-- 세션 만료 시간 인덱스
CREATE INDEX IF NOT EXISTS idx_sessions_last_accessed ON auth.sessions(last_accessed);

-- 사용자 역할 기반 접근 제어 인덱스
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 활성 상태 기반 조회 인덱스
CREATE INDEX IF NOT EXISTS idx_hospitals_status ON hospitals(status);
CREATE INDEX IF NOT EXISTS idx_interpreters_status ON interpreters(status);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active, valid_until);

-- 13. 보안 설정 업데이트
-- 비밀번호 정책 강화
ALTER TABLE auth.users ALTER COLUMN encrypted_password SET NOT NULL;

-- 계정 잠금 정책
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;

-- 14. 보안 뷰 생성
-- 관리자 전용 사용자 정보 뷰
CREATE OR REPLACE VIEW admin_user_overview AS
SELECT 
    u.id,
    u.email,
    u.role,
    u.created_at,
    u.last_sign_in_at,
    p.name,
    p.status,
    p.phone,
    p.language
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
);

-- 사용자 전용 프로필 뷰
CREATE OR REPLACE VIEW user_profile_view AS
SELECT 
    id,
    name,
    phone,
    language,
    age,
    gender,
    avatar_url
FROM profiles
WHERE user_id = auth.uid();

-- 15. 보안 함수 권한 설정
GRANT EXECUTE ON FUNCTION cleanup_inactive_sessions() TO authenticated;
GRANT EXECUTE ON FUNCTION check_rate_limit(UUID, TEXT, INTEGER, INTERVAL) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_input(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION encrypt_phone(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION decrypt_phone(TEXT) TO authenticated;

-- 감사 로그 테이블 권한
GRANT SELECT ON audit_logs TO authenticated;
GRANT INSERT ON audit_logs TO authenticated;

-- 보안 뷰 권한
GRANT SELECT ON admin_user_overview TO authenticated;
GRANT SELECT ON user_profile_view TO authenticated;

-- 성능 최적화를 위한 추가 인덱스, 뷰, 함수
-- ==========================================

-- 1. 성능 최적화 인덱스
-- ==========================================

-- 사용자 조회 최적화
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_role_status ON users(role, status);

-- 병원 조회 최적화
CREATE INDEX IF NOT EXISTS idx_hospitals_specialty ON hospitals(specialty);
CREATE INDEX IF NOT EXISTS idx_hospitals_location ON hospitals USING GIN(to_tsvector('korean', address));
CREATE INDEX IF NOT EXISTS idx_hospitals_rating ON hospitals(rating DESC NULLS LAST);

-- 통역사 조회 최적화
CREATE INDEX IF NOT EXISTS idx_interpreters_specializations ON interpreters USING GIN(specializations);
CREATE INDEX IF NOT EXISTS idx_interpreters_experience ON interpreters(experience_years DESC);
CREATE INDEX IF NOT EXISTS idx_interpreters_hourly_rate ON interpreters(hourly_rate);

-- 예약 조회 최적화
CREATE INDEX IF NOT EXISTS idx_reservations_date_time ON reservations(date, time);
CREATE INDEX IF NOT EXISTS idx_reservations_patient ON reservations(patient_id);
CREATE INDEX IF NOT EXISTS idx_reservations_interpreter ON reservations(interpreter_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status_date ON reservations(status, date);

-- 리뷰 조회 최적화
CREATE INDEX IF NOT EXISTS idx_reviews_hospital ON reviews(hospital_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- 프로모션 조회 최적화
CREATE INDEX IF NOT EXISTS idx_promotions_validity ON promotions(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_promotions_hospital ON promotions(hospital_id);

-- 2. 성능 최적화 뷰
-- ==========================================

-- 병원 통계 뷰
CREATE OR REPLACE VIEW hospital_stats AS
SELECT 
    h.id,
    h.name,
    h.specialty,
    h.address,
    h.rating,
    h.total_reservations,
    COUNT(r.id) as current_month_reservations,
    AVG(rv.rating) as avg_review_rating,
    COUNT(rv.id) as total_reviews,
    COUNT(f.id) as total_fees
FROM hospitals h
LEFT JOIN reservations r ON h.id = r.hospital_id 
    AND r.date >= DATE_TRUNC('month', CURRENT_DATE)
LEFT JOIN reviews rv ON h.id = rv.hospital_id
LEFT JOIN fees f ON h.id = f.hospital_id
WHERE h.status = 'active'
GROUP BY h.id, h.name, h.specialty, h.address, h.rating, h.total_reservations;

-- 통역사 통계 뷰
CREATE OR REPLACE VIEW interpreter_stats AS
SELECT 
    i.id,
    i.user_id,
    u.name,
    i.specializations,
    i.experience_years,
    i.hourly_rate,
    i.is_verified,
    COUNT(r.id) as total_reservations,
    COUNT(r.id) FILTER (WHERE r.date >= DATE_TRUNC('month', CURRENT_DATE)) as current_month_reservations,
    AVG(rv.rating) as avg_rating,
    COUNT(rv.id) as total_reviews
FROM interpreters i
LEFT JOIN users u ON i.user_id = u.id
LEFT JOIN reservations r ON i.id = r.interpreter_id
LEFT JOIN reviews rv ON r.id = rv.reservation_id
WHERE i.status = 'active'
GROUP BY i.id, i.user_id, u.name, i.specializations, i.experience_years, i.hourly_rate, i.is_verified;

-- 사용자 대시보드 뷰
CREATE OR REPLACE VIEW user_dashboard AS
SELECT 
    u.id,
    u.email,
    u.role,
    u.created_at,
    p.name,
    p.avatar_url,
    COUNT(r.id) as total_reservations,
    COUNT(r.id) FILTER (WHERE r.status = 'pending') as pending_reservations,
    COUNT(r.id) FILTER (WHERE r.status = 'confirmed') as confirmed_reservations,
    COUNT(r.id) FILTER (WHERE r.status = 'completed') as completed_reservations,
    COUNT(f.id) as total_favorites,
    COUNT(rv.id) as total_reviews
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN reservations r ON u.id = r.patient_id
LEFT JOIN favorites f ON u.id = f.user_id
LEFT JOIN reviews rv ON u.id = rv.user_id
GROUP BY u.id, u.email, u.role, u.created_at, p.name, p.avatar_url;

-- 3. 성능 최적화 함수
-- ==========================================

-- 병원 검색 최적화 함수
CREATE OR REPLACE FUNCTION search_hospitals(
    search_term TEXT DEFAULT '',
    specialty_filter TEXT DEFAULT '',
    min_rating NUMERIC DEFAULT 0,
    max_distance NUMERIC DEFAULT NULL
)
RETURNS TABLE(
    id UUID,
    name TEXT,
    specialty TEXT,
    address TEXT,
    rating NUMERIC,
    total_reservations INTEGER,
    distance NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.id,
        h.name,
        h.specialty,
        h.address,
        h.rating,
        h.total_reservations,
        CASE 
            WHEN max_distance IS NOT NULL THEN 
                -- 거리 계산 (간단한 유클리드 거리)
                SQRT(POWER(0, 2) + POWER(0, 2))
            ELSE 0
        END as distance
    FROM hospitals h
    WHERE h.status = 'active'
        AND (search_term = '' OR 
             h.name ILIKE '%' || search_term || '%' OR
             h.specialty ILIKE '%' || search_term || '%' OR
             h.address ILIKE '%' || search_term || '%')
        AND (specialty_filter = '' OR h.specialty = specialty_filter)
        AND (min_rating = 0 OR h.rating >= min_rating)
    ORDER BY h.rating DESC NULLS LAST, h.total_reservations DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 통역사 검색 최적화 함수
CREATE OR REPLACE FUNCTION search_interpreters(
    search_term TEXT DEFAULT '',
    specializations_filter TEXT[] DEFAULT ARRAY[]::TEXT[],
    min_experience INTEGER DEFAULT 0,
    max_hourly_rate NUMERIC DEFAULT NULL
)
RETURNS TABLE(
    id UUID,
    user_id UUID,
    name TEXT,
    specializations TEXT[],
    experience_years INTEGER,
    hourly_rate NUMERIC,
    is_verified BOOLEAN,
    total_reservations BIGINT,
    avg_rating NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.user_id,
        u.name,
        i.specializations,
        i.experience_years,
        i.hourly_rate,
        i.is_verified,
        COUNT(r.id) as total_reservations,
        AVG(rv.rating) as avg_rating
    FROM interpreters i
    LEFT JOIN users u ON i.user_id = u.id
    LEFT JOIN reservations r ON i.id = r.interpreter_id
    LEFT JOIN reviews rv ON r.id = rv.reservation_id
    WHERE i.status = 'active'
        AND (search_term = '' OR 
             u.name ILIKE '%' || search_term || '%' OR
             i.specializations && ARRAY[search_term])
        AND (array_length(specializations_filter, 1) IS NULL OR 
             i.specializations && specializations_filter)
        AND (min_experience = 0 OR i.experience_years >= min_experience)
        AND (max_hourly_rate IS NULL OR i.hourly_rate <= max_hourly_rate)
    GROUP BY i.id, i.user_id, u.name, i.specializations, i.experience_years, i.hourly_rate, i.is_verified
    ORDER BY i.is_verified DESC, i.experience_years DESC, avg_rating DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 예약 통계 함수
CREATE OR REPLACE FUNCTION get_reservation_stats(
    user_id UUID,
    date_from DATE DEFAULT NULL,
    date_to DATE DEFAULT NULL
)
RETURNS TABLE(
    total_reservations BIGINT,
    pending_reservations BIGINT,
    confirmed_reservations BIGINT,
    completed_reservations BIGINT,
    cancelled_reservations BIGINT,
    total_spent NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(r.id) as total_reservations,
        COUNT(r.id) FILTER (WHERE r.status = 'pending') as pending_reservations,
        COUNT(r.id) FILTER (WHERE r.status = 'confirmed') as confirmed_reservations,
        COUNT(r.id) FILTER (WHERE r.status = 'completed') as completed_reservations,
        COUNT(r.id) FILTER (WHERE r.status = 'cancelled') as cancelled_reservations,
        COALESCE(SUM(f.price), 0) as total_spent
    FROM reservations r
    LEFT JOIN fees f ON r.hospital_id = f.hospital_id
    WHERE r.patient_id = $1
        AND (date_from IS NULL OR r.date >= date_from)
        AND (date_to IS NULL OR r.date <= date_to);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 캐싱 및 성능 최적화
-- ==========================================

-- 자주 사용되는 데이터를 위한 메터리얼라이즈드 뷰
CREATE MATERIALIZED VIEW IF NOT EXISTS hospital_popularity AS
SELECT 
    h.id,
    h.name,
    h.specialty,
    COUNT(r.id) as reservation_count,
    AVG(rv.rating) as avg_rating,
    COUNT(rv.id) as review_count
FROM hospitals h
LEFT JOIN reservations r ON h.id = r.hospital_id
LEFT JOIN reviews rv ON h.id = rv.hospital_id
WHERE h.status = 'active'
GROUP BY h.id, h.name, h.specialty;

-- 메터리얼라이즈드 뷰 새로고침 함수
CREATE OR REPLACE FUNCTION refresh_hospital_popularity()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW hospital_popularity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 쿼리 성능 모니터링
-- ==========================================

-- 느린 쿼리 추적을 위한 함수
CREATE OR REPLACE FUNCTION log_slow_query(
    query_text TEXT,
    execution_time NUMERIC,
    rows_returned INTEGER
)
RETURNS void AS $$
BEGIN
    INSERT INTO audit_logs (table_name, action, new_values, user_id)
    VALUES (
        'slow_queries',
        'LOG',
        jsonb_build_object(
            'query', query_text,
            'execution_time_ms', execution_time,
            'rows_returned', rows_returned,
            'timestamp', NOW()
        ),
        auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 데이터베이스 정리 함수
-- ==========================================

-- 오래된 데이터 정리 함수
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- 1년 이상 된 완료된 예약 삭제
    DELETE FROM reservations 
    WHERE status = 'completed' 
    AND date < CURRENT_DATE - INTERVAL '1 year';
    
    -- 6개월 이상 된 취소된 예약 삭제
    DELETE FROM reservations 
    WHERE status = 'cancelled' 
    AND date < CURRENT_DATE - INTERVAL '6 months';
    
    -- 만료된 프로모션 비활성화
    UPDATE promotions 
    SET is_active = false 
    WHERE valid_until < CURRENT_DATE;
    
    -- 3개월 이상 된 감사 로그 정리
    DELETE FROM audit_logs 
    WHERE timestamp < CURRENT_DATE - INTERVAL '3 months';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 성능 최적화 권한 설정
-- ==========================================

-- 성능 최적화 함수 권한
GRANT EXECUTE ON FUNCTION search_hospitals(TEXT, TEXT, NUMERIC, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION search_interpreters(TEXT, TEXT[], INTEGER, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION get_reservation_stats(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_hospital_popularity() TO authenticated;
GRANT EXECUTE ON FUNCTION log_slow_query(TEXT, NUMERIC, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_data() TO authenticated;

-- 성능 최적화 뷰 권한
GRANT SELECT ON hospital_stats TO authenticated;
GRANT SELECT ON interpreter_stats TO authenticated;
GRANT SELECT ON user_dashboard TO authenticated;
GRANT SELECT ON hospital_popularity TO authenticated;

-- 8. 자동 정리 스케줄러 설정
-- ==========================================

-- 매일 자동으로 실행되는 정리 작업
SELECT cron.schedule(
    'cleanup-old-data',
    '0 2 * * *', -- 매일 새벽 2시
    'SELECT cleanup_old_data();'
);

-- 매주 자동으로 실행되는 통계 새로고침
SELECT cron.schedule(
    'refresh-hospital-popularity',
    '0 3 * * 0', -- 매주 일요일 새벽 3시
    'SELECT refresh_hospital_popularity();'
);

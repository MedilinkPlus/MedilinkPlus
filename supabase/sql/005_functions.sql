-- Function to calculate hospital rating from reviews
CREATE OR REPLACE FUNCTION calculate_hospital_rating(hospital_uuid UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
    avg_rating DECIMAL(3,2);
BEGIN
    SELECT COALESCE(AVG(r.rating), 0)
    INTO avg_rating
    FROM reviews r
    JOIN reservations res ON res.id = r.reservation_id
    WHERE res.hospital_id = hospital_uuid;
    
    -- Update hospital rating
    UPDATE hospitals 
    SET rating = avg_rating, updated_at = NOW()
    WHERE id = hospital_uuid;
    
    RETURN avg_rating;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Force drop existing functions first
DROP FUNCTION IF EXISTS get_user_reservations(uuid,text) CASCADE;
DROP FUNCTION IF EXISTS get_user_reservations_v2(uuid,text) CASCADE;

-- Function to get user reservations with details (renamed to avoid conflicts)
CREATE OR REPLACE FUNCTION get_user_reservations_v2(user_uuid UUID, status_filter TEXT DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    treatment VARCHAR(255),
    appointment_date DATE,
    appointment_time TIME,
    status TEXT,
    hospital_name VARCHAR(255),
    interpreter_name VARCHAR(100),
    estimated_cost VARCHAR(100)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        res.id,
        res.treatment,
        res.date,
        res.time,
        res.status::TEXT,
        h.name,
        u.name,
        res.estimated_cost
    FROM reservations res
    JOIN hospitals h ON h.id = res.hospital_id
    LEFT JOIN interpreters i ON i.id = res.interpreter_id
    LEFT JOIN users u ON u.id = i.user_id
    WHERE res.patient_id = user_uuid
    AND (status_filter IS NULL OR res.status::TEXT = status_filter)
    ORDER BY res.date DESC, res.time DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create alias for backward compatibility
CREATE OR REPLACE FUNCTION get_user_reservations(user_uuid UUID, status_filter TEXT DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    treatment VARCHAR(255),
    appointment_date DATE,
    appointment_time TIME,
    status TEXT,
    hospital_name VARCHAR(255),
    interpreter_name VARCHAR(100),
    estimated_cost VARCHAR(100)
) AS $$
BEGIN
    RETURN QUERY SELECT * FROM get_user_reservations_v2(user_uuid, status_filter);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing function first
DROP FUNCTION IF EXISTS search_hospitals(text,text,numeric,numeric);

-- Function to search hospitals with filters
CREATE OR REPLACE FUNCTION search_hospitals(
    search_term TEXT DEFAULT NULL,
    specialty_filter TEXT DEFAULT NULL,
    min_rating DECIMAL(3,2) DEFAULT NULL,
    max_price_filter DECIMAL(10,2) DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    specialty VARCHAR(100),
    address TEXT,
    rating DECIMAL(3,2),
    total_reservations INTEGER,
    image_url TEXT,
    min_price DECIMAL(10,2),
    max_price DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        h.id,
        h.name,
        h.specialty,
        h.address,
        h.rating,
        h.total_reservations,
        h.image_url,
        MIN(f.min_price) as min_price,
        MAX(f.max_price) as max_price
    FROM hospitals h
    LEFT JOIN fees f ON f.hospital_id = h.id
    WHERE h.status = 'active'
    AND (search_term IS NULL OR 
         h.name ILIKE '%' || search_term || '%' OR 
         h.specialty ILIKE '%' || search_term || '%' OR
         h.address ILIKE '%' || search_term || '%')
    AND (specialty_filter IS NULL OR h.specialty = specialty_filter)
    AND (min_rating IS NULL OR h.rating >= min_rating)
    AND (max_price_filter IS NULL OR f.max_price <= max_price_filter)
    GROUP BY h.id, h.name, h.specialty, h.address, h.rating, h.total_reservations, h.image_url
    ORDER BY h.rating DESC, h.total_reservations DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get interpreter availability
CREATE OR REPLACE FUNCTION get_interpreter_availability(
    interpreter_uuid UUID,
    check_date DATE
)
RETURNS TABLE (
    time_slot TIME,
    is_available BOOLEAN
) AS $$
DECLARE
    time_slot TIME;
BEGIN
    -- Generate time slots from 9 AM to 6 PM
    FOR time_slot IN SELECT generate_series(
        '09:00:00'::TIME, 
        '18:00:00'::TIME, 
        '01:00:00'::INTERVAL
    )::TIME
    LOOP
        RETURN QUERY
        SELECT 
            time_slot,
            NOT EXISTS (
                SELECT 1 FROM reservations 
                WHERE interpreter_id = interpreter_uuid 
                AND date = check_date 
                AND time = time_slot
                AND status IN ('pending', 'confirmed')
            ) as is_available;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user statistics
CREATE OR REPLACE FUNCTION update_user_statistics(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE users 
    SET 
        total_bookings = (
            SELECT COUNT(*) FROM reservations WHERE patient_id = user_uuid
        ),
        favorite_hospitals_count = (
            SELECT COUNT(*) FROM favorites WHERE user_id = user_uuid
        ),
        total_reviews = (
            SELECT COUNT(*) FROM reviews WHERE user_id = user_uuid
        ),
        updated_at = NOW()
    WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update hospital statistics
CREATE OR REPLACE FUNCTION update_hospital_statistics(hospital_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE hospitals 
    SET 
        total_reservations = (
            SELECT COUNT(*) FROM reservations WHERE hospital_id = hospital_uuid
        ),
        rating = (
            SELECT COALESCE(AVG(r.rating), 0)
            FROM reviews r
            JOIN reservations res ON res.id = r.reservation_id
            WHERE res.hospital_id = hospital_uuid
        ),
        updated_at = NOW()
    WHERE id = hospital_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can cancel reservation
CREATE OR REPLACE FUNCTION can_cancel_reservation(
    reservation_uuid UUID,
    user_uuid UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    reservation_date DATE;
    user_role TEXT;
    is_owner BOOLEAN;
BEGIN
    -- Get reservation date and user role
    SELECT res.date, u.role
    INTO reservation_date, user_role
    FROM reservations res
    JOIN users u ON u.id = res.patient_id
    WHERE res.id = reservation_uuid;
    
    -- Check if user owns the reservation
    SELECT EXISTS(
        SELECT 1 FROM reservations 
        WHERE id = reservation_uuid AND patient_id = user_uuid
    ) INTO is_owner;
    
    -- Admin can cancel any reservation
    IF user_role = 'admin' THEN
        RETURN TRUE;
    END IF;
    
    -- User can cancel own reservation if it's more than 24 hours away
    IF is_owner AND reservation_date > CURRENT_DATE + INTERVAL '1 day' THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get promotion statistics
CREATE OR REPLACE FUNCTION get_promotion_statistics()
RETURNS TABLE (
    total_promotions INTEGER,
    active_promotions INTEGER,
    expiring_soon INTEGER,
    total_usage INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_promotions,
        COUNT(*) FILTER (WHERE status = 'active' AND CURRENT_DATE BETWEEN valid_from AND valid_until) as active_promotions,
        COUNT(*) FILTER (WHERE status = 'active' AND (valid_until - CURRENT_DATE) <= 7 AND (valid_until - CURRENT_DATE) > 0) as expiring_soon,
        SUM(used_count) as total_usage
    FROM promotions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing function first
DROP FUNCTION IF EXISTS search_interpreters(text,text,integer,numeric);

-- Function to search interpreters with filters
CREATE OR REPLACE FUNCTION search_interpreters(
    language_filter TEXT DEFAULT NULL,
    specialization_filter TEXT DEFAULT NULL,
    min_experience INTEGER DEFAULT NULL,
    min_rating DECIMAL(3,2) DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    languages TEXT[],
    specializations TEXT[],
    experience_years INTEGER,
    rating DECIMAL(3,2),
    total_requests INTEGER,
    avatar_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        u.name,
        i.languages,
        i.specializations,
        i.experience_years,
        i.rating,
        i.total_requests,
        u.avatar_url
    FROM interpreters i
    JOIN users u ON u.id = i.user_id
    WHERE i.status = 'active'
    AND (language_filter IS NULL OR language_filter = ANY(i.languages))
    AND (specialization_filter IS NULL OR specialization_filter = ANY(i.specializations))
    AND (min_experience IS NULL OR i.experience_years >= min_experience)
    AND (min_rating IS NULL OR i.rating >= min_rating)
    ORDER BY i.rating DESC, i.experience_years DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger first
DROP TRIGGER IF EXISTS trigger_update_statistics_on_reservation_change ON reservations;

-- Trigger function to update statistics when reservations change
CREATE OR REPLACE FUNCTION update_statistics_on_reservation_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user statistics
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM update_user_statistics(NEW.patient_id);
        PERFORM update_hospital_statistics(NEW.hospital_id);
        IF NEW.interpreter_id IS NOT NULL THEN
            UPDATE interpreters 
            SET total_requests = (
                SELECT COUNT(*) FROM reservations WHERE interpreter_id = NEW.interpreter_id
            )
            WHERE id = NEW.interpreter_id;
        END IF;
    END IF;
    
    -- Update user statistics on delete
    IF TG_OP = 'DELETE' THEN
        PERFORM update_user_statistics(OLD.patient_id);
        PERFORM update_hospital_statistics(OLD.hospital_id);
        IF OLD.interpreter_id IS NOT NULL THEN
            UPDATE interpreters 
            SET total_requests = (
                SELECT COUNT(*) FROM reservations WHERE interpreter_id = OLD.interpreter_id
            )
            WHERE id = OLD.interpreter_id;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for reservation changes
CREATE TRIGGER trigger_update_statistics_on_reservation_change
    AFTER INSERT OR UPDATE OR DELETE ON reservations
    FOR EACH ROW EXECUTE FUNCTION update_statistics_on_reservation_change();

-- Hospital summary view with ratings and statistics
CREATE OR REPLACE VIEW hospital_summary AS
SELECT 
  h.id,
  h.name,
  h.specialty,
  h.address,
  h.phone,
  h.website,
  h.hours,
  h.status,
  h.image_url,
  h.rating,
  h.total_reservations,
  h.created_at,
  h.updated_at,
  -- Calculate average rating from reviews
  COALESCE(AVG(r.rating), 0) as calculated_rating,
  -- Count total reviews
  COUNT(r.id) as total_reviews,
  -- Count active promotions
  COUNT(p.id) as active_promotions,
  -- Get departments as array
  ARRAY_AGG(DISTINCT hd.name) FILTER (WHERE hd.name IS NOT NULL) as departments
FROM hospitals h
LEFT JOIN reviews r ON r.reservation_id IN (
  SELECT id FROM reservations WHERE hospital_id = h.id
)
LEFT JOIN promotions p ON p.hospital = h.name AND p.status = 'active'
LEFT JOIN hospital_departments hd ON hd.hospital_id = h.id
GROUP BY h.id, h.name, h.specialty, h.address, h.phone, h.website, h.hours, h.status, h.image_url, h.rating, h.total_reservations, h.created_at, h.updated_at;

-- Interpreter summary view
CREATE OR REPLACE VIEW interpreter_summary AS
SELECT 
  i.id,
  i.user_id,
  u.name,
  u.email,
  u.phone,
  u.avatar_url,
  i.languages,
  i.specializations,
  i.experience_years,
  i.rating,
  i.total_requests,
  i.status,
  i.created_at,
  i.updated_at,
  -- Calculate average rating from reviews
  COALESCE(AVG(r.rating), 0) as calculated_rating,
  -- Count total reviews
  COUNT(r.id) as total_reviews,
  -- Count completed reservations
  COUNT(res.id) FILTER (WHERE res.status = 'completed') as completed_reservations
FROM interpreters i
JOIN users u ON u.id = i.user_id
LEFT JOIN reservations res ON res.interpreter_id = i.id
LEFT JOIN reviews r ON r.reservation_id = res.id
GROUP BY i.id, i.user_id, u.name, u.email, u.phone, u.avatar_url, i.languages, i.specializations, i.experience_years, i.rating, i.total_requests, i.status, i.created_at, i.updated_at;

-- User dashboard statistics view
CREATE OR REPLACE VIEW user_dashboard_stats AS
SELECT 
  u.id,
  u.name,
  u.email,
  u.role,
  u.avatar_url,
  u.member_since,
  u.total_bookings,
  u.favorite_hospitals_count,
  u.total_reviews,
  -- Recent reservations
  COUNT(res.id) FILTER (WHERE res.date >= CURRENT_DATE - INTERVAL '30 days') as recent_reservations,
  -- Upcoming reservations
  COUNT(res.id) FILTER (WHERE res.date >= CURRENT_DATE AND res.status IN ('pending', 'confirmed')) as upcoming_reservations,
  -- Favorite hospitals
  ARRAY_AGG(DISTINCT h.name) FILTER (WHERE h.name IS NOT NULL) as favorite_hospital_names,
  -- Recent reviews
  ARRAY_AGG(DISTINCT r.comment) FILTER (WHERE r.created_at >= CURRENT_DATE - INTERVAL '30 days') as recent_review_comments
FROM users u
LEFT JOIN reservations res ON res.patient_id = u.id
LEFT JOIN favorites f ON f.user_id = u.id
LEFT JOIN hospitals h ON h.id = f.hospital_id
LEFT JOIN reviews r ON r.user_id = u.id
GROUP BY u.id, u.name, u.email, u.role, u.avatar_url, u.member_since, u.total_bookings, u.favorite_hospitals_count, u.total_reviews;

-- Reservation details view with related information
CREATE OR REPLACE VIEW reservation_details AS
SELECT 
  res.id,
  res.treatment,
  res.date,
  res.time,
  res.status,
  res.notes,
  res.estimated_cost,
  res.special_requests,
  res.booking_date,
  res.cancellation_reason,
  res.admin_approval_required,
  res.created_at,
  res.updated_at,
  -- Patient information
  u_patient.name as patient_name,
  u_patient.email as patient_email,
  u_patient.phone as patient_phone,
  u_patient.language as patient_language,
  -- Hospital information
  h.name as hospital_name,
  h.specialty as hospital_specialty,
  h.address as hospital_address,
  h.phone as hospital_phone,
  -- Interpreter information
  u_interpreter.name as interpreter_name,
  u_interpreter.phone as interpreter_phone,
  i.languages as interpreter_languages,
  i.specializations as interpreter_specializations,
  -- Fee information
  f.min_price,
  f.max_price,
  f.currency,
  f.duration
FROM reservations res
JOIN users u_patient ON u_patient.id = res.patient_id
JOIN hospitals h ON h.id = res.hospital_id
LEFT JOIN interpreters i ON i.id = res.interpreter_id
LEFT JOIN users u_interpreter ON u_interpreter.id = i.user_id
LEFT JOIN fees f ON f.hospital_id = res.hospital_id AND f.treatment = res.treatment;

-- Promotion summary view
CREATE OR REPLACE VIEW promotion_summary AS
SELECT 
  p.id,
  p.title,
  p.hospital,
  p.description,
  p.discount,
  p.original_price,
  p.discount_price,
  p.valid_from,
  p.valid_until,
  p.status,
  p.used_count,
  p.banner_image,
  p.created_at,
  -- Calculate days remaining
  (p.valid_until - CURRENT_DATE) as days_remaining,
  -- Check if promotion is expiring soon (within 7 days)
  CASE 
    WHEN (p.valid_until - CURRENT_DATE) <= 7 AND (p.valid_until - CURRENT_DATE) > 0 
    THEN true 
    ELSE false 
  END as expiring_soon,
  -- Check if promotion is active and valid
  CASE 
    WHEN p.status = 'active' AND CURRENT_DATE BETWEEN p.valid_from AND p.valid_until 
    THEN true 
    ELSE false 
  END as is_valid
FROM promotions p;

-- Fee comparison view
CREATE OR REPLACE VIEW fee_comparison AS
SELECT 
  f.id,
  f.hospital_id,
  h.name as hospital_name,
  h.specialty as hospital_specialty,
  f.department,
  f.treatment,
  f.min_price,
  f.max_price,
  f.currency,
  f.duration,
  f.last_updated,
  -- Calculate average price
  (f.min_price + f.max_price) / 2 as avg_price,
  -- Price range
  (f.max_price - f.min_price) as price_range,
  -- Price category (budget, mid-range, premium)
  CASE 
    WHEN (f.min_price + f.max_price) / 2 < 500 THEN 'Budget'
    WHEN (f.min_price + f.max_price) / 2 < 2000 THEN 'Mid-range'
    ELSE 'Premium'
  END as price_category
FROM fees f
JOIN hospitals h ON h.id = f.hospital_id
WHERE f.min_price IS NOT NULL AND f.max_price IS NOT NULL;

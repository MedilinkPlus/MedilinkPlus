-- Insert sample users
INSERT INTO users (id, email, password_hash, role, name, phone, language, age, gender, avatar_url, member_since) VALUES
-- Admin user (password: admin123)
('550e8400-e29b-41d4-a716-446655440001', 'admin@admin', crypt('admin123', gen_salt('bf')), 'admin', 'Admin User', '+82-2-1234-5678', 'ko', 35, 'male', 'https://readdy.ai/api/search-image?query=Professional%20admin%20profile%20photo%2C%20business%20attire%2C%20confident%20expression&width=200&height=200&seq=admin-avatar&orientation=squarish', '2024-01-01'),

-- Interpreter user (password: inter123)
('550e8400-e29b-41d4-a716-446655440002', 'inter@inter', crypt('inter123', gen_salt('bf')), 'interpreter', 'Sarah Kim', '+82-2-2345-6789', 'ko', 28, 'female', 'https://readdy.ai/api/search-image?query=Professional%20Korean%20interpreter%20profile%20photo%2C%20friendly%20smile%2C%20business%20attire&width=200&height=200&seq=interpreter-avatar&orientation=squarish', '2024-01-01'),

-- Sample regular users
('550e8400-e29b-41d4-a716-446655440003', 'siriporn.t@email.com', crypt('password123', gen_salt('bf')), 'user', 'Siriporn Thanakit', '+66-81-234-5678', 'th', 32, 'female', 'https://readdy.ai/api/search-image?query=Professional%20Thai%20woman%20profile%20photo%2C%20friendly%20smile%2C%20modern%20casual%20attire&width=200&height=200&seq=user-avatar&orientation=squarish', '2024-01-15'),

('550e8400-e29b-41d4-a716-446655440004', 'panida.s@email.com', crypt('password123', gen_salt('bf')), 'user', 'Panida Sukumarn', '+66-82-345-6789', 'th', 29, 'female', 'https://readdy.ai/api/search-image?query=Professional%20Thai%20woman%20profile%20photo%2C%20confident%20expression%2C%20business%20attire&width=200&height=200&seq=user-avatar2&orientation=squarish', '2024-01-20'),

('550e8400-e29b-41d4-a716-446655440005', 'nattaya.k@email.com', crypt('password123', gen_salt('bf')), 'user', 'Nattaya Kamnoet', '+66-83-456-7890', 'th', 31, 'female', 'https://readdy.ai/api/search-image?query=Professional%20Thai%20woman%20profile%20photo%2C%20warm%20smile%2C%20casual%20attire&width=200&height=200&seq=user-avatar3&orientation=squarish', '2024-01-25');

-- Insert sample hospitals (reduced to 2 for SSG)
INSERT INTO hospitals (id, name, specialty, address, phone, website, hours, status, image_url, rating, total_reservations) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'Seoul Dental Excellence', 'Dental Care', '123 Gangnam-daero, Gangnam-gu, Seoul', '+82-2-1234-5678', 'https://seoul-dental-excellence.com', '09:00-18:00', 'active', 'https://readdy.ai/api/search-image?query=Modern%20dental%20clinic%20interior%2C%20dental%20chairs%2C%20professional%20lighting%2C%20clean%20white%20environment&width=400&height=300&seq=hospital1&orientation=landscape', 4.8, 45),

('550e8400-e29b-41d4-a716-446655440011', 'Gangnam Beauty Clinic', 'Plastic Surgery', '456 Gangnam-daero, Gangnam-gu, Seoul', '+82-2-2345-6789', 'https://gangnam-beauty-clinic.co.kr', '10:00-19:00', 'active', 'https://readdy.ai/api/search-image?query=Elegant%20plastic%20surgery%20clinic%20with%20modern%20equipment%2C%20clean%20white%20interior%2C%20professional%20atmosphere&width=400&height=300&seq=hospital2&orientation=landscape', 4.6, 32);

-- Insert sample interpreters (reduced to 2 for SSG)
INSERT INTO interpreters (id, user_id, languages, specializations, experience_years, rating, total_requests, status) VALUES
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440002', ARRAY['Korean', 'English', 'Thai'], ARRAY['Medical', 'Dental', 'General'], 5, 4.8, 45, 'active'),

('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440002', ARRAY['Korean', 'English', 'Japanese'], ARRAY['Plastic Surgery', 'Dermatology'], 3, 4.6, 32, 'active');

-- Insert sample treatments
INSERT INTO treatments (id, name, description, category) VALUES
('550e8400-e29b-41d4-a716-446655440030', 'Dental Check-up', 'Comprehensive dental examination and cleaning', 'Dental'),
('550e8400-e29b-41d4-a716-446655440031', 'Dental Implant', 'Single tooth replacement with implant', 'Dental'),
('550e8400-e29b-41d4-a716-446655440032', 'Rhinoplasty', 'Nose reshaping surgery', 'Plastic Surgery'),
('550e8400-e29b-41d4-a716-446655440033', 'Laser Skin Resurfacing', 'Skin rejuvenation treatment', 'Dermatology'),
('550e8400-e29b-41d4-a716-446655440034', 'Knee Replacement', 'Total knee joint replacement', 'Orthopedics'),
('550e8400-e29b-41d4-a716-446655440035', 'Heart Bypass Surgery', 'Coronary artery bypass grafting', 'Cardiology'),
('550e8400-e29b-41d4-a716-446655440036', 'Skin Analysis', 'Comprehensive skin condition assessment', 'Dermatology');

-- Insert sample fees
INSERT INTO fees (id, hospital_id, department, treatment, min_price, max_price, currency, duration) VALUES
('550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440010', 'General Dentistry', 'Dental Check-up', 80.00, 120.00, 'USD', '1 hour'),
('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440010', 'Oral Surgery', 'Dental Implant (Single)', 800.00, 1200.00, 'USD', '1 hour'),
('550e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440011', 'Facial Surgery', 'Rhinoplasty (Nose Job)', 3500.00, 5000.00, 'USD', '2-3 hours'),
('550e8400-e29b-41d4-a716-446655440043', '550e8400-e29b-41d4-a716-446655440011', 'Non-surgical', 'Laser Skin Resurfacing', 1500.00, 2500.00, 'USD', '1-2 hours');

-- Insert sample promotions
INSERT INTO promotions (id, title, hospital, description, discount, original_price, discount_price, valid_from, valid_until, status, used_count, banner_image) VALUES
('550e8400-e29b-41d4-a716-446655440050', '50% OFF Dental Check-up', 'Seoul Dental Excellence', 'Special promotion for new customers', '50%', '$170', '$85', '2024-01-01', '2024-03-31', 'active', 23, 'https://readdy.ai/api/search-image?query=Modern%20dental%20clinic%20interior%20with%20soft%20pastel%20colors%2C%20clean%20white%20environment%2C%20dental%20chair%2C%20professional%20lighting&width=400&height=200&seq=dental-promo&orientation=landscape'),

('550e8400-e29b-41d4-a716-446655440051', 'Free Consultation', 'Gangnam Beauty Clinic', 'Plastic Surgery with certified doctors', '100%', '$100', '$0', '2024-02-01', '2024-04-30', 'active', 15, 'https://readdy.ai/api/search-image?query=Elegant%20plastic%20surgery%20consultation%20room%20with%20soft%20lighting%2C%20comfortable%20seating%2C%20modern%20medical%20equipment&width=400&height=200&seq=surgery-promo&orientation=landscape');

-- Insert sample reservations (reduced to 2 for SSG)
INSERT INTO reservations (id, patient_id, hospital_id, interpreter_id, treatment, date, time, status, notes, estimated_cost, special_requests, booking_date) VALUES
('550e8400-e29b-41d4-a716-446655440060', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440020', 'Dental Check-up', '2024-02-15', '10:00:00', 'confirmed', 'Customer has dental anxiety. Requires gentle approach and extra time.', '$120', 'English interpreter required, afternoon appointment preferred', '2024-02-01'),

('550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440021', 'Plastic Surgery Consultation', '2024-02-20', '14:00:00', 'pending', 'First-time consultation for rhinoplasty procedure.', '$150', 'Korean interpreter needed, consultation about nose surgery options', '2024-02-05');

-- Insert sample reviews (reduced to 1 for SSG)
INSERT INTO reviews (id, reservation_id, user_id, review_type, rating, comment) VALUES
('550e8400-e29b-41d4-a716-446655440070', '550e8400-e29b-41d4-a716-446655440060', '550e8400-e29b-41d4-a716-446655440003', 'confirmed', 5, 'Excellent service. Doctor was very thorough and caring. Highly recommend!');

-- Insert sample favorites (reduced to 2 for SSG)
INSERT INTO favorites (id, user_id, hospital_id) VALUES
('550e8400-e29b-41d4-a716-446655440080', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440010'),
('550e8400-e29b-41d4-a716-446655440081', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440011');

-- Update user statistics
UPDATE users SET 
  total_bookings = (SELECT COUNT(*) FROM reservations WHERE patient_id = users.id),
  favorite_hospitals_count = (SELECT COUNT(*) FROM favorites WHERE user_id = users.id),
  total_reviews = (SELECT COUNT(*) FROM reviews WHERE user_id = users.id);

-- Update hospital statistics
UPDATE hospitals SET 
  total_reservations = (SELECT COUNT(*) FROM reservations WHERE hospital_id = hospitals.id);

-- Update interpreter statistics
UPDATE interpreters SET 
  total_requests = (SELECT COUNT(*) FROM reservations WHERE interpreter_id = interpreters.id);

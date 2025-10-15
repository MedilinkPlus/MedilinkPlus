-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE user_role AS ENUM ('user', 'admin', 'interpreter');
CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE hospital_status AS ENUM ('active', 'inactive');
CREATE TYPE promotion_status AS ENUM ('active', 'expired');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
CREATE TYPE review_type AS ENUM ('in_progress', 'completed');

-- Users table (master table with profile info)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  language VARCHAR(10) DEFAULT 'ko',
  age INTEGER CHECK (age >= 0 AND age <= 150),
  gender gender_type,
  avatar_url TEXT,
  member_since DATE DEFAULT CURRENT_DATE,
  total_bookings INTEGER DEFAULT 0,
  favorite_hospitals_count INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  line_user_id VARCHAR(100), -- LINE 연동용
  notification_preferences JSONB DEFAULT '{"email": true, "line": false}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hospitals table
CREATE TABLE hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  specialty VARCHAR(100),
  address TEXT NOT NULL,
  phone VARCHAR(20),
  website TEXT,
  hours VARCHAR(100),
  status hospital_status DEFAULT 'active',
  image_url TEXT,
  rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
  total_reservations INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hospital departments table
CREATE TABLE hospital_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Treatments table
CREATE TABLE treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fees table (improved structure)
CREATE TABLE fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  department VARCHAR(100),
  treatment VARCHAR(255),
  min_price DECIMAL(10,2),
  max_price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  duration VARCHAR(50),
  last_updated DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interpreters table
CREATE TABLE interpreters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  languages VARCHAR(50)[] NOT NULL, -- 지원 언어 배열
  specializations VARCHAR(100)[] NOT NULL, -- 전문 분야 배열
  experience_years INTEGER CHECK (experience_years >= 0),
  rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
  total_requests INTEGER DEFAULT 0,
  status hospital_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reservations table
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  interpreter_id UUID REFERENCES interpreters(id) ON DELETE SET NULL,
  treatment VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status reservation_status DEFAULT 'pending',
  notes TEXT,
  estimated_cost VARCHAR(100),
  special_requests TEXT,
  booking_date DATE DEFAULT CURRENT_DATE,
  cancellation_reason TEXT,
  admin_approval_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promotions table
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  hospital VARCHAR(255),
  description TEXT,
  discount VARCHAR(50) NOT NULL, -- "30%"
  original_price VARCHAR(100),
  discount_price VARCHAR(100),
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  status promotion_status DEFAULT 'active',
  used_count INTEGER DEFAULT 0,
  banner_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  review_type review_type DEFAULT 'completed',
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorites table
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, hospital_id) -- 중복 방지
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_line_user_id ON users(line_user_id);

CREATE INDEX idx_hospitals_name ON hospitals(name);
CREATE INDEX idx_hospitals_specialty ON hospitals(specialty);
CREATE INDEX idx_hospitals_status ON hospitals(status);
CREATE INDEX idx_hospitals_rating ON hospitals(rating);

CREATE INDEX idx_fees_hospital_id ON fees(hospital_id);
CREATE INDEX idx_fees_treatment ON fees(treatment);
CREATE INDEX idx_fees_department ON fees(department);
CREATE INDEX idx_fees_price_range ON fees(min_price, max_price);

CREATE INDEX idx_interpreters_user_id ON interpreters(user_id);
CREATE INDEX idx_interpreters_languages ON interpreters USING GIN(languages);
CREATE INDEX idx_interpreters_specializations ON interpreters USING GIN(specializations);
CREATE INDEX idx_interpreters_status ON interpreters(status);

CREATE INDEX idx_reservations_patient_id ON reservations(patient_id);
CREATE INDEX idx_reservations_hospital_id ON reservations(hospital_id);
CREATE INDEX idx_reservations_interpreter_id ON reservations(interpreter_id);
CREATE INDEX idx_reservations_date ON reservations(date);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_booking_date ON reservations(booking_date);

CREATE INDEX idx_promotions_status ON promotions(status);
CREATE INDEX idx_promotions_valid_dates ON promotions(valid_from, valid_until);

CREATE INDEX idx_reviews_reservation_id ON reviews(reservation_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_hospital_id ON favorites(hospital_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hospitals_updated_at BEFORE UPDATE ON hospitals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interpreters_updated_at BEFORE UPDATE ON interpreters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

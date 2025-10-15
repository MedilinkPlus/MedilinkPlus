-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE interpreters ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all users" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete users" ON users
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Hospitals table policies (public read, admin write)
CREATE POLICY "Anyone can view active hospitals" ON hospitals
    FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can view all hospitals" ON hospitals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can insert hospitals" ON hospitals
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update hospitals" ON hospitals
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete hospitals" ON hospitals
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Hospital departments policies
CREATE POLICY "Anyone can view hospital departments" ON hospital_departments
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage hospital departments" ON hospital_departments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Treatments policies
CREATE POLICY "Anyone can view treatments" ON treatments
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage treatments" ON treatments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Fees policies
CREATE POLICY "Anyone can view fees" ON fees
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage fees" ON fees
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Interpreters policies
CREATE POLICY "Anyone can view active interpreters" ON interpreters
    FOR SELECT USING (status = 'active');

CREATE POLICY "Interpreters can view own profile" ON interpreters
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Interpreters can update own profile" ON interpreters
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all interpreters" ON interpreters
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Reservations policies
CREATE POLICY "Users can view own reservations" ON reservations
    FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Interpreters can view assigned reservations" ON reservations
    FOR SELECT USING (
        interpreter_id IN (
            SELECT id FROM interpreters WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all reservations" ON reservations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can create reservations" ON reservations
    FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Users can update own reservations" ON reservations
    FOR UPDATE USING (patient_id = auth.uid());

CREATE POLICY "Admins can update all reservations" ON reservations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete reservations" ON reservations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Promotions policies
CREATE POLICY "Anyone can view active promotions" ON promotions
    FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can view all promotions" ON promotions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage promotions" ON promotions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Reviews policies
CREATE POLICY "Users can view reviews" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for own reservations" ON reviews
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        reservation_id IN (
            SELECT id FROM reservations WHERE patient_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own reviews" ON reviews
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all reviews" ON reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Favorites policies
CREATE POLICY "Users can view own favorites" ON favorites
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own favorites" ON favorites
    FOR ALL USING (user_id = auth.uid());

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is interpreter
CREATE OR REPLACE FUNCTION is_interpreter()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'interpreter'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

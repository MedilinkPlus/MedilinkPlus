-- 007_fix_rls_recursion.sql
-- Fix infinite recursion in users table RLS policies

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;

-- Create a function to safely check admin role without recursion
CREATE OR REPLACE FUNCTION check_admin_role_safe()
RETURNS BOOLEAN AS $$
BEGIN
    -- Use auth.jwt() to get user info directly from JWT token
    -- This avoids querying the users table and prevents recursion
    RETURN (auth.jwt() ->> 'role') = 'admin';
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to safely check user role without recursion
CREATE OR REPLACE FUNCTION check_user_role_safe()
RETURNS TEXT AS $$
BEGIN
    -- Use auth.jwt() to get user info directly from JWT token
    RETURN COALESCE(auth.jwt() ->> 'role', 'user');
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'user';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate users table policies with safe admin checks
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Use the safe admin check function
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (check_admin_role_safe());

CREATE POLICY "Admins can update all users" ON users
    FOR UPDATE USING (check_admin_role_safe());

CREATE POLICY "Admins can delete users" ON users
    FOR DELETE USING (check_admin_role_safe());

-- Also fix other tables that reference users table in admin checks
-- Hospitals table policies
DROP POLICY IF EXISTS "Admins can view all hospitals" ON hospitals;
DROP POLICY IF EXISTS "Admins can insert hospitals" ON hospitals;
DROP POLICY IF EXISTS "Admins can update hospitals" ON hospitals;
DROP POLICY IF EXISTS "Admins can delete hospitals" ON hospitals;

CREATE POLICY "Admins can view all hospitals" ON hospitals
    FOR SELECT USING (check_admin_role_safe());

CREATE POLICY "Admins can insert hospitals" ON hospitals
    FOR INSERT WITH CHECK (check_admin_role_safe());

CREATE POLICY "Admins can update hospitals" ON hospitals
    FOR UPDATE USING (check_admin_role_safe());

CREATE POLICY "Admins can delete hospitals" ON hospitals
    FOR DELETE USING (check_admin_role_safe());

-- Hospital departments policies
DROP POLICY IF EXISTS "Admins can manage hospital departments" ON hospital_departments;

CREATE POLICY "Admins can manage hospital departments" ON hospital_departments
    FOR ALL USING (check_admin_role_safe());

-- Treatments policies
DROP POLICY IF EXISTS "Admins can manage treatments" ON treatments;

CREATE POLICY "Admins can manage treatments" ON treatments
    FOR ALL USING (check_admin_role_safe());

-- Fees policies
DROP POLICY IF EXISTS "Admins can manage fees" ON fees;

CREATE POLICY "Admins can manage fees" ON fees
    FOR ALL USING (check_admin_role_safe());

-- Interpreters policies
DROP POLICY IF EXISTS "Admins can manage all interpreters" ON interpreters;

CREATE POLICY "Admins can manage all interpreters" ON interpreters
    FOR ALL USING (check_admin_role_safe());

-- Reservations policies
DROP POLICY IF EXISTS "Admins can view all reservations" ON reservations;
DROP POLICY IF EXISTS "Admins can update all reservations" ON reservations;
DROP POLICY IF EXISTS "Admins can delete reservations" ON reservations;

CREATE POLICY "Admins can view all reservations" ON reservations
    FOR SELECT USING (check_admin_role_safe());

CREATE POLICY "Admins can update all reservations" ON reservations
    FOR UPDATE USING (check_admin_role_safe());

CREATE POLICY "Admins can delete reservations" ON reservations
    FOR DELETE USING (check_admin_role_safe());

-- Promotions policies
DROP POLICY IF EXISTS "Admins can view all promotions" ON promotions;
DROP POLICY IF EXISTS "Admins can manage promotions" ON promotions;

CREATE POLICY "Admins can view all promotions" ON promotions
    FOR SELECT USING (check_admin_role_safe());

CREATE POLICY "Admins can manage promotions" ON promotions
    FOR ALL USING (check_admin_role_safe());

-- Reviews policies
DROP POLICY IF EXISTS "Admins can manage all reviews" ON reviews;

CREATE POLICY "Admins can manage all reviews" ON reviews
    FOR ALL USING (check_admin_role_safe());

-- Update the existing functions to use safe checks
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN check_admin_role_safe();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_interpreter()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN check_user_role_safe() = 'interpreter';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

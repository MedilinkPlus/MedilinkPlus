-- 012_create_storage_buckets.sql
-- Create storage buckets and policies for avatars and hospital images

begin;

-- 1) Create avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 2) Create hospital-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hospital-images',
  'hospital-images',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 3) Avatar policies
-- Users can upload own avatar
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can view own avatar
DROP POLICY IF EXISTS "Users can view own avatar" ON storage.objects;
CREATE POLICY "Users can view own avatar"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update own avatar
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete own avatar
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 4) Hospital images policies
-- Admins can upload hospital images
DROP POLICY IF EXISTS "Admins can upload hospital images" ON storage.objects;
CREATE POLICY "Admins can upload hospital images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'hospital-images' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Anyone can view hospital images
DROP POLICY IF EXISTS "Anyone can view hospital images" ON storage.objects;
CREATE POLICY "Anyone can view hospital images"
ON storage.objects FOR SELECT
USING (bucket_id = 'hospital-images');

-- Admins can update hospital images
DROP POLICY IF EXISTS "Admins can update hospital images" ON storage.objects;
CREATE POLICY "Admins can update hospital images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'hospital-images' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins can delete hospital images
DROP POLICY IF EXISTS "Admins can delete hospital images" ON storage.objects;
CREATE POLICY "Admins can delete hospital images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'hospital-images' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

commit;


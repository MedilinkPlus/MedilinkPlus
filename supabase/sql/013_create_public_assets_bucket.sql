-- 013_create_public_assets_bucket.sql
-- Create public-assets bucket for general file uploads

begin;

-- Create public-assets bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'public-assets',
  'public-assets',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

-- Public assets policies
-- Authenticated users can upload to public-assets
DROP POLICY IF EXISTS "Authenticated users can upload to public-assets" ON storage.objects;
CREATE POLICY "Authenticated users can upload to public-assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'public-assets' AND
  auth.role() = 'authenticated'
);

-- Anyone can view public-assets
DROP POLICY IF EXISTS "Anyone can view public-assets" ON storage.objects;
CREATE POLICY "Anyone can view public-assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'public-assets');

-- Authenticated users can update public-assets
DROP POLICY IF EXISTS "Authenticated users can update public-assets" ON storage.objects;
CREATE POLICY "Authenticated users can update public-assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'public-assets' AND
  auth.role() = 'authenticated'
);

-- Authenticated users can delete public-assets
DROP POLICY IF EXISTS "Authenticated users can delete public-assets" ON storage.objects;
CREATE POLICY "Authenticated users can delete public-assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'public-assets' AND
  auth.role() = 'authenticated'
);

commit;

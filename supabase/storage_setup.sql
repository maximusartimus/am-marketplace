-- =====================================================
-- QUICK STORAGE SETUP FOR LISTING-IMAGES
-- =====================================================
-- Run this in the Supabase SQL Editor
-- This creates the listing-images bucket and sets up public access
-- =====================================================

-- Create the bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listing-images',
  'listing-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[];

-- Drop existing policies (to avoid conflicts)
DROP POLICY IF EXISTS "Public read access for listing images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete listing images" ON storage.objects;

-- Create new policies
-- 1. Anyone can view listing images
CREATE POLICY "Public read access for listing images"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-images');

-- 2. Authenticated users can upload images
CREATE POLICY "Authenticated users can upload listing images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'listing-images');

-- 3. Authenticated users can delete their images
CREATE POLICY "Users can delete listing images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'listing-images');

-- Verify the bucket was created
SELECT * FROM storage.buckets WHERE id = 'listing-images';






-- =====================================================
-- FIX RLS POLICIES FOR LISTING_IMAGES
-- =====================================================
-- Run this in Supabase SQL Editor to fix image delete/update issues
-- The original migration used invalid syntax that may have silently failed
-- =====================================================

-- First, make sure RLS is enabled
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Public can view listing images" ON listing_images;
DROP POLICY IF EXISTS "Store owners can insert listing images" ON listing_images;
DROP POLICY IF EXISTS "Store owners can update listing images" ON listing_images;
DROP POLICY IF EXISTS "Store owners can delete listing images" ON listing_images;

-- Recreate policies properly

-- 1. Allow anyone to read listing images (for public viewing)
CREATE POLICY "Public can view listing images"
ON listing_images FOR SELECT
USING (true);

-- 2. Allow authenticated users to insert images for their own listings
CREATE POLICY "Store owners can insert listing images"
ON listing_images FOR INSERT
TO authenticated
WITH CHECK (
  listing_id IN (
    SELECT l.id FROM listings l
    JOIN stores s ON l.store_id = s.id
    WHERE s.user_id = auth.uid()
  )
);

-- 3. Allow store owners to update their listing images
CREATE POLICY "Store owners can update listing images"
ON listing_images FOR UPDATE
TO authenticated
USING (
  listing_id IN (
    SELECT l.id FROM listings l
    JOIN stores s ON l.store_id = s.id
    WHERE s.user_id = auth.uid()
  )
)
WITH CHECK (
  listing_id IN (
    SELECT l.id FROM listings l
    JOIN stores s ON l.store_id = s.id
    WHERE s.user_id = auth.uid()
  )
);

-- 4. Allow store owners to delete their listing images
CREATE POLICY "Store owners can delete listing images"
ON listing_images FOR DELETE
TO authenticated
USING (
  listing_id IN (
    SELECT l.id FROM listings l
    JOIN stores s ON l.store_id = s.id
    WHERE s.user_id = auth.uid()
  )
);

-- Verify policies were created
SELECT 
  policyname, 
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'listing_images';




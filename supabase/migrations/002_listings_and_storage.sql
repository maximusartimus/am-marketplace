-- =====================================================
-- LISTINGS TABLES AND STORAGE SETUP
-- =====================================================
-- This migration creates the listings tables and storage bucket
-- for the listing creation feature.
-- Run this in Supabase SQL Editor after the initial tables are set up.
-- =====================================================

-- =====================================================
-- 1. CREATE LISTINGS TABLE (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  section_id UUID REFERENCES store_sections(id) ON DELETE SET NULL,
  category_id UUID NOT NULL REFERENCES categories(id),
  title_hy VARCHAR(255),
  title_ru VARCHAR(255),
  title_en VARCHAR(255) NOT NULL,
  description_hy TEXT,
  description_ru TEXT,
  description_en TEXT,
  price DECIMAL(12, 2),
  currency VARCHAR(3) DEFAULT 'AMD',
  condition VARCHAR(20) CHECK (condition IN ('new', 'like_new', 'used', 'parts')),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'sold', 'removed')),
  location_city VARCHAR(100),
  location_region VARCHAR(100),
  location_address TEXT,
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  pickup_instructions TEXT,
  use_store_location BOOLEAN DEFAULT TRUE,
  delivery_methods TEXT[] DEFAULT ARRAY['pickup'],
  shipping_carriers TEXT[],
  shipping_cost DECIMAL(10, 2),
  shipping_cost_type VARCHAR(20) DEFAULT 'contact' CHECK (shipping_cost_type IN ('free', 'flat', 'contact')),
  shipping_time_days INTEGER,
  position INTEGER,
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster store queries
CREATE INDEX IF NOT EXISTS idx_listings_store_id ON listings(store_id);
CREATE INDEX IF NOT EXISTS idx_listings_category_id ON listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);

-- =====================================================
-- 2. CREATE LISTING IMAGES TABLE (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  medium_url TEXT,
  position INTEGER NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE
);

-- Create index for faster listing queries
CREATE INDEX IF NOT EXISTS idx_listing_images_listing_id ON listing_images(listing_id);

-- =====================================================
-- 3. CREATE CATEGORIES TABLE (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name_hy VARCHAR(255),
  name_ru VARCHAR(255),
  name_en VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  icon TEXT,
  position INTEGER NOT NULL DEFAULT 0
);

-- =====================================================
-- 4. INSERT DEFAULT CATEGORIES (if empty)
-- =====================================================
INSERT INTO categories (name_en, slug, position) 
SELECT 'Electronics', 'electronics', 1
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'electronics');

INSERT INTO categories (name_en, slug, position) 
SELECT 'Fashion', 'fashion', 2
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'fashion');

INSERT INTO categories (name_en, slug, position) 
SELECT 'Home & Garden', 'home-garden', 3
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'home-garden');

INSERT INTO categories (name_en, slug, position) 
SELECT 'Vehicles', 'vehicles', 4
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'vehicles');

INSERT INTO categories (name_en, slug, position) 
SELECT 'Sports & Outdoors', 'sports-outdoors', 5
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'sports-outdoors');

INSERT INTO categories (name_en, slug, position) 
SELECT 'Art & Collectibles', 'art-collectibles', 6
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'art-collectibles');

INSERT INTO categories (name_en, slug, position) 
SELECT 'Books & Media', 'books-media', 7
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'books-media');

INSERT INTO categories (name_en, slug, position) 
SELECT 'Handmade & Crafts', 'handmade-crafts', 8
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'handmade-crafts');

INSERT INTO categories (name_en, slug, position) 
SELECT 'Services', 'services', 9
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'services');

INSERT INTO categories (name_en, slug, position) 
SELECT 'Other', 'other', 10
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'other');

-- =====================================================
-- 5. CREATE STORAGE BUCKET FOR LISTING IMAGES
-- =====================================================
-- Note: Run this in the Supabase Dashboard > Storage > New Bucket
-- Or run via SQL:
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listing-images',
  'listing-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 6. CREATE STORAGE POLICIES FOR LISTING IMAGES
-- =====================================================
-- Allow anyone to view listing images (public bucket)
CREATE POLICY IF NOT EXISTS "Public read access for listing images"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-images');

-- Allow authenticated users to upload images to the listings folder
CREATE POLICY IF NOT EXISTS "Authenticated users can upload listing images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'listing-images' 
  AND (storage.foldername(name))[1] = 'listings'
);

-- Allow users to update their own listing images
CREATE POLICY IF NOT EXISTS "Users can update own listing images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'listing-images'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Allow users to delete their own listing images
CREATE POLICY IF NOT EXISTS "Users can delete own listing images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'listing-images'
);

-- =====================================================
-- 7. ROW LEVEL SECURITY FOR LISTINGS
-- =====================================================
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read active listings
CREATE POLICY IF NOT EXISTS "Public can view active listings"
ON listings FOR SELECT
USING (status = 'active');

-- Allow store owners to view all their listings
CREATE POLICY IF NOT EXISTS "Store owners can view all their listings"
ON listings FOR SELECT
TO authenticated
USING (
  store_id IN (
    SELECT id FROM stores WHERE user_id = auth.uid()
  )
);

-- Allow store owners to insert listings
CREATE POLICY IF NOT EXISTS "Store owners can insert listings"
ON listings FOR INSERT
TO authenticated
WITH CHECK (
  store_id IN (
    SELECT id FROM stores WHERE user_id = auth.uid() AND approval_status = 'approved'
  )
);

-- Allow store owners to update their listings
CREATE POLICY IF NOT EXISTS "Store owners can update their listings"
ON listings FOR UPDATE
TO authenticated
USING (
  store_id IN (
    SELECT id FROM stores WHERE user_id = auth.uid()
  )
);

-- Allow store owners to delete their listings
CREATE POLICY IF NOT EXISTS "Store owners can delete their listings"
ON listings FOR DELETE
TO authenticated
USING (
  store_id IN (
    SELECT id FROM stores WHERE user_id = auth.uid()
  )
);

-- =====================================================
-- 8. ROW LEVEL SECURITY FOR LISTING IMAGES
-- =====================================================
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read listing images
CREATE POLICY IF NOT EXISTS "Public can view listing images"
ON listing_images FOR SELECT
USING (true);

-- Allow authenticated users to insert listing images for their listings
CREATE POLICY IF NOT EXISTS "Store owners can insert listing images"
ON listing_images FOR INSERT
TO authenticated
WITH CHECK (
  listing_id IN (
    SELECT l.id FROM listings l
    JOIN stores s ON l.store_id = s.id
    WHERE s.user_id = auth.uid()
  )
);

-- Allow store owners to update their listing images
CREATE POLICY IF NOT EXISTS "Store owners can update listing images"
ON listing_images FOR UPDATE
TO authenticated
USING (
  listing_id IN (
    SELECT l.id FROM listings l
    JOIN stores s ON l.store_id = s.id
    WHERE s.user_id = auth.uid()
  )
);

-- Allow store owners to delete their listing images
CREATE POLICY IF NOT EXISTS "Store owners can delete listing images"
ON listing_images FOR DELETE
TO authenticated
USING (
  listing_id IN (
    SELECT l.id FROM listings l
    JOIN stores s ON l.store_id = s.id
    WHERE s.user_id = auth.uid()
  )
);

-- =====================================================
-- 9. TRIGGER TO UPDATE updated_at TIMESTAMP
-- =====================================================
CREATE OR REPLACE FUNCTION update_listing_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_listings_updated_at ON listings;
CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION update_listing_timestamp();



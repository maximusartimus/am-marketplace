'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { supabase } from '@/lib/supabase';
import { MultiImageUpload } from '@/components/ui/MultiImageUpload';
import { Header } from '@/components/layout/Header';
import { SaleModal } from '@/components/listings/SaleModal';
import { Promotion, isPromotionActive, formatSaleTimeRemaining, formatSaleEndDate } from '@/lib/promotions';

interface Category {
  id: string;
  name_en: string;
  slug: string;
  parent_id: string | null;
}

interface ExistingImage {
  id: string;
  url: string;
  position: number;
  is_primary: boolean;
}


interface Store {
  id: string;
  name: string;
  slug: string;
  user_id: string;
}

interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

interface ListingFormData {
  title: string;
  description: string;
  categoryId: string;
  price: string;
  currency: 'AMD' | 'USD';
  condition: 'new' | 'like_new' | 'used' | 'parts' | '';
  deliveryMethods: string[];
  images: ImageFile[];
}

const conditions = [
  { value: 'new', label: 'New', description: 'Brand new, never used' },
  { value: 'like_new', label: 'Like New', description: 'Excellent condition, barely used' },
  { value: 'used', label: 'Used', description: 'Good condition, shows normal wear' },
  { value: 'parts', label: 'For Parts', description: 'Not fully functional, for parts only' },
];

const deliveryOptions = [
  { value: 'pickup', label: 'Pickup', description: 'Buyer picks up in person' },
  { value: 'local', label: 'Local Delivery', description: 'Delivery within the city' },
  { value: 'nationwide', label: 'Nationwide Shipping', description: 'Ship anywhere in Armenia' },
  { value: 'international', label: 'International Shipping', description: 'Ship worldwide' },
];

const currencyOptions = [
  { value: 'AMD', label: 'AMD', symbol: '֏', name: 'Armenian Dram' },
  { value: 'USD', label: 'USD', symbol: '$', name: 'US Dollar' },
];

function EditListingForm() {
  const params = useParams();
  const listingId = params.id as string;
  
  const [formData, setFormData] = useState<ListingFormData>({
    title: '',
    description: '',
    categoryId: '',
    price: '',
    currency: 'AMD',
    condition: '',
    deliveryMethods: ['pickup'],
    images: [],
  });
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [isDeletingImage, setIsDeletingImage] = useState<string | null>(null);
  const [isSettingPrimary, setIsSettingPrimary] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [listingCurrency, setListingCurrency] = useState<string>('AMD');
  const router = useRouter();
  const { user } = useAuth();
  
  const activePromotion = promotion && isPromotionActive(promotion) ? promotion : null;
  const currencySymbol = listingCurrency === 'AMD' ? '֏' : '$';

  // Fetch listing, store and categories
  useEffect(() => {
    async function fetchData() {
      if (!user || !listingId) return;

      try {
        // Debug: Check authentication status
        const { data: { session } } = await supabase.auth.getSession();
        console.log('=== AUTH DEBUG ===');
        console.log('User from context:', user?.email);
        console.log('Session from Supabase:', session?.user?.email || 'NO SESSION');
        console.log('Session access token exists:', !!session?.access_token);
        
        // Fetch categories first
        const { data: categoryData } = await supabase
          .from('categories')
          .select('*')
          .order('position');
        setCategories(categoryData || []);

        // Fetch listing with store
        const { data: listingData, error: listingError } = await supabase
          .from('listings')
          .select(`
            *,
            store:stores(*),
            listing_images(*)
          `)
          .eq('id', listingId)
          .single();

        if (listingError) {
          if (listingError.code === 'PGRST116') {
            setNotFound(true);
          }
          return;
        }

        // Check ownership
        if (listingData.store.user_id !== user.id) {
          setUnauthorized(true);
          return;
        }

        setStore(listingData.store);
        setListingCurrency(listingData.currency || 'AMD');

        // Fetch active promotion for this listing
        const now = new Date().toISOString();
        const { data: promotionData } = await supabase
          .from('listing_promotions')
          .select('*')
          .eq('listing_id', listingId)
          .eq('is_active', true)
          .lte('start_date', now)
          .gte('end_date', now)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (promotionData) {
          setPromotion(promotionData);
        }

        // Populate form data
        setFormData({
          title: listingData.title_en || '',
          description: listingData.description_en || '',
          categoryId: listingData.category_id || '',
          price: listingData.price?.toString() || '',
          currency: listingData.currency || 'AMD',
          condition: listingData.condition || '',
          deliveryMethods: listingData.delivery_methods || ['pickup'],
          images: [],
        });

        // Sort existing images - primary first, then by position
        const sortedImages = (listingData.listing_images || []).sort(
          (a: ExistingImage, b: ExistingImage) => {
            // Primary image always comes first
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            // Then sort by position
            return a.position - b.position;
          }
        );
        setExistingImages(sortedImages);
        console.log('=== IMAGES DEBUG ===');
        console.log('Loaded images:', sortedImages);
        console.log('Listing ID:', listingId);
        console.log('Store ID:', listingData.store_id);
        console.log('Store owner:', listingData.store.user_id);
        console.log('Current user:', user.id);
        console.log('User owns store:', listingData.store.user_id === user.id);
        
        // Test if we can query the listing_images with RLS
        if (sortedImages.length > 0) {
          const testImageId = sortedImages[0].id;
          console.log('=== RLS TEST ===');
          console.log('Testing RLS on image:', testImageId);
          
          // Try to read (should work)
          const { data: readTest, error: readError } = await supabase
            .from('listing_images')
            .select('*')
            .eq('id', testImageId)
            .single();
          console.log('Read test:', { success: !!readTest, error: readError?.message });
          
          // Try a dry-run update (no actual change)
          const { data: updateTest, error: updateError } = await supabase
            .from('listing_images')
            .update({ position: sortedImages[0].position })
            .eq('id', testImageId)
            .select();
          console.log('Update test (no-op):', { 
            success: !!updateTest && updateTest.length > 0, 
            rowsAffected: updateTest?.length || 0,
            error: updateError?.message 
          });
          
          if (!updateTest || updateTest.length === 0) {
            console.error('⚠️ RLS ISSUE: Update returned no rows. You may need to run the migration:');
            console.error('supabase/migrations/003_fix_listing_images_rls.sql');
          }
        }

      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load listing');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, listingId]);

  // Function to refetch promotion data
  const refetchPromotion = async () => {
    if (!listingId) return;
    
    const now = new Date().toISOString();
    const { data: promotionData } = await supabase
      .from('listing_promotions')
      .select('*')
      .eq('listing_id', listingId)
      .eq('is_active', true)
      .lte('start_date', now)
      .gte('end_date', now)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    setPromotion(promotionData || null);
  };

  const updateField = <K extends keyof ListingFormData>(
    field: K,
    value: ListingFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const toggleDeliveryMethod = (method: string) => {
    setFormData(prev => {
      const methods = prev.deliveryMethods.includes(method)
        ? prev.deliveryMethods.filter(m => m !== method)
        : [...prev.deliveryMethods, method];
      return { ...prev, deliveryMethods: methods };
    });
  };

  const handleRemoveExistingImage = async (imageId: string) => {
    console.log('=== DELETE IMAGE START ===');
    console.log('Image ID to delete:', imageId);
    console.log('Listing ID:', listingId);
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Current session:', session ? 'Authenticated as ' + session.user.email : 'NOT AUTHENTICATED');
    
    if (!session) {
      console.error('User is not authenticated!');
      setError('You must be logged in to delete images.');
      return;
    }
    
    const imageToRemove = existingImages.find(img => img.id === imageId);
    if (!imageToRemove) {
      console.error('Image not found in existingImages array');
      return;
    }
    console.log('Image to remove:', imageToRemove);

    // Set loading state for this specific image
    setIsDeletingImage(imageId);
    setError(null);

    try {
      // First verify the image exists in database
      console.log('Verifying image exists in database...');
      const { data: existingData, error: existingError } = await supabase
        .from('listing_images')
        .select('*')
        .eq('id', imageId)
        .single();
      
      console.log('Existing image check:', { data: existingData, error: existingError });
      
      if (!existingData) {
        console.error('Image not found in database - may have already been deleted');
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
        return;
      }

      // Delete from database FIRST (this is the critical operation)
      console.log('Attempting to delete from listing_images table...');
      const { data: dbData, error: dbError, count } = await supabase
        .from('listing_images')
        .delete()
        .eq('id', imageId)
        .select();

      console.log('Database delete response:', { data: dbData, error: dbError, count });

      if (dbError) {
        console.error('Database deletion error:', dbError);
        setError(`Failed to delete image: ${dbError.message}`);
        return;
      }

      if (!dbData || dbData.length === 0) {
        console.error('Delete returned no data - RLS policy may be blocking delete');
        setError('Permission denied. You may not have access to delete this image.');
        return;
      }

      console.log('Successfully deleted from database, rows affected:', dbData.length);

      // Now delete from Supabase Storage
      const storagePath = extractStoragePath(imageToRemove.url);
      console.log('Image URL:', imageToRemove.url);
      console.log('Extracted storage path:', storagePath);

      if (storagePath) {
        console.log('Attempting to delete from storage bucket "listing-images"...');
        const { data: storageData, error: storageError } = await supabase.storage
          .from('listing-images')
          .remove([storagePath]);

        console.log('Storage delete response:', { data: storageData, error: storageError });
        
        if (storageError) {
          console.error('Storage deletion error (non-critical):', storageError);
          // Don't fail - DB delete was successful
        } else {
          console.log('Successfully deleted from storage');
        }
      } else {
        console.warn('Could not extract storage path from URL - skipping storage delete');
      }

      // Update UI - remove the image from state
      setExistingImages(prev => {
        const newImages = prev.filter(img => img.id !== imageId);
        console.log('Updated existingImages state:', newImages.length, 'images remaining');
        return newImages;
      });

      console.log('=== DELETE IMAGE SUCCESS ===');

    } catch (err) {
      console.error('=== DELETE IMAGE ERROR ===', err);
      setError('Failed to delete image. Please try again.');
    } finally {
      setIsDeletingImage(null);
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    console.log('=== SET PRIMARY IMAGE START ===');
    console.log('Image ID to set as primary:', imageId);
    console.log('Listing ID:', listingId);
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Current session:', session ? 'Authenticated as ' + session.user.email : 'NOT AUTHENTICATED');
    
    if (!session) {
      console.error('User is not authenticated!');
      setError('You must be logged in to update images.');
      return;
    }
    
    const imageToSetPrimary = existingImages.find(img => img.id === imageId);
    if (!imageToSetPrimary) {
      console.error('Image not found');
      return;
    }

    // Don't do anything if it's already primary
    if (imageToSetPrimary.is_primary) {
      console.log('Image is already primary');
      return;
    }

    setIsSettingPrimary(imageId);
    setError(null);

    try {
      // First, unset all images as primary for this listing
      console.log('Unsetting all images as primary for listing:', listingId);
      const { data: unsetData, error: unsetError } = await supabase
        .from('listing_images')
        .update({ is_primary: false })
        .eq('listing_id', listingId)
        .select();

      console.log('Unset primary response:', { data: unsetData, error: unsetError });

      if (unsetError) {
        console.error('Error unsetting primary:', unsetError);
        setError('Failed to update primary image. Please try again.');
        return;
      }

      // Then set the selected image as primary
      console.log('Setting image as primary:', imageId);
      const { data: setPrimaryData, error: setPrimaryError } = await supabase
        .from('listing_images')
        .update({ is_primary: true })
        .eq('id', imageId)
        .select();

      console.log('Set primary response:', { data: setPrimaryData, error: setPrimaryError });

      if (setPrimaryError) {
        console.error('Error setting primary:', setPrimaryError);
        setError('Failed to update primary image. Please try again.');
        return;
      }

      if (!setPrimaryData || setPrimaryData.length === 0) {
        console.error('Update returned no data - RLS policy may be blocking update');
        setError('Permission denied. You may not have access to update this image.');
        return;
      }

      console.log('Successfully set primary image in database');

      // Verify the change was saved
      const { data: verifyData } = await supabase
        .from('listing_images')
        .select('id, is_primary')
        .eq('listing_id', listingId);
      console.log('Verification - current images state in DB:', verifyData);

      // Update local state - move the primary image to front
      setExistingImages(prev => {
        const updated = prev.map(img => ({
          ...img,
          is_primary: img.id === imageId
        }));
        // Sort to put primary first
        return updated.sort((a, b) => {
          if (a.is_primary && !b.is_primary) return -1;
          if (!a.is_primary && b.is_primary) return 1;
          return a.position - b.position;
        });
      });

      console.log('=== SET PRIMARY IMAGE SUCCESS ===');

    } catch (err) {
      console.error('=== SET PRIMARY IMAGE ERROR ===', err);
      setError('Failed to update primary image. Please try again.');
    } finally {
      setIsSettingPrimary(null);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.categoryId) {
      setError('Category is required');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Please enter a valid price');
      return false;
    }
    if (!formData.condition) {
      setError('Condition is required');
      return false;
    }
    if (existingImages.length === 0 && formData.images.length === 0) {
      setError('At least one image is required');
      return false;
    }
    if (formData.deliveryMethods.length === 0) {
      setError('Select at least one delivery method');
      return false;
    }
    return true;
  };

  const extractStoragePath = (url: string): string | null => {
    // Extract the storage path from a Supabase Storage URL
    // URL format: https://xxx.supabase.co/storage/v1/object/public/listing-images/listings/filename.ext
    const match = url.match(/listing-images\/(.+)$/);
    return match ? match[1] : null;
  };

  const uploadImage = async (file: File, position: number): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${listingId}-${position}-${Date.now()}.${fileExt}`;
    const filePath = `listings/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('listing-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('listing-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !store) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Update listing details
      const { error: updateError } = await supabase
        .from('listings')
        .update({
          category_id: formData.categoryId,
          title_en: formData.title.trim(),
          description_en: formData.description.trim() || null,
          price: parseFloat(formData.price),
          currency: formData.currency,
          condition: formData.condition,
          delivery_methods: formData.deliveryMethods,
        })
        .eq('id', listingId);

      if (updateError) {
        setError('Failed to update listing. Please try again.');
        return;
      }

      // Step 2: Update positions for remaining existing images
      if (existingImages.length > 0) {
        const positionUpdates = existingImages.map((img, i) => ({
          id: img.id,
          position: i,
          is_primary: i === 0 && formData.images.length === 0,
        }));

        // Update positions in parallel for better performance
        await Promise.all(
          positionUpdates.map(update =>
            supabase
              .from('listing_images')
              .update({ position: update.position, is_primary: update.is_primary })
              .eq('id', update.id)
          )
        );
      }

      // Step 3: Upload new images
      if (formData.images.length > 0) {
        const startPosition = existingImages.length;
        const imagePromises = formData.images.map(async (image, index) => {
          const position = startPosition + index;
          const url = await uploadImage(image.file, position);
          return {
            listing_id: listingId,
            url,
            position,
            is_primary: position === 0 && existingImages.length === 0,
          };
        });

        const uploadedImages = await Promise.all(imagePromises);

        const { error: insertError } = await supabase
          .from('listing_images')
          .insert(uploadedImages);

        if (insertError) {
          console.error('Error inserting new images:', insertError);
          setError('Failed to save some images. Please try again.');
          return;
        }
      }

      // Redirect to the listing page
      router.push(`/listing/${listingId}?updated=true`);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#222222] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-sm text-[#757575]">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  // Not found state
  if (notFound) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
          <div className="bg-white border border-[#E5E5E5] p-8 max-w-md mx-4 text-center">
            <h2 className="text-xl font-semibold text-[#222222] mb-2">Listing Not Found</h2>
            <p className="text-[#757575] mb-6">
              The listing you&apos;re trying to edit doesn&apos;t exist.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-[#222222] text-white font-medium hover:bg-[#333333] transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Unauthorized state
  if (unauthorized) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
          <div className="bg-white border border-[#E5E5E5] p-8 max-w-md mx-4 text-center">
            <h2 className="text-xl font-semibold text-[#222222] mb-2">Unauthorized</h2>
            <p className="text-[#757575] mb-6">
              You don&apos;t have permission to edit this listing.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-[#222222] text-white font-medium hover:bg-[#333333] transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Build category options
  const parentCategories = categories.filter(c => !c.parent_id);
  const getCategoryOptions = () => {
    const options: { value: string; label: string; isParent: boolean }[] = [];
    parentCategories.forEach(parent => {
      options.push({ value: parent.id, label: parent.name_en, isParent: true });
      const children = categories.filter(c => c.parent_id === parent.id);
      children.forEach(child => {
        options.push({ value: child.id, label: `  ${child.name_en}`, isParent: false });
      });
    });
    return options;
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#F5F5F5]">
        {/* Page Header */}
        <div className="bg-white border-b border-[#E5E5E5]">
          <div className="max-w-3xl mx-auto px-4 py-6">
            <Link href={`/listing/${listingId}`} className="text-[#757575] hover:text-[#222222] text-sm mb-4 inline-flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Listing
            </Link>
            <h1 className="text-2xl md:text-3xl font-semibold text-[#222222]">Edit Listing</h1>
            <p className="text-[#757575] mt-2">Update your listing details</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8">
          <form onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-[#FFEBEE] border border-[#D32F2F] text-[#D32F2F] text-sm">
                {error}
              </div>
            )}

            {/* Images Section */}
            <div className="bg-white border border-[#E5E5E5] p-6 mb-6">
              <h2 className="text-lg font-semibold text-[#222222] mb-4">Photos</h2>
              <MultiImageUpload
                label="Listing Images"
                description="Add up to 10 photos. Click the star icon to set the primary photo."
                maxImages={10}
                value={formData.images}
                onChange={(images) => updateField('images', images)}
                existingImages={existingImages}
                onRemoveExisting={handleRemoveExistingImage}
                onSetPrimary={handleSetPrimary}
                deletingImageId={isDeletingImage}
                settingPrimaryId={isSettingPrimary}
              />
            </div>

            {/* Basic Info Section */}
            <div className="bg-white border border-[#E5E5E5] p-6 mb-6">
              <h2 className="text-lg font-semibold text-[#222222] mb-4">Basic Information</h2>
              
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-[#222222] mb-2">
                    Title <span className="text-[#D32F2F]">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="e.g., Vintage Armenian Carpet, Hand-woven"
                    className="w-full px-4 py-3 border border-[#E5E5E5] focus:border-[#222222] focus:outline-none text-[#222222] placeholder-[#757575]"
                    maxLength={200}
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-[#222222] mb-2">
                    Description <span className="text-[#757575] font-normal">(Optional)</span>
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Describe your item in detail..."
                    rows={5}
                    className="w-full px-4 py-3 border border-[#E5E5E5] focus:border-[#222222] focus:outline-none text-[#222222] placeholder-[#757575] resize-none"
                    maxLength={2000}
                  />
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-[#222222] mb-2">
                    Category <span className="text-[#D32F2F]">*</span>
                  </label>
                  <select
                    id="category"
                    value={formData.categoryId}
                    onChange={(e) => updateField('categoryId', e.target.value)}
                    className="w-full px-4 py-3 border border-[#E5E5E5] focus:border-[#222222] focus:outline-none text-[#222222] bg-white"
                  >
                    <option value="">Select a category</option>
                    {getCategoryOptions().map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="bg-white border border-[#E5E5E5] p-6 mb-6">
              <h2 className="text-lg font-semibold text-[#222222] mb-4">Pricing</h2>
              
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-[#222222] mb-2">
                  Price <span className="text-[#D32F2F]">*</span>
                </label>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      id="price"
                      value={formData.price}
                      onChange={(e) => updateField('price', e.target.value)}
                      placeholder="0"
                      min="0"
                      step="1"
                      className="w-full px-4 py-3 border border-[#E5E5E5] focus:border-[#222222] focus:outline-none text-[#222222] placeholder-[#757575]"
                    />
                  </div>
                  <select
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => updateField('currency', e.target.value as 'AMD' | 'USD')}
                    className="px-4 py-3 border border-[#E5E5E5] focus:border-[#222222] focus:outline-none text-[#222222] bg-white font-medium min-w-[120px]"
                  >
                    {currencyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.symbol} {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                {formData.price && parseFloat(formData.price) > 0 && (
                  <p className="text-sm text-[#2E7D32] mt-2">
                    {formData.currency === 'AMD' ? '֏' : '$'}{parseFloat(formData.price).toLocaleString()} {formData.currency}
                  </p>
                )}
              </div>
            </div>

            {/* Sale Management Section */}
            <div className="bg-white border border-[#E5E5E5] p-6 mb-6">
              <h2 className="text-lg font-semibold text-[#222222] mb-4">Sale / Promotion</h2>
              
              {activePromotion ? (
                <div className="p-4 bg-[#FFF3E0] border border-[#F56400] mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#F56400]">Active Sale</span>
                      <span className="px-2 py-0.5 bg-[#F56400] text-white text-xs font-bold">
                        -{activePromotion.discount_percent}%
                      </span>
                    </div>
                    <span className="text-sm text-[#757575]">
                      {formatSaleTimeRemaining(activePromotion.end_date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[#757575] line-through">
                      {currencySymbol}{activePromotion.original_price.toLocaleString()}
                    </span>
                    <span className="text-xl font-bold text-[#F56400]">
                      {currencySymbol}{activePromotion.sale_price.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-[#595959]">
                    Ends {formatSaleEndDate(activePromotion.end_date)}
                  </p>
                </div>
              ) : (
                <p className="text-[#757575] text-sm mb-4">
                  No active sale on this listing.
                </p>
              )}
              
              <button
                type="button"
                onClick={() => setShowSaleModal(true)}
                className={`w-full py-3 font-medium transition-colors flex items-center justify-center gap-2 ${
                  activePromotion
                    ? 'border border-[#F56400] text-[#F56400] hover:bg-[#FFF3E0]'
                    : 'bg-[#F56400] text-white hover:bg-[#D95700]'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {activePromotion ? 'Manage Sale' : 'Add Sale'}
              </button>
            </div>

            {/* Condition Section */}
            <div className="bg-white border border-[#E5E5E5] p-6 mb-6">
              <h2 className="text-lg font-semibold text-[#222222] mb-4">Condition</h2>
              
              <div className="grid grid-cols-2 gap-3">
                {conditions.map((condition) => (
                  <label
                    key={condition.value}
                    className={`
                      relative flex items-start p-4 border cursor-pointer transition-all
                      ${formData.condition === condition.value 
                        ? 'border-[#222222] bg-[#F5F5F5]' 
                        : 'border-[#E5E5E5] hover:border-[#757575]'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="condition"
                      value={condition.value}
                      checked={formData.condition === condition.value}
                      onChange={() => updateField('condition', condition.value as ListingFormData['condition'])}
                      className="sr-only"
                    />
                    <div>
                      <span className="block text-sm font-medium text-[#222222]">
                        {condition.label}
                      </span>
                      <span className="block text-xs text-[#757575] mt-0.5">
                        {condition.description}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Delivery Section */}
            <div className="bg-white border border-[#E5E5E5] p-6 mb-6">
              <h2 className="text-lg font-semibold text-[#222222] mb-4">Delivery Methods</h2>
              
              <div className="space-y-3">
                {deliveryOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`
                      flex items-center p-4 border cursor-pointer transition-all
                      ${formData.deliveryMethods.includes(option.value) 
                        ? 'border-[#222222] bg-[#F5F5F5]' 
                        : 'border-[#E5E5E5] hover:border-[#757575]'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={formData.deliveryMethods.includes(option.value)}
                      onChange={() => toggleDeliveryMethod(option.value)}
                      className="w-5 h-5 text-[#222222] border-[#E5E5E5] rounded focus:ring-[#222222]"
                    />
                    <div className="ml-3 flex-1">
                      <span className="block text-sm font-medium text-[#222222]">
                        {option.label}
                      </span>
                      <span className="block text-xs text-[#757575]">
                        {option.description}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Link
                href={`/listing/${listingId}`}
                className="px-6 py-3 border border-[#E5E5E5] text-[#222222] hover:bg-[#F5F5F5] transition-colors font-medium"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-[#F56400] hover:bg-[#D95700] disabled:bg-[#E5E5E5] disabled:text-[#757575] text-white font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>

          {/* Sale Modal */}
          <SaleModal
            isOpen={showSaleModal}
            onClose={() => setShowSaleModal(false)}
            listingId={listingId}
            currentPrice={parseFloat(formData.price) || 0}
            currency={formData.currency}
            existingPromotion={promotion}
            onSaleUpdated={refetchPromotion}
          />
        </div>
      </div>
    </>
  );
}

export default function EditListingPage() {
  return (
    <ProtectedRoute>
      <EditListingForm />
    </ProtectedRoute>
  );
}

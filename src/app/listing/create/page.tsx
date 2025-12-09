'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { supabase } from '@/lib/supabase';
import { MultiImageUpload } from '@/components/ui/MultiImageUpload';
import { Header } from '@/components/layout/Header';

interface Category {
  id: string;
  name_en: string;
  slug: string;
  parent_id: string | null;
}

interface Store {
  id: string;
  name: string;
  slug: string;
  approval_status: 'pending' | 'approved' | 'needs_info' | 'rejected';
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

const initialFormData: ListingFormData = {
  title: '',
  description: '',
  categoryId: '',
  price: '',
  currency: 'AMD',
  condition: '',
  deliveryMethods: ['pickup'],
  images: [],
};

function CreateListingForm() {
  const [formData, setFormData] = useState<ListingFormData>(initialFormData);
  const [categories, setCategories] = useState<Category[]>([]);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  // Fetch store and categories
  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        // Fetch user's store
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('id, name, slug, approval_status')
          .eq('user_id', user.id)
          .single();

        if (storeError && storeError.code !== 'PGRST116') {
          console.error('Error fetching store:', storeError);
        }
        setStore(storeData);

        // Fetch categories
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('*')
          .order('position');

        if (categoryError) {
          console.error('Error fetching categories:', categoryError);
        }
        setCategories(categoryData || []);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

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

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (formData.title.trim().length < 3) {
      setError('Title must be at least 3 characters');
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
    if (formData.images.length === 0) {
      setError('At least one image is required');
      return false;
    }
    if (formData.deliveryMethods.length === 0) {
      setError('Select at least one delivery method');
      return false;
    }
    return true;
  };

  const uploadImage = async (file: File, listingId: string, position: number): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${listingId}-${position}-${Date.now()}.${fileExt}`;
    const filePath = `listings/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('listing-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

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
      // Create listing
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert({
          store_id: store.id,
          category_id: formData.categoryId,
          title_hy: formData.title.trim(),
          title_en: formData.title.trim(),
          description_en: formData.description.trim() || null,
          price: parseFloat(formData.price),
          currency: formData.currency,
          condition: formData.condition,
          delivery_methods: formData.deliveryMethods,
          status: 'active',
        })
        .select()
        .single();

      if (listingError) {
        console.error('Error creating listing:', listingError);
        console.error('Insert data was:', {
          store_id: store.id,
          category_id: formData.categoryId,
          title_hy: formData.title.trim(),
        });
        setError(`Failed to create listing: ${listingError.message || listingError.code}`);
        return;
      }

      // Upload images and create listing_images records
      const imagePromises = formData.images.map(async (image, index) => {
        const url = await uploadImage(image.file, listing.id, index);
        return {
          listing_id: listing.id,
          url,
          position: index,
          is_primary: index === 0,
        };
      });

      const uploadedImages = await Promise.all(imagePromises);

      const { error: imagesError } = await supabase
        .from('listing_images')
        .insert(uploadedImages);

      if (imagesError) {
        console.error('Error saving images:', imagesError);
        // Listing was created, but images failed - still redirect
      }

      // Redirect to the listing page
      router.push(`/listing/${listing.id}?created=true`);
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

  // No store state
  if (!store) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
          <div className="bg-white border border-[#E5E5E5] p-8 max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-[#FFF3E0] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#F56400]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[#222222] mb-2">Create a Store First</h2>
            <p className="text-[#757575] mb-6">
              You need to create a store before you can add listings. Setting up a store is quick and easy!
            </p>
            <Link
              href="/store/create"
              className="inline-block px-6 py-3 bg-[#222222] text-white font-medium hover:bg-[#333333] transition-colors"
            >
              Create Your Store
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Store not approved state
  if (store.approval_status !== 'approved') {
    const statusMessages = {
      pending: {
        title: 'Store Pending Approval',
        message: 'Your store is currently being reviewed. You can create listings once your store is approved. This usually takes 1-2 business days.',
        bgColor: 'bg-[#FFF3E0]',
        iconColor: 'text-[#F56400]',
      },
      needs_info: {
        title: 'Additional Information Needed',
        message: 'We need more information about your store before approval. Please check your email for details.',
        bgColor: 'bg-[#E3F2FD]',
        iconColor: 'text-[#1976D2]',
      },
      rejected: {
        title: 'Store Not Approved',
        message: 'Unfortunately, your store application was not approved. Please contact support for more information.',
        bgColor: 'bg-[#FFEBEE]',
        iconColor: 'text-[#D32F2F]',
      },
    };

    const status = statusMessages[store.approval_status as keyof typeof statusMessages];

    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
          <div className="bg-white border border-[#E5E5E5] p-8 max-w-md mx-4 text-center">
            <div className={`w-16 h-16 ${status.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <svg className={`w-8 h-8 ${status.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[#222222] mb-2">{status.title}</h2>
            <p className="text-[#757575] mb-6">{status.message}</p>
            <Link
              href={`/store/${store.slug}`}
              className="inline-block px-6 py-3 bg-[#222222] text-white font-medium hover:bg-[#333333] transition-colors"
            >
              View Your Store
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Build category options with parent-child hierarchy
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
            <Link href={`/store/${store.slug}`} className="text-[#757575] hover:text-[#222222] text-sm mb-4 inline-flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to {store.name}
            </Link>
            <h1 className="text-2xl md:text-3xl font-semibold text-[#222222]">Create New Listing</h1>
            <p className="text-[#757575] mt-2">Add a new product to your store</p>
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
                description="Add up to 10 photos. The first image will be your main photo."
                maxImages={10}
                value={formData.images}
                onChange={(images) => updateField('images', images)}
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
                  <p className="text-xs text-[#757575] mt-1">
                    Be descriptive and specific ({formData.title.length}/200)
                  </p>
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
                    placeholder="Describe your item in detail. Include materials, dimensions, history, condition details, etc."
                    rows={5}
                    className="w-full px-4 py-3 border border-[#E5E5E5] focus:border-[#222222] focus:outline-none text-[#222222] placeholder-[#757575] resize-none"
                    maxLength={2000}
                  />
                  <p className="text-xs text-[#757575] mt-1">
                    {formData.description.length}/2000
                  </p>
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
                      <option
                        key={option.value}
                        value={option.value}
                        className={option.isParent ? 'font-medium' : ''}
                      >
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
                    {formData.condition === condition.value && (
                      <svg className="absolute top-2 right-2 w-5 h-5 text-[#222222]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Delivery Section */}
            <div className="bg-white border border-[#E5E5E5] p-6 mb-6">
              <h2 className="text-lg font-semibold text-[#222222] mb-4">Delivery Methods</h2>
              <p className="text-sm text-[#757575] mb-4">Select how buyers can receive this item</p>
              
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
                      className="w-5 h-5 text-[#222222] border-[#E5E5E5] rounded focus:ring-[#222222] focus:ring-offset-0"
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
                href={`/store/${store.slug}`}
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
                    Creating Listing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Listing
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default function CreateListingPage() {
  return (
    <ProtectedRoute>
      <CreateListingForm />
    </ProtectedRoute>
  );
}

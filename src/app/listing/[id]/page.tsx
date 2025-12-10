'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/layout/Header';
import { FavoriteButton } from '@/components/listings/FavoriteButton';
import { FollowButton } from '@/components/stores/FollowButton';
import { StoreBadges } from '@/components/stores/StoreBadges';
import { ReportModal } from '@/components/ui/ReportModal';

interface ListingImage {
  id: string;
  url: string;
  position: number;
  is_primary: boolean;
}

interface Store {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  phone: string | null;
  telegram_handle: string | null;
  instagram_handle: string | null;
  whatsapp_number: string | null;
  user_id: string;
  is_verified: boolean;
  is_top_seller: boolean;
  is_featured: boolean;
  average_rating: number;
  total_sales: number;
  total_reviews: number;
}

interface Category {
  id: string;
  name_en: string;
  slug: string;
}

interface ReviewerInfo {
  id: string;
  name: string | null;
  profile_photo: string | null;
}

interface Review {
  id: string;
  store_id: string;
  listing_id: string | null;
  reviewer_id: string;
  rating: number;
  comment: string | null;
  seller_response: string | null;
  seller_response_at: string | null;
  created_at: string;
  reviewer: ReviewerInfo | null;
}

interface Listing {
  id: string;
  store_id: string;
  category_id: string;
  title_en: string;
  description_en: string | null;
  price: number;
  currency: string;
  condition: 'new' | 'like_new' | 'used' | 'parts';
  status: string;
  delivery_methods: string[];
  view_count: number;
  created_at: string;
  store: Store;
  category: Category;
  listing_images: ListingImage[];
}

const conditionLabels: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-[#E8F5E9] text-[#2E7D32]' },
  like_new: { label: 'Like New', color: 'bg-[#E3F2FD] text-[#1976D2]' },
  used: { label: 'Used', color: 'bg-[#FFF3E0] text-[#F56400]' },
  parts: { label: 'For Parts', color: 'bg-[#FFEBEE] text-[#D32F2F]' },
};

const deliveryLabels: Record<string, { label: string; icon: string }> = {
  pickup: { label: 'Pickup available', icon: '📍' },
  local: { label: 'Local delivery', icon: '🚗' },
  nationwide: { label: 'Nationwide shipping', icon: '📦' },
};

// Star Rating Display Component for listing page
function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };
  
  return (
    <span className={`${sizeClasses[size]} tracking-tight`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= Math.round(rating) ? 'text-[#F56400]' : 'text-[#D4D4D4]'}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function StarRatingDisplay({ rating, count, storeSlug }: { rating: number; count: number; storeSlug?: string }) {
  const content = (
    <span className="inline-flex items-center gap-1 text-sm">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= Math.round(rating) ? 'text-[#F56400]' : 'text-[#D4D4D4]'}
        >
          ★
        </span>
      ))}
      <span className="text-[#222222] font-medium ml-0.5">{rating.toFixed(1)}</span>
      <span className="text-[#757575]">({count} {count === 1 ? 'review' : 'reviews'})</span>
    </span>
  );

  if (storeSlug) {
    return (
      <Link 
        href={`/store/${storeSlug}#reviews`}
        className="hover:opacity-80 transition-opacity"
      >
        {content}
      </Link>
    );
  }

  return content;
}

export default function ListingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = params.id as string;
  const justCreated = searchParams.get('created') === 'true';
  const justUpdated = searchParams.get('updated') === 'true';
  
  const { user, loading: authLoading } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isContactingSeller, setIsContactingSeller] = useState(false);
  const [storeRating, setStoreRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [storeReviews, setStoreReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);

  const isOwner = user && listing && user.id === listing.store.user_id;

  useEffect(() => {
    async function fetchListing() {
      try {
        const { data, error: fetchError } = await supabase
          .from('listings')
          .select(`
            *,
            store:stores(*),
            category:categories(*),
            listing_images(*)
          `)
          .eq('id', listingId)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            setError('Listing not found');
          } else {
            setError('Failed to load listing');
          }
          return;
        }

        // Sort images by position
        if (data.listing_images) {
          data.listing_images.sort((a: ListingImage, b: ListingImage) => a.position - b.position);
        }

        setListing(data);

        // Fetch store reviews with reviewer info
        if (data.store?.id) {
          setReviewsLoading(true);
          try {
            const { data: reviewsData } = await supabase
              .from('reviews')
              .select('*, reviewer:users(id, name, profile_photo)')
              .eq('store_id', data.store.id)
              .order('created_at', { ascending: false });

            if (reviewsData && reviewsData.length > 0) {
              const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
              setStoreRating(totalRating / reviewsData.length);
              setReviewCount(reviewsData.length);
              // Store only 5 most recent reviews
              setStoreReviews(reviewsData.slice(0, 5));
            }
          } finally {
            setReviewsLoading(false);
          }
        } else {
          setReviewsLoading(false);
        }

        // Increment view count (don't await)
        supabase
          .from('listings')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', listingId)
          .then();

      } catch (err) {
        console.error('Error fetching listing:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (listingId) {
      fetchListing();
    }
  }, [listingId]);

  // Track recently viewed for logged-in users
  useEffect(() => {
    async function trackRecentlyViewed() {
      // Only track for logged-in users
      if (!user || !listing) return;
      
      // Don't track if user is viewing their own listing
      if (user.id === listing.store.user_id) return;

      try {
        await supabase
          .from('recently_viewed')
          .upsert(
            { user_id: user.id, listing_id: listingId, viewed_at: new Date().toISOString() },
            { onConflict: 'user_id,listing_id' }
          );
      } catch {
        // Fail silently - don't show errors to user
      }
    }

    trackRecentlyViewed();
  }, [user, listing, listingId]);

  const handleContactSeller = async () => {
    if (!user || !listing) {
      router.push('/auth/signin');
      return;
    }

    setIsContactingSeller(true);
    try {
      // Check if a conversation already exists for this listing + buyer
      const { data: existingConvo, error: checkError } = await supabase
        .from('conversations')
        .select('id')
        .eq('listing_id', listing.id)
        .eq('buyer_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking conversation:', checkError);
        alert('Failed to start conversation. Please try again.');
        return;
      }

      if (existingConvo) {
        // Conversation exists, navigate to it
        router.push(`/messages/${existingConvo.id}`);
        return;
      }

      // Create new conversation
      const { data: newConvo, error: createError } = await supabase
        .from('conversations')
        .insert({
          listing_id: listing.id,
          buyer_id: user.id,
          seller_id: listing.store.user_id,
          status: 'active',
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating conversation:', createError);
        alert('Failed to start conversation. Please try again.');
        return;
      }

      // Navigate to new conversation
      router.push(`/messages/${newConvo.id}`);
    } catch (err) {
      console.error('Error:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setIsContactingSeller(false);
    }
  };

  const handleDelete = async () => {
    if (!listing) return;
    
    setIsDeleting(true);
    try {
      // Delete listing images from storage
      if (listing.listing_images.length > 0) {
        const imagePaths = listing.listing_images.map(img => {
          const url = img.url;
          const pathMatch = url.match(/listing-images\/(.+)$/);
          return pathMatch ? pathMatch[1] : null;
        }).filter(Boolean) as string[];

        if (imagePaths.length > 0) {
          await supabase.storage
            .from('listing-images')
            .remove(imagePaths);
        }
      }

      // Delete listing (cascade will delete listing_images records)
      const { error: deleteError } = await supabase
        .from('listings')
        .delete()
        .eq('id', listing.id);

      if (deleteError) {
        console.error('Error deleting listing:', deleteError);
        alert('Failed to delete listing. Please try again.');
        return;
      }

      // Redirect to store page
      router.push(`/store/${listing.store.slug}`);
    } catch (err) {
      console.error('Error:', err);
      alert('An error occurred while deleting the listing.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading || authLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#222222] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-sm text-[#757575]">Loading listing...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !listing) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 bg-[#E5E5E5] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#757575]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-[#222222] mb-2">{error || 'Listing not found'}</h1>
            <p className="text-[#757575] mb-6">The listing you&apos;re looking for doesn&apos;t exist or has been removed.</p>
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

  const images = listing.listing_images;
  const currentImage = images[selectedImage] || images[0];
  const condition = conditionLabels[listing.condition];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#F5F5F5]">
        {/* Success Banner */}
        {(justCreated || justUpdated) && isOwner && (
          <div className="bg-[#E8F5E9] border-b border-[#2E7D32]">
            <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-[#2E7D32] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-[#2E7D32] font-medium">
                    {justCreated ? 'Your listing is now live!' : 'Listing updated successfully!'}
                  </p>
                  <p className="text-sm text-[#2E7D32]">
                    {justCreated 
                      ? 'Buyers can now see and contact you about this item.'
                      : 'Your changes have been saved.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-[#757575] mb-6">
            <Link href="/" className="hover:text-[#222222]">Home</Link>
            <span>/</span>
            <Link href={`/store/${listing.store.slug}`} className="hover:text-[#222222]">{listing.store.name}</Link>
            <span>/</span>
            <span className="text-[#222222] truncate max-w-[200px]">{listing.title_en}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div 
                className="relative aspect-square bg-white border border-[#E5E5E5] cursor-zoom-in overflow-hidden"
                onClick={() => setIsLightboxOpen(true)}
              >
                {currentImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentImage.url}
                    alt={listing.title_en}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#757575]">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <button 
                  className="absolute bottom-4 right-4 p-2 bg-white/90 hover:bg-white shadow-md transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLightboxOpen(true);
                  }}
                >
                  <svg className="w-5 h-5 text-[#222222]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </button>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 border-2 transition-colors overflow-hidden ${
                        selectedImage === index 
                          ? 'border-[#222222]' 
                          : 'border-[#E5E5E5] hover:border-[#757575]'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.url}
                        alt={`${listing.title_en} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Listing Details */}
            <div className="space-y-6">
              {/* Title & Price */}
              <div>
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-2xl md:text-3xl font-semibold text-[#222222]">
                    {listing.title_en}
                  </h1>
                  <div className="flex gap-2 flex-shrink-0">
                    {/* Favorite Button - always visible for non-owners */}
                    {!isOwner && (
                      <FavoriteButton listingId={listing.id} size="large" />
                    )}
                    {isOwner && (
                      <>
                        <Link
                          href={`/listing/${listing.id}/edit`}
                          className="p-2 border border-[#E5E5E5] hover:border-[#222222] transition-colors"
                          title="Edit listing"
                        >
                          <svg className="w-5 h-5 text-[#222222]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="p-2 border border-[#E5E5E5] hover:border-[#D32F2F] hover:bg-[#FFEBEE] transition-colors"
                          title="Delete listing"
                        >
                          <svg className="w-5 h-5 text-[#D32F2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-3xl md:text-4xl font-bold text-[#222222] mt-2">
                  ֏{listing.price.toLocaleString()}
                </p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 text-sm font-medium ${condition.color}`}>
                  {condition.label}
                </span>
                {listing.category && (
                  <Link 
                    href={`/category/${listing.category.slug}`}
                    className="px-3 py-1 text-sm font-medium bg-[#F5F5F5] text-[#757575] hover:bg-[#E5E5E5] transition-colors"
                  >
                    {listing.category.name_en}
                  </Link>
                )}
              </div>

              {/* Delivery Methods */}
              {listing.delivery_methods && listing.delivery_methods.length > 0 && (
                <div className="border-t border-[#E5E5E5] pt-6">
                  <h3 className="text-sm font-medium text-[#222222] mb-3">Delivery Options</h3>
                  <div className="flex flex-wrap gap-2">
                    {listing.delivery_methods.map(method => {
                      const delivery = deliveryLabels[method];
                      if (!delivery) return null;
                      return (
                        <span key={method} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F5F5] text-sm text-[#595959]">
                          <span>{delivery.icon}</span>
                          {delivery.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Description */}
              {listing.description_en && (
                <div className="border-t border-[#E5E5E5] pt-6">
                  <h3 className="text-sm font-medium text-[#222222] mb-3">Description</h3>
                  <p className="text-[#595959] whitespace-pre-wrap leading-relaxed">
                    {listing.description_en}
                  </p>
                </div>
              )}

              {/* Seller Info Card */}
              <div className="border border-[#E5E5E5] bg-white p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Link href={`/store/${listing.store.slug}`} className="flex-shrink-0">
                    {listing.store.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={listing.store.logo}
                        alt={listing.store.name}
                        className="w-14 h-14 rounded-full object-cover border border-[#E5E5E5]"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-[#F5F5F5] flex items-center justify-center border border-[#E5E5E5]">
                        <span className="text-xl font-bold text-[#222222]">
                          {listing.store.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <Link href={`/store/${listing.store.slug}`} className="block">
                        <h4 className="font-semibold text-[#222222] hover:text-[#F56400] transition-colors flex items-center gap-1.5">
                          {listing.store.name}
                          <StoreBadges 
                            is_verified={listing.store.is_verified}
                            is_top_seller={listing.store.is_top_seller}
                            size="small"
                          />
                        </h4>
                      </Link>
                      {/* Follow Button - small version */}
                      <FollowButton 
                        storeId={listing.store.id} 
                        storeOwnerId={listing.store.user_id} 
                        showCount={false}
                        size="small"
                      />
                    </div>
                    {/* Store Rating Display */}
                    {storeRating > 0 && reviewCount > 0 && (
                      <div className="mt-1">
                        <StarRatingDisplay 
                          rating={storeRating} 
                          count={reviewCount}
                          storeSlug={listing.store.slug}
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-sm text-[#757575] mt-1">
                      <span>{listing.store.total_sales} sales</span>
                    </div>
                  </div>
                </div>

                {/* Contact Buttons */}
                {!isOwner && (
                  <div className="space-y-3">
                    {/* Contact Seller via Messages */}
                    <button
                      onClick={handleContactSeller}
                      disabled={isContactingSeller}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#F56400] hover:bg-[#D95700] disabled:bg-[#E5E5E5] transition-colors text-white font-medium"
                    >
                      {isContactingSeller ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Starting conversation...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          Contact Seller
                        </>
                      )}
                    </button>

                    {/* Review Seller Button - only for logged-in users */}
                    {user && (
                      <Link
                        href={`/store/${listing.store.slug}#reviews`}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-[#E5E5E5] hover:border-[#222222] transition-colors text-[#222222] font-medium"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        Review Seller
                      </Link>
                    )}

                    {listing.store.telegram_handle && (
                      <a
                        href={`https://t.me/${listing.store.telegram_handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#0088cc] hover:bg-[#0077b5] transition-colors text-white font-medium"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                        </svg>
                        Contact on Telegram
                      </a>
                    )}
                    {listing.store.whatsapp_number && (
                      <a
                        href={`https://wa.me/${listing.store.whatsapp_number.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#25D366] hover:bg-[#20bd5a] transition-colors text-white font-medium"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Contact on WhatsApp
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Listing Meta */}
              <div className="flex items-start justify-between">
                <div className="text-sm text-[#757575]">
                  <p>Listed {new Date(listing.created_at).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}</p>
                  <p>{listing.view_count.toLocaleString()} views</p>
                </div>
                
                {/* Report Button - only for logged-in users who are NOT the owner */}
                {user && !isOwner && (
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-[#757575] hover:text-[#D32F2F] transition-colors"
                    title="Report this listing"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                    </svg>
                    Report
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Store Reviews Section */}
          {storeReviews.length > 0 && (
            <div className="mt-12 pb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-[#222222]">Store Reviews</h2>
                  {storeRating > 0 && (
                    <Link 
                      href={`/store/${listing.store.slug}#reviews`}
                      className="flex items-center gap-2 mt-1 hover:opacity-80 transition-opacity"
                    >
                      <StarRating rating={storeRating} size="md" />
                      <span className="text-[#222222] font-medium">{storeRating.toFixed(1)}</span>
                      <span className="text-[#757575]">({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</span>
                    </Link>
                  )}
                </div>
                <Link
                  href={`/store/${listing.store.slug}#reviews`}
                  className="text-sm text-[#F56400] hover:text-[#D95700] font-medium"
                >
                  See all reviews →
                </Link>
              </div>

              {reviewsLoading ? (
                <div className="bg-white border border-[#E5E5E5] p-8 text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-[#222222] border-t-transparent rounded-full mx-auto mb-2" />
                  <p className="text-sm text-[#757575]">Loading reviews...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {storeReviews.map((review) => (
                    <div key={review.id} className="bg-white border border-[#E5E5E5] p-6">
                      <div className="flex items-start gap-4">
                        {/* Reviewer Avatar */}
                        <div className="w-10 h-10 bg-[#E5E5E5] rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {review.reviewer?.profile_photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={review.reviewer.profile_photo}
                              alt={review.reviewer.name || 'Reviewer'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-[#757575]">
                              {(review.reviewer?.name || 'U').charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        
                        {/* Review Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-medium text-[#222222]">
                              {review.reviewer?.name || 'Anonymous'}
                            </span>
                            <span className="text-sm text-[#757575]">
                              {new Date(review.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          
                          <StarRating rating={review.rating} size="sm" />
                          
                          {review.comment && (
                            <p className="mt-2 text-[#595959] leading-relaxed">{review.comment}</p>
                          )}

                          {/* Seller Response */}
                          {review.seller_response && (
                            <div className="mt-4 ml-4 pl-4 border-l-2 border-[#F56400] bg-[#FFF9F5] p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-[#F56400]">Seller Response</span>
                                {review.seller_response_at && (
                                  <span className="text-xs text-[#757575]">
                                    {new Date(review.seller_response_at).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-[#595959]">{review.seller_response}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {reviewCount > 5 && (
                    <div className="text-center pt-2">
                      <Link
                        href={`/store/${listing.store.slug}#reviews`}
                        className="inline-flex items-center gap-2 px-6 py-3 border border-[#E5E5E5] hover:border-[#222222] transition-colors text-[#222222] font-medium"
                      >
                        See all {reviewCount} reviews
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lightbox */}
        {isLightboxOpen && images.length > 0 && (
          <div 
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
            onClick={() => setIsLightboxOpen(false)}
          >
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Previous Button */}
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(prev => prev === 0 ? images.length - 1 : prev - 1);
                }}
                className="absolute left-4 p-2 text-white hover:bg-white/10 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Image */}
            <div 
              className="max-w-5xl max-h-[85vh] mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[selectedImage].url}
                alt={`${listing.title_en} - Image ${selectedImage + 1}`}
                className="max-w-full max-h-[85vh] object-contain"
              />
            </div>

            {/* Next Button */}
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(prev => prev === images.length - 1 ? 0 : prev + 1);
                }}
                className="absolute right-4 p-2 text-white hover:bg-white/10 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
                {selectedImage + 1} / {images.length}
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-[#222222] mb-2">Delete Listing</h3>
              <p className="text-[#757575] mb-6">
                Are you sure you want to delete &quot;{listing.title_en}&quot;? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-[#E5E5E5] text-[#222222] hover:bg-[#F5F5F5] transition-colors font-medium"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-[#D32F2F] hover:bg-[#B71C1C] disabled:bg-[#E5E5E5] text-white font-medium transition-colors flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Listing'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Report Modal */}
        {user && (
          <ReportModal
            isOpen={showReportModal}
            onClose={() => setShowReportModal(false)}
            reportType="listing"
            reporterId={user.id}
            listingId={listing.id}
            targetName={listing.title_en}
          />
        )}
      </div>
    </>
  );
}



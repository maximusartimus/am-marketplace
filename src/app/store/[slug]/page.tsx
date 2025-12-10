'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/layout/Header';
import { ListingCard } from '@/components/listings/ListingCard';
import { FollowButton } from '@/components/stores/FollowButton';

interface Store {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description_en: string | null;
  logo: string | null;
  banner_image: string | null;
  phone: string | null;
  telegram_handle: string | null;
  instagram_handle: string | null;
  whatsapp_number: string | null;
  location_country: string | null;
  location_city: string | null;
  location_region: string | null;
  location_address: string | null;
  approval_status: 'pending' | 'approved' | 'needs_info' | 'rejected';
  is_verified: boolean;
  average_rating: number;
  total_reviews: number;
  total_sales: number;
  created_at: string;
}

interface ListingImage {
  id: string;
  url: string;
  position: number;
  is_primary: boolean;
}

interface Listing {
  id: string;
  title_en: string;
  price: number;
  currency: string;
  condition: 'new' | 'like_new' | 'used' | 'parts';
  status: string;
  created_at: string;
  listing_images: ListingImage[];
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

// Star Rating Display Component
function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
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

// Interactive Star Rating Selector
function StarRatingSelector({ 
  rating, 
  onRatingChange 
}: { 
  rating: number; 
  onRatingChange: (rating: number) => void;
}) {
  const [hoverRating, setHoverRating] = useState(0);
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`text-3xl transition-colors ${
            star <= (hoverRating || rating) ? 'text-[#F56400]' : 'text-[#D4D4D4]'
          } hover:scale-110 transition-transform`}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => onRatingChange(star)}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function StorePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const justCreated = searchParams.get('created') === 'true';
  
  const { user, loading: authLoading } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  
  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  
  // Edit review state
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  
  // Delete review state
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Seller response state
  const [replyingToReviewId, setReplyingToReviewId] = useState<string | null>(null);
  const [sellerResponse, setSellerResponse] = useState('');
  const [responseLoading, setResponseLoading] = useState(false);
  
  // Edit/Delete seller response state
  const [editingResponseId, setEditingResponseId] = useState<string | null>(null);
  const [editResponseText, setEditResponseText] = useState('');
  const [editResponseLoading, setEditResponseLoading] = useState(false);
  const [deletingResponseId, setDeletingResponseId] = useState<string | null>(null);
  const [deleteResponseLoading, setDeleteResponseLoading] = useState(false);

  const isOwner = user && store && user.id === store.user_id;

  // Fetch reviews for the store
  const fetchReviews = useCallback(async (storeId: string) => {
    setReviewsLoading(true);
    try {
      // Fetch reviews with reviewer info
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*, reviewer:users(id, name, profile_photo)')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (reviewsError) {
        console.error('Error fetching reviews:', reviewsError);
        return;
      }

      setReviews(reviewsData || []);

      // Calculate average rating
      if (reviewsData && reviewsData.length > 0) {
        const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
        setAverageRating(totalRating / reviewsData.length);
        setTotalReviews(reviewsData.length);
      } else {
        setAverageRating(0);
        setTotalReviews(0);
      }

      // Check if current user has already reviewed
      if (user) {
        const userReview = reviewsData?.find(review => review.reviewer_id === user.id);
        setHasUserReviewed(!!userReview);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  }, [user]);

  // Submit a new review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !store || reviewRating === 0) return;

    setSubmitLoading(true);
    setReviewError(null);

    try {
      const { error } = await supabase.from('reviews').insert({
        store_id: store.id,
        reviewer_id: user.id,
        rating: reviewRating,
        comment: reviewComment.trim() || null,
      });

      if (error) {
        if (error.code === '23505') {
          setReviewError('You have already reviewed this store.');
        } else {
          setReviewError('Failed to submit review. Please try again.');
        }
        console.error('Error submitting review:', error);
        return;
      }

      // Reset form and refresh reviews
      setReviewRating(0);
      setReviewComment('');
      setShowReviewForm(false);
      await fetchReviews(store.id);
    } catch (err) {
      console.error('Error submitting review:', err);
      setReviewError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Submit seller response
  const handleSubmitResponse = async (reviewId: string) => {
    if (!sellerResponse.trim()) return;

    setResponseLoading(true);

    try {
      const { error } = await supabase
        .from('reviews')
        .update({
          seller_response: sellerResponse.trim(),
          seller_response_at: new Date().toISOString(),
        })
        .eq('id', reviewId);

      if (error) {
        console.error('Error submitting response:', error);
        return;
      }

      // Reset and refresh
      setSellerResponse('');
      setReplyingToReviewId(null);
      if (store) {
        await fetchReviews(store.id);
      }
    } catch (err) {
      console.error('Error submitting response:', err);
    } finally {
      setResponseLoading(false);
    }
  };

  // Edit review
  const handleEditReview = async (reviewId: string) => {
    if (editRating === 0) return;

    setEditLoading(true);

    try {
      const { error } = await supabase
        .from('reviews')
        .update({ 
          rating: editRating, 
          comment: editComment.trim() || null 
        })
        .eq('id', reviewId);

      if (error) {
        console.error('Error updating review:', error);
        return;
      }

      // Reset and refresh
      setEditingReviewId(null);
      setEditRating(0);
      setEditComment('');
      if (store) {
        await fetchReviews(store.id);
      }
    } catch (err) {
      console.error('Error updating review:', err);
    } finally {
      setEditLoading(false);
    }
  };

  // Delete review
  const handleDeleteReview = async (reviewId: string) => {
    setDeleteLoading(true);

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) {
        console.error('Error deleting review:', error);
        return;
      }

      // Reset and refresh
      setDeletingReviewId(null);
      if (store) {
        await fetchReviews(store.id);
      }
    } catch (err) {
      console.error('Error deleting review:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Start editing a review
  const startEditingReview = (review: Review) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment || '');
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingReviewId(null);
    setEditRating(0);
    setEditComment('');
  };

  // Scroll to reviews section
  const scrollToReviews = () => {
    const reviewsSection = document.getElementById('reviews');
    if (reviewsSection) {
      reviewsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Start editing seller response
  const startEditingResponse = (review: Review) => {
    setEditingResponseId(review.id);
    setEditResponseText(review.seller_response || '');
  };

  // Cancel editing response
  const cancelEditingResponse = () => {
    setEditingResponseId(null);
    setEditResponseText('');
  };

  // Edit seller response
  const handleEditResponse = async (reviewId: string) => {
    if (!editResponseText.trim()) return;

    setEditResponseLoading(true);

    try {
      const { error } = await supabase
        .from('reviews')
        .update({
          seller_response: editResponseText.trim(),
          seller_response_at: new Date().toISOString(),
        })
        .eq('id', reviewId);

      if (error) {
        console.error('Error updating response:', error);
        return;
      }

      // Reset and refresh
      setEditingResponseId(null);
      setEditResponseText('');
      if (store) {
        await fetchReviews(store.id);
      }
    } catch (err) {
      console.error('Error updating response:', err);
    } finally {
      setEditResponseLoading(false);
    }
  };

  // Delete seller response
  const handleDeleteResponse = async (reviewId: string) => {
    setDeleteResponseLoading(true);

    try {
      const { error } = await supabase
        .from('reviews')
        .update({
          seller_response: null,
          seller_response_at: null,
        })
        .eq('id', reviewId);

      if (error) {
        console.error('Error deleting response:', error);
        return;
      }

      // Reset and refresh
      setDeletingResponseId(null);
      if (store) {
        await fetchReviews(store.id);
      }
    } catch (err) {
      console.error('Error deleting response:', err);
    } finally {
      setDeleteResponseLoading(false);
    }
  };

  useEffect(() => {
    async function fetchStoreAndListings() {
      try {
        // Fetch store
        const { data: storeData, error: fetchError } = await supabase
          .from('stores')
          .select('*')
          .eq('slug', slug)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            setError('Store not found');
          } else {
            setError('Failed to load store');
          }
          return;
        }

        setStore(storeData);

        // Fetch listings for this store
        const { data: listingsData, error: listingsError } = await supabase
          .from('listings')
          .select(`
            *,
            listing_images(*)
          `)
          .eq('store_id', storeData.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (listingsError) {
          console.error('Error fetching listings:', listingsError);
        } else {
          // Sort images by position for each listing
          const sortedListings = (listingsData || []).map(listing => ({
            ...listing,
            listing_images: (listing.listing_images || []).sort(
              (a: ListingImage, b: ListingImage) => a.position - b.position
            ),
          }));
          setListings(sortedListings);
        }
      } catch (err) {
        console.error('Error fetching store:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchStoreAndListings();
    }
  }, [slug]);

  // Fetch reviews when store is loaded
  useEffect(() => {
    if (store?.id) {
      fetchReviews(store.id);
    }
  }, [store?.id, fetchReviews]);

  // Smooth scroll to reviews section if hash is #reviews
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#reviews') {
      // Small delay to ensure the page is fully rendered
      setTimeout(() => {
        const reviewsSection = document.getElementById('reviews');
        if (reviewsSection) {
          reviewsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [loading]);

  if (loading || authLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#222222] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-sm text-[#757575]">Loading store...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
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
            <h1 className="text-xl font-semibold text-[#222222] mb-2">{error}</h1>
            <p className="text-[#757575] mb-6">The store you&apos;re looking for doesn&apos;t exist or has been removed.</p>
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

  if (!store) return null;

  const isPending = store.approval_status === 'pending';
  const isApproved = store.approval_status === 'approved';
  const isRejected = store.approval_status === 'rejected';
  const needsInfo = store.approval_status === 'needs_info';

  // Non-owners can only see approved stores
  if (!isOwner && !isApproved) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 bg-[#E5E5E5] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#757575]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-[#222222] mb-2">Store Not Available</h1>
            <p className="text-[#757575] mb-6">This store is not yet available to the public.</p>
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

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#F5F5F5]">
        {/* Just Created Success Banner */}
        {justCreated && isOwner && (
        <div className="bg-[#E8F5E9] border-b border-[#2E7D32]">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-[#2E7D32] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-[#2E7D32] font-medium">Your store has been created!</p>
                <p className="text-sm text-[#2E7D32]">
                  It&apos;s now pending approval. You&apos;ll receive a notification once it&apos;s reviewed.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending/Status Banner for Owner */}
      {isOwner && !justCreated && !isApproved && (
        <div className={`border-b ${
          isPending ? 'bg-[#FFF3E0] border-[#F56400]' : 
          isRejected ? 'bg-[#FFEBEE] border-[#D32F2F]' : 
          'bg-[#E3F2FD] border-[#1976D2]'
        }`}>
          <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4">
            <div className="flex items-center gap-3">
              <svg className={`w-6 h-6 flex-shrink-0 ${
                isPending ? 'text-[#F56400]' : 
                isRejected ? 'text-[#D32F2F]' : 
                'text-[#1976D2]'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isPending ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : isRejected ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
              <div>
                <p className={`font-medium ${
                  isPending ? 'text-[#F56400]' : 
                  isRejected ? 'text-[#D32F2F]' : 
                  'text-[#1976D2]'
                }`}>
                  {isPending && 'Your store is pending approval'}
                  {isRejected && 'Your store application was not approved'}
                  {needsInfo && 'Additional information needed'}
                </p>
                <p className={`text-sm ${
                  isPending ? 'text-[#F56400]' : 
                  isRejected ? 'text-[#D32F2F]' : 
                  'text-[#1976D2]'
                }`}>
                  {isPending && 'Our team is reviewing your store. This usually takes 1-2 business days.'}
                  {isRejected && 'Please contact support for more information.'}
                  {needsInfo && 'Please check your email for details on what information is needed.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Store Banner */}
      <div className="relative h-48 md:h-64 bg-gradient-to-br from-[#222222] to-[#595959]">
        {store.banner_image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={store.banner_image}
            alt={`${store.name} banner`}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      {/* Store Header */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="relative -mt-16 md:-mt-20 mb-6">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
            {/* Store Logo */}
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white border-4 border-white shadow-md rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
              {store.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={store.logo}
                  alt={store.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl md:text-4xl font-bold text-[#222222]">
                  {store.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Store Info */}
            <div className="flex-1 pt-2 md:pt-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-[#222222]">{store.name}</h1>
                    {store.is_verified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#1976D2] text-white text-xs font-medium rounded-full">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                  {/* Clickable Rating at top */}
                  {totalReviews > 0 && (
                    <button
                      onClick={scrollToReviews}
                      className="flex items-center gap-2 mt-1 hover:opacity-80 transition-opacity"
                    >
                      <StarRating rating={averageRating} size="sm" />
                      <span className="text-sm text-[#222222] font-medium">{averageRating.toFixed(1)}</span>
                      <span className="text-sm text-[#757575]">({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
                    </button>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-[#757575]">
                    {(store.location_country || store.location_region) && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {store.location_region ? `${store.location_region}, ` : ''}{store.location_country}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Joined {new Date(store.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {/* Follow Button - only for non-owners */}
                  {store && (
                    <FollowButton 
                      storeId={store.id} 
                      storeOwnerId={store.user_id} 
                      showCount={true}
                    />
                  )}
                  
                  {/* Owner Edit Button */}
                  {isOwner && (
                    <Link
                      href="/store/edit"
                      className="inline-flex items-center gap-2 px-4 py-2 border border-[#222222] text-[#222222] hover:bg-[#222222] hover:text-white transition-colors font-medium text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Store
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Store Description */}
        {store.description_en && (
          <div className="mb-8">
            <p className="text-[#595959] leading-relaxed max-w-3xl">{store.description_en}</p>
          </div>
        )}

        {/* Contact Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          {store.phone && (
            <a
              href={`tel:+374${store.phone}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E5E5] hover:border-[#222222] transition-colors text-sm font-medium text-[#222222]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call
            </a>
          )}
          {store.telegram_handle && (
            <a
              href={`https://t.me/${store.telegram_handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0088cc] hover:bg-[#0077b5] transition-colors text-sm font-medium text-white"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
              </svg>
              Telegram
            </a>
          )}
          {store.instagram_handle && (
            <a
              href={`https://instagram.com/${store.instagram_handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] hover:opacity-90 transition-opacity text-sm font-medium text-white"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              Instagram
            </a>
          )}
          {store.whatsapp_number && (
            <a
              href={`https://wa.me/374${store.whatsapp_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] transition-colors text-sm font-medium text-white"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
          )}
        </div>

        {/* Store Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-lg">
          <div className="bg-white border border-[#E5E5E5] p-4 text-center">
            <p className="text-2xl font-bold text-[#222222]">{store.total_sales}</p>
            <p className="text-xs text-[#757575] uppercase tracking-wide">Sales</p>
          </div>
          <div className="bg-white border border-[#E5E5E5] p-4 text-center">
            <p className="text-2xl font-bold text-[#222222]">
              {store.average_rating > 0 ? store.average_rating.toFixed(1) : '—'}
            </p>
            <p className="text-xs text-[#757575] uppercase tracking-wide">Rating</p>
          </div>
          <div className="bg-white border border-[#E5E5E5] p-4 text-center">
            <p className="text-2xl font-bold text-[#222222]">{store.total_reviews}</p>
            <p className="text-xs text-[#757575] uppercase tracking-wide">Reviews</p>
          </div>
        </div>

        {/* Listings Section */}
        <div className="pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#222222]">
              Listings {listings.length > 0 && <span className="text-[#757575] font-normal">({listings.length})</span>}
            </h2>
            {isOwner && isApproved && (
              <Link
                href="/listing/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#F56400] hover:bg-[#D95700] transition-colors text-sm font-medium text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Listing
              </Link>
            )}
          </div>

          {/* Listings Grid */}
          {listings.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white border border-[#E5E5E5] p-12 text-center">
              <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#757575]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[#222222] mb-2">No listings yet</h3>
              <p className="text-[#757575] mb-6 max-w-sm mx-auto">
                {isOwner 
                  ? "You haven't added any listings yet. Start selling by creating your first listing."
                  : "This store hasn't added any listings yet. Check back later!"}
              </p>
              {isOwner && isApproved && (
                <Link
                  href="/listing/create"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#222222] hover:bg-[#333333] transition-colors font-medium text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Your First Listing
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div id="reviews" className="pb-12 scroll-mt-24">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-[#222222]">Reviews</h2>
              {totalReviews > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <StarRating rating={averageRating} size="md" />
                  <span className="text-[#222222] font-medium">{averageRating.toFixed(1)}</span>
                  <span className="text-[#757575]">({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
                </div>
              )}
            </div>
            
            {/* Write Review Button - only for logged-in users who are NOT the store owner */}
            {user && !isOwner && !hasUserReviewed && !showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#F56400] hover:bg-[#D95700] transition-colors text-sm font-medium text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Write a Review
              </button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="bg-white border border-[#E5E5E5] p-6 mb-6">
              <h3 className="text-lg font-semibold text-[#222222] mb-4">Write a Review</h3>
              <form onSubmit={handleSubmitReview}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#222222] mb-2">
                    Your Rating <span className="text-red-500">*</span>
                  </label>
                  <StarRatingSelector rating={reviewRating} onRatingChange={setReviewRating} />
                  {reviewRating === 0 && submitLoading && (
                    <p className="text-sm text-red-500 mt-1">Please select a rating</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#222222] mb-2">
                    Your Review (optional)
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience with this store..."
                    rows={4}
                    className="w-full px-4 py-3 border border-[#E5E5E5] focus:border-[#222222] focus:outline-none text-[#222222] placeholder-[#9E9E9E] resize-none"
                  />
                </div>

                {reviewError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
                    {reviewError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submitLoading || reviewRating === 0}
                    className="px-6 py-2 bg-[#222222] text-white font-medium hover:bg-[#333333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReviewForm(false);
                      setReviewRating(0);
                      setReviewComment('');
                      setReviewError(null);
                    }}
                    className="px-6 py-2 border border-[#E5E5E5] text-[#222222] font-medium hover:border-[#222222] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Reviews List */}
          {reviewsLoading ? (
            <div className="bg-white border border-[#E5E5E5] p-8 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-[#222222] border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-sm text-[#757575]">Loading reviews...</p>
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => {
                const isReviewer = user && review.reviewer_id === user.id;
                const isEditing = editingReviewId === review.id;
                const isDeleting = deletingReviewId === review.id;
                
                return (
                <div key={review.id} className="bg-white border border-[#E5E5E5] p-6">
                  {/* Delete Confirmation */}
                  {isDeleting && (
                    <div className="mb-4 p-4 bg-[#FFEBEE] border border-[#D32F2F]">
                      <p className="text-sm text-[#D32F2F] mb-3">Are you sure you want to delete your review?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          disabled={deleteLoading}
                          className="px-4 py-2 bg-[#D32F2F] text-white text-sm font-medium hover:bg-[#B71C1C] transition-colors disabled:opacity-50"
                        >
                          {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
                        </button>
                        <button
                          onClick={() => setDeletingReviewId(null)}
                          disabled={deleteLoading}
                          className="px-4 py-2 border border-[#E5E5E5] text-[#222222] text-sm font-medium hover:border-[#222222] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Edit Form */}
                  {isEditing ? (
                    <div>
                      <h4 className="text-sm font-medium text-[#222222] mb-3">Edit Your Review</h4>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-[#222222] mb-2">
                          Rating <span className="text-red-500">*</span>
                        </label>
                        <StarRatingSelector rating={editRating} onRatingChange={setEditRating} />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-[#222222] mb-2">
                          Comment (optional)
                        </label>
                        <textarea
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                          placeholder="Share your experience..."
                          rows={3}
                          className="w-full px-4 py-3 border border-[#E5E5E5] focus:border-[#222222] focus:outline-none text-[#222222] placeholder-[#9E9E9E] resize-none text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditReview(review.id)}
                          disabled={editLoading || editRating === 0}
                          className="px-4 py-2 bg-[#222222] text-white text-sm font-medium hover:bg-[#333333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {editLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          onClick={cancelEditing}
                          disabled={editLoading}
                          className="px-4 py-2 border border-[#E5E5E5] text-[#222222] text-sm font-medium hover:border-[#222222] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                  <>
                  {/* Review Header */}
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
                          {isReviewer && <span className="ml-2 text-xs text-[#757575] font-normal">(You)</span>}
                        </span>
                        <div className="flex items-center gap-2">
                          {/* Edit/Delete buttons for reviewer */}
                          {isReviewer && !isDeleting && (
                            <>
                              <button
                                onClick={() => startEditingReview(review)}
                                className="text-sm text-[#1976D2] hover:text-[#1565C0] font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setDeletingReviewId(review.id)}
                                className="text-sm text-[#D32F2F] hover:text-[#B71C1C] font-medium"
                              >
                                Delete
                              </button>
                            </>
                          )}
                          <span className="text-sm text-[#757575]">
                            {new Date(review.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                      
                      <StarRating rating={review.rating} size="sm" />
                      
                      {review.comment && (
                        <p className="mt-2 text-[#595959] leading-relaxed">{review.comment}</p>
                      )}

                      {/* Seller Response */}
                      {review.seller_response && (
                        <div className="mt-4 ml-4 pl-4 border-l-2 border-[#F56400] bg-[#FFF9F5] p-4">
                          {/* Delete Response Confirmation */}
                          {deletingResponseId === review.id && (
                            <div className="mb-3 p-3 bg-[#FFEBEE] border border-[#D32F2F]">
                              <p className="text-sm text-[#D32F2F] mb-2">Delete your response?</p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleDeleteResponse(review.id)}
                                  disabled={deleteResponseLoading}
                                  className="px-3 py-1.5 bg-[#D32F2F] text-white text-xs font-medium hover:bg-[#B71C1C] transition-colors disabled:opacity-50"
                                >
                                  {deleteResponseLoading ? 'Deleting...' : 'Yes, Delete'}
                                </button>
                                <button
                                  onClick={() => setDeletingResponseId(null)}
                                  disabled={deleteResponseLoading}
                                  className="px-3 py-1.5 border border-[#E5E5E5] text-[#222222] text-xs font-medium hover:border-[#222222] transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Edit Response Form */}
                          {editingResponseId === review.id ? (
                            <div>
                              <textarea
                                value={editResponseText}
                                onChange={(e) => setEditResponseText(e.target.value)}
                                placeholder="Edit your response..."
                                rows={3}
                                className="w-full px-3 py-2 border border-[#E5E5E5] focus:border-[#F56400] focus:outline-none text-[#222222] placeholder-[#9E9E9E] resize-none text-sm bg-white"
                              />
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => handleEditResponse(review.id)}
                                  disabled={editResponseLoading || !editResponseText.trim()}
                                  className="px-3 py-1.5 bg-[#F56400] text-white text-xs font-medium hover:bg-[#D95700] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {editResponseLoading ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                  onClick={cancelEditingResponse}
                                  disabled={editResponseLoading}
                                  className="px-3 py-1.5 border border-[#E5E5E5] text-[#222222] text-xs font-medium hover:border-[#222222] transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
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
                                {/* Edit/Delete buttons for store owner */}
                                {isOwner && deletingResponseId !== review.id && (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => startEditingResponse(review)}
                                      className="text-xs text-[#1976D2] hover:text-[#1565C0] font-medium"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => setDeletingResponseId(review.id)}
                                      className="text-xs text-[#D32F2F] hover:text-[#B71C1C] font-medium"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-[#595959]">{review.seller_response}</p>
                            </>
                          )}
                        </div>
                      )}

                      {/* Reply Button for Store Owner */}
                      {isOwner && !review.seller_response && (
                        <>
                          {replyingToReviewId === review.id ? (
                            <div className="mt-4">
                              <textarea
                                value={sellerResponse}
                                onChange={(e) => setSellerResponse(e.target.value)}
                                placeholder="Write your response..."
                                rows={3}
                                className="w-full px-4 py-3 border border-[#E5E5E5] focus:border-[#222222] focus:outline-none text-[#222222] placeholder-[#9E9E9E] resize-none text-sm"
                              />
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => handleSubmitResponse(review.id)}
                                  disabled={responseLoading || !sellerResponse.trim()}
                                  className="px-4 py-2 bg-[#222222] text-white text-sm font-medium hover:bg-[#333333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {responseLoading ? 'Sending...' : 'Send Response'}
                                </button>
                                <button
                                  onClick={() => {
                                    setReplyingToReviewId(null);
                                    setSellerResponse('');
                                  }}
                                  className="px-4 py-2 border border-[#E5E5E5] text-[#222222] text-sm font-medium hover:border-[#222222] transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setReplyingToReviewId(review.id)}
                              className="mt-3 text-sm text-[#F56400] hover:text-[#D95700] font-medium"
                            >
                              Reply to this review
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  </>
                  )}
                </div>
              )})}
            </div>
          ) : (
            /* No Reviews Empty State */
            <div className="bg-white border border-[#E5E5E5] p-8 text-center">
              <div className="w-12 h-12 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-[#757575]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[#222222] mb-1">No reviews yet</h3>
              <p className="text-[#757575] text-sm">
                {isOwner 
                  ? "Your store doesn't have any reviews yet."
                  : "Be the first to review this store!"}
              </p>
              {user && !isOwner && !hasUserReviewed && !showReviewForm && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#F56400] hover:bg-[#D95700] transition-colors text-sm font-medium text-white"
                >
                  Write a Review
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

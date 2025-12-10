'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { FavoriteButton } from '@/components/listings/FavoriteButton';
import { VerifiedCheckmark } from '@/components/stores/StoreBadges';

interface ListingImage {
  url: string;
  position: number;
}

interface Store {
  name: string;
  slug: string;
  is_verified?: boolean;
  average_rating?: number;
}

interface Listing {
  id: string;
  title_en: string;
  price: number;
  currency: string;
  condition: string;
  status: string;
  store: Store;
  images: ListingImage[];
}

interface RecentlyViewedItem {
  listing_id: string;
  viewed_at: string;
  listing: Listing;
}

function formatPrice(price: number, currency: string): string {
  if (currency === 'AMD') {
    return `${price.toLocaleString()}`;
  }
  return `$${price.toLocaleString()}`;
}

function getConditionLabel(condition: string): string | null {
  switch (condition) {
    case 'new':
      return 'NEW';
    case 'like_new':
      return 'LIKE NEW';
    default:
      return null;
  }
}

export function RecentlyViewed() {
  const { user, loading: authLoading } = useAuth();
  const [listings, setListings] = useState<RecentlyViewedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentlyViewed() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await supabase
          .from('recently_viewed')
          .select('listing_id, viewed_at, listing:listings(id, title_en, price, currency, condition, status, store:stores(name, slug, is_verified, average_rating), images:listing_images(url, position))')
          .eq('user_id', user.id)
          .order('viewed_at', { ascending: false })
          .limit(8);

        if (data) {
          // Filter out listings that are no longer active
          const activeListings = data.filter(
            (item) => item.listing && (item.listing as unknown as Listing).status === 'active'
          ) as unknown as RecentlyViewedItem[];
          setListings(activeListings);
        }
      } catch {
        // Fail silently
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchRecentlyViewed();
    }
  }, [user, authLoading]);

  // Don't show anything while auth is loading
  if (authLoading) {
    return null;
  }

  // Don't show for logged-out users
  if (!user) {
    return null;
  }

  // Don't show while loading
  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-[#FAFAFA]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-8 border-b border-[#E5E5E5] pb-4">
            <h2 className="text-xl md:text-2xl font-medium text-[#222222] tracking-tight">
              Recently Viewed
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-[#E5E5E5]" />
                <div className="pt-3 pb-2">
                  <div className="h-4 bg-[#E5E5E5] rounded w-3/4 mb-2" />
                  <div className="h-3 bg-[#E5E5E5] rounded w-1/2 mb-2" />
                  <div className="h-4 bg-[#E5E5E5] rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Don't show if no recently viewed listings
  if (listings.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 bg-[#FAFAFA]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8 border-b border-[#E5E5E5] pb-4">
          <h2 className="text-xl md:text-2xl font-medium text-[#222222] tracking-tight">
            Recently Viewed
          </h2>
          <Link
            href="/account/recently-viewed"
            className="text-sm text-[#222222] hover:text-[#F56400] font-medium flex items-center gap-1 transition-colors"
          >
            View All
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        {/* Listings grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {listings.map((item) => {
            const listing = item.listing;
            // Get primary image (first by position)
            const sortedImages = [...(listing.images || [])].sort((a, b) => a.position - b.position);
            const primaryImage = sortedImages[0];

            return (
              <Link
                key={item.listing_id}
                href={`/listing/${listing.id}`}
                className="group"
              >
                {/* Image container */}
                <div className="aspect-square relative bg-[#F5F5F5] overflow-hidden">
                  {primaryImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={primaryImage.url}
                      alt={listing.title_en}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-[#D4D4D4]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Condition badge - bottom left */}
                  {getConditionLabel(listing.condition) && (
                    <span className="absolute bottom-3 left-3 bg-white px-2 py-1 text-[10px] font-semibold tracking-wide text-[#222222] uppercase">
                      {getConditionLabel(listing.condition)}
                    </span>
                  )}

                  {/* Favorite Button */}
                  <div className="absolute top-2 right-2">
                    <FavoriteButton listingId={listing.id} size="small" />
                  </div>
                </div>

                {/* Content */}
                <div className="pt-3 pb-2">
                  <h3 className="font-medium text-[#222222] text-sm leading-tight group-hover:underline line-clamp-2">
                    {listing.title_en}
                  </h3>
                  <p className="text-xs text-[#757575] mt-1 flex items-center gap-1">
                    <span className="inline-flex items-center gap-0.5">
                      {listing.store.name}
                      {listing.store.is_verified && <VerifiedCheckmark />}
                    </span>
                    {listing.store.average_rating && listing.store.average_rating > 0 && (
                      <span className="inline-flex items-center text-[#F56400]">
                        <span>★</span>
                        <span className="ml-0.5">{listing.store.average_rating.toFixed(1)}</span>
                      </span>
                    )}
                  </p>
                  <div className="mt-2">
                    <span className="font-medium text-[#222222] text-sm">
                      {formatPrice(listing.price, listing.currency)} {listing.currency}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

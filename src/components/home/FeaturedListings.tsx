'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Listing {
  id: string;
  title: string;
  price: number;
  currency: string;
  image: string | null;
  storeName: string;
  condition: string;
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

export function FeaturedListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchListings() {
      try {
        // Fetch active listings with their primary image and store info
        const { data, error: fetchError } = await supabase
          .from('listings')
          .select(`
            id,
            title_en,
            price,
            currency,
            condition,
            store:stores(name),
            listing_images!inner(url, is_primary, position)
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(8);

        if (fetchError) {
          console.error('Error fetching listings:', fetchError);
          setError('Failed to load listings');
          return;
        }

        // Transform the data to our format
        const transformedListings: Listing[] = (data || []).map((item) => {
          // Find primary image (is_primary=true) or first image (position=0)
          const images = item.listing_images || [];
          const primaryImage = images.find((img: { is_primary: boolean }) => img.is_primary) 
            || images.find((img: { position: number }) => img.position === 0)
            || images[0];

          return {
            id: item.id,
            title: item.title_en || 'Untitled',
            price: item.price || 0,
            currency: item.currency || 'AMD',
            image: primaryImage?.url || null,
            storeName: item.store?.name || 'Unknown Store',
            condition: item.condition || '',
          };
        });

        setListings(transformedListings);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load listings');
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, []);

  // Loading state
  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-8 border-b border-[#E5E5E5] pb-4">
            <h2 className="text-xl md:text-2xl font-medium text-[#222222] tracking-tight">
              Featured
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-[#F5F5F5]" />
                <div className="pt-3 pb-2">
                  <div className="h-4 bg-[#F5F5F5] rounded w-3/4 mb-2" />
                  <div className="h-3 bg-[#F5F5F5] rounded w-1/2 mb-2" />
                  <div className="h-4 bg-[#F5F5F5] rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <div className="text-center py-12">
            <p className="text-[#757575]">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  // No listings state
  if (listings.length === 0) {
    return (
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-8 border-b border-[#E5E5E5] pb-4">
            <h2 className="text-xl md:text-2xl font-medium text-[#222222] tracking-tight">
              Featured
            </h2>
          </div>
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-[#E5E5E5] mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <p className="text-[#757575] text-lg">No listings yet</p>
            <p className="text-[#9E9E9E] text-sm mt-1">
              Be the first to list something!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8 border-b border-[#E5E5E5] pb-4">
          <h2 className="text-xl md:text-2xl font-medium text-[#222222] tracking-tight">
            Featured
          </h2>
          <Link
            href="/search"
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
          {listings.map((listing) => (
            <Link
              key={listing.id}
              href={`/listing/${listing.id}`}
              className="group"
            >
              {/* Image container */}
              <div className="aspect-square relative bg-[#F5F5F5] overflow-hidden">
                {listing.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={listing.image}
                    alt={listing.title}
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
              </div>

              {/* Content */}
              <div className="pt-3 pb-2">
                <h3 className="font-medium text-[#222222] text-sm leading-tight group-hover:underline line-clamp-2">
                  {listing.title}
                </h3>
                <p className="text-xs text-[#757575] mt-1">
                  {listing.storeName}
                </p>
                <div className="mt-2">
                  <span className="font-medium text-[#222222] text-sm">
                    {formatPrice(listing.price, listing.currency)} {listing.currency}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

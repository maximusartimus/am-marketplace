'use client';

import Link from 'next/link';
import { FavoriteButton } from './FavoriteButton';
import { VerifiedCheckmark } from '@/components/stores/StoreBadges';

interface ListingImage {
  id: string;
  url: string;
  position: number;
  is_primary: boolean;
}

interface ListingCardProps {
  listing: {
    id: string;
    title_en: string;
    price: number;
    currency: string;
    condition: 'new' | 'like_new' | 'used' | 'parts';
    listing_images: ListingImage[];
    store?: {
      name: string;
      slug: string;
      average_rating?: number;
      total_reviews?: number;
      is_verified?: boolean;
    };
  };
  showStore?: boolean;
}

const conditionLabels: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-[#E8F5E9] text-[#2E7D32]' },
  like_new: { label: 'Like New', color: 'bg-[#E3F2FD] text-[#1976D2]' },
  used: { label: 'Used', color: 'bg-[#FFF3E0] text-[#F56400]' },
  parts: { label: 'For Parts', color: 'bg-[#FFEBEE] text-[#D32F2F]' },
};

export function ListingCard({ listing, showStore = false }: ListingCardProps) {
  const primaryImage = listing.listing_images?.find(img => img.is_primary) || listing.listing_images?.[0];
  const condition = conditionLabels[listing.condition];

  return (
    <Link 
      href={`/listing/${listing.id}`}
      className="group block bg-white border border-[#E5E5E5] hover:border-[#222222] hover:shadow-md transition-all overflow-hidden"
    >
      {/* Image */}
      <div className="aspect-square relative overflow-hidden bg-[#F5F5F5]">
        {primaryImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={primaryImage.url}
            alt={listing.title_en}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-[#E5E5E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Condition Badge */}
        {condition && (
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-0.5 text-xs font-medium ${condition.color}`}>
              {condition.label}
            </span>
          </div>
        )}

        {/* Favorite Button */}
        <div className="absolute top-2 right-2">
          <FavoriteButton listingId={listing.id} size="small" />
        </div>

        {/* Image Count Badge */}
        {listing.listing_images && listing.listing_images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {listing.listing_images.length}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-4">
        <h3 className="font-medium text-[#222222] text-sm line-clamp-2 leading-snug min-h-[2.5rem]">
          {listing.title_en}
        </h3>
        
        {showStore && listing.store && (
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
        )}
        
        <p className="font-bold text-[#222222] mt-2">
          ֏{listing.price.toLocaleString()}
        </p>
      </div>
    </Link>
  );
}



'use client';

import Link from 'next/link';

// Placeholder data for featured listings
const featuredListings = [
  {
    id: '1',
    title: 'iPhone 15 Pro Max 256GB',
    price: 650000,
    originalPrice: null,
    currency: 'AMD',
    image: null,
    storeName: 'Tech Armenia',
    location: 'Yerevan',
    rating: 4.8,
    badge: 'NEW',
  },
  {
    id: '2',
    title: 'Vintage Armenian Carpet',
    price: 180000,
    originalPrice: 220000,
    currency: 'AMD',
    image: null,
    storeName: 'Artisan Crafts',
    location: 'Gyumri',
    rating: 4.9,
    badge: 'BESTSELLER',
  },
  {
    id: '3',
    title: 'MacBook Air M2 2023',
    price: 520000,
    originalPrice: 620000,
    currency: 'AMD',
    image: null,
    storeName: 'Apple Store AM',
    location: 'Yerevan',
    rating: 4.7,
    badge: '16% OFF',
  },
  {
    id: '4',
    title: 'Handmade Silver Jewelry Set',
    price: 45000,
    originalPrice: null,
    currency: 'AMD',
    image: null,
    storeName: 'Silver Dreams',
    location: 'Yerevan',
    rating: 5.0,
    badge: null,
  },
  {
    id: '5',
    title: 'Modern Office Chair',
    price: 85000,
    originalPrice: 110000,
    currency: 'AMD',
    image: null,
    storeName: 'Home & More',
    location: 'Yerevan',
    rating: 4.5,
    badge: '23% OFF',
  },
  {
    id: '6',
    title: 'Samsung Galaxy S24 Ultra',
    price: 580000,
    originalPrice: null,
    currency: 'AMD',
    image: null,
    storeName: 'Mobile Zone',
    location: 'Yerevan',
    rating: 4.6,
    badge: 'NEW',
  },
  {
    id: '7',
    title: 'Traditional Armenian Duduk',
    price: 35000,
    originalPrice: null,
    currency: 'AMD',
    image: null,
    storeName: 'Music Armenia',
    location: 'Yerevan',
    rating: 4.9,
    badge: 'BESTSELLER',
  },
  {
    id: '8',
    title: 'Leather Messenger Bag',
    price: 65000,
    originalPrice: 85000,
    currency: 'AMD',
    image: null,
    storeName: 'Leather Works',
    location: 'Yerevan',
    rating: 4.7,
    badge: '24% OFF',
  },
];

function formatPrice(price: number, currency: string): string {
  if (currency === 'AMD') {
    return `${price.toLocaleString()}`;
  }
  return `$${price.toLocaleString()}`;
}

export function FeaturedListings() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8 border-b border-[#E5E5E5] pb-4">
          <h2 className="text-xl md:text-2xl font-medium text-[#222222] tracking-tight">
            Featured
          </h2>
          <Link
            href="/featured"
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
          {featuredListings.map((listing) => (
            <Link
              key={listing.id}
              href={`/listing/${listing.id}`}
              className="group"
            >
              {/* Image container */}
              <div className="aspect-square relative bg-[#F5F5F5] overflow-hidden">
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

                {/* Rating badge - top left */}
                {listing.rating && (
                  <span className="absolute top-3 left-3 text-xs font-medium text-[#222222] flex items-center gap-0.5">
                    <svg className="w-3.5 h-3.5 text-[#222222] fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {listing.rating}
                  </span>
                )}

                {/* Status badge - bottom left */}
                {listing.badge && (
                  <span className="absolute bottom-3 left-3 bg-white px-2 py-1 text-[10px] font-semibold tracking-wide text-[#222222] uppercase">
                    {listing.badge}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="pt-3 pb-2">
                <h3 className="font-medium text-[#222222] text-sm leading-tight group-hover:underline">
                  {listing.title}
                </h3>
                <p className="text-xs text-[#757575] mt-1">
                  {listing.storeName}
                </p>
                <div className="mt-2">
                  {listing.originalPrice ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#757575] line-through">
                        {formatPrice(listing.originalPrice, listing.currency)}
                      </span>
                      <span className="text-xs text-[#757575]">/</span>
                      <span className="font-medium text-[#222222] text-sm">
                        {formatPrice(listing.price, listing.currency)} AMD
                      </span>
                    </div>
                  ) : (
                    <span className="font-medium text-[#222222] text-sm">
                      {formatPrice(listing.price, listing.currency)} AMD
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Load more button */}
        <div className="text-center mt-10">
          <button className="bg-[#222222] hover:bg-[#333333] text-white font-medium py-3 px-8 text-sm tracking-wide transition-colors">
            Load More
          </button>
        </div>
      </div>
    </section>
  );
}


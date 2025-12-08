'use client';

import Link from 'next/link';

// Placeholder data for featured listings
const featuredListings = [
  {
    id: '1',
    title: 'iPhone 15 Pro Max 256GB',
    price: 650000,
    currency: 'AMD',
    image: null,
    storeName: 'Tech Armenia',
    location: 'Yerevan',
    isNew: true,
  },
  {
    id: '2',
    title: 'Vintage Armenian Carpet',
    price: 180000,
    currency: 'AMD',
    image: null,
    storeName: 'Artisan Crafts',
    location: 'Gyumri',
    isNew: false,
  },
  {
    id: '3',
    title: 'MacBook Air M2 2023',
    price: 520000,
    currency: 'AMD',
    image: null,
    storeName: 'Apple Store AM',
    location: 'Yerevan',
    isNew: true,
  },
  {
    id: '4',
    title: 'Handmade Silver Jewelry Set',
    price: 45000,
    currency: 'AMD',
    image: null,
    storeName: 'Silver Dreams',
    location: 'Yerevan',
    isNew: false,
  },
  {
    id: '5',
    title: 'Modern Office Chair',
    price: 85000,
    currency: 'AMD',
    image: null,
    storeName: 'Home & More',
    location: 'Yerevan',
    isNew: false,
  },
  {
    id: '6',
    title: 'Samsung Galaxy S24 Ultra',
    price: 580000,
    currency: 'AMD',
    image: null,
    storeName: 'Mobile Zone',
    location: 'Yerevan',
    isNew: true,
  },
  {
    id: '7',
    title: 'Traditional Armenian Duduk',
    price: 35000,
    currency: 'AMD',
    image: null,
    storeName: 'Music Armenia',
    location: 'Yerevan',
    isNew: false,
  },
  {
    id: '8',
    title: 'Leather Messenger Bag',
    price: 65000,
    currency: 'AMD',
    image: null,
    storeName: 'Leather Works',
    location: 'Yerevan',
    isNew: true,
  },
];

function formatPrice(price: number, currency: string): string {
  if (currency === 'AMD') {
    return `֏${price.toLocaleString()}`;
  }
  return `$${price.toLocaleString()}`;
}

export function FeaturedListings() {
  return (
    <section className="py-12 md:py-16 bg-[#F5F5F5]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#222222]">
              Featured Listings
            </h2>
            <p className="text-[#595959] mt-1">
              Hand-picked items just for you
            </p>
          </div>
          <Link
            href="/featured"
            className="text-[#F56400] hover:text-[#D95700] font-semibold flex items-center gap-1 transition-colors"
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
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        {/* Listings grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featuredListings.map((listing) => (
            <Link
              key={listing.id}
              href={`/listing/${listing.id}`}
              className="group bg-white rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all overflow-hidden"
            >
              {/* Image placeholder */}
              <div className="aspect-square relative bg-gradient-to-br from-[#F5F5F5] to-[#E8E8E8]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-[#D4D4D4]"
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

                {/* Favorite button */}
                <button
                  className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform z-10"
                  onClick={(e) => {
                    e.preventDefault();
                    // Handle favorite
                  }}
                >
                  <svg
                    className="w-5 h-5 text-[#757575] hover:text-[#F56400]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>

                {/* New badge */}
                {listing.isNew && (
                  <span className="absolute top-3 left-3 bg-[#F56400] text-white text-xs font-semibold px-2 py-1 rounded-full">
                    New
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-medium text-[#222222] truncate group-hover:text-[#F56400] transition-colors">
                  {listing.title}
                </h3>
                <p className="text-sm text-[#595959] mt-1 truncate">
                  {listing.storeName}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-bold text-[#222222] text-lg">
                    {formatPrice(listing.price, listing.currency)}
                  </span>
                  <span className="text-xs text-[#757575] flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {listing.location}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Load more button */}
        <div className="text-center mt-10">
          <button className="bg-white hover:bg-[#F5F5F5] text-[#222222] font-semibold py-3 px-8 rounded-full border-2 border-[#222222] transition-colors">
            Load More Listings
          </button>
        </div>
      </div>
    </section>
  );
}


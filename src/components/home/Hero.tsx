'use client';

import { useState } from 'react';

const popularSearches = [
  'iPhone',
  'Apartment',
  'MacBook',
  'Furniture',
  'Car',
  'Jewelry',
];

export function Hero() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <section className="relative bg-gradient-to-br from-[#FFF3E0] via-white to-[#FFF8F0] overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#F56400] rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FFB366] rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#222222] mb-6 leading-tight">
            Discover unique finds in{' '}
            <span className="text-[#F56400] relative">
              Armenia
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 200 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 10C50 2 150 2 198 10"
                  stroke="#F56400"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="text-lg md:text-xl text-[#595959] mb-8 max-w-xl mx-auto">
            Shop from thousands of local sellers. Find everything from handmade crafts to electronics, all in one place.
          </p>

          {/* Search bar */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <div className="flex border-2 border-[#222222] rounded-full overflow-hidden bg-white shadow-lg focus-within:border-[#F56400] focus-within:ring-4 focus-within:ring-[#F56400]/10 transition-all">
              <div className="flex-1 flex items-center">
                <svg
                  className="w-5 h-5 ml-5 text-[#757575]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for anything..."
                  className="flex-1 px-4 py-4 md:py-5 focus:outline-none text-[#222222] placeholder-[#757575] text-base md:text-lg"
                />
              </div>
              <button className="bg-[#F56400] hover:bg-[#D95700] px-6 md:px-10 text-white font-semibold transition-colors text-base md:text-lg">
                Search
              </button>
            </div>
          </div>

          {/* Popular searches */}
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
            <span className="text-sm text-[#757575]">Popular:</span>
            {popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => setSearchQuery(term)}
                className="px-4 py-1.5 bg-white border border-[#D4D4D4] rounded-full text-sm text-[#595959] hover:border-[#F56400] hover:text-[#F56400] transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto">
          {[
            { value: '50K+', label: 'Active Listings' },
            { value: '10K+', label: 'Verified Sellers' },
            { value: '100K+', label: 'Happy Customers' },
            { value: '11', label: 'Regions Covered' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-[#222222]">{stat.value}</div>
              <div className="text-sm text-[#757575] mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


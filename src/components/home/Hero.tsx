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
    <section className="bg-[#F5F5F5]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="max-w-2xl">
          {/* Headline */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium text-[#222222] mb-4 leading-tight tracking-tight">
            Discover unique finds in Armenia
          </h1>

          <p className="text-base md:text-lg text-[#595959] mb-8 max-w-lg">
            Shop from thousands of local sellers. Find everything from handmade crafts to electronics, all in one place.
          </p>

          {/* Search bar */}
          <div className="max-w-xl mb-6">
            <div className="flex border border-[#222222] bg-white overflow-hidden focus-within:ring-1 focus-within:ring-[#222222] transition-all">
              <div className="flex-1 flex items-center">
                <svg
                  className="w-5 h-5 ml-4 text-[#757575]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for anything..."
                  className="flex-1 px-4 py-4 focus:outline-none text-[#222222] placeholder-[#757575] text-base"
                />
              </div>
              <button className="bg-[#222222] hover:bg-[#333333] px-8 text-white font-medium transition-colors text-sm tracking-wide">
                Search
              </button>
            </div>
          </div>

          {/* Popular searches */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#757575] uppercase tracking-wide">Popular:</span>
            {popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => setSearchQuery(term)}
                className="px-3 py-1.5 border border-[#D4D4D4] text-xs text-[#595959] hover:border-[#222222] hover:text-[#222222] transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl">
          {[
            { value: '50K+', label: 'Active Listings' },
            { value: '10K+', label: 'Verified Sellers' },
            { value: '100K+', label: 'Happy Customers' },
            { value: '11', label: 'Regions Covered' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl md:text-3xl font-medium text-[#222222]">{stat.value}</div>
              <div className="text-xs text-[#757575] mt-1 uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

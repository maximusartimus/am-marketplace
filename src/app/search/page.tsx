'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SearchFilters, FilterState } from '@/components/search/SearchFilters';
import { FavoriteButton } from '@/components/listings/FavoriteButton';
import { supabase } from '@/lib/supabase';
import { Promotion, isPromotionActive } from '@/lib/promotions';

interface ListingImage {
  url: string;
  is_primary: boolean;
  position: number;
}

interface Listing {
  id: string;
  title_en: string;
  price: number;
  currency: string;
  condition: string;
  listing_images: ListingImage[];
  store: {
    name: string;
    slug: string;
    location_country: string | null;
    average_rating: number | null;
  } | null;
  listing_promotions?: Promotion[];
}

const conditionLabels: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-[#E8F5E9] text-[#2E7D32]' },
  like_new: { label: 'Like New', color: 'bg-[#E3F2FD] text-[#1976D2]' },
  used: { label: 'Used', color: 'bg-[#FFF3E0] text-[#F56400]' },
  parts: { label: 'For Parts', color: 'bg-[#FFEBEE] text-[#D32F2F]' },
};

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    currency: (searchParams.get('currency') as 'AMD' | 'USD') || 'AMD',
    conditions: searchParams.get('conditions')?.split(',').filter(Boolean) || [],
    country: searchParams.get('country') || '',
    onSale: searchParams.get('onSale') === 'true',
  });

  const fetchListings = useCallback(async (filters: FilterState) => {
    setLoading(true);
    try {
      const now = new Date().toISOString();
      
      // Start building the query (exclude listings from deleted stores)
      let queryBuilder = supabase
        .from('listings')
        .select(`
          id,
          title_en,
          title_hy,
          description_en,
          description_hy,
          price,
          currency,
          condition,
          location_region,
          category_id,
          categories!inner(slug),
          listing_images(url, is_primary, position),
          store:stores!inner(name, slug, location_country, average_rating, deleted_at),
          listing_promotions(*)
        `, { count: 'exact' })
        .eq('status', 'active')
        .is('stores.deleted_at', null);

      // Apply text search if query exists
      if (query) {
        queryBuilder = queryBuilder.or(`title_en.ilike.%${query}%,title_hy.ilike.%${query}%,description_en.ilike.%${query}%,description_hy.ilike.%${query}%`);
      }

      // Apply category filter
      if (filters.category) {
        queryBuilder = queryBuilder.eq('categories.slug', filters.category);
      }

      // Apply price filters based on selected currency
      if (filters.minPrice || filters.maxPrice) {
        // Filter by the selected currency
        queryBuilder = queryBuilder.eq('currency', filters.currency);
        
        if (filters.minPrice) {
          queryBuilder = queryBuilder.gte('price', parseFloat(filters.minPrice));
        }
        if (filters.maxPrice) {
          queryBuilder = queryBuilder.lte('price', parseFloat(filters.maxPrice));
        }
      }

      // Apply condition filter
      if (filters.conditions.length > 0) {
        queryBuilder = queryBuilder.in('condition', filters.conditions);
      }

      // Apply country filter (filters by store's location_country)
      if (filters.country) {
        queryBuilder = queryBuilder.eq('stores.location_country', filters.country);
      }

      // Order by created_at
      queryBuilder = queryBuilder.order('created_at', { ascending: false });

      const { data, error, count } = await queryBuilder;

      if (error) {
        console.error('Error fetching listings:', error);
        setListings([]);
        setTotalCount(0);
        return;
      }

      // Transform data to include store as object instead of array
      let transformedData = (data || []).map(item => ({
        ...item,
        store: Array.isArray(item.store) ? item.store[0] || null : item.store,
        listing_promotions: item.listing_promotions || [],
      })) as Listing[];

      // Filter by active promotions if onSale is true
      if (filters.onSale) {
        transformedData = transformedData.filter(listing => {
          const activePromotion = listing.listing_promotions?.find(p => isPromotionActive(p));
          return !!activePromotion;
        });
      }

      setListings(transformedData);
      setTotalCount(filters.onSale ? transformedData.length : (count || 0));
    } catch (err) {
      console.error('Error:', err);
      setListings([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [query]);

  // Fetch listings on mount and when query/filters change
  useEffect(() => {
    fetchListings(currentFilters);
  }, [fetchListings, currentFilters]);

  // Handle filter changes
  const handleApplyFilters = (filters: FilterState) => {
    setCurrentFilters(filters);
    
    // Update URL with filters
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (filters.category) params.set('category', filters.category);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.currency !== 'AMD') params.set('currency', filters.currency);
    if (filters.conditions.length > 0) params.set('conditions', filters.conditions.join(','));
    if (filters.country) params.set('country', filters.country);
    if (filters.onSale) params.set('onSale', 'true');
    
    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  const getPrimaryImage = (images: ListingImage[]): string | null => {
    if (!images || images.length === 0) return null;
    const primary = images.find(img => img.is_primary) || images.find(img => img.position === 0) || images[0];
    return primary?.url || null;
  };

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'USD') {
      return `$${price.toLocaleString()}`;
    }
    return `֏${price.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />
      
      <main className="flex-1">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-[#757575] mb-6">
            <Link href="/" className="hover:text-[#222222]">Home</Link>
            <span>/</span>
            <span className="text-[#222222]">Search Results</span>
          </nav>

          {/* Page header */}
          <div className="mb-6">
            <h1 className="text-2xl font-medium text-[#222222]">
              {query ? `Search results for "${query}"` : 'All Listings'}
            </h1>
            <p className="text-[#757575] mt-1">
              {loading ? 'Searching...' : `${totalCount} result${totalCount !== 1 ? 's' : ''} found`}
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Filters sidebar */}
            <aside className="w-full md:w-64 flex-shrink-0">
              <SearchFilters
                onApplyFilters={handleApplyFilters}
                initialFilters={currentFilters}
                showCategoryFilter={true}
              />
            </aside>

            {/* Results */}
            <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white animate-pulse">
                      <div className="aspect-square bg-[#F5F5F5]" />
                      <div className="p-4">
                        <div className="h-4 bg-[#F5F5F5] rounded w-3/4 mb-2" />
                        <div className="h-3 bg-[#F5F5F5] rounded w-1/2 mb-2" />
                        <div className="h-4 bg-[#F5F5F5] rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : listings.length === 0 ? (
                <div className="bg-white border border-[#E5E5E5] p-12 text-center">
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-[#222222] mb-1">No results found</h3>
                  <p className="text-[#757575] text-sm">
                    {query 
                      ? `We couldn't find any listings matching "${query}"`
                      : 'Try adjusting your filters or search for something else'
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {listings.map((listing) => {
                    const condition = conditionLabels[listing.condition];
                    const primaryImage = getPrimaryImage(listing.listing_images);
                    const activePromotion = listing.listing_promotions?.find(p => isPromotionActive(p));
                    const currencySymbol = listing.currency === 'AMD' ? '֏' : '$';

                    return (
                      <Link
                        key={listing.id}
                        href={`/listing/${listing.id}`}
                        className="group bg-white border border-[#E5E5E5] hover:border-[#222222] hover:shadow-md transition-all overflow-hidden"
                      >
                        {/* Image */}
                        <div className="aspect-square relative overflow-hidden bg-[#F5F5F5]">
                          {primaryImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={primaryImage}
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

                          {/* Sale Badge */}
                          {activePromotion && (
                            <div className="absolute top-2 left-2 z-10">
                              <span className="px-2 py-0.5 text-xs font-bold bg-[#F56400] text-white">
                                SALE
                              </span>
                            </div>
                          )}

                          {/* Condition Badge */}
                          {condition && (
                            <div className={`absolute left-2 ${activePromotion ? 'top-9' : 'top-2'}`}>
                              <span className={`px-2 py-0.5 text-xs font-medium ${condition.color}`}>
                                {condition.label}
                              </span>
                            </div>
                          )}

                          {/* Favorite Button */}
                          <div className="absolute top-2 right-2">
                            <FavoriteButton listingId={listing.id} size="small" />
                          </div>

                          {/* Discount Badge */}
                          {activePromotion && (
                            <div className="absolute bottom-2 left-2 bg-[#F56400] text-white text-xs font-bold px-1.5 py-0.5">
                              -{activePromotion.discount_percent}%
                            </div>
                          )}

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
                          
                          {listing.store && (
                            <p className="text-xs text-[#757575] mt-1 flex items-center gap-1">
                              <span>{listing.store.name}</span>
                              {listing.store.average_rating && listing.store.average_rating > 0 && (
                                <span className="inline-flex items-center text-[#F56400]">
                                  <span>★</span>
                                  <span className="ml-0.5">{listing.store.average_rating.toFixed(1)}</span>
                                </span>
                              )}
                            </p>
                          )}
                          
                          {/* Price - with sale display */}
                          {activePromotion ? (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-xs text-[#757575] line-through">
                                {currencySymbol}{activePromotion.original_price.toLocaleString()}
                              </span>
                              <span className="font-bold text-[#F56400]">
                                {currencySymbol}{activePromotion.sale_price.toLocaleString()}
                              </span>
                            </div>
                          ) : (
                            <p className="font-bold text-[#222222] mt-2">
                              {formatPrice(listing.price, listing.currency)}
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
        <Header />
        <main className="flex-1">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-[#E5E5E5] rounded w-64 mb-4" />
              <div className="h-4 bg-[#E5E5E5] rounded w-32" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}

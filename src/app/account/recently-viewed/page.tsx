'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/layout/Header';
import { ListingCard } from '@/components/listings/ListingCard';

interface ListingImage {
  id: string;
  url: string;
  position: number;
  is_primary: boolean;
}

interface Store {
  name: string;
  slug: string;
  is_verified?: boolean;
  average_rating?: number;
  total_reviews?: number;
}

interface Listing {
  id: string;
  title_en: string;
  price: number;
  currency: string;
  condition: 'new' | 'like_new' | 'used' | 'parts';
  status: string;
  store: Store;
  listing_images: ListingImage[];
}

interface RecentlyViewedItem {
  listing_id: string;
  viewed_at: string;
  listing: Listing;
}

function RecentlyViewedContent() {
  const { user } = useAuth();
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    async function fetchRecentlyViewed() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await supabase
          .from('recently_viewed')
          .select('listing_id, viewed_at, listing:listings(id, title_en, price, currency, condition, status, store:stores(name, slug, is_verified, average_rating, total_reviews), listing_images(id, url, position, is_primary))')
          .eq('user_id', user.id)
          .order('viewed_at', { ascending: false })
          .limit(50);

        if (data) {
          // Filter out listings that are no longer active
          const activeItems = data.filter(
            (item) => item.listing && (item.listing as unknown as Listing).status === 'active'
          ) as unknown as RecentlyViewedItem[];
          setItems(activeItems);
        }
      } catch {
        // Fail silently
      } finally {
        setLoading(false);
      }
    }

    fetchRecentlyViewed();
  }, [user]);

  const handleClearHistory = async () => {
    if (!user || clearing) return;

    setClearing(true);
    try {
      await supabase
        .from('recently_viewed')
        .delete()
        .eq('user_id', user.id);

      setItems([]);
    } catch {
      // Fail silently
    } finally {
      setClearing(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#222222] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-sm text-[#757575]">Loading recently viewed...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#F5F5F5]">
        {/* Page Title */}
        <div className="bg-white border-b border-[#E5E5E5]">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <nav className="flex items-center gap-2 text-sm text-[#757575] mb-2">
                  <Link href="/account" className="hover:text-[#222222]">Account</Link>
                  <span>/</span>
                  <span className="text-[#222222]">Recently Viewed</span>
                </nav>
                <h1 className="text-2xl md:text-3xl font-semibold text-[#222222]">Recently Viewed</h1>
                <p className="text-[#757575] mt-1">
                  {items.length > 0 
                    ? `${items.length} listing${items.length === 1 ? '' : 's'} you've viewed`
                    : 'Listings you view will appear here'
                  }
                </p>
              </div>
              {items.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  disabled={clearing}
                  className="px-4 py-2 border border-[#E5E5E5] hover:border-[#D32F2F] hover:bg-[#FFEBEE] hover:text-[#D32F2F] text-[#757575] text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {clearing ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Clearing...
                    </span>
                  ) : (
                    'Clear History'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8">
          {items.length === 0 ? (
            <div className="bg-white border border-[#E5E5E5] p-12 text-center">
              <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#757575]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-[#222222] mb-2">No recently viewed listings</h2>
              <p className="text-[#757575] mb-6">Start browsing to see your viewing history here.</p>
              <Link
                href="/search"
                className="inline-block px-6 py-3 bg-[#222222] text-white font-medium hover:bg-[#333333] transition-colors"
              >
                Browse Listings
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {items.map((item) => (
                <ListingCard
                  key={item.listing_id}
                  listing={item.listing}
                  showStore={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function RecentlyViewedPage() {
  return (
    <ProtectedRoute>
      <RecentlyViewedContent />
    </ProtectedRoute>
  );
}


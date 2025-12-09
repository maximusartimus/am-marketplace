'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

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
  listing_images: ListingImage[];
  store?: {
    name: string;
    slug: string;
  };
}

interface Favorite {
  id: string;
  listing_id: string;
  created_at: string;
  listing: Listing;
}

const conditionLabels: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-[#E8F5E9] text-[#2E7D32]' },
  like_new: { label: 'Like New', color: 'bg-[#E3F2FD] text-[#1976D2]' },
  used: { label: 'Used', color: 'bg-[#FFF3E0] text-[#F56400]' },
  parts: { label: 'For Parts', color: 'bg-[#FFEBEE] text-[#D32F2F]' },
};

function FavoritesContent() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFavorites() {
      if (!user) return;

      try {
        const { data, error: fetchError } = await supabase
          .from('favorites')
          .select('*, listing:listings(*, store:stores(name, slug), listing_images(*))')
          .eq('user_id', user.id);

        if (fetchError) {
          console.error('Error fetching favorites:', fetchError);
          setError('Failed to load favorites');
          return;
        }

        // Filter out favorites where listing is null (deleted listings)
        const validFavorites = (data || []).filter(
          (fav: Favorite) => fav.listing !== null
        ) as Favorite[];

        setFavorites(validFavorites);
      } catch (err) {
        console.error('Error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, [user]);

  const handleRemoveFavorite = async (favoriteId: string, listingId: string) => {
    if (!user) return;

    setRemovingId(favoriteId);

    try {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listingId);

      setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId));
    } catch (err) {
      console.error('Error removing favorite:', err);
    } finally {
      setRemovingId(null);
    }
  };

  const getPrimaryImage = (images: ListingImage[]): string | null => {
    if (!images || images.length === 0) return null;
    const primary = images.find((img) => img.is_primary) || images[0];
    return primary?.url || null;
  };

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'USD') {
      return `$${price.toLocaleString()}`;
    }
    return `֏${price.toLocaleString()}`;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#222222] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-sm text-[#757575]">Loading favorites...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#F5F5F5]">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-12">
            <div className="bg-white border border-[#E5E5E5] p-8 text-center">
              <div className="w-16 h-16 bg-[#FFEBEE] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#D32F2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-[#222222] mb-2">Unable to Load Favorites</h2>
              <p className="text-[#757575] mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-[#222222] text-white hover:bg-[#333333] transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
        <Footer />
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
            <nav className="flex items-center gap-2 text-sm text-[#757575] mb-4">
              <Link href="/" className="hover:text-[#222222]">Home</Link>
              <span>/</span>
              <Link href="/account" className="hover:text-[#222222]">Account</Link>
              <span>/</span>
              <span className="text-[#222222]">Favorites</span>
            </nav>
            <h1 className="text-2xl md:text-3xl font-semibold text-[#222222]">My Favorites</h1>
            <p className="text-[#757575] mt-1">
              {favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8">
          {favorites.length === 0 ? (
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
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <h3 className="text-lg font-medium text-[#222222] mb-1">No favorites yet</h3>
              <p className="text-[#757575] text-sm mb-6">
                Start browsing and save listings you like by clicking the heart icon.
              </p>
              <Link
                href="/search"
                className="inline-block px-6 py-3 bg-[#F56400] hover:bg-[#D95700] text-white font-medium transition-colors"
              >
                Browse Listings
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {favorites.map((favorite) => {
                const listing = favorite.listing;
                const condition = conditionLabels[listing.condition];
                const primaryImage = getPrimaryImage(listing.listing_images);

                return (
                  <div
                    key={favorite.id}
                    className="group bg-white border border-[#E5E5E5] hover:border-[#222222] hover:shadow-md transition-all overflow-hidden relative"
                  >
                    <Link href={`/listing/${listing.id}`}>
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

                        {/* Condition Badge */}
                        {condition && (
                          <div className="absolute top-2 left-2">
                            <span className={`px-2 py-0.5 text-xs font-medium ${condition.color}`}>
                              {condition.label}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="p-4">
                        <h3 className="font-medium text-[#222222] text-sm line-clamp-2 leading-snug min-h-[2.5rem]">
                          {listing.title_en}
                        </h3>

                        {listing.store && (
                          <p className="text-xs text-[#757575] mt-1">
                            {listing.store.name}
                          </p>
                        )}

                        <p className="font-bold text-[#222222] mt-2">
                          {formatPrice(listing.price, listing.currency)}
                        </p>
                      </div>
                    </Link>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveFavorite(favorite.id, listing.id)}
                      disabled={removingId === favorite.id}
                      className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-md transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remove from favorites"
                      aria-label="Remove from favorites"
                    >
                      {removingId === favorite.id ? (
                        <div className="w-4 h-4 border-2 border-[#F56400] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg
                          className="w-4 h-4 text-[#F56400]"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function FavoritesPage() {
  return (
    <ProtectedRoute>
      <FavoritesContent />
    </ProtectedRoute>
  );
}

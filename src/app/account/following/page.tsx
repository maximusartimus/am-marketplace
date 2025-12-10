'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/layout/Header';

interface FollowedStore {
  id: string;
  store_id: string;
  created_at: string;
  store: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    is_verified: boolean;
  };
  follower_count: number;
}

function formatFollowerCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return count.toString();
}

function FollowingContent() {
  const { user } = useAuth();
  const [followedStores, setFollowedStores] = useState<FollowedStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unfollowingId, setUnfollowingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFollowedStores() {
      if (!user) return;

      setLoading(true);
      try {
        // Fetch stores the user follows
        const { data: followData, error: followError } = await supabase
          .from('store_followers')
          .select(`
            id,
            store_id,
            created_at,
            store:stores(id, name, slug, logo, is_verified)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (followError) {
          console.error('Error fetching followed stores:', followError);
          setError('Failed to load followed stores');
          return;
        }

        // Get follower counts for each store
        if (followData && followData.length > 0) {
          const storeIds = followData.map(f => f.store_id);
          
          // Fetch all follower counts in parallel
          const countPromises = storeIds.map(async (storeId) => {
            const { count } = await supabase
              .from('store_followers')
              .select('*', { count: 'exact', head: true })
              .eq('store_id', storeId);
            return { storeId, count: count || 0 };
          });

          const counts = await Promise.all(countPromises);
          const countMap = Object.fromEntries(counts.map(c => [c.storeId, c.count]));

          // Merge data
          const storesWithCounts = followData
            .filter(f => f.store) // Filter out any null stores
            .map(f => ({
              ...f,
              store: f.store as FollowedStore['store'],
              follower_count: countMap[f.store_id] || 0,
            }));

          setFollowedStores(storesWithCounts);
        } else {
          setFollowedStores([]);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchFollowedStores();
  }, [user]);

  const handleUnfollow = async (storeId: string, followId: string) => {
    if (!user) return;

    setUnfollowingId(followId);
    try {
      const { error } = await supabase
        .from('store_followers')
        .delete()
        .eq('store_id', storeId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error unfollowing:', error);
        return;
      }

      // Remove from list
      setFollowedStores(prev => prev.filter(f => f.id !== followId));
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setUnfollowingId(null);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#222222] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-sm text-[#757575]">Loading followed stores...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#F5F5F5]">
          <div className="max-w-2xl mx-auto px-4 py-12">
            <div className="bg-white border border-[#E5E5E5] p-8 text-center">
              <div className="w-16 h-16 bg-[#FFEBEE] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#D32F2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-[#222222] mb-2">Unable to Load</h2>
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
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#F5F5F5]">
        {/* Page Title */}
        <div className="bg-white border-b border-[#E5E5E5]">
          <div className="max-w-2xl mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Link
                href="/account"
                className="p-2 hover:bg-[#F5F5F5] transition-colors -ml-2"
              >
                <svg className="w-5 h-5 text-[#757575]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-[#222222]">Following</h1>
                <p className="text-[#757575] mt-1">
                  {followedStores.length} {followedStores.length === 1 ? 'store' : 'stores'} you follow
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8">
          {followedStores.length > 0 ? (
            <div className="space-y-4">
              {followedStores.map((follow) => (
                <div 
                  key={follow.id} 
                  className="bg-white border border-[#E5E5E5] p-4 flex items-center gap-4"
                >
                  {/* Store Logo */}
                  <Link href={`/store/${follow.store.slug}`} className="flex-shrink-0">
                    {follow.store.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={follow.store.logo}
                        alt={follow.store.name}
                        className="w-14 h-14 rounded-full object-cover border border-[#E5E5E5]"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-[#F5F5F5] flex items-center justify-center border border-[#E5E5E5]">
                        <span className="text-xl font-bold text-[#222222]">
                          {follow.store.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Store Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/store/${follow.store.slug}`}>
                      <h3 className="font-semibold text-[#222222] hover:text-[#F56400] transition-colors flex items-center gap-1 truncate">
                        {follow.store.name}
                        {follow.store.is_verified && (
                          <svg className="w-4 h-4 text-[#1976D2] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </h3>
                    </Link>
                    <p className="text-sm text-[#757575]">
                      {formatFollowerCount(follow.follower_count)} {follow.follower_count === 1 ? 'follower' : 'followers'}
                    </p>
                  </div>

                  {/* Unfollow Button */}
                  <button
                    onClick={() => handleUnfollow(follow.store_id, follow.id)}
                    disabled={unfollowingId === follow.id}
                    className="flex-shrink-0 px-4 py-2 bg-[#F56400] text-white text-sm font-medium hover:bg-[#D95700] transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {unfollowingId === follow.id ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Following
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white border border-[#E5E5E5] p-12 text-center">
              <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#757575]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[#222222] mb-2">Not following any stores yet</h3>
              <p className="text-[#757575] mb-6 max-w-sm mx-auto">
                When you follow stores, they&apos;ll appear here so you can easily keep up with their latest listings.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#222222] hover:bg-[#333333] transition-colors font-medium text-white"
              >
                Browse Stores
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function FollowingPage() {
  return (
    <ProtectedRoute>
      <FollowingContent />
    </ProtectedRoute>
  );
}

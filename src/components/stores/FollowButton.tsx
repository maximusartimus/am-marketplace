'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface FollowButtonProps {
  storeId: string;
  storeOwnerId: string;
  showCount?: boolean;
  size?: 'small' | 'medium';
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

export function FollowButton({ storeId, storeOwnerId, showCount = true, size = 'medium' }: FollowButtonProps) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Check if current user is the store owner
  const isOwner = user?.id === storeOwnerId;

  // Fetch follow status and count
  const fetchFollowData = useCallback(async () => {
    setLoading(true);
    try {
      // Get follower count
      const { count, error: countError } = await supabase
        .from('store_followers')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', storeId);

      if (countError) {
        console.error('Error fetching follower count:', countError);
      } else {
        setFollowerCount(count || 0);
      }

      // Check if current user is following
      if (user) {
        const { data, error: followError } = await supabase
          .from('store_followers')
          .select('id')
          .eq('store_id', storeId)
          .eq('user_id', user.id)
          .single();

        if (followError && followError.code !== 'PGRST116') {
          console.error('Error checking follow status:', followError);
        }
        setIsFollowing(!!data);
      }
    } catch (err) {
      console.error('Error fetching follow data:', err);
    } finally {
      setLoading(false);
    }
  }, [storeId, user]);

  useEffect(() => {
    fetchFollowData();
  }, [fetchFollowData]);

  const handleFollow = async () => {
    if (!user) {
      // Redirect to sign in
      window.location.href = '/auth/signin';
      return;
    }

    setActionLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('store_followers')
          .delete()
          .eq('store_id', storeId)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error unfollowing:', error);
          return;
        }
        setIsFollowing(false);
        setFollowerCount(prev => Math.max(0, prev - 1));
      } else {
        // Follow
        const { error } = await supabase
          .from('store_followers')
          .insert({ store_id: storeId, user_id: user.id });

        if (error) {
          if (error.code === '23505') {
            // Already following (constraint violation)
            setIsFollowing(true);
          } else {
            console.error('Error following:', error);
          }
          return;
        }
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);

        // Create notification for the store owner (don't block on failure)
        try {
          // Don't notify yourself
          if (storeOwnerId !== user.id) {
            // Get store slug for the notification link
            const { data: storeData } = await supabase
              .from('stores')
              .select('slug')
              .eq('id', storeId)
              .single();

            const followerName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Someone';
            
            await supabase.from('notifications').insert({
              user_id: storeOwnerId,
              type: 'new_follower',
              title: `${followerName} started following your store`,
              body: null,
              link: `/store/${storeData?.slug || storeId}`,
              related_id: storeId,
            });
          }
        } catch (notifError) {
          // Fail silently - don't block follow action
          console.error('Failed to create notification:', notifError);
        }
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Don't show for store owner
  if (isOwner) {
    // Show follower count only for owner
    if (showCount && followerCount > 0) {
      return (
        <span className="text-sm text-[#757575]">
          {formatFollowerCount(followerCount)} {followerCount === 1 ? 'follower' : 'followers'}
        </span>
      );
    }
    return null;
  }

  // Don't show button while loading auth (but show count)
  if (loading) {
    return (
      <div className="flex items-center gap-2">
        {showCount && (
          <span className="text-sm text-[#757575]">
            <span className="inline-block w-8 h-4 bg-[#E5E5E5] animate-pulse rounded" />
          </span>
        )}
        <div className={`${size === 'small' ? 'px-3 py-1' : 'px-4 py-2'} border border-[#E5E5E5] bg-[#F5F5F5] animate-pulse`}>
          <span className={`${size === 'small' ? 'text-xs' : 'text-sm'} text-transparent`}>Follow</span>
        </div>
      </div>
    );
  }

  const sizeClasses = size === 'small' 
    ? 'px-3 py-1 text-xs gap-1' 
    : 'px-4 py-2 text-sm gap-1.5';

  return (
    <div className="flex items-center gap-2">
      {showCount && followerCount > 0 && (
        <span className="text-sm text-[#757575]">
          {formatFollowerCount(followerCount)} {followerCount === 1 ? 'follower' : 'followers'}
        </span>
      )}
      <button
        onClick={handleFollow}
        disabled={actionLoading}
        className={`inline-flex items-center font-medium transition-colors disabled:opacity-50 ${sizeClasses} ${
          isFollowing
            ? 'bg-[#F56400] text-white hover:bg-[#D95700] border border-[#F56400]'
            : 'bg-white text-[#222222] border border-[#222222] hover:bg-[#222222] hover:text-white'
        }`}
      >
        {actionLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : isFollowing ? (
          <>
            <svg className={`${size === 'small' ? 'w-3 h-3' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Following
          </>
        ) : (
          <>
            <svg className={`${size === 'small' ? 'w-3 h-3' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Follow
          </>
        )}
      </button>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface FavoriteButtonProps {
  listingId: string;
  size?: 'small' | 'large';
  className?: string;
}

export function FavoriteButton({ listingId, size = 'small', className = '' }: FavoriteButtonProps) {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function checkFavorite() {
      if (!user) {
        setIsFavorited(false);
        return;
      }

      try {
        const { data } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('listing_id', listingId)
          .single();

        setIsFavorited(!!data);
      } catch {
        // Not favorited or error - treat as not favorited
        setIsFavorited(false);
      }
    }

    checkFavorite();
  }, [user, listingId]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // Redirect to sign in
      window.location.href = '/auth/signin';
      return;
    }

    setIsLoading(true);

    try {
      if (isFavorited) {
        // Remove favorite
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listingId);
        
        setIsFavorited(false);
      } else {
        // Add favorite
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, listing_id: listingId });
        
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = size === 'large' 
    ? 'w-12 h-12' 
    : 'w-8 h-8';
  
  const iconSize = size === 'large' ? 'w-6 h-6' : 'w-4 h-4';

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`${sizeClasses} flex items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-md transition-all ${
        isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
      } ${className}`}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isLoading ? (
        <div className={`${iconSize} border-2 border-[#F56400] border-t-transparent rounded-full animate-spin`} />
      ) : isFavorited ? (
        <svg
          className={`${iconSize} text-[#F56400]`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ) : (
        <svg
          className={`${iconSize} text-[#757575] hover:text-[#F56400]`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )}
    </button>
  );
}




'use client';

interface StoreBadgesProps {
  is_verified?: boolean;
  is_top_seller?: boolean;
  is_featured?: boolean;
  size?: 'small' | 'medium' | 'large';
  showLabels?: boolean;
}

// Verified Badge - Blue checkmark
function VerifiedBadge({ size, showLabel }: { size: 'small' | 'medium' | 'large'; showLabel: boolean }) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6',
  };

  return (
    <span
      className="inline-flex items-center gap-1 group relative"
      title="Verified Seller"
    >
      <svg
        className={`${sizeClasses[size]} text-[#1976D2]`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      {showLabel && (
        <span className="text-xs font-medium text-[#1976D2]">Verified</span>
      )}
      {/* Tooltip */}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-[#222222] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
        Verified Seller
      </span>
    </span>
  );
}

// Top Seller Badge - Orange star/award
function TopSellerBadge({ size, showLabel }: { size: 'small' | 'medium' | 'large'; showLabel: boolean }) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6',
  };

  return (
    <span
      className="inline-flex items-center gap-1 group relative"
      title="Top Seller"
    >
      <svg
        className={`${sizeClasses[size]} text-[#F56400]`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      {showLabel && (
        <span className="text-xs font-medium text-[#F56400]">Top Seller</span>
      )}
      {/* Tooltip */}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-[#222222] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
        Top Seller
      </span>
    </span>
  );
}

// Featured Badge - Gold/purple sparkle
function FeaturedBadge({ size, showLabel }: { size: 'small' | 'medium' | 'large'; showLabel: boolean }) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6',
  };

  return (
    <span
      className="inline-flex items-center gap-1 group relative"
      title="Featured Store"
    >
      <svg
        className={`${sizeClasses[size]} text-[#9C27B0]`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
          clipRule="evenodd"
        />
      </svg>
      {showLabel && (
        <span className="text-xs font-medium text-[#9C27B0]">Featured</span>
      )}
      {/* Tooltip */}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-[#222222] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
        Featured Store
      </span>
    </span>
  );
}

// Small verified checkmark for inline use (e.g., in ListingCard)
export function VerifiedCheckmark({ className = '' }: { className?: string }) {
  return (
    <span className="inline-flex items-center group relative" title="Verified">
      <svg
        className={`w-3.5 h-3.5 text-[#1976D2] ${className}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 text-xs text-white bg-[#222222] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
        Verified
      </span>
    </span>
  );
}

// Main StoreBadges component
// Note: is_featured prop is accepted but not displayed publicly.
// Featured functionality will be expanded later with a payment system.
export function StoreBadges({ 
  is_verified = false, 
  is_top_seller = false, 
  is_featured = false, // Kept for API compatibility, not displayed publicly
  size = 'medium',
  showLabels = false,
}: StoreBadgesProps) {
  // Only show Verified and Top Seller badges publicly
  const hasBadges = is_verified || is_top_seller;

  if (!hasBadges) {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      {is_verified && <VerifiedBadge size={size} showLabel={showLabels} />}
      {is_top_seller && <TopSellerBadge size={size} showLabel={showLabels} />}
      {/* Featured badge hidden from public display - will be enabled with payment system */}
    </span>
  );
}

export default StoreBadges;

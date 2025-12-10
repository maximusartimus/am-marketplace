// Promotion types and helper functions

export interface Promotion {
  id: string;
  listing_id: string;
  original_price: number;
  sale_price: number;
  discount_percent: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

// Check if a promotion is currently active
export function isPromotionActive(promotion: Promotion | null | undefined): boolean {
  if (!promotion || !promotion.is_active) return false;
  const now = new Date();
  return new Date(promotion.start_date) <= now && new Date(promotion.end_date) >= now;
}

// Calculate discount percentage
export function calculateDiscountPercent(originalPrice: number, salePrice: number): number {
  if (originalPrice <= 0) return 0;
  return Math.round((1 - salePrice / originalPrice) * 100);
}

// Calculate sale price from discount percentage
export function calculateSalePrice(originalPrice: number, discountPercent: number): number {
  return Math.round(originalPrice * (1 - discountPercent / 100));
}

// Format time remaining for a sale
export function formatSaleTimeRemaining(endDate: string): string {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end.getTime() - now.getTime();
  
  if (diff <= 0) return 'Ended';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) {
    return days === 1 ? '1 day left' : `${days} days left`;
  }
  if (hours > 0) {
    return hours === 1 ? '1 hour left' : `${hours} hours left`;
  }
  
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return minutes <= 1 ? 'Less than a minute' : `${minutes} minutes left`;
}

// Format end date for display
export function formatSaleEndDate(endDate: string): string {
  return new Date(endDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Duration presets in days
export const DURATION_PRESETS = [
  { label: '1 day', days: 1 },
  { label: '2 days', days: 2 },
  { label: '3 days', days: 3 },
  { label: '1 week', days: 7 },
  { label: '2 weeks', days: 14 },
  { label: '1 month', days: 30 },
] as const;

// Discount presets
export const DISCOUNT_PRESETS = [5, 10, 15, 20, 25, 30, 50] as const;

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Promotion,
  isPromotionActive,
  calculateDiscountPercent,
  calculateSalePrice,
  formatSaleEndDate,
  formatSaleTimeRemaining,
  DURATION_PRESETS,
  DISCOUNT_PRESETS,
} from '@/lib/promotions';

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  currentPrice: number;
  currency: string;
  existingPromotion?: Promotion | null;
  onSaleUpdated: () => void;
}

export function SaleModal({
  isOpen,
  onClose,
  listingId,
  currentPrice,
  currency,
  existingPromotion,
  onSaleUpdated,
}: SaleModalProps) {
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<number>(currentPrice);
  const [customDiscount, setCustomDiscount] = useState<string>('');
  const [customSalePrice, setCustomSalePrice] = useState<string>('');
  const [isCustom, setIsCustom] = useState(false);
  const [durationDays, setDurationDays] = useState<number>(7);
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEndingSale, setIsEndingSale] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currencySymbol = currency === 'AMD' ? '֏' : '$';
  const hasActiveSale = existingPromotion && isPromotionActive(existingPromotion);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && !hasActiveSale) {
      setDiscountPercent(0);
      setSalePrice(currentPrice);
      setCustomDiscount('');
      setCustomSalePrice('');
      setIsCustom(false);
      setDurationDays(7);
      setCustomEndDate('');
      setIsCustomDuration(false);
      setError(null);
    }
  }, [isOpen, currentPrice, hasActiveSale]);

  const handleDiscountPresetClick = (percent: number) => {
    setIsCustom(false);
    setDiscountPercent(percent);
    setSalePrice(calculateSalePrice(currentPrice, percent));
    setCustomDiscount('');
    setCustomSalePrice('');
    setError(null);
  };

  const handleCustomDiscountChange = (value: string) => {
    setCustomDiscount(value);
    setCustomSalePrice('');
    setIsCustom(true);
    const percent = parseFloat(value);
    if (!isNaN(percent) && percent > 0 && percent < 100) {
      setDiscountPercent(percent);
      setSalePrice(calculateSalePrice(currentPrice, percent));
      setError(null);
    }
  };

  const handleCustomSalePriceChange = (value: string) => {
    setCustomSalePrice(value);
    setCustomDiscount('');
    setIsCustom(true);
    const price = parseFloat(value);
    if (!isNaN(price) && price > 0 && price < currentPrice) {
      setSalePrice(price);
      setDiscountPercent(calculateDiscountPercent(currentPrice, price));
      setError(null);
    }
  };

  const handleDurationPresetClick = (days: number) => {
    setIsCustomDuration(false);
    setDurationDays(days);
    setCustomEndDate('');
    setError(null);
  };

  const handleCustomEndDateChange = (value: string) => {
    setCustomEndDate(value);
    setIsCustomDuration(true);
    setError(null);
  };

  const getEndDate = (): Date => {
    if (isCustomDuration && customEndDate) {
      return new Date(customEndDate);
    }
    const end = new Date();
    end.setDate(end.getDate() + durationDays);
    return end;
  };

  const validateForm = (): boolean => {
    if (salePrice <= 0) {
      setError('Sale price must be greater than 0');
      return false;
    }
    if (salePrice >= currentPrice) {
      setError('Sale price must be less than the original price');
      return false;
    }
    if (discountPercent <= 0 || discountPercent >= 100) {
      setError('Discount must be between 1% and 99%');
      return false;
    }
    const endDate = getEndDate();
    if (endDate <= new Date()) {
      setError('End date must be in the future');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const now = new Date().toISOString();
      const endDate = getEndDate().toISOString();

      // If there's an existing promotion, deactivate it first
      if (existingPromotion) {
        await supabase
          .from('listing_promotions')
          .update({ is_active: false })
          .eq('id', existingPromotion.id);
      }

      // Insert new promotion
      const { error: insertError } = await supabase
        .from('listing_promotions')
        .insert({
          listing_id: listingId,
          original_price: currentPrice,
          sale_price: salePrice,
          discount_percent: Math.round(discountPercent),
          start_date: now,
          end_date: endDate,
          is_active: true,
        });

      if (insertError) {
        console.error('Error creating promotion:', insertError);
        setError('Failed to create sale. Please try again.');
        return;
      }

      onSaleUpdated();
      onClose();
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndSale = async () => {
    if (!existingPromotion) return;

    setIsEndingSale(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('listing_promotions')
        .update({ is_active: false })
        .eq('id', existingPromotion.id);

      if (updateError) {
        console.error('Error ending sale:', updateError);
        setError('Failed to end sale. Please try again.');
        return;
      }

      onSaleUpdated();
      onClose();
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsEndingSale(false);
    }
  };

  if (!isOpen) return null;

  // Get min date for custom end date input (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E5E5E5]">
          <h2 className="text-xl font-semibold text-[#222222]">
            {hasActiveSale ? 'Manage Sale' : 'Add Sale'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F5F5F5] transition-colors"
          >
            <svg className="w-5 h-5 text-[#757575]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Active Sale Info */}
          {hasActiveSale && existingPromotion && (
            <div className="mb-6 p-4 bg-[#FFF3E0] border border-[#F56400] rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-[#F56400]">Active Sale</span>
                <span className="text-sm text-[#F56400] bg-white px-2 py-0.5 rounded">
                  -{existingPromotion.discount_percent}%
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#757575] line-through">
                  {currencySymbol}{existingPromotion.original_price.toLocaleString()}
                </span>
                <span className="font-bold text-[#F56400]">
                  {currencySymbol}{existingPromotion.sale_price.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-[#595959] mt-2">
                {formatSaleTimeRemaining(existingPromotion.end_date)} • Ends {formatSaleEndDate(existingPromotion.end_date)}
              </p>
              <button
                onClick={handleEndSale}
                disabled={isEndingSale}
                className="mt-4 w-full py-2 border border-[#D32F2F] text-[#D32F2F] font-medium hover:bg-[#FFEBEE] transition-colors disabled:opacity-50"
              >
                {isEndingSale ? 'Ending Sale...' : 'End Sale Early'}
              </button>
              <div className="mt-4 pt-4 border-t border-[#F56400]/30">
                <p className="text-sm text-[#757575] text-center">Or create a new sale:</p>
              </div>
            </div>
          )}

          {/* Current Price */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#222222] mb-2">Current Price</label>
            <div className="px-4 py-3 bg-[#F5F5F5] border border-[#E5E5E5] text-[#222222] font-medium">
              {currencySymbol}{currentPrice.toLocaleString()} {currency}
            </div>
          </div>

          {/* Discount Presets */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#222222] mb-2">Discount</label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {DISCOUNT_PRESETS.map((percent) => (
                <button
                  key={percent}
                  type="button"
                  onClick={() => handleDiscountPresetClick(percent)}
                  className={`py-2 text-sm font-medium transition-colors border ${
                    !isCustom && discountPercent === percent
                      ? 'border-[#F56400] bg-[#FFF3E0] text-[#F56400]'
                      : 'border-[#E5E5E5] hover:border-[#222222] text-[#222222]'
                  }`}
                >
                  {percent}%
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setIsCustom(true);
                  setDiscountPercent(0);
                }}
                className={`py-2 text-sm font-medium transition-colors border ${
                  isCustom
                    ? 'border-[#F56400] bg-[#FFF3E0] text-[#F56400]'
                    : 'border-[#E5E5E5] hover:border-[#222222] text-[#222222]'
                }`}
              >
                Custom
              </button>
            </div>

            {/* Custom Inputs */}
            {isCustom && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#757575] mb-1">Discount %</label>
                  <input
                    type="number"
                    value={customDiscount}
                    onChange={(e) => handleCustomDiscountChange(e.target.value)}
                    placeholder="e.g. 15"
                    min="1"
                    max="99"
                    className="w-full px-3 py-2 border border-[#E5E5E5] focus:border-[#222222] focus:outline-none text-[#222222]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#757575] mb-1">or Sale Price</label>
                  <input
                    type="number"
                    value={customSalePrice}
                    onChange={(e) => handleCustomSalePriceChange(e.target.value)}
                    placeholder={`e.g. ${Math.round(currentPrice * 0.8)}`}
                    min="1"
                    max={currentPrice - 1}
                    className="w-full px-3 py-2 border border-[#E5E5E5] focus:border-[#222222] focus:outline-none text-[#222222]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sale Price Preview */}
          {discountPercent > 0 && salePrice > 0 && (
            <div className="mb-6 p-4 bg-[#E8F5E9] border border-[#2E7D32]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#2E7D32] mb-1">Sale Price</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[#757575] line-through text-sm">
                      {currencySymbol}{currentPrice.toLocaleString()}
                    </span>
                    <span className="text-2xl font-bold text-[#2E7D32]">
                      {currencySymbol}{salePrice.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-[#F56400] text-white font-bold text-lg rounded">
                    -{Math.round(discountPercent)}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-[#2E7D32] mt-2">
                Customers save {currencySymbol}{(currentPrice - salePrice).toLocaleString()} {currency}
              </p>
            </div>
          )}

          {/* Duration */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#222222] mb-2">Duration</label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {DURATION_PRESETS.map(({ label, days }) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => handleDurationPresetClick(days)}
                  className={`py-2 text-sm font-medium transition-colors border ${
                    !isCustomDuration && durationDays === days
                      ? 'border-[#222222] bg-[#222222] text-white'
                      : 'border-[#E5E5E5] hover:border-[#222222] text-[#222222]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-xs text-[#757575] mb-1">Or select end date</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => handleCustomEndDateChange(e.target.value)}
                min={minDate}
                className={`w-full px-3 py-2 border focus:border-[#222222] focus:outline-none text-[#222222] ${
                  isCustomDuration ? 'border-[#222222]' : 'border-[#E5E5E5]'
                }`}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-[#FFEBEE] border border-[#D32F2F] text-[#D32F2F] text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-[#E5E5E5] text-[#222222] font-medium hover:bg-[#F5F5F5] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || discountPercent <= 0}
              className="flex-1 py-3 bg-[#F56400] hover:bg-[#D95700] disabled:bg-[#E5E5E5] disabled:text-[#757575] text-white font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                hasActiveSale ? 'Start New Sale' : 'Start Sale'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


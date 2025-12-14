'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

type ReportType = 'listing' | 'store' | 'user';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: ReportType;
  reporterId: string;
  listingId?: string;
  storeId?: string;
  userId?: string;
  targetName?: string;
}

const LISTING_REASONS = [
  'Prohibited item',
  'Counterfeit/fake',
  'Misleading description',
  'Spam',
  'Other',
];

const STORE_REASONS = [
  'Fraudulent store',
  'Harassment',
  'Counterfeit products',
  'Spam',
  'Other',
];

const USER_REASONS = [
  'Harassment',
  'Scam attempt',
  'Spam',
  'Inappropriate behavior',
  'Other',
];

export function ReportModal({
  isOpen,
  onClose,
  reportType,
  reporterId,
  listingId,
  storeId,
  userId,
  targetName,
}: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reasons = reportType === 'listing' 
    ? LISTING_REASONS 
    : reportType === 'store' 
      ? STORE_REASONS 
      : USER_REASONS;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) {
      setError('Please select a reason');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const reportData: Record<string, unknown> = {
        reporter_id: reporterId,
        reason,
        details: details.trim() || null,
      };

      if (reportType === 'listing' && listingId) {
        reportData.listing_id = listingId;
      } else if (reportType === 'store' && storeId) {
        reportData.store_id = storeId;
      } else if (reportType === 'user' && userId) {
        reportData.user_id = userId;
      }

      const { error: insertError } = await supabase
        .from('reports')
        .insert(reportData);

      if (insertError) {
        console.error('Error submitting report:', insertError);
        setError('Failed to submit report. Please try again.');
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setDetails('');
    setSuccess(false);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  const title = reportType === 'listing' 
    ? 'Report Listing' 
    : reportType === 'store' 
      ? 'Report Store' 
      : 'Report User';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          <>
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#2E7D32]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#222222] mb-2">Report Submitted</h3>
              <p className="text-[#757575] mb-6">
                Thank you for your report. We&apos;ll review it shortly.
              </p>
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-[#222222] text-white font-medium hover:bg-[#333333] transition-colors"
              >
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#222222]">{title}</h3>
              <button
                onClick={handleClose}
                className="p-1 text-[#757575] hover:text-[#222222] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {targetName && (
              <p className="text-sm text-[#757575] mb-4">
                Reporting: <span className="font-medium text-[#222222]">{targetName}</span>
              </p>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#222222] mb-2">
                  Reason <span className="text-red-500">*</span>
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E5E5] focus:border-[#222222] focus:outline-none text-[#222222] bg-white"
                >
                  <option value="">Select a reason</option>
                  {reasons.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-[#222222] mb-2">
                  Additional Details (optional)
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Provide any additional information that might help us review this report..."
                  rows={4}
                  className="w-full px-4 py-3 border border-[#E5E5E5] focus:border-[#222222] focus:outline-none text-[#222222] placeholder-[#9E9E9E] resize-none"
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-[#FFEBEE] border border-[#D32F2F] text-[#D32F2F] text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-[#E5E5E5] text-[#222222] font-medium hover:bg-[#F5F5F5] transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !reason}
                  className="px-4 py-2 bg-[#D32F2F] hover:bg-[#B71C1C] disabled:bg-[#E5E5E5] disabled:text-[#757575] text-white font-medium transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Report'
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}


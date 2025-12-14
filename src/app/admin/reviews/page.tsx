'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Review {
  id: string;
  store_id: string;
  listing_id: string | null;
  reviewer_id: string;
  rating: number;
  comment: string | null;
  seller_response: string | null;
  seller_response_at: string | null;
  created_at: string;
  store?: {
    id: string;
    name: string;
    slug: string;
  };
  reviewer?: {
    id: string;
    name: string;
    email: string;
  };
}

type RatingFilter = 'all' | '5' | '4' | '3' | '2' | '1';

const ITEMS_PER_PAGE = 10;

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="tracking-tight">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rating ? 'text-[#F56400]' : 'text-[#D4D4D4]'}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [deleteReview, setDeleteReview] = useState<Review | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('reviews')
        .select(`
          id,
          store_id,
          listing_id,
          reviewer_id,
          rating,
          comment,
          seller_response,
          seller_response_at,
          created_at
        `, { count: 'exact' });

      // Filter by rating
      if (ratingFilter !== 'all') {
        query = query.eq('rating', parseInt(ratingFilter));
      }

      query = query
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      // Fetch store and reviewer info
      if (data && data.length > 0) {
        const storeIds = [...new Set(data.map(r => r.store_id))];
        const reviewerIds = [...new Set(data.map(r => r.reviewer_id))];

        const [storesResult, usersResult] = await Promise.all([
          supabase.from('stores').select('id, name, slug').in('id', storeIds),
          supabase.from('users').select('id, name, email').in('id', reviewerIds),
        ]);

        const storeMap = new Map(storesResult.data?.map(s => [s.id, s]) || []);
        const userMap = new Map(usersResult.data?.map(u => [u.id, u]) || []);

        let reviewsWithData = data.map(review => ({
          ...review,
          store: storeMap.get(review.store_id),
          reviewer: userMap.get(review.reviewer_id),
        }));

        // Client-side search filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          reviewsWithData = reviewsWithData.filter(review => 
            review.store?.name?.toLowerCase().includes(query) ||
            review.reviewer?.name?.toLowerCase().includes(query) ||
            review.reviewer?.email?.toLowerCase().includes(query)
          );
        }

        setReviews(reviewsWithData);
      } else {
        setReviews([]);
      }

      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [ratingFilter, currentPage, searchQuery]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleRatingFilterChange = (rating: RatingFilter) => {
    setRatingFilter(rating);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchReviews();
  };

  const handleDeleteReview = async () => {
    if (!deleteReview) return;

    setDeleteLoading(true);
    try {
      // First delete the review
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', deleteReview.id);

      if (error) throw error;

      // Then update the store's average_rating and total_reviews
      // Fetch remaining reviews for the store
      const { data: remainingReviews, error: fetchError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('store_id', deleteReview.store_id);

      if (fetchError) throw fetchError;

      // Calculate new average
      const totalReviews = remainingReviews?.length || 0;
      const averageRating = totalReviews > 0
        ? remainingReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

      // Update store
      await supabase
        .from('stores')
        .update({
          average_rating: averageRating,
          total_reviews: totalReviews,
        })
        .eq('id', deleteReview.store_id);

      setDeleteReview(null);
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const truncateText = (text: string | null, maxLength: number) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Rating Filter */}
          <div className="flex flex-wrap gap-2">
            {(['all', '5', '4', '3', '2', '1'] as RatingFilter[]).map((rating) => (
              <button
                key={rating}
                onClick={() => handleRatingFilterChange(rating)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  ratingFilter === rating
                    ? 'bg-[#222222] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {rating === 'all' ? 'All Ratings' : (
                  <span className="flex items-center gap-1">
                    {rating} <span className="text-[#F56400]">★</span>
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by store or reviewer..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F56400]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#222222] text-white rounded-lg hover:bg-[#333333] transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Store
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reviewer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4" colSpan={6}>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : reviews.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-center text-gray-500" colSpan={6}>
                    No reviews found
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{review.store?.name || 'Unknown'}</p>
                        {review.store?.slug && (
                          <Link
                            href={`/store/${review.store.slug}`}
                            target="_blank"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            View Store
                          </Link>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-900">{review.reviewer?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{review.reviewer?.email || '-'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StarRating rating={review.rating} />
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 max-w-xs">
                        {truncateText(review.comment, 50)}
                      </p>
                      {review.seller_response && (
                        <p className="text-xs text-[#F56400] mt-1">Has seller response</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedReview(review)}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View
                        </button>
                        <button
                          onClick={() => setDeleteReview(review)}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} reviews
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Review Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Review Details</h3>
              <button
                onClick={() => setSelectedReview(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Store</p>
                <p className="font-medium text-gray-900">{selectedReview.store?.name || 'Unknown'}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Reviewer</p>
                <p className="text-gray-900">{selectedReview.reviewer?.name || 'Unknown'}</p>
                <p className="text-sm text-gray-500">{selectedReview.reviewer?.email}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Rating</p>
                <div className="flex items-center gap-2">
                  <StarRating rating={selectedReview.rating} />
                  <span className="text-gray-900 font-medium">{selectedReview.rating}/5</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Date</p>
                <p className="text-gray-900">
                  {new Date(selectedReview.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Comment</p>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {selectedReview.comment || <span className="text-gray-400 italic">No comment</span>}
                </p>
              </div>

              {selectedReview.seller_response && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Seller Response</p>
                  <div className="bg-[#FFF9F5] border-l-2 border-[#F56400] p-3 rounded-r-lg">
                    <p className="text-gray-700">{selectedReview.seller_response}</p>
                    {selectedReview.seller_response_at && (
                      <p className="text-xs text-gray-500 mt-2">
                        Responded on {new Date(selectedReview.seller_response_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedReview(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setDeleteReview(selectedReview);
                  setSelectedReview(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Review Modal */}
      {deleteReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-red-600 mb-4">Delete Review</h3>
            
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex gap-3">
                <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-medium text-red-600">Warning</p>
                  <p className="text-sm text-red-600 mt-1">
                    This will permanently delete this review and update the store&apos;s rating.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Store:</strong> {deleteReview.store?.name}<br />
                <strong>Reviewer:</strong> {deleteReview.reviewer?.name}<br />
                <strong>Rating:</strong> {deleteReview.rating} stars
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteReview(null)}
                disabled={deleteLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteReview}
                disabled={deleteLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Review'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

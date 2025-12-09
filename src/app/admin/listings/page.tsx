'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Listing {
  id: string;
  title_en: string | null;
  title_hy: string | null;
  price: number | null;
  currency: string;
  status: 'draft' | 'active' | 'sold' | 'removed';
  created_at: string;
  store_id: string;
  category_id: string;
  store?: {
    name: string;
    slug: string;
  };
  category?: {
    name_en: string | null;
  };
}

type StatusFilter = 'all' | 'active' | 'draft' | 'sold' | 'removed';

const ITEMS_PER_PAGE = 10;

export default function AdminListings() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    (searchParams.get('status') as StatusFilter) || 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [removeReason, setRemoveReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('listings')
        .select(`
          id,
          title_en,
          title_hy,
          price,
          currency,
          status,
          created_at,
          store_id,
          category_id
        `, { count: 'exact' });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (searchQuery.trim()) {
        query = query.or(`title_en.ilike.%${searchQuery}%,title_hy.ilike.%${searchQuery}%`);
      }

      query = query
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      // Fetch store and category info
      if (data && data.length > 0) {
        const storeIds = [...new Set(data.map(l => l.store_id))];
        const categoryIds = [...new Set(data.map(l => l.category_id).filter(Boolean))];

        const [storesResult, categoriesResult] = await Promise.all([
          supabase.from('stores').select('id, name, slug').in('id', storeIds),
          categoryIds.length > 0
            ? supabase.from('categories').select('id, name_en').in('id', categoryIds)
            : { data: [] },
        ]);

        const storeMap = new Map(storesResult.data?.map(s => [s.id, s]) || []);
        const categoryMap = new Map(categoriesResult.data?.map(c => [c.id, c]) || []);

        const listingsWithRelations = data.map(listing => ({
          ...listing,
          store: storeMap.get(listing.store_id),
          category: categoryMap.get(listing.category_id),
        }));

        setListings(listingsWithRelations);
      } else {
        setListings([]);
      }

      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, currentPage, searchQuery]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleStatusFilterChange = (status: StatusFilter) => {
    setStatusFilter(status);
    setCurrentPage(1);
    router.push(`/admin/listings${status !== 'all' ? `?status=${status}` : ''}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchListings();
  };

  const handleRemoveListing = async () => {
    if (!selectedListing) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('listings')
        .update({
          status: 'removed',
        })
        .eq('id', selectedListing.id);

      if (error) throw error;

      // Optionally log the removal reason somewhere

      fetchListings();
      setSelectedListing(null);
      setRemoveReason('');
    } catch (error) {
      console.error('Error removing listing:', error);
      alert('Failed to remove listing. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: Listing['status']) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      sold: 'bg-blue-100 text-blue-800',
      removed: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatPrice = (price: number | null, currency: string) => {
    if (price === null) return 'N/A';
    return currency === 'AMD' ? `֏${price.toLocaleString()}` : `$${price.toLocaleString()}`;
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search listings by title..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#222222] text-white rounded-lg hover:bg-[#333333] transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {(['all', 'active', 'draft', 'sold', 'removed'] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => handleStatusFilterChange(status)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                statusFilter === status
                  ? 'bg-[#222222] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Listing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Store
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
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
                    <td className="px-6 py-4" colSpan={7}>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : listings.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-center text-gray-500" colSpan={7}>
                    No listings found
                  </td>
                </tr>
              ) : (
                listings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 truncate max-w-xs">
                        {listing.title_en || listing.title_hy || 'Untitled'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {listing.store ? (
                        <Link
                          href={`/store/${listing.store.slug}`}
                          target="_blank"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {listing.store.name}
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-500">Unknown</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {listing.category?.name_en || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatPrice(listing.price, listing.currency)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(listing.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(listing.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/listing/${listing.id}`}
                          target="_blank"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View
                        </Link>
                        {listing.status !== 'removed' && (
                          <button
                            onClick={() => setSelectedListing(listing)}
                            className="text-sm text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        )}
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
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} listings
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

      {/* Remove Modal */}
      {selectedListing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Remove Listing
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to remove &quot;{selectedListing.title_en || selectedListing.title_hy || 'this listing'}&quot;?
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Removal (optional)
              </label>
              <textarea
                value={removeReason}
                onChange={(e) => setRemoveReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Why is this listing being removed?"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedListing(null);
                  setRemoveReason('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveListing}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Removing...' : 'Remove Listing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



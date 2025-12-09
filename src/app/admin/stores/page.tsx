'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Store {
  id: string;
  name: string;
  slug: string;
  approval_status: 'pending' | 'approved' | 'needs_info' | 'rejected';
  created_at: string;
  user_id: string;
  user?: {
    name: string;
    email: string;
  };
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'needs_info' | 'rejected';

const ITEMS_PER_PAGE = 10;

export default function AdminStores() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    (searchParams.get('status') as StatusFilter) || 'all'
  );
  
  // Modal states
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'request_info' | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('stores')
        .select(`
          id,
          name,
          slug,
          approval_status,
          created_at,
          user_id
        `, { count: 'exact' });

      if (statusFilter !== 'all') {
        query = query.eq('approval_status', statusFilter);
      }

      query = query
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      // Fetch user info for each store
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(s => s.user_id))];
        const { data: users } = await supabase
          .from('users')
          .select('id, name, email')
          .in('id', userIds);

        const userMap = new Map(users?.map(u => [u.id, u]) || []);
        
        const storesWithUsers = data.map(store => ({
          ...store,
          user: userMap.get(store.user_id),
        }));

        setStores(storesWithUsers);
      } else {
        setStores([]);
      }
      
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, currentPage]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleStatusFilterChange = (status: StatusFilter) => {
    setStatusFilter(status);
    setCurrentPage(1);
    router.push(`/admin/stores${status !== 'all' ? `?status=${status}` : ''}`);
  };

  const handleAction = async () => {
    if (!selectedStore || !actionType || !user) return;

    setActionLoading(true);
    try {
      const updates: Record<string, unknown> = {
        approval_reviewed_at: new Date().toISOString(),
        approval_reviewed_by: user.id,
      };

      if (actionType === 'approve') {
        updates.approval_status = 'approved';
        updates.approval_notes = actionNotes || null;
      } else if (actionType === 'reject') {
        updates.approval_status = 'rejected';
        updates.rejection_reason = actionNotes || null;
      } else if (actionType === 'request_info') {
        updates.approval_status = 'needs_info';
        updates.info_request_message = actionNotes || null;
      }

      // Update store
      const { error: updateError } = await supabase
        .from('stores')
        .update(updates)
        .eq('id', selectedStore.id);

      if (updateError) throw updateError;

      // Add to approval history
      await supabase.from('store_approval_history').insert({
        store_id: selectedStore.id,
        status: updates.approval_status,
        changed_by: user.id,
        notes: actionNotes || null,
      });

      // Refresh list
      fetchStores();
      
      // Close modal
      setSelectedStore(null);
      setActionType(null);
      setActionNotes('');
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Failed to perform action. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const openActionModal = (store: Store, type: 'approve' | 'reject' | 'request_info') => {
    setSelectedStore(store);
    setActionType(type);
    setActionNotes('');
  };

  const closeModal = () => {
    setSelectedStore(null);
    setActionType(null);
    setActionNotes('');
  };

  const getStatusBadge = (status: Store['approval_status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      needs_info: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
    };

    const labels = {
      pending: 'Pending',
      approved: 'Approved',
      needs_info: 'Needs Info',
      rejected: 'Rejected',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'approved', 'needs_info', 'rejected'] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => handleStatusFilterChange(status)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                statusFilter === status
                  ? 'bg-[#222222] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All' : status === 'needs_info' ? 'Needs Info' : status.charAt(0).toUpperCase() + status.slice(1)}
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
                  Store
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
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
                    <td className="px-6 py-4" colSpan={5}>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : stores.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-center text-gray-500" colSpan={5}>
                    No stores found
                  </td>
                </tr>
              ) : (
                stores.map((store) => (
                  <tr key={store.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{store.name}</p>
                        <p className="text-sm text-gray-500">/{store.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-900">{store.user?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{store.user?.email || '-'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(store.approval_status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(store.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/store/${store.slug}`}
                          target="_blank"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View
                        </Link>
                        {store.approval_status === 'pending' && (
                          <>
                            <button
                              onClick={() => openActionModal(store, 'approve')}
                              className="text-sm text-green-600 hover:underline"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => openActionModal(store, 'reject')}
                              className="text-sm text-red-600 hover:underline"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => openActionModal(store, 'request_info')}
                              className="text-sm text-orange-600 hover:underline"
                            >
                              Request Info
                            </button>
                          </>
                        )}
                        {store.approval_status === 'needs_info' && (
                          <>
                            <button
                              onClick={() => openActionModal(store, 'approve')}
                              className="text-sm text-green-600 hover:underline"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => openActionModal(store, 'reject')}
                              className="text-sm text-red-600 hover:underline"
                            >
                              Reject
                            </button>
                          </>
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
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} stores
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

      {/* Action Modal */}
      {selectedStore && actionType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {actionType === 'approve' && 'Approve Store'}
              {actionType === 'reject' && 'Reject Store'}
              {actionType === 'request_info' && 'Request More Information'}
            </h3>
            
            <p className="text-sm text-gray-600 mb-4">
              {actionType === 'approve' && `Are you sure you want to approve "${selectedStore.name}"?`}
              {actionType === 'reject' && `Are you sure you want to reject "${selectedStore.name}"?`}
              {actionType === 'request_info' && `Request additional information from "${selectedStore.name}"?`}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {actionType === 'approve' && 'Notes (optional)'}
                {actionType === 'reject' && 'Rejection Reason'}
                {actionType === 'request_info' && 'Information Needed'}
              </label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder={
                  actionType === 'approve' 
                    ? 'Add any notes...'
                    : actionType === 'reject'
                    ? 'Please provide a reason for rejection...'
                    : 'What information do you need from the seller?'
                }
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={actionLoading || (actionType !== 'approve' && !actionNotes.trim())}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${
                  actionType === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : actionType === 'reject'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {actionLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


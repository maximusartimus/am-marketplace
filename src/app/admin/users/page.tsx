'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: 'user' | 'admin';
  created_at: string;
  is_banned: boolean;
  is_verified: boolean;
}

const ITEMS_PER_PAGE = 10;

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Modal states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<'ban' | 'unban' | 'make_admin' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('users')
        .select('*', { count: 'exact' });

      if (searchQuery.trim()) {
        query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      query = query
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      setUsers(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const handleAction = async () => {
    if (!selectedUser || !actionType) return;

    setActionLoading(true);
    try {
      let updates: Record<string, unknown> = {};

      if (actionType === 'ban') {
        updates = { is_banned: true };
      } else if (actionType === 'unban') {
        updates = { is_banned: false };
      } else if (actionType === 'make_admin') {
        updates = { role: 'admin' };
      }

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', selectedUser.id);

      if (error) throw error;

      fetchUsers();
      closeModal();
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Failed to perform action. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const openActionModal = (user: User, type: 'ban' | 'unban' | 'make_admin') => {
    setSelectedUser(user);
    setActionType(type);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setActionType(null);
  };

  const getRoleBadge = (role: User['role']) => {
    return role === 'admin' ? (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
        Admin
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
        User
      </span>
    );
  };

  const getStatusIndicator = (user: User) => {
    if (user.is_banned) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
          Banned
        </span>
      );
    }
    if (user.is_verified) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          Verified
        </span>
      );
    }
    return null;
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or email..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#222222] text-white rounded-lg hover:bg-[#333333] transition-colors"
          >
            Search
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
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
              ) : users.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-center text-gray-500" colSpan={6}>
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                          {(user.name || user.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">
                          {user.name || 'No name'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.email || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusIndicator(user) || (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {user.is_banned ? (
                          <button
                            onClick={() => openActionModal(user, 'unban')}
                            className="text-sm text-green-600 hover:underline"
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => openActionModal(user, 'ban')}
                            className="text-sm text-red-600 hover:underline"
                          >
                            Ban
                          </button>
                        )}
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => openActionModal(user, 'make_admin')}
                            className="text-sm text-purple-600 hover:underline"
                          >
                            Make Admin
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
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} users
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
      {selectedUser && actionType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {actionType === 'ban' && 'Ban User'}
              {actionType === 'unban' && 'Unban User'}
              {actionType === 'make_admin' && 'Make Admin'}
            </h3>

            <p className="text-sm text-gray-600 mb-6">
              {actionType === 'ban' && (
                <>
                  Are you sure you want to ban <strong>{selectedUser.name || selectedUser.email}</strong>? 
                  They will no longer be able to access the marketplace.
                </>
              )}
              {actionType === 'unban' && (
                <>
                  Are you sure you want to unban <strong>{selectedUser.name || selectedUser.email}</strong>? 
                  They will regain access to the marketplace.
                </>
              )}
              {actionType === 'make_admin' && (
                <>
                  Are you sure you want to make <strong>{selectedUser.name || selectedUser.email}</strong> an admin? 
                  They will have full access to the admin panel.
                </>
              )}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={actionLoading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${
                  actionType === 'ban'
                    ? 'bg-red-600 hover:bg-red-700'
                    : actionType === 'unban'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-purple-600 hover:bg-purple-700'
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



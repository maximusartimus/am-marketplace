'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Report {
  id: string;
  reason: string;
  details: string | null;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  created_at: string;
  reviewed_at: string | null;
  resolution_notes: string | null;
  reporter_id: string;
  listing_id: string | null;
  store_id: string | null;
  user_id: string | null;
  reporter?: {
    name: string | null;
    email: string | null;
  };
  listing?: {
    title_en: string | null;
  };
  store?: {
    name: string;
  };
  reported_user?: {
    name: string | null;
    email: string | null;
  };
}

type StatusFilter = 'all' | 'pending' | 'reviewed' | 'resolved' | 'dismissed';

const ITEMS_PER_PAGE = 10;

export default function AdminReports() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    (searchParams.get('status') as StatusFilter) || 'all'
  );

  // Modal states
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actionType, setActionType] = useState<'review' | 'resolve' | 'dismiss' | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('reports')
        .select('*', { count: 'exact' });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      query = query
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      // Fetch related data
      if (data && data.length > 0) {
        const reportsWithRelations = await Promise.all(
          data.map(async (report) => {
            const enriched: Report = { ...report };

            // Fetch reporter
            if (report.reporter_id) {
              const { data: reporter } = await supabase
                .from('users')
                .select('name, email')
                .eq('id', report.reporter_id)
                .single();
              enriched.reporter = reporter || undefined;
            }

            // Fetch listing if applicable
            if (report.listing_id) {
              const { data: listing } = await supabase
                .from('listings')
                .select('title_en')
                .eq('id', report.listing_id)
                .single();
              enriched.listing = listing || undefined;
            }

            // Fetch store if applicable
            if (report.store_id) {
              const { data: store } = await supabase
                .from('stores')
                .select('name')
                .eq('id', report.store_id)
                .single();
              enriched.store = store || undefined;
            }

            // Fetch reported user if applicable
            if (report.user_id) {
              const { data: reportedUser } = await supabase
                .from('users')
                .select('name, email')
                .eq('id', report.user_id)
                .single();
              enriched.reported_user = reportedUser || undefined;
            }

            return enriched;
          })
        );

        setReports(reportsWithRelations);
      } else {
        setReports([]);
      }

      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, currentPage]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleStatusFilterChange = (status: StatusFilter) => {
    setStatusFilter(status);
    setCurrentPage(1);
    router.push(`/admin/reports${status !== 'all' ? `?status=${status}` : ''}`);
  };

  const handleAction = async () => {
    if (!selectedReport || !actionType || !user) return;

    setActionLoading(true);
    try {
      const updates: Record<string, unknown> = {
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      };

      if (actionType === 'review') {
        updates.status = 'reviewed';
      } else if (actionType === 'resolve') {
        updates.status = 'resolved';
        updates.resolution_notes = resolutionNotes || null;
      } else if (actionType === 'dismiss') {
        updates.status = 'dismissed';
        updates.resolution_notes = resolutionNotes || null;
      }

      const { error } = await supabase
        .from('reports')
        .update(updates)
        .eq('id', selectedReport.id);

      if (error) throw error;

      fetchReports();
      closeModal();
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Failed to update report. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const openActionModal = (report: Report, type: 'review' | 'resolve' | 'dismiss') => {
    setSelectedReport(report);
    setActionType(type);
    setResolutionNotes('');
  };

  const closeModal = () => {
    setSelectedReport(null);
    setActionType(null);
    setResolutionNotes('');
  };

  const getStatusBadge = (status: Report['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      dismissed: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getReportTarget = (report: Report) => {
    if (report.listing_id && report.listing) {
      return (
        <div>
          <span className="text-xs text-gray-500">Listing</span>
          <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
            {report.listing.title_en || 'Untitled'}
          </p>
        </div>
      );
    }
    if (report.store_id && report.store) {
      return (
        <div>
          <span className="text-xs text-gray-500">Store</span>
          <p className="text-sm font-medium text-gray-900">{report.store.name}</p>
        </div>
      );
    }
    if (report.user_id && report.reported_user) {
      return (
        <div>
          <span className="text-xs text-gray-500">User</span>
          <p className="text-sm font-medium text-gray-900">
            {report.reported_user.name || report.reported_user.email || 'Unknown'}
          </p>
        </div>
      );
    }
    return <span className="text-sm text-gray-500">Unknown</span>;
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'reviewed', 'resolved', 'dismissed'] as StatusFilter[]).map((status) => (
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
                  Reporter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reported Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
              ) : reports.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-center text-gray-500" colSpan={6}>
                    No reports found
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {report.reporter?.name || report.reporter?.email || 'Unknown'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {getReportTarget(report)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{report.reason}</p>
                      {report.details && (
                        <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                          {report.details}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {report.listing_id && (
                          <Link
                            href={`/listing/${report.listing_id}`}
                            target="_blank"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            View
                          </Link>
                        )}
                        {report.store_id && (
                          <Link
                            href={`/store/${report.store_id}`}
                            target="_blank"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            View
                          </Link>
                        )}
                        {report.status === 'pending' && (
                          <>
                            <button
                              onClick={() => openActionModal(report, 'review')}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Review
                            </button>
                            <button
                              onClick={() => openActionModal(report, 'resolve')}
                              className="text-sm text-green-600 hover:underline"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => openActionModal(report, 'dismiss')}
                              className="text-sm text-gray-600 hover:underline"
                            >
                              Dismiss
                            </button>
                          </>
                        )}
                        {report.status === 'reviewed' && (
                          <>
                            <button
                              onClick={() => openActionModal(report, 'resolve')}
                              className="text-sm text-green-600 hover:underline"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => openActionModal(report, 'dismiss')}
                              className="text-sm text-gray-600 hover:underline"
                            >
                              Dismiss
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
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} reports
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

      {/* Report Detail / Action Modal */}
      {selectedReport && actionType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {actionType === 'review' && 'Mark as Reviewed'}
              {actionType === 'resolve' && 'Resolve Report'}
              {actionType === 'dismiss' && 'Dismiss Report'}
            </h3>

            {/* Report Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
              <div>
                <span className="text-xs text-gray-500">Reporter</span>
                <p className="text-sm font-medium text-gray-900">
                  {selectedReport.reporter?.name || selectedReport.reporter?.email || 'Unknown'}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Reason</span>
                <p className="text-sm font-medium text-gray-900">{selectedReport.reason}</p>
              </div>
              {selectedReport.details && (
                <div>
                  <span className="text-xs text-gray-500">Details</span>
                  <p className="text-sm text-gray-700">{selectedReport.details}</p>
                </div>
              )}
              <div>
                <span className="text-xs text-gray-500">Reported</span>
                <p className="text-sm text-gray-700">
                  {new Date(selectedReport.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            {(actionType === 'resolve' || actionType === 'dismiss') && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resolution Notes {actionType === 'dismiss' && '(optional)'}
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder={
                    actionType === 'resolve'
                      ? 'Describe how the report was resolved...'
                      : 'Why is this report being dismissed?'
                  }
                />
              </div>
            )}

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
                  actionType === 'review'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : actionType === 'resolve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-600 hover:bg-gray-700'
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



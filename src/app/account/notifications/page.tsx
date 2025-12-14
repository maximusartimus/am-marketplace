'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/layout/Header';

interface Notification {
  id: string;
  user_id: string;
  type: 'new_message' | 'new_follower' | 'new_listing' | 'new_review' | 'price_drop';
  title: string;
  body: string | null;
  link: string | null;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
}

// Get icon based on notification type
function getNotificationIcon(type: Notification['type']) {
  switch (type) {
    case 'new_message':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case 'new_follower':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      );
    case 'new_listing':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      );
    case 'new_review':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
    case 'price_drop':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      );
    default:
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      );
  }
}

// Get icon color based on notification type
function getNotificationIconColor(type: Notification['type']) {
  switch (type) {
    case 'new_message':
      return 'text-[#1976D2] bg-[#E3F2FD]';
    case 'new_follower':
      return 'text-[#388E3C] bg-[#E8F5E9]';
    case 'new_listing':
      return 'text-[#F56400] bg-[#FFF3E0]';
    case 'new_review':
      return 'text-[#FFC107] bg-[#FFFDE7]';
    case 'price_drop':
      return 'text-[#D32F2F] bg-[#FFEBEE]';
    default:
      return 'text-[#757575] bg-[#F5F5F5]';
  }
}

// Format time ago
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks !== 1 ? 's' : ''} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
}

// Format full date
function formatFullDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type FilterTab = 'all' | 'unread';

const ITEMS_PER_PAGE = 20;

function NotificationsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [hasMore, setHasMore] = useState(true);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  async function fetchNotifications(offset = 0, append = false) {
    if (!user) return;

    if (offset === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1);

      if (activeTab === 'unread') {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching notifications:', error);
      } else {
        const newNotifications = data || [];
        if (append) {
          setNotifications(prev => [...prev, ...newNotifications]);
        } else {
          setNotifications(newNotifications);
        }
        setHasMore(newNotifications.length === ITEMS_PER_PAGE);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  // Fetch unread count
  async function fetchUnreadCount() {
    if (!user) return;

    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (!error) {
        setUnreadCount(count || 0);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [user, activeTab]);

  // Load more
  function loadMore() {
    fetchNotifications(notifications.length, true);
  }

  // Mark single notification as read and navigate
  async function handleNotificationClick(notification: Notification) {
    if (!notification.is_read) {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notification.id);

        if (!error) {
          setNotifications(prev =>
            prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    }

    if (notification.link) {
      router.push(notification.link);
    }
  }

  // Mark all as read
  async function markAllAsRead() {
    if (!user) return;

    setMarkingAllRead(true);
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (!error) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
        
        // If on unread tab, refetch to show empty state
        if (activeTab === 'unread') {
          fetchNotifications();
        }
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    } finally {
      setMarkingAllRead(false);
    }
  }

  // Clear all notifications
  async function clearAllNotifications() {
    if (!user) return;

    const confirmed = window.confirm('Are you sure you want to delete all notifications? This action cannot be undone.');
    if (!confirmed) return;

    setClearingAll(true);
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (!error) {
        setNotifications([]);
        setUnreadCount(0);
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error clearing notifications:', err);
    } finally {
      setClearingAll(false);
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#F5F5F5]">
        {/* Page Title */}
        <div className="bg-white border-b border-[#E5E5E5]">
          <div className="max-w-3xl mx-auto px-4 py-6">
            <div className="flex items-center gap-2 text-sm text-[#757575] mb-2">
              <Link href="/account" className="hover:text-[#222222]">My Account</Link>
              <span>/</span>
              <span className="text-[#222222]">Notifications</span>
            </div>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl md:text-3xl font-semibold text-[#222222]">Notifications</h1>
              {unreadCount > 0 && (
                <span className="px-3 py-1 bg-[#F56400] text-white text-sm font-medium rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Filter Tabs & Actions */}
          <div className="bg-white border border-[#E5E5E5] mb-4">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E5E5]">
              {/* Tabs */}
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'all'
                      ? 'bg-[#222222] text-white'
                      : 'text-[#757575] hover:bg-[#F5F5F5]'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab('unread')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'unread'
                      ? 'bg-[#222222] text-white'
                      : 'text-[#757575] hover:bg-[#F5F5F5]'
                  }`}
                >
                  Unread {unreadCount > 0 && `(${unreadCount})`}
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    disabled={markingAllRead}
                    className="px-3 py-1.5 text-sm text-[#F56400] hover:bg-[#FFF3E0] transition-colors disabled:opacity-50"
                  >
                    {markingAllRead ? 'Marking...' : 'Mark all read'}
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    disabled={clearingAll}
                    className="px-3 py-1.5 text-sm text-[#D32F2F] hover:bg-[#FFEBEE] transition-colors disabled:opacity-50"
                  >
                    {clearingAll ? 'Clearing...' : 'Clear all'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Notification List */}
          <div className="bg-white border border-[#E5E5E5]">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-[#222222] border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-sm text-[#757575]">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#BDBDBD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-[#222222] mb-2">
                  {activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </h3>
                <p className="text-sm text-[#757575]">
                  {activeTab === 'unread'
                    ? 'You\'re all caught up!'
                    : 'When you receive notifications, they\'ll appear here.'}
                </p>
              </div>
            ) : (
              <>
                <ul>
                  {notifications.map((notification) => (
                    <li key={notification.id} className="border-b border-[#E5E5E5] last:border-b-0">
                      <button
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full text-left px-4 py-4 hover:bg-[#F5F5F5] transition-colors flex gap-4 ${
                          !notification.is_read ? 'bg-[#FFF8F0]' : ''
                        }`}
                      >
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getNotificationIconColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-[#222222] ${!notification.is_read ? 'font-semibold' : ''}`}>
                              {notification.title}
                            </p>
                            {!notification.is_read && (
                              <div className="flex-shrink-0 w-2.5 h-2.5 bg-[#F56400] rounded-full mt-1.5" />
                            )}
                          </div>
                          {notification.body && (
                            <p className="text-sm text-[#757575] mt-1 line-clamp-2">
                              {notification.body}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-[#9E9E9E]">
                              {formatTimeAgo(notification.created_at)}
                            </span>
                            <span className="text-xs text-[#E5E5E5]">•</span>
                            <span className="text-xs text-[#BDBDBD]">
                              {formatFullDate(notification.created_at)}
                            </span>
                          </div>
                        </div>

                        {/* Arrow */}
                        {notification.link && (
                          <div className="flex-shrink-0 self-center text-[#BDBDBD]">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>

                {/* Load More */}
                {hasMore && (
                  <div className="p-4 border-t border-[#E5E5E5]">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="w-full py-3 text-sm font-medium text-[#F56400] hover:bg-[#FFF3E0] transition-colors disabled:opacity-50"
                    >
                      {loadingMore ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="animate-spin w-4 h-4 border-2 border-[#F56400] border-t-transparent rounded-full" />
                          Loading...
                        </span>
                      ) : (
                        'Load more notifications'
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <NotificationsContent />
    </ProtectedRoute>
  );
}

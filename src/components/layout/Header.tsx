'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';

const languages = [
  { code: 'hy', label: 'HY' },
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
];

interface UserStore {
  slug: string;
  name: string;
}

interface UserProfile {
  profile_photo: string | null;
  name: string | null;
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(languages[2]);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userStore, setUserStore] = useState<UserStore | null>(null);
  const [storeLoading, setStoreLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const { user, loading } = useAuth();

  // Handle search submission
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Fetch user's store when user is available
  useEffect(() => {
    async function fetchUserStore() {
      if (!user) {
        setUserStore(null);
        return;
      }

      setStoreLoading(true);
      try {
        const { data, error } = await supabase
          .from('stores')
          .select('slug, name')
          .eq('user_id', user.id)
          .single();

        if (error) {
          // No store found or error - that's fine
          setUserStore(null);
        } else {
          setUserStore(data);
        }
      } catch (err) {
        console.error('Error fetching user store:', err);
        setUserStore(null);
      } finally {
        setStoreLoading(false);
      }
    }

    fetchUserStore();
  }, [user]);

  // Fetch user profile (including profile photo)
  useEffect(() => {
    async function fetchUserProfile() {
      if (!user) {
        setUserProfile(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('profile_photo, name')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
        } else {
          setUserProfile(data);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setUserProfile(null);
      }
    }

    fetchUserProfile();
  }, [user]);

  // Fetch unread message count
  useEffect(() => {
    async function fetchUnreadCount() {
      if (!user) {
        setUnreadMessageCount(0);
        return;
      }

      try {
        // First get user's conversation IDs
        const { data: conversations } = await supabase
          .from('conversations')
          .select('id')
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

        if (!conversations || conversations.length === 0) {
          setUnreadMessageCount(0);
          return;
        }

        const userConversationIds = conversations.map(c => c.id);

        // Get unread message count
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('is_read', false)
          .neq('sender_id', user.id)
          .in('conversation_id', userConversationIds);

        setUnreadMessageCount(count || 0);
      } catch (err) {
        console.error('Error fetching unread count:', err);
        setUnreadMessageCount(0);
      }
    }

    fetchUnreadCount();
    
    // Refresh count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Fetch unread notification count
  useEffect(() => {
    async function fetchUnreadNotificationCount() {
      if (!user) {
        setUnreadNotificationCount(0);
        return;
      }

      try {
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false);

        if (error) {
          console.error('Error fetching notification count:', error);
          setUnreadNotificationCount(0);
        } else {
          setUnreadNotificationCount(count || 0);
        }
      } catch (err) {
        console.error('Error fetching notification count:', err);
        setUnreadNotificationCount(0);
      }
    }

    fetchUnreadNotificationCount();
    
    // Refresh count every 30 seconds
    const interval = setInterval(fetchUnreadNotificationCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get user display name or email
  const getUserDisplayName = () => {
    if (!user) return '';
    return userProfile?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E5E5E5]">
      {/* Top bar - hidden on mobile */}
      <div className="hidden md:block bg-[#222222] py-2">
        <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center text-xs text-white">
          <div className="flex gap-6">
            <span>Free Shipping on Orders 50,000+ AMD</span>
            <span>|</span>
            <span>Easy Returns</span>
          </div>
          <div className="flex gap-6">
            <Link href="/sell" className="hover:underline transition-colors">
              Start Selling
            </Link>
            <Link href="/help" className="hover:underline transition-colors">
              Help
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center gap-4 md:gap-8">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 -ml-2"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold tracking-tight text-[#222222]">
                AM MARKETPLACE
              </span>
            </div>
          </Link>

          {/* Search bar - desktop */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <form onSubmit={handleSearch} className="flex w-full border border-[#E5E5E5] overflow-hidden focus-within:border-[#222222] transition-colors">
              <input
                type="text"
                placeholder="Search for anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 px-4 py-2.5 focus:outline-none text-[#222222] placeholder-[#757575] text-sm"
              />
              <button type="submit" className="bg-[#222222] hover:bg-[#333333] px-4 text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            {/* Language switcher */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-[#222222] hover:underline"
              >
                <span>{currentLang.label}</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isLangOpen && (
                <div className="absolute right-0 mt-1 w-24 bg-white border border-[#E5E5E5] py-1 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setCurrentLang(lang);
                        setIsLangOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-[#F5F5F5] ${
                        currentLang.code === lang.code ? 'font-medium' : ''
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications icon - only show when logged in */}
            {user && (
              <NotificationDropdown
                userId={user.id}
                unreadCount={unreadNotificationCount}
                onUnreadCountChange={setUnreadNotificationCount}
              />
            )}

            {/* Messages icon - only show when logged in */}
            {user && (
              <Link
                href="/messages"
                className="relative flex items-center text-sm font-medium text-[#222222] hover:text-[#F56400] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {unreadMessageCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-[#F56400] text-white rounded-full">
                    {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                  </span>
                )}
              </Link>
            )}

            {/* Cart link */}
            <Link
              href="/cart"
              className="flex items-center text-sm font-medium text-[#222222] hover:underline"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </Link>

            {/* Auth section */}
            {loading ? (
              <div className="w-8 h-8 bg-[#E5E5E5] rounded-full animate-pulse"></div>
            ) : user ? (
              /* Logged in - show user menu */
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  {userProfile?.profile_photo ? (
                    <Image
                      src={userProfile.profile_photo}
                      alt={getUserDisplayName()}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-[#222222] rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {getUserInitials()}
                    </div>
                  )}
                  <span className="hidden md:block text-sm font-medium text-[#222222]">
                    {getUserDisplayName()}
                  </span>
                  <svg className="hidden md:block w-3 h-3 text-[#222222]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E5E5E5] py-1 z-50 shadow-sm">
                    <div className="px-4 py-2 border-b border-[#E5E5E5]">
                      <p className="text-sm font-medium text-[#222222] truncate">{getUserDisplayName()}</p>
                      <p className="text-xs text-[#757575] truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-[#222222] hover:bg-[#F5F5F5]"
                    >
                      My Account
                    </Link>
                    {storeLoading ? (
                      <div className="px-4 py-2 text-sm text-[#757575]">Loading...</div>
                    ) : userStore ? (
                      <Link
                        href={`/store/${userStore.slug}`}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-[#222222] hover:bg-[#F5F5F5]"
                      >
                        My Store
                      </Link>
                    ) : (
                      <Link
                        href="/store/create"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-[#222222] hover:bg-[#F5F5F5]"
                      >
                        Create Store
                      </Link>
                    )}
                    <Link
                      href="/account/notifications"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-[#222222] hover:bg-[#F5F5F5]"
                    >
                      Notifications
                      {unreadNotificationCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-[#F56400] text-white rounded-full">
                          {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      href="/messages"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-[#222222] hover:bg-[#F5F5F5]"
                    >
                      Messages
                      {unreadMessageCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-[#F56400] text-white rounded-full">
                          {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                        </span>
                      )}
                    </Link>
                    <div className="border-t border-[#E5E5E5]">
                      <Link
                        href="/auth/signout"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-red-600 hover:bg-[#F5F5F5]"
                      >
                        Sign Out
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Not logged in - show sign in button */
              <Link
                href="/auth/signin"
                className="bg-[#222222] hover:bg-[#333333] text-white font-medium py-2 px-5 text-sm transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden mt-4">
          <form onSubmit={handleSearch} className="flex w-full border border-[#E5E5E5] overflow-hidden focus-within:border-[#222222] transition-colors">
            <input
              type="text"
              placeholder="Search for anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-4 py-2.5 focus:outline-none text-[#222222] placeholder-[#757575] text-sm"
            />
            <button type="submit" className="bg-[#222222] hover:bg-[#333333] px-4 text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-[#E5E5E5] bg-white">
          <nav className="max-w-[1400px] mx-auto px-4 py-4">
            <ul className="space-y-1">
              <li>
                <Link
                  href="/categories"
                  className="block py-3 px-4 text-sm font-medium hover:bg-[#F5F5F5]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  All Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/sell"
                  className="block py-3 px-4 text-sm font-medium hover:bg-[#F5F5F5]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Start Selling
                </Link>
              </li>
              {user ? (
                <>
                  <li>
                    <Link
                      href="/account"
                      className="block py-3 px-4 text-sm font-medium hover:bg-[#F5F5F5]"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Account
                    </Link>
                  </li>
                  {storeLoading ? (
                    <li>
                      <div className="py-3 px-4 text-sm text-[#757575]">Loading...</div>
                    </li>
                  ) : userStore ? (
                    <li>
                      <Link
                        href={`/store/${userStore.slug}`}
                        className="block py-3 px-4 text-sm font-medium hover:bg-[#F5F5F5]"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        My Store
                      </Link>
                    </li>
                  ) : (
                    <li>
                      <Link
                        href="/store/create"
                        className="block py-3 px-4 text-sm font-medium hover:bg-[#F5F5F5]"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Create Store
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link
                      href="/account/notifications"
                      className="block py-3 px-4 text-sm font-medium hover:bg-[#F5F5F5]"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Notifications
                      {unreadNotificationCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold bg-[#F56400] text-white rounded-full">
                          {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                        </span>
                      )}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/messages"
                      className="block py-3 px-4 text-sm font-medium hover:bg-[#F5F5F5]"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Messages
                      {unreadMessageCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold bg-[#F56400] text-white rounded-full">
                          {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                        </span>
                      )}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/auth/signout"
                      className="block py-3 px-4 text-sm font-medium text-red-600 hover:bg-[#F5F5F5]"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Out
                    </Link>
                  </li>
                </>
              ) : (
                <li>
                  <Link
                    href="/auth/signin"
                    className="block py-3 px-4 text-sm font-medium hover:bg-[#F5F5F5]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                </li>
              )}
              <li>
                <Link
                  href="/help"
                  className="block py-3 px-4 text-sm font-medium hover:bg-[#F5F5F5]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Help & Support
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}

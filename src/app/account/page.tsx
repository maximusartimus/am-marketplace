'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/layout/Header';

interface UserProfile {
  id: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  profile_photo: string | null;
  language_preference: string | null;
  location_city: string | null;
  location_region: string | null;
  country: string | null;
  address: string | null;
  phone_country_code: string | null;
  created_at: string | null;
  role: string | null;
}

interface UserStore {
  slug: string;
  name: string;
}

function AccountContent() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [store, setStore] = useState<UserStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfileAndStore() {
      if (!user) return;

      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('id, email, phone, name, profile_photo, language_preference, location_city, location_region, country, address, phone_country_code, created_at, role')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setError('Failed to load profile');
        } else {
          setProfile(profileData);
        }

        // Fetch user's store
        const { data: storeData } = await supabase
          .from('stores')
          .select('slug, name')
          .eq('user_id', user.id)
          .single();

        if (storeData) {
          setStore(storeData);
        }
      } catch (err) {
        console.error(err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchProfileAndStore();
  }, [user]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPhone = (phone: string | null, countryCode: string | null) => {
    if (!phone) return null;
    const code = countryCode || '+374';
    return `${code} ${phone}`;
  };

  const formatLocation = (profile: UserProfile) => {
    const parts: string[] = [];
    if (profile.location_city) parts.push(profile.location_city);
    if (profile.country === 'Armenia' && profile.location_region) {
      parts.push(profile.location_region);
    }
    if (profile.country) parts.push(profile.country);
    return parts.length > 0 ? parts.join(', ') : null;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#222222] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-sm text-[#757575]">Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#F5F5F5]">
          <div className="max-w-2xl mx-auto px-4 py-12">
            <div className="bg-white border border-[#E5E5E5] p-8 text-center">
              <div className="w-16 h-16 bg-[#FFEBEE] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#D32F2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-[#222222] mb-2">Unable to Load Profile</h2>
              <p className="text-[#757575] mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-[#222222] text-white hover:bg-[#333333] transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#F5F5F5]">
        {/* Page Title */}
        <div className="bg-white border-b border-[#E5E5E5]">
          <div className="max-w-2xl mx-auto px-4 py-6">
            <h1 className="text-2xl md:text-3xl font-semibold text-[#222222]">My Account</h1>
            <p className="text-[#757575] mt-1">View and manage your profile</p>
          </div>
        </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Profile Card */}
        <div className="bg-white border border-[#E5E5E5]">
          {/* Profile Header */}
          <div className="p-6 md:p-8 border-b border-[#E5E5E5]">
            <div className="flex items-center gap-6">
              {/* Profile Photo */}
              <div className="relative w-24 h-24 md:w-28 md:h-28 flex-shrink-0">
                {profile?.profile_photo ? (
                  <Image
                    src={profile.profile_photo}
                    alt={profile.name || 'Profile'}
                    fill
                    className="object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full bg-[#F5F5F5] rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-[#757575]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Name and Role */}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl md:text-2xl font-semibold text-[#222222] truncate">
                  {profile?.name || 'No name set'}
                </h2>
                {profile?.role && (
                  <span className="inline-block mt-2 px-3 py-1 bg-[#F5F5F5] text-[#757575] text-xs uppercase tracking-wide">
                    {profile.role}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6 md:p-8 space-y-6">
            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#F5F5F5] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#757575]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-[#757575] mb-1">Email</p>
                <p className="text-[#222222]">{profile?.email || 'Not set'}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#F5F5F5] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#757575]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-[#757575] mb-1">Phone</p>
                <p className="text-[#222222]">
                  {formatPhone(profile?.phone ?? null, profile?.phone_country_code ?? null) || 'Not set'}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#F5F5F5] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#757575]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-[#757575] mb-1">Location</p>
                <p className="text-[#222222]">
                  {profile ? formatLocation(profile) || 'Not set' : 'Not set'}
                </p>
              </div>
            </div>

            {/* Member Since */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#F5F5F5] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#757575]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-[#757575] mb-1">Member Since</p>
                <p className="text-[#222222]">{formatDate(profile?.created_at ?? null)}</p>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <div className="px-6 md:px-8 pb-6 md:pb-8">
            <Link
              href="/account/edit"
              className="block w-full py-3 bg-[#F56400] hover:bg-[#D95700] text-white text-center font-medium transition-colors"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-6 bg-white border border-[#E5E5E5]">
          <div className="p-6">
            <h3 className="text-sm font-medium text-[#757575] uppercase tracking-wide mb-4">Quick Links</h3>
            <div className="space-y-2">
              {store ? (
                <Link
                  href={`/store/${store.slug}`}
                  className="flex items-center justify-between p-3 hover:bg-[#F5F5F5] transition-colors"
                >
                  <span className="text-[#222222]">My Store</span>
                  <svg className="w-5 h-5 text-[#757575]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ) : (
                <Link
                  href="/store/create"
                  className="flex items-center justify-between p-3 hover:bg-[#F5F5F5] transition-colors"
                >
                  <span className="text-[#222222]">Create Store</span>
                  <svg className="w-5 h-5 text-[#757575]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
              <Link
                href="/listing/create"
                className="flex items-center justify-between p-3 hover:bg-[#F5F5F5] transition-colors"
              >
                <span className="text-[#222222]">Create Listing</span>
                <svg className="w-5 h-5 text-[#757575]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/account/favorites"
                className="flex items-center justify-between p-3 hover:bg-[#F5F5F5] transition-colors"
              >
                <span className="text-[#222222] flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#F56400]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  My Favorites
                </span>
                <svg className="w-5 h-5 text-[#757575]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/account/following"
                className="flex items-center justify-between p-3 hover:bg-[#F5F5F5] transition-colors"
              >
                <span className="text-[#222222] flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#1976D2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Following Stores
                </span>
                <svg className="w-5 h-5 text-[#757575]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/account/settings"
                className="flex items-center justify-between p-3 hover:bg-[#F5F5F5] transition-colors"
              >
                <span className="text-[#222222] flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#757575]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Account Settings
                </span>
                <svg className="w-5 h-5 text-[#757575]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <AccountContent />
    </ProtectedRoute>
  );
}

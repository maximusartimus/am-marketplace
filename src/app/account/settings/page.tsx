'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/layout/Header';

function SettingsContent() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  
  // Email change state
  const [newEmail, setNewEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  
  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(null);
    setEmailLoading(true);

    try {
      if (!newEmail.trim()) {
        setEmailError('Please enter a new email address');
        return;
      }

      if (newEmail === user?.email) {
        setEmailError('New email must be different from your current email');
        return;
      }

      const { error } = await supabase.auth.updateUser({ email: newEmail });

      if (error) {
        setEmailError(error.message);
        return;
      }

      setEmailSuccess('Verification email sent to your new address');
      setNewEmail('');
    } catch (err) {
      console.error('Error updating email:', err);
      setEmailError('An unexpected error occurred. Please try again.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    setPasswordLoading(true);

    try {
      if (!newPassword.trim()) {
        setPasswordError('Please enter a new password');
        return;
      }

      if (newPassword.length < 6) {
        setPasswordError('Password must be at least 6 characters');
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordError('Passwords do not match');
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        setPasswordError(error.message);
        return;
      }

      setPasswordSuccess('Password updated successfully. You will be signed out.');
      setNewPassword('');
      setConfirmPassword('');

      // Sign out user after successful password change
      setTimeout(async () => {
        await signOut();
        router.push('/auth/signin');
      }, 2000);
    } catch (err) {
      console.error('Error updating password:', err);
      setPasswordError('An unexpected error occurred. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#F5F5F5]">
        {/* Page Title */}
        <div className="bg-white border-b border-[#E5E5E5]">
          <div className="max-w-2xl mx-auto px-4 py-6">
            <div className="flex items-center gap-2 text-sm text-[#757575] mb-2">
              <Link href="/account" className="hover:text-[#222222] transition-colors">
                My Account
              </Link>
              <span>/</span>
              <span className="text-[#222222]">Settings</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold text-[#222222]">Account Settings</h1>
            <p className="text-[#757575] mt-1">Manage your email and password</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          {/* Change Email Section */}
          <div className="bg-white border border-[#E5E5E5]">
            <div className="p-6 md:p-8 border-b border-[#E5E5E5]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#F5F5F5] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#757575]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#222222]">Change Email</h2>
                  <p className="text-sm text-[#757575]">Update your email address</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleEmailUpdate} className="p-6 md:p-8 space-y-4">
              {/* Current Email */}
              <div>
                <label className="block text-sm font-medium text-[#757575] mb-2">
                  Current Email
                </label>
                <div className="w-full px-4 py-3 bg-[#F5F5F5] border border-[#E5E5E5] text-[#757575]">
                  {user?.email || 'No email set'}
                </div>
              </div>

              {/* New Email */}
              <div>
                <label htmlFor="newEmail" className="block text-sm font-medium text-[#757575] mb-2">
                  New Email
                </label>
                <input
                  type="email"
                  id="newEmail"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter new email address"
                  className="w-full px-4 py-3 border border-[#E5E5E5] focus:border-[#F56400] focus:outline-none transition-colors"
                />
              </div>

              {/* Email Error */}
              {emailError && (
                <div className="p-3 bg-[#FFEBEE] border border-[#FFCDD2] text-[#D32F2F] text-sm">
                  {emailError}
                </div>
              )}

              {/* Email Success */}
              {emailSuccess && (
                <div className="p-3 bg-[#E8F5E9] border border-[#C8E6C9] text-[#2E7D32] text-sm">
                  {emailSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={emailLoading}
                className="w-full py-3 bg-[#F56400] hover:bg-[#D95700] disabled:bg-[#BDBDBD] text-white font-medium transition-colors flex items-center justify-center gap-2"
              >
                {emailLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Email'
                )}
              </button>
            </form>
          </div>

          {/* Change Password Section */}
          <div className="bg-white border border-[#E5E5E5]">
            <div className="p-6 md:p-8 border-b border-[#E5E5E5]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#F5F5F5] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#757575]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#222222]">Change Password</h2>
                  <p className="text-sm text-[#757575]">Update your account password</p>
                </div>
              </div>
            </div>

            <form onSubmit={handlePasswordUpdate} className="p-6 md:p-8 space-y-4">
              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-[#757575] mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 border border-[#E5E5E5] focus:border-[#F56400] focus:outline-none transition-colors"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#757575] mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 border border-[#E5E5E5] focus:border-[#F56400] focus:outline-none transition-colors"
                />
              </div>

              {/* Password Error */}
              {passwordError && (
                <div className="p-3 bg-[#FFEBEE] border border-[#FFCDD2] text-[#D32F2F] text-sm">
                  {passwordError}
                </div>
              )}

              {/* Password Success */}
              {passwordSuccess && (
                <div className="p-3 bg-[#E8F5E9] border border-[#C8E6C9] text-[#2E7D32] text-sm">
                  {passwordSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full py-3 bg-[#F56400] hover:bg-[#D95700] disabled:bg-[#BDBDBD] text-white font-medium transition-colors flex items-center justify-center gap-2"
              >
                {passwordLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          </div>

          {/* Back to Account Link */}
          <div className="text-center">
            <Link
              href="/account"
              className="inline-flex items-center gap-2 text-[#757575] hover:text-[#222222] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to My Account
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}




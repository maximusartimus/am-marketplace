'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function SignOutPage() {
  const router = useRouter();
  const { signOut } = useAuth();

  useEffect(() => {
    const handleSignOut = async () => {
      await signOut();
      router.push('/');
      router.refresh();
    };

    handleSignOut();
  }, [signOut, router]);

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#222222] border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-sm text-[#757575]">Signing out...</p>
      </div>
    </div>
  );
}


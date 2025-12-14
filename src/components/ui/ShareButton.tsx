'use client';

import { useState } from 'react';
import { ShareModal } from './ShareModal';

interface ShareButtonProps {
  type: 'listing' | 'store';
  url: string;
  title: string;
  size?: 'small' | 'large';
  variant?: 'icon' | 'button';
  className?: string;
}

export function ShareButton({ 
  type, 
  url, 
  title, 
  size = 'small',
  variant = 'icon',
  className = '' 
}: ShareButtonProps) {
  const [showModal, setShowModal] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowModal(true);
  };

  const sizeClasses = size === 'large' 
    ? 'w-12 h-12' 
    : 'w-8 h-8';
  
  const iconSize = size === 'large' ? 'w-5 h-5' : 'w-4 h-4';

  if (variant === 'button') {
    return (
      <>
        <button
          onClick={handleClick}
          className={`inline-flex items-center gap-2 px-4 py-2 border border-[#E5E5E5] hover:border-[#222222] transition-colors text-sm font-medium text-[#222222] ${className}`}
          title={`Share this ${type}`}
          aria-label={`Share this ${type}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>

        <ShareModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          url={url}
          title={title}
          type={type}
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`${sizeClasses} flex items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-md transition-all hover:scale-110 ${className}`}
        title={`Share this ${type}`}
        aria-label={`Share this ${type}`}
      >
        <svg className={`${iconSize} text-[#757575] hover:text-[#222222]`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </button>

      <ShareModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        url={url}
        title={title}
        type={type}
      />
    </>
  );
}

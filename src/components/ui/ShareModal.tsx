'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  type: 'listing' | 'store';
}

export function ShareModal({ isOpen, onClose, url, title, type }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(true);
  const [qrError, setQrError] = useState<string | null>(null);
  const [canNativeShare, setCanNativeShare] = useState(false);

  // Check if native share is available (mainly for mobile)
  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  // Generate QR code when modal opens
  useEffect(() => {
    if (!isOpen || !url) return;

    setQrLoading(true);
    setQrError(null);

    QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#222222',
        light: '#FFFFFF',
      },
    })
      .then((dataUrl) => {
        setQrCodeDataUrl(dataUrl);
        setQrLoading(false);
      })
      .catch((err) => {
        console.error('Error generating QR code:', err);
        setQrError('Failed to generate QR code');
        setQrLoading(false);
      });
  }, [isOpen, url]);

  // Reset copied state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        alert('Failed to copy link. Please copy manually.');
      }
      document.body.removeChild(textArea);
    }
  };

  const handleDownloadQR = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `${type}-qrcode-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return;

    try {
      await navigator.share({
        title: title,
        url: url,
      });
    } catch (err) {
      // User cancelled or share failed - fail silently
      if ((err as Error).name !== 'AbortError') {
        console.error('Share failed:', err);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#222222]">
            Share {type === 'listing' ? 'Listing' : 'Store'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-[#757575] hover:text-[#222222] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Copy Link Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#222222] mb-2">
            Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              readOnly
              className="flex-1 px-4 py-3 border border-[#E5E5E5] bg-[#F5F5F5] text-[#222222] text-sm truncate"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-3 font-medium text-sm transition-all flex items-center gap-2 min-w-[100px] justify-center ${
                copied 
                  ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]' 
                  : 'bg-[#222222] text-white hover:bg-[#333333]'
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#222222] mb-3">
            QR Code
          </label>
          <div className="flex flex-col items-center">
            {qrLoading ? (
              <div className="w-[200px] h-[200px] flex items-center justify-center bg-[#F5F5F5] border border-[#E5E5E5]">
                <div className="animate-spin w-6 h-6 border-2 border-[#222222] border-t-transparent rounded-full" />
              </div>
            ) : qrError ? (
              <div className="w-[200px] h-[200px] flex items-center justify-center bg-[#FFEBEE] border border-[#D32F2F] text-[#D32F2F] text-sm text-center p-4">
                {qrError}
              </div>
            ) : qrCodeDataUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrCodeDataUrl}
                  alt="QR Code"
                  className="w-[200px] h-[200px] border border-[#E5E5E5]"
                />
                <button
                  onClick={handleDownloadQR}
                  className="mt-3 px-4 py-2 border border-[#E5E5E5] hover:border-[#222222] transition-colors text-sm font-medium text-[#222222] flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download QR Code
                </button>
              </>
            ) : null}
          </div>
        </div>

        {/* Native Share Button (mobile only) */}
        {canNativeShare && (
          <div className="pt-4 border-t border-[#E5E5E5]">
            <button
              onClick={handleNativeShare}
              className="w-full px-4 py-3 bg-[#F56400] hover:bg-[#D95700] transition-colors text-white font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

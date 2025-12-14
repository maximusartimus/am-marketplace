'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

interface StoreLinkCardProps {
  storeUrl: string;
  storeName: string;
}

export function StoreLinkCard({ storeUrl, storeName }: StoreLinkCardProps) {
  const [copied, setCopied] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);

  // Generate QR code on mount
  useEffect(() => {
    if (!storeUrl) return;

    QRCode.toDataURL(storeUrl, {
      width: 200,
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
        setQrLoading(false);
      });
  }, [storeUrl]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = storeUrl;
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
    link.download = `${storeName.replace(/\s+/g, '-').toLowerCase()}-qrcode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="bg-white border border-[#E5E5E5] p-4 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <svg className="w-5 h-5 text-[#F56400] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span className="text-sm font-medium text-[#222222]">Your Store Link</span>
        </div>

        {/* Single Row Layout */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* URL Input */}
          <div className="flex-1 bg-[#F5F5F5] border border-[#E5E5E5] px-3 py-2 overflow-hidden">
            <p className="text-sm text-[#595959] truncate font-mono">{storeUrl}</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2 font-medium text-sm transition-all flex items-center justify-center gap-1.5 ${
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
                  Copied
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

            <button
              onClick={() => setShowQrModal(true)}
              disabled={qrLoading || !qrCodeDataUrl}
              className="px-4 py-2 border border-[#E5E5E5] text-[#222222] hover:border-[#222222] transition-colors font-medium text-sm flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Show QR Code"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              QR
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && qrCodeDataUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 max-w-sm w-full relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-3 right-3 p-1 text-[#757575] hover:text-[#222222] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h3 className="text-lg font-semibold text-[#222222] mb-4 text-center">Store QR Code</h3>
            
            <div className="flex flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCodeDataUrl}
                alt="Store QR Code"
                className="w-[180px] h-[180px] border border-[#E5E5E5]"
              />
              <p className="text-sm text-[#757575] mt-3 text-center">Scan to visit your store</p>
              
              <button
                onClick={handleDownloadQR}
                className="mt-4 w-full px-4 py-2 bg-[#222222] text-white hover:bg-[#333333] transition-colors font-medium text-sm flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download QR Code
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

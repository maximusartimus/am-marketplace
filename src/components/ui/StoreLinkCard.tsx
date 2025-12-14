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
    <div className="bg-gradient-to-br from-[#FFF9F5] to-[#FFF3E0] border-2 border-[#F56400] p-6 mb-8">
      <div className="flex items-start gap-2 mb-4">
        <svg className="w-6 h-6 text-[#F56400] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        <div>
          <h3 className="text-lg font-semibold text-[#222222]">Your Store Link</h3>
          <p className="text-sm text-[#757575] mt-1">
            Share this link on social media, business cards, or anywhere to attract customers.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Link and Copy Section */}
        <div className="flex-1">
          <div className="bg-white border border-[#E5E5E5] p-3 mb-4">
            <p className="text-sm text-[#222222] break-all font-mono">{storeUrl}</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCopyLink}
              className={`flex-1 md:flex-none px-6 py-3 font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                copied 
                  ? 'bg-[#E8F5E9] text-[#2E7D32] border-2 border-[#2E7D32]' 
                  : 'bg-[#222222] text-white hover:bg-[#333333]'
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Link
                </>
              )}
            </button>

            <button
              onClick={handleDownloadQR}
              disabled={qrLoading || !qrCodeDataUrl}
              className="flex-1 md:flex-none px-6 py-3 border-2 border-[#222222] text-[#222222] hover:bg-[#222222] hover:text-white transition-colors font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download QR Code
            </button>
          </div>
        </div>

        {/* QR Code Preview */}
        <div className="flex flex-col items-center">
          {qrLoading ? (
            <div className="w-[120px] h-[120px] flex items-center justify-center bg-white border border-[#E5E5E5]">
              <div className="animate-spin w-5 h-5 border-2 border-[#222222] border-t-transparent rounded-full" />
            </div>
          ) : qrCodeDataUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCodeDataUrl}
                alt="Store QR Code"
                className="w-[120px] h-[120px] border border-[#E5E5E5]"
              />
              <p className="text-xs text-[#757575] mt-2 text-center">Scan to visit store</p>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

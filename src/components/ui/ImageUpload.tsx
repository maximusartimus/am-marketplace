'use client';

import { useState, useRef, useCallback } from 'react';

interface ImageUploadProps {
  label: string;
  description?: string;
  recommendedSize?: string;
  aspectRatio?: 'square' | 'banner';
  value: File | null;
  previewUrl?: string | null;
  onChange: (file: File | null) => void;
  className?: string;
}

export function ImageUpload({
  label,
  description,
  recommendedSize,
  aspectRatio = 'square',
  value,
  previewUrl,
  onChange,
  className = '',
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(previewUrl || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File | null) => {
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onChange(file);
    } else {
      setPreview(previewUrl || null);
      onChange(null);
    }
  }, [onChange, previewUrl]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFile(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(previewUrl || null);
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const displayPreview = preview || previewUrl;
  const isSquare = aspectRatio === 'square';

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-[#222222] mb-2">
        {label}
      </label>
      {description && (
        <p className="text-xs text-[#757575] mb-2">{description}</p>
      )}
      
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative cursor-pointer border-2 border-dashed transition-all
          ${isDragging 
            ? 'border-[#F56400] bg-[#FFF3E0]' 
            : 'border-[#E5E5E5] hover:border-[#757575] bg-[#FAFAFA]'
          }
          ${isSquare ? 'w-32 h-32' : 'w-full h-32'}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />
        
        {displayPreview ? (
          <div className="relative w-full h-full group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayPreview}
              alt="Preview"
              className={`w-full h-full object-cover ${isSquare ? 'rounded-full' : ''}`}
            />
            <div className={`absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 ${isSquare ? 'rounded-full' : ''}`}>
              <button
                type="button"
                onClick={handleClick}
                className="p-2 bg-white rounded-full hover:bg-[#F5F5F5] transition-colors"
              >
                <svg className="w-4 h-4 text-[#222222]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 bg-white rounded-full hover:bg-[#FFEBEE] transition-colors"
              >
                <svg className="w-4 h-4 text-[#D32F2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <svg className="w-8 h-8 text-[#757575] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-[#757575] text-center">
              {isDragging ? 'Drop image here' : 'Click or drag to upload'}
            </span>
            {recommendedSize && (
              <span className="text-xs text-[#999999] mt-1 text-center">{recommendedSize}</span>
            )}
          </div>
        )}
      </div>
      
      {value && (
        <p className="text-xs text-[#2E7D32] mt-2 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {value.name}
        </p>
      )}
    </div>
  );
}






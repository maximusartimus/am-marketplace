'use client';

import { useState, useRef, useCallback } from 'react';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

interface ExistingImage {
  id: string;
  url: string;
  is_primary?: boolean;
}

interface MultiImageUploadProps {
  label?: string;
  description?: string;
  maxImages?: number;
  value: ImageFile[];
  onChange: (images: ImageFile[]) => void;
  existingImages?: ExistingImage[];
  onRemoveExisting?: (id: string) => void;
  onSetPrimary?: (id: string) => void;
  deletingImageId?: string | null;
  settingPrimaryId?: string | null;
}

export function MultiImageUpload({
  label = 'Images',
  description,
  maxImages = 10,
  value,
  onChange,
  existingImages = [],
  onRemoveExisting,
  onSetPrimary,
  deletingImageId,
  settingPrimaryId,
}: MultiImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const totalImages = value.length + existingImages.length;
  const canAddMore = totalImages < maxImages;

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const remainingSlots = maxImages - totalImages;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    const newImages: ImageFile[] = [];

    filesToProcess.forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum size is 5MB.`);
        return;
      }

      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const preview = URL.createObjectURL(file);
      newImages.push({ id, file, preview });
    });

    if (newImages.length > 0) {
      onChange([...value, ...newImages]);
    }
  }, [maxImages, totalImages, value, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

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
    handleFiles(e.target.files);
    // Reset input so the same file can be selected again
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleRemove = (id: string) => {
    const imageToRemove = value.find(img => img.id === id);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    onChange(value.filter(img => img.id !== id));
  };

  const handleMakePrimary = (id: string) => {
    const imageIndex = value.findIndex(img => img.id === id);
    if (imageIndex > 0) {
      const newImages = [...value];
      const [image] = newImages.splice(imageIndex, 1);
      newImages.unshift(image);
      onChange(newImages);
    }
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newImages = [...value];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onChange(newImages);
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-[#222222] mb-2">
          {label} <span className="text-[#757575] font-normal">({totalImages}/{maxImages})</span>
        </label>
      )}
      {description && (
        <p className="text-xs text-[#757575] mb-3">{description}</p>
      )}

      {/* Image Grid */}
      {(existingImages.length > 0 || value.length > 0) && (
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-3">
          {/* Existing images */}
          {existingImages.map((image, index) => {
            const isDeleting = deletingImageId === image.id;
            const isSettingPrimary = settingPrimaryId === image.id;
            const isPrimary = image.is_primary;
            const isLoading = isDeleting || isSettingPrimary;
            
            return (
              <div
                key={image.id}
                className={`relative aspect-square bg-[#F5F5F5] border-2 ${isPrimary ? 'border-[#F56400]' : 'border-[#E5E5E5]'} group overflow-hidden ${isLoading ? 'opacity-50' : ''}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {isPrimary && !isLoading && (
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-[#F56400] text-white text-xs font-medium flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Primary
                  </div>
                )}
                {isLoading ? (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {/* Set as Primary button - only show if not already primary */}
                    {onSetPrimary && !isPrimary && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSetPrimary(image.id);
                        }}
                        className="p-1.5 bg-white rounded-full hover:bg-[#FFF3E0] transition-colors"
                        title="Set as primary"
                      >
                        <svg className="w-4 h-4 text-[#F56400]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                    )}
                    {/* Delete button */}
                    {onRemoveExisting && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveExisting(image.id);
                        }}
                        className="p-1.5 bg-white rounded-full hover:bg-[#FFEBEE] transition-colors"
                        title="Remove"
                      >
                        <svg className="w-4 h-4 text-[#D32F2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* New images */}
          {value.map((image, index) => (
            <div
              key={image.id}
              className="relative aspect-square bg-[#F5F5F5] border border-[#E5E5E5] group overflow-hidden"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', index.toString());
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                if (fromIndex !== index) {
                  handleReorder(fromIndex, index);
                }
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.preview}
                alt={`Image ${existingImages.length + index + 1}`}
                className="w-full h-full object-cover"
              />
              {index === 0 && existingImages.length === 0 && (
                <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-[#222222] text-white text-xs font-medium">
                  Primary
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                {index !== 0 && existingImages.length === 0 && (
                  <button
                    type="button"
                    onClick={() => handleMakePrimary(image.id)}
                    className="p-1.5 bg-white rounded-full hover:bg-[#E8F5E9] transition-colors"
                    title="Make primary"
                  >
                    <svg className="w-4 h-4 text-[#2E7D32]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(image.id)}
                  className="p-1.5 bg-white rounded-full hover:bg-[#FFEBEE] transition-colors"
                  title="Remove"
                >
                  <svg className="w-4 h-4 text-[#D32F2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="absolute bottom-1 right-1 cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {canAddMore && (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative cursor-pointer border-2 border-dashed transition-all p-6
            ${isDragging 
              ? 'border-[#F56400] bg-[#FFF3E0]' 
              : 'border-[#E5E5E5] hover:border-[#757575] bg-[#FAFAFA]'
            }
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleInputChange}
            className="hidden"
          />
          
          <div className="flex flex-col items-center justify-center text-center">
            <svg className="w-10 h-10 text-[#757575] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-[#222222] font-medium mb-1">
              {isDragging ? 'Drop images here' : 'Click or drag to upload images'}
            </p>
            <p className="text-xs text-[#757575]">
              Up to {maxImages - totalImages} more {maxImages - totalImages === 1 ? 'image' : 'images'} • Max 5MB each • JPG, PNG, WebP
            </p>
          </div>
        </div>
      )}

      {totalImages === 0 && (
        <p className="text-xs text-[#D32F2F] mt-2">
          At least one image is required
        </p>
      )}

      {totalImages > 0 && (
        <p className="text-xs text-[#757575] mt-2">
          💡 Hover over an image to delete or set as primary. The primary image is shown first in listings.
        </p>
      )}
    </div>
  );
}

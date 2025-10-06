"use client";

import { useState } from "react";

interface ImagePreviewProps {
  src: string;
  alt: string;
  onPreview: () => void;
}

export function ImagePreview({ src, alt, onPreview }: ImagePreviewProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };

  if (imageError) {
    return (
      <div className="flex items-center justify-center w-10 h-10 bg-gray-100 border border-gray-200 rounded">
        <span className="text-xs text-gray-500">Error</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
          <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-10 w-auto object-cover rounded cursor-pointer"
        onClick={onPreview}
        onLoad={handleImageLoad}
        onError={handleImageError}
        title={`${alt} - Klik kanan untuk copy URL`}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserProfilePhotoProps {
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showDefaultIcon?: boolean;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-32 h-32",
};

const iconSizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

export function UserProfilePhoto({
  photoUrl,
  size = "md",
  className,
  showDefaultIcon = true,
}: UserProfilePhotoProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(!!photoUrl);

  // Debug logging
  if (process.env.NODE_ENV === "development") {
    console.log("UserProfilePhoto props:", {
      photoUrl,
      size,
      imageError,
      isLoading,
    });
  }

  const containerClass = cn(
    "rounded-full border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center",
    sizeClasses[size],
    className
  );

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };

  // If no photoUrl or image error, show default icon or empty container
  if (!photoUrl || imageError) {
    if (showDefaultIcon) {
      return (
        <div className={cn(containerClass, "bg-blue-50 border-blue-100")}>
          <User className={cn("text-blue-600", iconSizeClasses[size])} />
        </div>
      );
    }
    return <div className={containerClass} />;
  }

  return (
    <div className={cn("relative", containerClass)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-full">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photoUrl}
        alt="Profile Photo"
        className="w-full h-full object-cover rounded-full"
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
}

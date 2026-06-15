"use client";

import { ImageIcon } from "lucide-react";
import { useState } from "react";

type SupabaseImageProps = React.ImgHTMLAttributes<HTMLImageElement>;

export function SupabaseImage({ src, alt = "", className = "", ...props }: SupabaseImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-[#F3F4F6] text-[#9CA3AF] dark:bg-[#2C313A] ${className}`}
        aria-label={alt}
      >
        <ImageIcon size={22} aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      {...props}
    />
  );
}
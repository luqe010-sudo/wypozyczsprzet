'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CldImage } from 'next-cloudinary';
import DynamicPlaceholder from '../DynamicPlaceholder';

/**
 * Listing photo with a graceful fallback: images linked from third-party sites can
 * disappear at any time, so a failed load shows the category placeholder instead.
 */
export default function ListingImage({ src, alt, title, category, sizes, priority = false, fit = 'cover' }) {
  const [failed, setFailed] = useState(false);
  const usable = src && String(src).startsWith('http') && !failed;

  if (!usable) {
    return (
      <div className="absolute inset-0">
        <DynamicPlaceholder title={title} category={category} />
      </div>
    );
  }

  const className = fit === 'contain' ? 'object-contain' : 'object-cover';

  if (String(src).includes('res.cloudinary.com')) {
    return (
      <CldImage
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={className}
        format="auto"
        quality="auto"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

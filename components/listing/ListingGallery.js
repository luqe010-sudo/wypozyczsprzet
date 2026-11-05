'use client';

import { useState } from 'react';
import ListingImage from './ListingImage';

export default function ListingGallery({ images = [], name, city, category }) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 md:aspect-[16/10]">
        <ListingImage
          key={current || 'placeholder'}
          src={current}
          alt={`${name} na wynajem, ${city}`}
          title={name}
          category={category}
          sizes="(max-width: 1024px) 100vw, 66vw"
          priority
          fit="contain"
        />
      </div>

      {images.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Zdjęcie ${index + 1} z ${images.length}`}
              aria-current={index === active}
              className={`relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 ${index === active ? 'border-brand-600' : 'border-transparent'}`}
            >
              <ListingImage src={image} alt="" title={name} category={category} sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ListingImage from './ListingImage';

export default function ListingGallery({ images = [], name, city, category }) {
  const [active, setActive] = useState(0);
  const current = images[active];
  const move = (direction) => setActive((index) => (index + direction + images.length) % images.length);
  const controlClass = 'absolute top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/60 bg-white/95 text-slate-950 shadow-md hover:bg-amber-200';

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800 sm:aspect-[16/10]">
        <ListingImage
          key={current || 'placeholder'}
          src={current}
          alt={`${name} na wynajem, ${city}`}
          title={name}
          category={category}
          sizes="(max-width: 1024px) 100vw, 620px"
          priority={active === 0}
          fit="contain"
        />
        {images.length > 1 && (
          <>
            <button type="button" aria-label="Poprzednie zdjęcie" onClick={() => move(-1)} className={`${controlClass} left-2 sm:left-3`}>
              <ChevronLeft size={22} aria-hidden="true" />
            </button>
            <button type="button" aria-label="Następne zdjęcie" onClick={() => move(1)} className={`${controlClass} right-2 sm:right-3`}>
              <ChevronRight size={22} aria-hidden="true" />
            </button>
            <span className="absolute bottom-2 right-2 rounded-md bg-slate-950/80 px-2 py-1 text-xs font-semibold text-white" aria-live="polite">
              {active + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-2 hidden gap-2 overflow-x-auto pb-1 sm:flex">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Zdjęcie ${index + 1} z ${images.length}`}
              aria-current={index === active}
              className={`relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 ${index === active ? 'border-amber-400' : 'border-transparent'}`}
            >
              <ListingImage src={image} alt="" title={name} category={category} sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, LayoutGrid } from 'lucide-react';
import { CompactorIcon, ExcavatorIcon, GeneratorIcon, LiftIcon } from './icons/EquipmentIcons';
import { CategoryIcon } from './icons/CategoryIcons';
import { MARKET_CATEGORIES, subcategoryHref } from '../lib/categories';

// Popular kinds of equipment open their subcategory, so a pill shows the same offers as the category filter.
const PILLS = [
  { icon: ExcavatorIcon, label: 'Minikoparki', href: subcategoryHref('roboty-ziemne', 'miniexcavators') },
  { icon: CompactorIcon, label: 'Zagęszczarki', href: subcategoryHref('roboty-ziemne', 'compactors') },
  { icon: LiftIcon, label: 'Podnośniki', href: subcategoryHref('prace-na-wysokosci', 'lifts') },
  { icon: GeneratorIcon, label: 'Agregaty', href: subcategoryHref('agregaty-i-zasilanie', 'generators') },
];

const iconClass = 'size-5 shrink-0 sm:size-[26px]';
const pillClass = 'flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[13px] font-medium sm:min-h-12 sm:gap-2.5 sm:px-5 sm:text-sm text-foreground shadow-sm transition hover:border-amber-400 hover:bg-brand-100 dark:hover:bg-slate-700';

/** Popular equipment pills; "Wszystkie kategorie" opens every category below in the same style. */
export default function PopularEquipment() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav aria-label="Popularny sprzęt" data-no-tab-swipe className="no-scrollbar mx-auto flex max-w-7xl gap-2 sm:gap-3 overflow-x-auto px-4 pb-1 pt-5 sm:px-6 lg:justify-center">
        {PILLS.map(({ icon: Icon, label, href }, index) => (
          <Link key={label} href={href} className={`${pillClass} ${index === 0 ? 'border-brand-200 bg-brand-100 dark:border-slate-600 dark:bg-slate-700' : 'border-border bg-card'}`}>
            <Icon className={iconClass} /> {label}
          </Link>
        ))}
        <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="more-categories" className={`${pillClass} ${open ? 'border-amber-400 bg-brand-100 dark:bg-slate-700' : 'border-border bg-card'}`}>
          <LayoutGrid size={19} aria-hidden="true" /> Wszystkie kategorie <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
      </nav>
      <div id="more-categories" className={`mx-auto grid max-w-7xl px-4 transition-[grid-template-rows,visibility] duration-200 sm:px-6 ${open ? 'grid-rows-[1fr]' : 'invisible grid-rows-[0fr]'}`}>
        <div className="min-h-0 overflow-hidden">
          <ul aria-label="Kategorie" className="grid grid-cols-2 gap-2 pb-1 pt-2 sm:flex sm:flex-wrap sm:gap-3 sm:pt-3 lg:justify-center">
            {MARKET_CATEGORIES.map(({ value, label, hub }) => (
              <li key={value} className="min-w-0">
                <Link href={`/${hub}`} className={`${pillClass} border-border bg-card max-sm:h-full max-sm:shrink max-sm:px-3 max-sm:leading-tight`}>
                  <CategoryIcon category={value} className={iconClass} /> {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

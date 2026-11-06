'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, LayoutGrid } from 'lucide-react';
import { CompactorIcon, ExcavatorIcon, GeneratorIcon, LiftIcon } from './icons/EquipmentIcons';

const PILLS = [
  { icon: ExcavatorIcon, label: 'Minikoparki', query: 'minikoparki' },
  { icon: CompactorIcon, label: 'Zagęszczarki', query: 'zagęszczarki' },
  { icon: LiftIcon, label: 'Podnośniki', query: 'podnośniki' },
  { icon: GeneratorIcon, label: 'Agregaty', query: 'agregaty' },
];

const pillClass = 'flex min-h-12 shrink-0 items-center gap-2.5 rounded-full border px-5 text-sm font-medium text-foreground shadow-sm transition hover:border-amber-400 hover:bg-brand-100 dark:hover:bg-slate-700';

/** Popular equipment pills; `children` are the remaining categories, revealed in place. */
export default function PopularEquipment({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav aria-label="Popularny sprzęt" data-no-tab-swipe className="no-scrollbar mx-auto flex max-w-7xl gap-3 overflow-x-auto px-4 pb-1 pt-5 sm:px-6 lg:justify-center">
        {PILLS.map(({ icon: Icon, label, query }, index) => (
          <Link key={label} href={`/szukaj?q=${encodeURIComponent(query)}`} className={`${pillClass} ${index === 0 ? 'border-brand-200 bg-brand-100 dark:border-slate-600 dark:bg-slate-700' : 'border-border bg-card'}`}>
            <Icon /> {label}
          </Link>
        ))}
        <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="more-categories" className={`${pillClass} ${open ? 'border-amber-400 bg-brand-100 dark:bg-slate-700' : 'border-border bg-card'}`}>
          <LayoutGrid size={19} aria-hidden="true" /> Wszystkie kategorie <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
      </nav>
      <div id="more-categories" className={`mx-auto grid max-w-7xl px-4 transition-[grid-template-rows,visibility] duration-200 sm:px-6 ${open ? 'grid-rows-[1fr]' : 'invisible grid-rows-[0fr]'}`}>
        <div className="min-h-0 overflow-hidden">
          <div className="grid grid-cols-2 gap-2 p-1 pt-3 sm:grid-cols-3 lg:grid-cols-6">{children}</div>
        </div>
      </div>
    </>
  );
}

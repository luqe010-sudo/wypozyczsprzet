'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BrickWall, Caravan, ChevronDown, Drill, LayoutGrid, Package, Sprout, Tractor } from 'lucide-react';
import { CompactorIcon, ExcavatorIcon, GeneratorIcon, LiftIcon } from './icons/EquipmentIcons';

const PILLS = [
  { icon: ExcavatorIcon, label: 'Minikoparki', href: `/szukaj?q=${encodeURIComponent('minikoparki')}` },
  { icon: CompactorIcon, label: 'Zagęszczarki', href: `/szukaj?q=${encodeURIComponent('zagęszczarki')}` },
  { icon: LiftIcon, label: 'Podnośniki', href: `/szukaj?q=${encodeURIComponent('podnośniki')}` },
  { icon: GeneratorIcon, label: 'Agregaty', href: `/szukaj?q=${encodeURIComponent('agregaty')}` },
];

const lucideProps = { size: 24, strokeWidth: 1.6 };
const CATEGORY_ICONS = {
  earthmoving: (props) => <Tractor {...lucideProps} {...props} />,
  tools: (props) => <Drill {...lucideProps} {...props} />,
  trailers: (props) => <Caravan {...lucideProps} {...props} />,
  'power-generators': GeneratorIcon,
  concrete: (props) => <BrickWall {...lucideProps} {...props} />,
  garden: (props) => <Sprout {...lucideProps} {...props} />,
  'access-platforms': LiftIcon,
  'other-equipment': (props) => <Package {...lucideProps} {...props} />,
};

// Pill-length names and an order that pairs short with long, so the panel is one row on a laptop
// and three rows of two on a phone.
const SHORT_LABELS = { tools: 'Narzędzia', garden: 'Ogród', 'other-equipment': 'Inny sprzęt' };
const PANEL_ORDER = ['earthmoving', 'tools', 'trailers', 'other-equipment', 'concrete', 'garden'];
const panelRank = (value) => (PANEL_ORDER.includes(value) ? PANEL_ORDER.indexOf(value) : PANEL_ORDER.length);
const iconClass = 'size-5 shrink-0 sm:size-[26px]';

const pillClass = 'flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[13px] font-medium sm:min-h-12 sm:gap-2.5 sm:px-5 sm:text-sm text-foreground shadow-sm transition hover:border-amber-400 hover:bg-brand-100 dark:hover:bg-slate-700';

/** Popular equipment pills; the remaining `categories` ({ value, label, hub }) open below in the same style. */
export default function PopularEquipment({ categories }) {
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
          <ul aria-label="Pozostałe kategorie" className="flex flex-wrap gap-2 pb-1 pt-2 sm:gap-3 sm:pt-3 lg:justify-center">
            {[...categories].sort((a, b) => panelRank(a.value) - panelRank(b.value)).map(({ value, label, hub }) => {
              const Icon = CATEGORY_ICONS[value] || LayoutGrid;
              return (
                <li key={value}>
                  <Link href={`/${hub}`} className={`${pillClass} border-border bg-card`}>
                    <Icon className={iconClass} aria-hidden="true" /> {SHORT_LABELS[value] || label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}

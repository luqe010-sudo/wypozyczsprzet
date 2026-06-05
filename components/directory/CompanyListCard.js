'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { citySlug } from '../../lib/slugify';

/**
 * Compact company card for the catalog listing page (/katalog).
 * Shows logo, name, rating, category, and cities.
 */
export default function CompanyListCard({ company }) {
  const branches = company.branches || [];
  const cities = [...new Set(branches.map((b) => b.city).filter(Boolean))];
  const firstCity = cities[0] || '';
  const href = `/katalog/${citySlug(firstCity)}/${company.slug}`;

  const hasLogo = company.logo_url && company.logo_url.startsWith('http');
  const initials = (company.name || '??')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  // Star rating display
  const rating = company.rating ? parseFloat(company.rating) : null;
  const reviewCount = company.review_count || 0;

  return (
    <Link href={href} className="group block no-underline">
      <article className="relative bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-blue-500/30 dark:hover:border-blue-400/30 transition-all duration-300 overflow-hidden h-full flex flex-col">
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="p-5 flex flex-col flex-1">
          {/* Header: Logo + Name + Category */}
          <div className="flex items-start gap-4 mb-4">
            {/* Logo / Initials */}
            <div className="relative flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-slate-600 group-hover:scale-105 transition-transform duration-300">
              {hasLogo ? (
                <Image
                  src={company.logo_url}
                  alt={`Logo ${company.name}`}
                  fill
                  sizes="56px"
                  className="object-contain p-1.5"
                />
              ) : (
                <span className="text-lg font-black text-blue-600 dark:text-blue-400 select-none">
                  {initials}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
                {company.name}
              </h3>
              {company.category && (
                <span className="inline-block mt-1 text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                  {company.category}
                </span>
              )}
            </div>
          </div>

          {/* Rating */}
          {rating !== null && rating > 0 ? (
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      star <= Math.round(rating)
                        ? 'text-amber-400'
                        : 'text-gray-200 dark:text-slate-600'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                {rating.toFixed(1)}
              </span>
              {reviewCount > 0 && (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  ({reviewCount})
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 mb-3 text-xs text-gray-400 dark:text-gray-500">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span>Brak opinii</span>
            </div>
          )}

          {/* Description preview */}
          {company.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-4">
              {company.description}
            </p>
          )}

          {/* Cities */}
          <div className="mt-auto pt-3 border-t border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium truncate">
                {cities.length > 3
                  ? `${cities.slice(0, 3).join(', ')} +${cities.length - 3}`
                  : cities.join(', ') || 'Brak lokalizacji'}
              </span>
            </div>
            {branches.length > 1 && (
              <div className="mt-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                {branches.length} {branches.length === 1 ? 'oddział' : branches.length < 5 ? 'oddziały' : 'oddziałów'}
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

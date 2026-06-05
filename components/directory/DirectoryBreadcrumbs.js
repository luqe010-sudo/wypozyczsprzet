import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Reusable breadcrumbs for the /katalog directory.
 * @param {Array} items - [{label, href?}] - last item has no href (current page)
 */
export default function DirectoryBreadcrumbs({ items = [] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Strona główna',
        item: 'https://wypozycz.online',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Katalog firm',
        item: 'https://wypozycz.online/katalog',
      },
      ...items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 3,
        name: item.label,
        ...(item.href ? { item: `https://wypozycz.online${item.href}` } : {}),
      })),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="flex mb-6 overflow-x-auto no-scrollbar py-2" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-2 whitespace-nowrap text-sm">
          <li className="inline-flex items-center">
            <Link
              href="/"
              className="inline-flex items-center font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <Home size={14} className="mr-1.5" />
              Start
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <ChevronRight size={14} className="text-gray-400 mx-1" />
              <Link
                href="/katalog"
                className="font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                Katalog firm
              </Link>
            </div>
          </li>
          {items.map((item, index) => (
            <li key={index}>
              <div className="flex items-center">
                <ChevronRight size={14} className="text-gray-400 mx-1" />
                {item.href ? (
                  <Link
                    href={item.href}
                    className="font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {item.label}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

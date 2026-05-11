import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs({ items }) {
  return (
    <nav className="flex mb-8 overflow-x-auto no-scrollbar py-2" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3 whitespace-nowrap">
        <li className="inline-flex items-center">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white transition-colors">
            <Home size={14} className="mr-2" />
            Start
          </Link>
        </li>
        <li>
          <div className="flex items-center">
            <ChevronRight size={16} className="text-gray-400 mx-1" />
            <Link href="/umowy" className="text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white transition-colors">
              Wzory umów
            </Link>
          </div>
        </li>
        {items && items.map((item, index) => (
          <li key={index}>
            <div className="flex items-center">
              <ChevronRight size={16} className="text-gray-400 mx-1" />
              {item.href ? (
                <Link href={item.href} className="text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {item.label}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}

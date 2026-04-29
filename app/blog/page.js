import Link from 'next/link';
import { articles } from '../../lib/articles';

export const metadata = {
  title: 'Poradniki i Blog - WypożyczSprzęt',
  description: 'Baza wiedzy o wynajmie sprzętu budowlanego. Poradniki, zestawienia cen i wskazówki dla budowlańców oraz majsterkowiczów.',
  openGraph: {
    title: 'Poradniki i Blog - WypożyczSprzęt',
    description: 'Baza wiedzy o wynajmie sprzętu budowlanego. Poradniki, zestawienia cen i wskazówki.',
    images: [
      {
        url: 'https://wypozycz.online/header.png',
        width: 1200,
        height: 630,
        alt: 'Blog WypożyczSprzęt',
      },
    ],
    type: 'website',
  },
};

export default function BlogIndexPage() {
  return (
    <div className="max-w-[1000px] mx-auto px-4 py-8">
      <header className="text-center mb-12 mt-8">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 dark:text-white">
          Poradniki i <span className="text-blue-600">Wiedza</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Praktyczne porady, zestawienia cenowe i wskazówki, które pomogą Ci wybrać najlepszy sprzęt do Twojego projektu budowlanego.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {articles.map((article) => (
          <Link key={article.slug} href={`/blog/${article.slug}`} className="group no-underline color-inherit">
            <article 
              className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden cursor-pointer h-full flex flex-col hover:shadow-xl hover:border-blue-500/30 transition-all duration-300"
            >
              <div className="p-8 flex-grow flex flex-col">
                <div className="flex justify-between items-center mb-4 text-sm">
                  <span className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">{article.category}</span>
                  <span className="text-gray-500 dark:text-gray-400">{article.date}</span>
                </div>
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                  {article.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed flex-grow">
                  {article.description}
                </p>
                <div className="mt-6 text-blue-600 dark:text-blue-400 font-bold text-sm flex items-center gap-1">
                  Czytaj dalej 
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      <div className="mt-16 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Wróć na stronę główną
        </Link>
      </div>
    </div>
  );
}

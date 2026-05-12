import Link from 'next/link';
import { SEO_CATEGORIES } from '../lib/categories';

export default function CategoryHubs({ categoryCounts = {} }) {
  const categories = Object.values(SEO_CATEGORIES);

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-3">
            Przeglądaj kategorie sprzętu
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Znajdź dokładnie to, czego szukasz — od koparek i agregatów po narzędzia i rusztowania.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Gradient accent */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${cat.color} transition-opacity duration-300`} />
              
              <div className="relative z-10">
                <span className="text-3xl md:text-4xl block mb-3">{cat.icon}</span>
                <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                  {cat.name}
                </h3>
                {categoryCounts[cat.slug] !== undefined && (
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">
                    {categoryCounts[cat.slug]} ofert
                  </span>
                )}
              </div>

              {/* Arrow */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

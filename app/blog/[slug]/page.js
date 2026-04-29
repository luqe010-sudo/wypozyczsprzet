import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getArticleBySlug, articles } from '../../../lib/articles';

export async function generateMetadata({ params }) {
  const article = getArticleBySlug(params.slug);
  if (!article) return { title: 'Nie znaleziono artykułu' };

  return {
    title: `${article.title} - Blog WypożyczSprzęt`,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      images: [
        {
          url: 'https://wypozycz.online/header.png',
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      type: 'article',
      publishedTime: article.date,
    },
  };
}

export async function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default function ArticlePage({ params }) {
  const article = getArticleBySlug(params.slug);
  if (!article) notFound();

  // Basic markdown-to-html converter for the blog content
  // Handles headers (##), bold (**), and lists (*)
  const renderContent = (content) => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      let htmlLine = line;
      
      // Headers
      if (htmlLine.startsWith('## ')) {
        return <h2 key={index} style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '2.5rem', marginBottom: '1rem', color: 'var(--foreground)' }}>{htmlLine.substring(3)}</h2>;
      }
      
      // Lists
      if (htmlLine.startsWith('* ')) {
        // Find bold inside lists
        const parts = htmlLine.substring(2).split(/\*\*(.*?)\*\*/g);
        return (
          <li key={index} style={{ marginBottom: '0.5rem', lineHeight: 1.8, marginLeft: '1.5rem', listStyleType: 'disc' }}>
            {parts.map((part, i) => i % 2 === 1 ? <strong key={i} style={{ color: 'var(--foreground)' }}>{part}</strong> : <span key={i}>{part}</span>)}
          </li>
        );
      }
      if (htmlLine.match(/^\d+\.\s/)) {
        // Numbered lists
        const numMatch = htmlLine.match(/^(\d+\.\s)(.*)/);
        const parts = numMatch[2].split(/\*\*(.*?)\*\*/g);
        return (
          <li key={index} style={{ marginBottom: '0.5rem', lineHeight: 1.8, marginLeft: '1.5rem', listStyleType: 'decimal' }}>
            {parts.map((part, i) => i % 2 === 1 ? <strong key={i} style={{ color: 'var(--foreground)' }}>{part}</strong> : <span key={i}>{part}</span>)}
          </li>
        );
      }

      // Empty lines
      if (!htmlLine.trim()) return <br key={index} />;

      // Paragraphs with bold
      const parts = htmlLine.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={index} style={{ marginBottom: '1rem', lineHeight: 1.8, color: 'var(--muted)' }}>
          {parts.map((part, i) => i % 2 === 1 ? <strong key={i} style={{ color: 'var(--foreground)' }}>{part}</strong> : <span key={i}>{part}</span>)}
        </p>
      );
    });
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    author: {
      '@type': 'Organization',
      name: 'WypożyczSprzęt'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-[800px] mx-auto px-4 py-12">
        <nav className="flex items-center gap-2 mb-8 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">Strona główna</Link>
          <span>/</span>
          <Link href="/blog" className="text-blue-600 dark:text-blue-400 hover:underline">Blog</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white line-clamp-1">{article.title}</span>
        </nav>

        <article className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <header className="p-8 md:p-12 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {article.category}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{article.date}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white leading-tight mb-6">
              {article.title}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
              {article.description}
            </p>
          </header>

          <div className="p-8 md:p-12 prose dark:prose-invert max-w-none">
            {renderContent(article.content)}
          </div>
        </article>

        <div className="mt-12 text-center">
          <Link href="/blog" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Powrót do artykułów
          </Link>
        </div>
      </div>
    </>
  );
}

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
      <div className="main-container" style={{ display: 'block', maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
        <nav style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--muted)' }}>
          <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Strona główna</Link>
          {' / '}
          <Link href="/blog" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Blog</Link>
          {' / '}
          <span style={{ color: 'var(--foreground)' }}>{article.title}</span>
        </nav>

        <article className="responsive-article-pad" style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <header style={{ marginBottom: '3rem', borderBottom: '1px solid var(--border)', paddingBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              <span style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '99px', fontWeight: 600 }}>
                {article.category}
              </span>
              <span style={{ color: 'var(--muted)' }}>{article.date}</span>
            </div>
            <h1 className="responsive-title" style={{ fontWeight: 800, lineHeight: 1.2, color: 'var(--foreground)', marginBottom: '1.5rem' }}>
              {article.title}
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--muted)', lineHeight: 1.6 }}>
              {article.description}
            </p>
          </header>

          <div className="article-content" style={{ fontSize: '1.05rem' }}>
            {renderContent(article.content)}
          </div>
        </article>

        <div style={{ marginTop: '4rem', textAlign: 'center' }}>
          <Link href="/blog" className="btn-secondary" style={{ textDecoration: 'none' }}>
            ← Powrót do artykułów
          </Link>
        </div>
      </div>
    </>
  );
}

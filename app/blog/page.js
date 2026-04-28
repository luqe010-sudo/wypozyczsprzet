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
    <div className="main-container" style={{ display: 'block', maxWidth: '1000px' }}>
      <header style={{ textAlign: 'center', marginBottom: '4rem', marginTop: '2rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--foreground)' }}>
          Poradniki i <span style={{ color: 'var(--primary)' }}>Wiedza</span>
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--muted)', maxWidth: '600px', margin: '0 auto' }}>
          Praktyczne porady, zestawienia cenowe i wskazówki, które pomogą Ci wybrać najlepszy sprzęt do Twojego projektu budowlanego.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
        {articles.map((article) => (
          <Link key={article.slug} href={`/blog/${article.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <article 
              className="blog-card"
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                overflow: 'hidden',
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ padding: '2rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{article.category}</span>
                  <span style={{ color: 'var(--muted)' }}>{article.date}</span>
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.4 }}>
                  {article.title}
                </h2>
                <p style={{ color: 'var(--muted)', lineHeight: 1.6, flexGrow: 1 }}>
                  {article.description}
                </p>
                <div style={{ marginTop: '1.5rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                  Czytaj dalej →
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: '4rem', textAlign: 'center' }}>
        <Link href="/" className="btn-secondary" style={{ textDecoration: 'none' }}>
          ← Wróć na stronę główną
        </Link>
      </div>
    </div>
  );
}

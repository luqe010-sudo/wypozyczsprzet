import React from 'react';

export const metadata = {
  title: 'Dodaj Ogłoszenie - Wynajem Sprzętu',
  description: 'Wypełnij formularz, aby dodać swoje ogłoszenie do naszej bazy.',
};

export default function AddListingPage() {
  const formUrl = process.env.NEXT_PUBLIC_FORM_URL || '';

  // Przygotowanie linku do osadzenia (zastąpienie parametrów jeśli potrzeba)
  const embedUrl = formUrl.includes('?') 
    ? `${formUrl.split('?')[0]}?embedded=true`
    : `${formUrl}?embedded=true`;

  return (
    <div className="main-container" style={{ display: 'block' }}>
      <div style={{ marginBottom: '2rem' }}>
        <a href="/" className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          ← Powrót do ogłoszeń
        </a>
      </div>

      <div className="search-hero" style={{ padding: '0', overflow: 'hidden', minHeight: '800px' }}>
        {formUrl ? (
          <iframe
            src={embedUrl}
            width="100%"
            height="1000"
            frameBorder="0"
            marginHeight="0"
            marginWidth="0"
            style={{ border: 'none', display: 'block' }}
          >
            Ładowanie...
          </iframe>
        ) : (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <h2>Formularz niedostępny</h2>
            <p>Przepraszamy, formularz dodawania ogłoszeń nie został skonfigurowany.</p>
          </div>
        )}
      </div>
    </div>
  );
}

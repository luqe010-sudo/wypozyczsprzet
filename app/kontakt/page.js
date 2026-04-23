import React from 'react';

export const metadata = {
  title: 'Kontakt i Współpraca - Wynajem Sprzętu',
  description: 'Skontaktuj się z nami w sprawie współpracy, reklamy lub dodania swojej firmy do bazy.',
};

export default function ContactPage() {
  return (
    <div className="main-container" style={{ display: 'block', maxWidth: '800px' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Kontakt i <span style={{ color: 'var(--primary-color)' }}>Współpraca</span></h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Jesteś właścicielem wypożyczalni? Chcesz dotrzeć do nowych klientów? Zapraszamy do kontaktu!
        </p>
      </header>

      <div className="filter-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', borderBottom: '2px solid var(--primary-color)', paddingBottom: '0.5rem', display: 'inline-block' }}>
          Dla Firm i Partnerów
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          Nasz marketplace to idealne miejsce na promocję Twojego sprzętu budowlanego. Oferujemy:
        </p>
        <ul style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', listStyle: 'none', padding: 0 }}>
          <li>✅ <strong>Zwiększenie zasięgów</strong> Twojej lokalnej firmy</li>
          <li>✅ <strong>Bezpośredni kontakt</strong> od zainteresowanych klientów</li>
          <li>✅ <strong>Prosty panel</strong> dodawania ogłoszeń bez zbędnych formalności</li>
          <li>✅ <strong>Możliwość integracji</strong> z Twoimi aktualnymi ofertami</li>
        </ul>

        <div style={{ backgroundColor: 'var(--secondary-color)', padding: '1.5rem', borderRadius: 'var(--border-radius)', borderLeft: '4px solid var(--primary-color)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Napisz do nas:</h3>
          <p style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            📧 kontakt@twojadomena.pl
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Odpowiadamy zazwyczaj w ciągu 24 godzin.
          </p>
        </div>
      </div>

      <div className="filter-card" style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Zgłoś błąd lub sugestię</h2>
        <p style={{ marginBottom: '1.5rem' }}>
          Stale rozwijamy naszą platformę. Jeśli masz pomysł na nową funkcjonalność lub zauważyłeś błąd, daj nam znać!
        </p>
        <a href="mailto:kontakt@twojadomena.pl" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
          Wyślij wiadomość
        </a>
      </div>

      <div style={{ marginTop: '3rem', textAlign: 'center' }}>
        <a href="/" className="btn-secondary" style={{ textDecoration: 'none' }}>
          ← Powrót do ogłoszeń
        </a>
      </div>
    </div>
  );
}

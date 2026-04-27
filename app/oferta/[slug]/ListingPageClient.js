"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DynamicPlaceholder from '../../../components/DynamicPlaceholder';
import { trackEvent } from '../../../lib/gtag';

export default function ListingPageClient({ listing, seoDescription, faqItems, related }) {
  const [showPhone, setShowPhone] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const name = listing['Sprzęt'] || 'Sprzęt';
  const company = listing.companyDetails || {};
  const phoneNumber = String(company.Telefon || '').trim();

  const hasHeroImage = listing.Zdjecie && String(listing.Zdjecie).startsWith('http');
  const isIncomplete = listing.Status && listing.Status.toLowerCase().includes('niekompletne');

  useEffect(() => {
    trackEvent('view_listing', {
      listing_name: name,
      listing_category: listing.Kategoria,
      listing_city: listing.Miasto,
    });
  }, [name, listing.Kategoria, listing.Miasto]);

  return (
    <>
      {/* Hero Image */}
      <div style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '2rem', position: 'relative', paddingTop: hasHeroImage ? '50%' : '0', backgroundColor: 'var(--primary-light)', minHeight: hasHeroImage ? '0' : '400px' }}>
        {hasHeroImage ? (
          <img
            src={listing.Zdjecie}
            alt={name}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <DynamicPlaceholder title={name} category={listing.Kategoria} />
          </div>
        )}
      </div>


      {/* Title + Price + Contact */}
      <div className="responsive-listing-header">
        <div>
          <span className="listing-category">{listing.Kategoria}</span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>{name}</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', color: 'var(--muted)', fontSize: '0.9375rem' }}>
            <span>{'📍'} {listing.Miasto}</span>
            <span>{'🏢'} {company.Nazwa || 'Brak firmy'}</span>
            {listing['Dostępność'] && listing['Dostępność'] !== 'brak danych' && (
              <span style={{ color: '#059669' }}>{'🟢'} {listing['Dostępność']}</span>
            )}
            {isIncomplete && (
              <span style={{ backgroundColor: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.75rem' }}>
                PROFIL NIEKOMPLETNY (40%)
              </span>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right', minWidth: '200px' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>
            {listing.Cena_od} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--muted)' }}>PLN / {listing.Czas || 'doba'}</span>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {phoneNumber && (
              showPhone ? (
                <a href={`tel:${phoneNumber.replace(/\s/g, '')}`} className="btn-primary" style={{ fontSize: '1.125rem', padding: '0.875rem 2rem' }}
                  onClick={() => trackEvent('click_phone', { listing_name: name, phone: phoneNumber })}>
                  {'📞 '}{phoneNumber}
                </a>
              ) : (
                <button 
                  className="btn-primary" 
                  style={{ fontSize: '1.125rem', padding: '0.875rem 2rem' }} 
                  onClick={() => { setShowPhone(true); trackEvent('show_phone', { listing_name: name }); }}
                >
                  {'Pokaż numer'}
                </button>
              )
            )}
            
            {isIncomplete && (
              <Link 
                href={`/dodaj-ogloszenie?edit=${listing.ID_sprzetu}`}
                className="btn-primary"
                style={{ fontSize: '1.125rem', padding: '0.875rem 2rem', backgroundColor: '#dc2626', color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
              >
                {'Jesteś właścicielem? - Uzupełnij dane.'}
              </Link>
            )}
            {listing.olxUrl && (
              <a href={listing.olxUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary"
                style={{ backgroundColor: '#23e5db', borderColor: '#23e5db', color: '#002f34' }}
                onClick={() => trackEvent('click_olx', { listing_name: name, olx_url: listing.olxUrl })}>
                <strong>{'Załatw przez OLX'}</strong>
              </a>
            )}
            {company.WWW && (
              <a href={company.WWW.startsWith('http') ? company.WWW : `https://${company.WWW}`} 
                target="_blank" rel="noopener noreferrer" className="btn-secondary"
                style={{ backgroundColor: '#fff', borderColor: '#e5e7eb', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                onClick={() => trackEvent('click_www', { listing_name: name, www: company.WWW })}>
                <span>{'🌐'}</span> <strong>{'Przejdź do strony'}</strong>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <section style={{ marginBottom: '3rem', backgroundColor: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>{'O sprzęcie'}</h2>
        {seoDescription.split('\n\n').map((paragraph, i) => (
          <p key={i} style={{ marginBottom: '1rem', lineHeight: 1.8, color: 'var(--muted)' }}>{paragraph}</p>
        ))}
      </section>

      {/* FAQ */}
      <section style={{ marginBottom: '3rem', backgroundColor: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>{'Najczęściej zadawane pytania'}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {faqItems.map((item, i) => (
            <div key={i} style={{ borderBottom: i < faqItems.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: '100%', textAlign: 'left', background: 'none', border: 'none',
                  padding: '1.25rem 0', cursor: 'pointer', fontSize: '1rem', fontWeight: 600,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontFamily: 'inherit', color: 'var(--foreground)',
                }}
              >
                {item.question}
                <span style={{ fontSize: '1.25rem', transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(180deg)' : 'none' }}>{'▼'}</span>
              </button>
              {openFaq === i && (
                <p style={{ padding: '0 0 1.25rem', lineHeight: 1.7, color: 'var(--muted)' }}>{item.answer}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>{'Inne oferty w tej kategorii'}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {related.map((item) => (
              <Link key={item.slug} href={`/oferta/${item.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="listing-card">
                  <div className="listing-image-container">
                    {item.Zdjecie && String(item.Zdjecie).startsWith('http') ? (
                      <img src={item.Zdjecie} alt={item['Sprzęt']} className="listing-image" />
                    ) : (
                      <DynamicPlaceholder title={item['Sprzęt']} category={item.Kategoria} />
                    )}
                  </div>
                  <div className="listing-content">
                    <span className="listing-category">{item.Kategoria}</span>
                    <h3 className="listing-title">{item['Sprzęt']}</h3>
                    <div className="listing-price">{item.Cena_od} PLN <span>/ {item.Czas || 'doba'}</span></div>
                    <div className="info-item">{'📍'} {item.Miasto}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Back */}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link href="/" className="btn-secondary" style={{ textDecoration: 'none' }}>
          {'← Powrót do wszystkich ofert'}
        </Link>
      </div>
    </>
  );
}

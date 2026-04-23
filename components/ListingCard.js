"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ListingCard({ listing }) {
  const [showPhone, setShowPhone] = useState(false);
  const router = useRouter();
  const company = listing.companyDetails || {};
  const phoneNumber = String(company.Telefon || '').trim();

  // Map categories to Unsplash images
  const getImageUrl = (category, sheetImage) => {
    // Priority 1: Image from Google Sheet
    if (sheetImage && String(sheetImage).startsWith('http')) {
      return sheetImage;
    }

    // Priority 2: Fallback to category-based Unsplash images
    const cat = String(category || '').toLowerCase();
    if (cat.includes('koparka') || cat.includes('minikoparka')) return 'https://images.unsplash.com/photo-1579450370423-f36b3383a18a?auto=format&fit=crop&q=80&w=800';
    if (cat.includes('\u0142adowarka')) return 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=800';
    if (cat.includes('narz\u0119dzi') || cat.includes('sprz\u0119t')) return 'https://images.unsplash.com/photo-1581141849291-1125c7b692b5?auto=format&fit=crop&q=80&w=800';
    if (cat.includes('podno\u015bnik')) return 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=800';
    if (cat.includes('ogrod')) return 'https://images.unsplash.com/photo-1558905619-17254263bc8a?auto=format&fit=crop&q=80&w=800';
    return 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=800'; // fallback
  };

  const handleCardClick = (e) => {
    // Prevent navigation if clicking on a button or link inside
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    router.push(`/oferta/${listing.slug}`);
  };

  return (
    <article className="listing-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div className="listing-image-container">
        <Link href={`/oferta/${listing.slug}`} tabIndex="-1">
          <img 
            src={getImageUrl(listing.Kategoria, listing.Zdjecie)} 
            alt={listing['Sprz\u0119t']} 
            className="listing-image"
          />
        </Link>
        {listing.isUserSubmitted && (
          <span
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              fontSize: '0.7rem',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              color: 'var(--foreground)',
              padding: '4px 8px',
              borderRadius: '6px',
              fontWeight: '700',
              backdropFilter: 'blur(4px)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {'⭐ Prywatne'}
          </span>
        )}
      </div>

      <div className="listing-content">
        <span className="listing-category">{listing.Kategoria}</span>
        <Link href={`/oferta/${listing.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 className="listing-title" style={{ transition: 'color 0.2s' }} 
              onMouseOver={(e) => e.target.style.color = 'var(--primary)'} 
              onMouseOut={(e) => e.target.style.color = 'inherit'}>
            {listing['Sprz\u0119t']}
          </h3>
        </Link>

        <div className="listing-price">
          {listing.Cena_od} PLN <span>/ {listing.Czas || 'doba'}</span>
        </div>

        <div className="listing-footer">
          <div className="info-item">
            {'📍'} <span>{listing.Miasto}</span>
          </div>
          <div className="info-item" style={{ color: 'var(--foreground)', fontWeight: 600 }}>
            {'🏢'} <span>{company.Nazwa || 'Brak firmy'}</span>
          </div>
          {listing['Dost\u0119pno\u015b\u0107'] && (
            <div className="info-item" style={{ color: '#059669' }}>
              {'🟢'} <span>{`Dost\u0119pne: ${listing['Dost\u0119pno\u015b\u0107']}`}</span>
            </div>
          )}
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {phoneNumber ? (
            showPhone ? (
              <a
                href={`tel:${phoneNumber.replace(/\s/g, '')}`}
                className="btn-primary"
                style={{ width: '100%', fontSize: '1rem' }}
                onClick={(e) => e.stopPropagation()}
              >
                {'📞 '} {phoneNumber}
              </a>
            ) : (
              <button
                className="btn-primary"
                style={{ width: '100%' }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPhone(true);
                }}
              >
                {'Poka\u017c numer'}
              </button>
            )
          ) : (
            <div className="info-item" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
              {'Brak numeru telefonu'}
            </div>
          )}

          {listing.olxUrl && (
            <a
              href={listing.olxUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ 
                width: '100%', 
                backgroundColor: '#23e5db',
                borderColor: '#23e5db',
                color: '#002f34'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <strong>{'Za\u0142atw przez OLX'}</strong>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function AddListingPage() {
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const [formData, setFormData] = useState({
    company: '',
    phone: '',
    city: '',
    category: 'Koparki',
    equipment: '',
    price: '',
    availability: 'Dostępne od zaraz',
    description: ''
  });

  const formUrl = process.env.NEXT_PUBLIC_FORM_URL || '';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');

    // === UWAGA DLA UŻYTKOWNIKA ===
    // Aby to działało z Twoim Google Form, musisz zamienić "entry.XXXXXX" na odpowiednie ID z Twojego formularza.
    // Musisz również upewnić się, że formularz w Google nie wymaga logowania (wyłączone zbieranie emaili i brak pola na plik).
    // Jeśli formularz nadal nie przyjmuje danych, możesz użyć serwisu takiego jak getform.io lub formspree.io jako backendu.
    
    const googleFormUrl = formUrl.replace('/viewform', '/formResponse');
    
    const body = new URLSearchParams();
    body.append('entry.1000001', formData.company); // Zmień na właściwe ID dla "Nazwa firmy"
    body.append('entry.1000002', formData.phone);   // Zmień na właściwe ID dla "Telefon"
    body.append('entry.1000003', formData.city);    // Zmień na właściwe ID dla "Miasto"
    body.append('entry.1000004', formData.category);// Zmień na właściwe ID dla "Kategoria"
    body.append('entry.1000005', formData.equipment);// Zmień na właściwe ID dla "Sprzęt"
    body.append('entry.1000006', formData.price);   // Zmień na właściwe ID dla "Cena od"
    body.append('entry.1000007', formData.availability); // Zmień na właściwe ID dla "Dostępność"
    body.append('entry.1000008', formData.description); // Zmień na właściwe ID dla "Opis"

    try {
      await fetch(googleFormUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });
      // no-cors always returns opaque response, assume success
      setStatus('success');
      setFormData({ company: '', phone: '', city: '', category: 'Koparki', equipment: '', price: '', availability: 'Dostępne od zaraz', description: '' });
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="main-container" style={{ display: 'block', maxWidth: '800px', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/" className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          ← Powrót do ogłoszeń
        </Link>
      </div>

      <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Dodaj swoje ogłoszenie</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
          Wypełnij poniższy formularz, aby dodać swój sprzęt do naszej bazy. Pojawi się on na stronie głównej i będzie widoczny dla tysięcy użytkowników.
        </p>

        {status === 'success' ? (
          <div style={{ padding: '2rem', backgroundColor: '#ecfdf5', color: '#065f46', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Ogłoszenie zostało wysłane!</h3>
            <p>Pojawi się na stronie po automatycznej synchronizacji z bazą danych.</p>
            <button onClick={() => setStatus('idle')} className="btn-primary" style={{ marginTop: '1.5rem' }}>Dodaj kolejne</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Nazwa Firmy / Osoby</label>
                <input required type="text" name="company" value={formData.company} onChange={handleChange} 
                       style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Telefon kontaktowy</label>
                <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} 
                       style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Miasto</label>
                <input required type="text" name="city" value={formData.city} onChange={handleChange} 
                       style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Kategoria</label>
                <select name="category" value={formData.category} onChange={handleChange} 
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'white' }}>
                  <option value="Koparki">Koparki</option>
                  <option value="Ładowarki">Ładowarki</option>
                  <option value="Podnośniki">Podnośniki</option>
                  <option value="Narzędzia">Narzędzia i sprzęt</option>
                  <option value="Ogród">Ogród</option>
                  <option value="Inne">Inne</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Nazwa Sprzętu</label>
              <input required type="text" name="equipment" value={formData.equipment} onChange={handleChange} placeholder="np. Minikoparka Kubota U17-3a"
                     style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Cena za dobę (PLN)</label>
                <input required type="number" name="price" value={formData.price} onChange={handleChange} 
                       style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Dostępność</label>
                <select name="availability" value={formData.availability} onChange={handleChange} 
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'white' }}>
                  <option value="Dostępne od zaraz">Dostępne od zaraz</option>
                  <option value="Wkrótce">Wkrótce</option>
                  <option value="Brak danych">Brak danych</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Opis sprzętu (Opcjonalnie)</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="4"
                        placeholder="Szczegóły, dane techniczne, zasady wynajmu..."
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', resize: 'vertical' }}></textarea>
            </div>

            {status === 'error' && (
              <div style={{ color: '#dc2626', fontSize: '0.875rem' }}>Wystąpił błąd podczas wysyłania formularza. Spróbuj ponownie później.</div>
            )}

            <button type="submit" disabled={status === 'submitting'} className="btn-primary" style={{ padding: '1rem', fontSize: '1.125rem', marginTop: '1rem' }}>
              {status === 'submitting' ? 'Wysyłanie...' : 'Dodaj ogłoszenie'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

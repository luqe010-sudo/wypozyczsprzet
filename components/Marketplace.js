"use client";

import { useEffect, useMemo, useState } from 'react';
import Filters from './Filters';
import ListingGrid from './ListingGrid';

export default function Marketplace({ initialData }) {
  const { listings, filters } = initialData;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCity, selectedCategory]);

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const equipmentName = String(item['Sprz\u0119t'] || '');
      const categoryName = String(item.Kategoria || '');
      const searchValue = searchTerm.toLowerCase();

      const matchSearch = searchTerm
        ? equipmentName.toLowerCase().includes(searchValue) ||
          categoryName.toLowerCase().includes(searchValue)
        : true;

      const matchCity = selectedCity ? item.Miasto === selectedCity : true;
      const matchCategory = selectedCategory ? item.Kategoria === selectedCategory : true;

      return matchSearch && matchCity && matchCategory;
    });
  }, [listings, searchTerm, selectedCity, selectedCategory]);

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h2>{'Wynajmij sprz\u0119t w swojej okolicy'}</h2>
          <p>
            {'Szybko znajd\u017a koparki, narz\u0119dzia i sprz\u0119t budowlany blisko Ciebie'}
          </p>
          <div className="hero-search">
            <input
              type="text"
              placeholder="Czego szukasz? (np. koparka, wiertarka...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn-primary">{'Znajdź sprzęt'}</button>
          </div>
        </div>
      </section>

      <div className="main-container">
        <aside className="sidebar">
          <Filters
            availableCities={filters.cities}
            availableCategories={filters.categories}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />

          <div className="filter-card" style={{ marginTop: '2.5rem', padding: '1.5rem', backgroundColor: 'var(--primary-light)', borderRadius: '16px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '1.5rem', letterSpacing: '0.05em' }}>
              {'Dlaczego warto?'}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.25rem' }}>{'🆓'}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{'Darmowe og\u0142oszenia'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.1rem' }}>{'Dodawaj oferty bez op\u0142at.'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.25rem' }}>{'⚡'}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{'Szybki kontakt'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.1rem' }}>{'Bezpo\u015bredni nr telefonu.'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.25rem' }}>{'📍'}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{'Lokalni wykonawcy'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.1rem' }}>{'Sprz\u0119t w Twojej okolicy.'}</div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className="content">
          <div className="ux-info-banner">
            <div>
              <p>{'Chcesz doda\u0107 og\u0142oszenie?'}</p>
              <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>{'Wype\u0142nij prosty formularz \u2013 bez logowania.'}</span>
            </div>
            <a href="/dodaj-ogloszenie" className="btn-secondary">
              {'Dodaj og\u0142oszenie teraz'}
            </a>
          </div>

          {isLoading ? (
            <div className="loading-state">
              <h3>{'Trwa wyszukiwanie...'}</h3>
            </div>
          ) : filteredListings.length > 0 ? (
            <ListingGrid listings={filteredListings} />
          ) : (
            <div className="empty-state">
              <h3>{'Nie znaleziono sprz\u0119tu'}</h3>
              <p>{'Spr\u00f3buj zmieni\u0107 kryteria wyszukiwania lub filtry.'}</p>
              <button
                className="btn-primary"
                style={{ marginTop: '1.5rem' }}
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCity('');
                  setSelectedCategory('');
                }}
              >
                {'Wyczy\u015b\u0107 filtry'}
              </button>
            </div>
          )}
        </section>
      </div>


      <div style={{ padding: '4rem 2rem', color: 'var(--muted)', fontSize: '0.9375rem', textAlign: 'center', backgroundColor: 'var(--primary-light)' }}>
        <div className="navbar-container">
          <p style={{ fontStyle: 'italic', maxWidth: '800px', margin: '0 auto', lineHeight: 1.8 }}>
            👉 {'Wynajem koparek Wroc\u0142aw, minikoparki, sprz\u0119t budowlany, \u0142adowarki teleskopowe, podno\u015bniki koszowe, wynajem zag\u0119szczarek i sprz\u0119tu ogrodniczego. Znajd\u017a najlepsze oferty od lokalnych firm w Twojej okolicy.'}
          </p>
        </div>
      </div>
    </>
  );
}

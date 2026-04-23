"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function Navbar({ actionUrl, actionLabel }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link href="/" className="logo">
          {'Wypo\u017cycz'}<span>{'Sprz\u0119t'}</span>
        </Link>

        {/* Hamburger Icon */}
        <button 
          className="mobile-menu-toggle"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>

        {/* Links */}
        <div className={`nav-links ${isOpen ? 'active' : ''}`}>
          <Link href="/" onClick={() => setIsOpen(false)}>{'Strona główna'}</Link>
          <Link href="/blog" onClick={() => setIsOpen(false)}>{'Poradniki'}</Link>
          <Link href="/kontakt" onClick={() => setIsOpen(false)}>{'Kontakt'}</Link>
          {actionUrl ? (
            <Link
              href="/dodaj-ogloszenie"
              className="btn-primary"
              onClick={() => setIsOpen(false)}
            >
              {actionLabel}
            </Link>
          ) : (
            <span
              className="btn-primary"
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
              aria-disabled="true"
            >
              {'Formularz niedost\u0119pny'}
            </span>
          )}
        </div>
      </div>
    </nav>
  );
}

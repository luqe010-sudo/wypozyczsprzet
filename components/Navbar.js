"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function Navbar({ actionUrl, actionLabel }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Link href="/" className="logo">
            {'Wypo\u017cycz'}<span>{'Sprz\u0119t'}</span>
          </Link>

          {/* Hamburger Icon */}
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMenu}
            aria-label="Toggle menu"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              padding: '0.5rem',
              cursor: 'pointer',
              color: 'var(--foreground)'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>

          {/* Desktop Nav */}
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
      </div>
      
      <style jsx>{`
        @media (max-width: 768px) {
          .mobile-menu-toggle {
            display: block !important;
          }
          
          .nav-links {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            flex-direction: column;
            padding: 1rem;
            border-bottom: 1px solid var(--border);
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            gap: 0 !important;
          }
          
          .nav-links.active {
            display: flex;
          }

          .nav-links :global(a), .nav-links :global(span) {
            width: 100%;
            padding: 1rem;
            border-bottom: 1px solid var(--border);
            font-size: 1.1rem;
          }

          .nav-links :global(a:last-child) {
            border-bottom: none;
          }

          .nav-links :global(.btn-primary) {
            margin-top: 1rem;
            border-bottom: none;
            text-align: center;
          }
        }
      `}</style>
    </nav>
  );
}

"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { trackEvent } from '../lib/gtag';

export default function Navbar({ actionUrl, actionLabel }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleDarkMode = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  return (
    <nav className="navbar dark:bg-slate-900 transition-colors">
      <div className="navbar-container">
        <Link href="/" className="flex items-center group">
          <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
            Wypożycz<span className="text-blue-600">Sprzęt</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {/* Facebook Link */}
          <a 
            href="https://www.facebook.com/profile.php?id=61561285692729" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-500 dark:text-gray-400"
            aria-label="Facebook Fanpage"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>

          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-500 dark:text-gray-400"
            aria-label="Toggle Dark Mode"
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
            )}
          </button>

          {/* Hamburger Icon */}
          <button 
            className="mobile-menu-toggle dark:text-white"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
            </svg>
          </button>
        </div>

        {/* Links */}
        <div className={`nav-links ${isOpen ? 'active' : ''} dark:bg-slate-900`}>
          <Link href="/" onClick={() => setIsOpen(false)} className="dark:text-gray-300 dark:hover:text-white">{'Strona główna'}</Link>
          <Link href="/blog" onClick={() => setIsOpen(false)} className="dark:text-gray-300 dark:hover:text-white">{'Poradniki'}</Link>
          <Link href="/regulamin" onClick={() => setIsOpen(false)} className="dark:text-gray-300 dark:hover:text-white">{'Regulamin'}</Link>
          <Link href="/kontakt" onClick={() => setIsOpen(false)} className="dark:text-gray-300 dark:hover:text-white">{'Kontakt'}</Link>
          {actionUrl ? (
            <Link
              href="/dodaj-ogloszenie"
              className="btn-primary"
              onClick={() => { setIsOpen(false); trackEvent('click_add_listing', { source: 'navbar' }); }}
            >
              {actionLabel}
            </Link>
          ) : (
            <span className="btn-primary opacity-60 cursor-not-allowed">{'Formularz niedost\u0119pny'}</span>
          )}
        </div>
      </div>
    </nav>
  );
}

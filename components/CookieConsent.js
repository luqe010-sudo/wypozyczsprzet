"use client";

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { CONSENT_KEY, GA_MEASUREMENT_ID, initializeAnalytics, readCookieConsent } from '../lib/gtag';

export default function CookieConsent() {
  const [storedConsent, setStoredConsent] = useState(readCookieConsent);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState({ analytics: storedConsent?.analytics === true, necessary: true });
  const showBanner = !storedConsent;

  useEffect(() => {
    initializeAnalytics();
  }, []);

  const saveConsent = (newConsent) => {
    setShowSettings(false);
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(newConsent));
    } catch {
      setStoredConsent({ analytics: false, necessary: true });
      return;
    }
    setStoredConsent(newConsent);

    // Reload so page events start from the first render after analytics consent.
    if (newConsent.analytics) window.location.reload();
  };

  const acceptAll = () => saveConsent({ analytics: true, necessary: true });
  const rejectOptional = () => saveConsent({ analytics: false, necessary: true });

  if (!showBanner && !showSettings) {
    // Load GA if consent given
    if (storedConsent.analytics === true) {
      return (
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="lazyOnload"
        />
      );
    }
    return null;
  }

  return (
    <>
      {/* Cookie Banner */}
      {showBanner && !showSettings && (
        <div className="cookie-banner">
          <div className="cookie-container">
            <div className="cookie-content">
              <h3>Ta strona używa plików cookies</h3>
              <p>Niezbędne pliki cookies zapewniają działanie serwisu. Analityczne włączymy tylko za Twoją zgodą. Szczegóły w <Link href="/polityka-prywatnosci" style={{ textDecoration: 'underline' }}>polityce prywatności</Link>.</p>
            </div>
            <div className="cookie-actions">
              <button onClick={() => setShowSettings(true)} className="btn-cookie-settings">Ustawienia</button>
              <button onClick={rejectOptional} className="btn-cookie-secondary">Odrzuć opcjonalne</button>
              <button onClick={acceptAll} className="btn-cookie-primary">Akceptuj wszystkie</button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="cookie-modal-overlay">
          <div className="cookie-modal">
            <h2>Ustawienia prywatności</h2>
            <div className="cookie-setting-item">
              <div className="setting-info">
                <strong>Cookies niezbędne</strong>
                <p>Wymagane do prawidłowego działania strony.</p>
              </div>
              <input type="checkbox" checked disabled />
            </div>
            <div className="cookie-setting-item">
              <div className="setting-info">
                <strong>Cookies analityczne (Google Analytics)</strong>
                <p>Pomagają nam zrozumieć, jak użytkownicy korzystają ze strony.</p>
              </div>
              <input 
                type="checkbox" 
                checked={consent.analytics} 
                onChange={(e) => setConsent({ ...consent, analytics: e.target.checked })} 
              />
            </div>
            <div className="cookie-modal-actions">
              <button onClick={() => setShowSettings(false)} className="btn-cookie-secondary">Anuluj</button>
              <button onClick={() => saveConsent(consent)} className="btn-cookie-primary">Zapisz ustawienia</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .cookie-banner {
          position: fixed;
          bottom: 20px;
          left: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          z-index: 9999;
          animation: slideUp 0.5s ease-out;
        }
        :global(.dark) .cookie-banner {
          background: rgba(30, 41, 59, 0.9);
          border-color: rgba(71, 85, 105, 0.5);
        }
        .cookie-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        @media (min-width: 768px) {
          .cookie-container {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }
        .cookie-content h3 {
          margin: 0 0 8px 0;
          font-size: 1.1rem;
          color: #1a1a1a;
        }
        :global(.dark) .cookie-content h3 {
          color: #f1f5f9;
        }
        .cookie-content p {
          margin: 0;
          font-size: 0.9rem;
          color: #666;
          line-height: 1.5;
        }
        :global(.dark) .cookie-content p {
          color: #94a3b8;
        }
        .cookie-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .btn-cookie-primary, .btn-cookie-secondary, .btn-cookie-settings {
          min-height: 44px;
          padding: 8px 14px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-cookie-primary {
          background: #ffc400;
          color: #111d2c;
          border: none;
        }
        .btn-cookie-primary:hover { background: #ffd44d; }
        .btn-cookie-secondary {
          background: #e2e8f0;
          color: #334155;
          text-decoration: underline;
          border: none;
        }
        .btn-cookie-secondary:hover { background: rgba(0, 0, 0, 0.1); }
        .btn-cookie-settings {
          background: transparent;
          color: var(--foreground);
          border: 1px solid var(--muted);
        }
        .btn-cookie-settings:hover { background: var(--background); }

        .cookie-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
        }
        .cookie-modal {
          background: white;
          border-radius: 32px;
          padding: 40px;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: fadeIn 0.3s ease-out;
        }
        :global(.dark) .cookie-modal {
          background: #1e293b;
          color: #f1f5f9;
        }
        .cookie-modal h2 { margin-top: 0; font-size: 1.5rem; }
        .cookie-setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        .setting-info p { margin: 4px 0 0 0; font-size: 0.85rem; color: #6b7280; }
        .cookie-modal-actions {
          margin-top: 32px;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import Script from 'next/script';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [consent, setConsent] = useState({ analytics: false, necessary: true });

  useEffect(() => {
    const storedConsent = localStorage.getItem('cookieConsent');
    if (!storedConsent) {
      setShowBanner(true);
    } else {
      setConsent(JSON.parse(storedConsent));
    }
  }, []);

  const saveConsent = (newConsent) => {
    localStorage.setItem('cookieConsent', JSON.stringify(newConsent));
    setConsent(newConsent);
    setShowBanner(false);
    setShowSettings(false);
    
    // Reload if needed or trigger GA
    if (newConsent.analytics) {
      window.location.reload(); // Simplest way to trigger GA script if it checks consent on load
    }
  };

  const acceptAll = () => saveConsent({ analytics: true, necessary: true });
  const rejectOptional = () => saveConsent({ analytics: false, necessary: true });

  if (!showBanner && !showSettings && !showPrivacy) {
    // Load GA if consent given
    if (consent.analytics) {
      return (
        <>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-02JHGY66TQ"
            strategy="afterInteractive"
          />
          <Script id="google-analytics-consent" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-02JHGY66TQ');
            `}
          </Script>
        </>
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
              <h3>Ta strona używa ciasteczek 🍪</h3>
              <p>Używamy plików cookies, aby zapewnić najlepszą jakość korzystania z naszej strony oraz do celów analitycznych.</p>
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
          border-radius: 24px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          z-index: 9999;
          animation: slideUp 0.5s ease-out;
        }
        .cookie-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
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
        .cookie-content p {
          margin: 0;
          font-size: 0.9rem;
          color: #666;
          line-height: 1.5;
        }
        .cookie-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .btn-cookie-primary, .btn-cookie-secondary, .btn-cookie-settings {
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-cookie-primary {
          background: #2563eb;
          color: white;
          border: none;
        }
        .btn-cookie-primary:hover { background: #1d4ed8; }
        .btn-cookie-secondary {
          background: rgba(0, 0, 0, 0.05);
          color: #4b5563;
          border: none;
        }
        .btn-cookie-secondary:hover { background: rgba(0, 0, 0, 0.1); }
        .btn-cookie-settings {
          background: transparent;
          color: #2563eb;
          border: 1px solid #2563eb;
        }
        .btn-cookie-settings:hover { background: rgba(37, 99, 235, 0.05); }

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

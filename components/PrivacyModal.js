"use client";

import React from 'react';

export default function PrivacyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="privacy-modal-overlay" onClick={onClose}>
      <div className="privacy-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>&times;</button>
        <div className="privacy-content">
          <h2>Polityka Prywatności</h2>
          <div className="privacy-text">
            <h3>1. Informacje ogólne</h3>
            <p>Niniejsza polityka prywatności określa zasady przetwarzania danych osobowych oraz wykorzystywania plików cookies w serwisie internetowym wypozycz.online (dalej: „Serwis”).</p>
            <p>Administratorem danych osobowych jest:<br />
            wypozycz.online<br />
            Adres e-mail: kontakt@wypozycz.online</p>

            <h3>2. Zakres zbieranych danych</h3>
            <p>W zależności od sposobu korzystania z Serwisu możemy przetwarzać:</p>
            <ul>
              <li><strong>a) Dane podawane dobrowolnie:</strong> imię i nazwisko, adres e-mail, numer telefonu, treść ogłoszenia / wiadomości, inne dane podane w formularzu.</li>
              <li><strong>b) Dane zbierane automatycznie:</strong> adres IP, typ przeglądarki, system operacyjny, dane o aktywności w Serwisie.</li>
            </ul>

            <h3>3. Cele przetwarzania danych</h3>
            <p>Dane osobowe przetwarzane są w celu:</p>
            <ul>
              <li>publikacji ogłoszeń w Serwisie</li>
              <li>kontaktu z użytkownikiem</li>
              <li>obsługi zapytań</li>
              <li>poprawy działania Serwisu (analityka)</li>
              <li>zapewnienia bezpieczeństwa</li>
            </ul>

            <h3>4. Podstawa prawna przetwarzania</h3>
            <p>Dane przetwarzane są na podstawie:</p>
            <ul>
              <li>zgody użytkownika (art. 6 ust. 1 lit. a RODO)</li>
              <li>realizacji usługi (art. 6 ust. 1 lit. b RODO)</li>
              <li>uzasadnionego interesu administratora (art. 6 ust. 1 lit. f RODO)</li>
            </ul>

            <h3>5. Udostępnianie danych</h3>
            <p>Dane mogą być przekazywane podmiotom trzecim, takim jak: dostawcy hostingu (np. Vercel), narzędzia analityczne (np. Google Analytics), usługi backendowe (np. Cloudinary, Google Sheets). Dane nie są sprzedawane osobom trzecim.</p>

            <h3>6. Okres przechowywania danych</h3>
            <p>Dane będą przechowywane przez czas trwania publikacji ogłoszenia, do momentu cofnięcia zgody lub przez okres wymagany przepisami prawa.</p>

            <h3>7. Prawa użytkownika</h3>
            <p>Każdy użytkownik ma prawo do: dostępu do swoich danych, sprostowania danych, usunięcia danych („prawo do bycia zapomnianym”), ograniczenia przetwarzania, przenoszenia danych, wniesienia sprzeciwu, złożenia skargi do Prezesa UODO.</p>

            <h3>8. Pliki cookies</h3>
            <p>Serwis wykorzystuje pliki cookies w celu prawidłowego działania strony, analizy ruchu (np. Google Analytics) oraz zapamiętywania preferencji użytkownika. Użytkownik może zarządzać cookies w ustawieniach przeglądarki.</p>

            <h3>9. Narzędzia zewnętrzne</h3>
            <p>Serwis może korzystać z narzędzi: Google Analytics, Google Sheets, Cloudinary. Dostawcy tych usług mogą przetwarzać dane poza Europejskim Obszarem Gospodarczym.</p>

            <h3>10. Zabezpieczenia danych</h3>
            <p>Administrator stosuje odpowiednie środki techniczne i organizacyjne w celu ochrony danych osobowych.</p>

            <h3>11. Zmiany polityki prywatności</h3>
            <p>Polityka może być aktualizowana. Aktualna wersja zawsze będzie dostępna w Serwisie.</p>

            <h3>12. Kontakt</h3>
            <p>W sprawach związanych z danymi osobowymi prosimy o kontakt: 📧 kontakt@wypozycz.online</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .privacy-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 11000;
          padding: 20px;
        }
        .privacy-modal {
          background: white;
          border-radius: 24px;
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow: hidden;
          position: relative;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: modalSlideIn 0.3s ease-out;
        }
        .close-button {
          position: absolute;
          top: 20px;
          right: 20px;
          background: #f3f4f6;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 20px;
          font-size: 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .close-button:hover { background: #e5e7eb; }
        .privacy-content {
          padding: 40px;
          height: 100%;
          overflow-y: auto;
        }
        .privacy-text h2 { margin-top: 0; margin-bottom: 24px; }
        .privacy-text h3 { margin-top: 24px; margin-bottom: 12px; font-size: 1.1rem; }
        .privacy-text p, .privacy-text li { font-size: 0.95rem; color: #4b5563; line-height: 1.6; }
        .privacy-text ul { padding-left: 20px; margin-bottom: 16px; }

        @keyframes modalSlideIn {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

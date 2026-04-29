import React from 'react';

export const metadata = {
  title: 'Kontakt i Współpraca - Wynajem Sprzętu',
  description: 'Skontaktuj się z nami w sprawie współpracy, reklamy lub dodania swojej firmy do bazy.',
};

export default function ContactPage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
          Kontakt i <span className="text-blue-600">Współpraca</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Jesteś właścicielem wypożyczalni? Chcesz dotrzeć do nowych klientów? Zapraszamy do kontaktu!
        </p>
      </header>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 p-8 mb-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b-4 border-blue-600 pb-2 inline-block">
          Dla Firm i Partnerów
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          Nasz marketplace to idealne miejsce na promocję Twojego sprzętu budowlanego. Oferujemy:
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 list-none p-0">
          <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            <span>Zwiększenie zasięgów</span>
          </li>
          <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            <span>Bezpośredni kontakt</span>
          </li>
          <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            <span>Prosty panel ogłoszeń</span>
          </li>
          <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            <span>Brak ukrytych opłat</span>
          </li>
        </ul>

        <div className="bg-blue-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-blue-100 dark:border-slate-700 border-l-4 border-l-blue-600">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Napisz do nas:</h3>
          <p className="text-xl font-black text-blue-600 dark:text-blue-400 mb-1">
            📧 lukasz.szyp@gmail.com
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Odpowiadamy zazwyczaj w ciągu 24 godzin.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Zgłoś błąd lub sugestię</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          Stale rozwijamy naszą platformę. Jeśli masz pomysł na nową funkcjonalność lub zauważyłeś błąd, daj nam znać!
        </p>
        <a href="mailto:lukasz.szyp@gmail.com" className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md">
          Wyślij wiadomość
        </a>
      </div>

      <div className="mt-12 text-center">
        <a href="/" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Powrót do ogłoszeń
        </a>
      </div>
    </div>
  );
}

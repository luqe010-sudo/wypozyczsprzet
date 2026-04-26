import React from 'react';
import Link from 'next/link';

export default function CTASection() {
  return (
    <div className="w-full mt-8">
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-lg p-8 relative overflow-hidden text-white">
        {/* Background Graphic elements */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-blue-300 opacity-20 rounded-full blur-xl"></div>
        
        <div className="relative z-10 flex flex-col h-full">
          <h3 className="text-2xl md:text-3xl font-bold mb-3">Masz sprzęt na wynajem?</h3>
          <p className="text-blue-100 mb-8 max-w-sm text-sm md:text-base leading-relaxed">
            Zarabiaj nawet 3000 zł miesięcznie bez pośredników. Dołącz do naszej platformy.
          </p>
          
          <Link 
            href="/dodaj-ogloszenie"
            className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-6 rounded-xl transition-all duration-200 inline-flex items-center justify-center gap-2 shadow-sm w-full md:w-auto self-start"
          >
            Dodaj ogłoszenie za darmo
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          </Link>
          
          <ul className="mt-8 space-y-3">
            <li className="flex items-center gap-3 text-sm text-blue-50 font-medium">
              <svg className="w-5 h-5 text-green-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              Szybka rejestracja
            </li>
            <li className="flex items-center gap-3 text-sm text-blue-50 font-medium">
              <svg className="w-5 h-5 text-green-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              Bez ukrytych opłat
            </li>
            <li className="flex items-center gap-3 text-sm text-blue-50 font-medium">
              <svg className="w-5 h-5 text-green-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              Dotrzyj do tysięcy klientów
            </li>
          </ul>
        </div>
        
        {/* Decorative illustration placeholder */}
        <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none hidden md:block">
           <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
           </svg>
        </div>
      </div>
    </div>
  );
}

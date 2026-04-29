import React from 'react';
import Link from 'next/link';

export default function CTASection() {
  return (
    <div className="w-full">
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-md p-5 relative overflow-hidden text-white transition-all">
        {/* Background Graphic elements */}
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <h3 className="text-lg font-bold mb-1.5 leading-tight">Masz sprzęt na wynajem?</h3>
          <p className="text-blue-100 mb-4 text-xs leading-relaxed">
            Zarabiaj bez pośredników. Dołącz do nas już dzisiaj.
          </p>
          
          <Link 
            href="/dodaj-ogloszenie"
            className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-2 px-4 rounded-xl transition-all duration-200 inline-flex items-center justify-center gap-2 shadow-sm w-full text-xs"
          >
            Dodaj ogłoszenie
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          </Link>
          
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center gap-2 text-[10px] text-blue-50 font-medium">
              <svg className="w-3.5 h-3.5 text-green-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              Szybka rejestracja
            </div>
            <div className="flex items-center gap-2 text-[10px] text-blue-50 font-medium">
              <svg className="w-3.5 h-3.5 text-green-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              Bez ukrytych opłat
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

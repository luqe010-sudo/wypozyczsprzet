import React from 'react';
import { documents } from '../../lib/umowy-data';
import DocumentCard from '../../components/DocumentCard';
import Breadcrumbs from '../../components/Breadcrumbs';
import { FileText, ShieldCheck, Zap } from 'lucide-react';

export const metadata = {
  title: 'Darmowe wzory umów wynajmu sprzętu | Wypożycz.online',
  description: 'Gotowe wzory umów i protokołów dla wypożyczalni oraz osób prywatnych. Ciężki sprzęt, maszyny budowlane, elektronarzędzia, agregaty i sprzęt ogrodowy.',
  keywords: 'wzór umowy wynajmu sprzętu budowlanego, umowa wynajmu koparki pdf, wzór umowy wynajmu elektronarzędzi, darmowy wzór umowy wynajmu',
  alternates: {
    canonical: '/umowy',
  },
};

export default function UmowyPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumbs />
      
      {/* Hero Section */}
      <section className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm font-bold mb-6">
          <ShieldCheck size={18} />
          <span>Bezpieczny wynajem</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
          Darmowe wzory umów <br className="hidden md:block" />
          <span className="text-blue-600">wynajmu sprzętu</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
          Gotowe wzory umów i protokołów dla wypożyczalni oraz osób prywatnych. 
          Ciężki sprzęt, maszyny budowlane, elektronarzędzia, agregaty, rusztowania i sprzęt ogrodowy.
        </p>
        <div className="mt-10 flex justify-center">
          <a 
            href="#dokumenty"
            className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl transition-all hover:scale-105 shadow-xl shadow-gray-200 dark:shadow-none"
          >
            Przeglądaj dokumenty
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {[
          { icon: <Zap className="text-amber-500" />, title: 'Szybkość', desc: 'Pobierz, uzupełnij i podpisz w kilka minut.' },
          { icon: <ShieldCheck className="text-green-500" />, title: 'Bezpieczeństwo', desc: 'Zabezpiecz swoje maszyny przed uszkodzeniami i kradzieżą.' },
          { icon: <FileText className="text-blue-500" />, title: 'Standard rynkowy', desc: 'Sprawdzone zapisy stosowane przez największe wypożyczalnie.' }
        ].map((feature, i) => (
          <div key={i} className="flex items-center gap-4 p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-50 dark:border-slate-700">
            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
              {feature.icon}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">{feature.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{feature.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Documents Grid */}
      <section id="dokumenty" className="scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dostępne dokumenty</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Wybierz wzór dopasowany do Twoich potrzeb</p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-lg border border-blue-200 dark:border-blue-800">
              {documents.length} Dokumentów
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {documents.map((doc) => (
            <DocumentCard key={doc.slug} doc={doc} />
          ))}
        </div>
      </section>

      {/* SEO Section / Disclaimer */}
      <section className="mt-24 pt-12 border-t border-gray-100 dark:border-slate-800">
        <div className="bg-gray-50 dark:bg-slate-800/30 rounded-3xl p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dlaczego warto korzystać z naszych wzorów?</h2>
          <div className="prose prose-blue dark:prose-invert max-w-none text-gray-600 dark:text-gray-400">
            <p>
              Wynajem sprzętu budowlanego wiąże się z dużą odpowiedzialnością finansową. Bez odpowiedniej umowy, obie strony są narażone na niepotrzebne ryzyko. Nasze darmowe wzory umów wynajmu koparek, elektronarzędzi i agregatów zostały przygotowane w oparciu o najlepsze praktyki rynkowe.
            </p>
            <p className="text-sm italic mt-8 text-gray-400 dark:text-gray-500">
              <strong>Disclaimer:</strong> Udostępnione wzory mają charakter informacyjny i nie stanowią porady prawnej. Przed podpisaniem ważnej umowy zalecamy konsultację z prawnikiem w celu dopasowania zapisów do specyfiki konkretnej transakcji.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mt-20 text-center bg-blue-600 rounded-3xl p-10 md:p-16 text-white shadow-2xl shadow-blue-500/20">
        <h2 className="text-3xl md:text-4xl font-black mb-6">Szukasz sprzętu do wynajęcia?</h2>
        <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
          Przejrzyj setki ogłoszeń od lokalnych dostawców sprzętu budowlanego, maszyn ogrodowych i narzędzi.
        </p>
        <a 
          href="/"
          className="inline-block px-10 py-4 bg-white text-blue-600 font-black rounded-2xl transition-transform hover:scale-105 shadow-xl"
        >
          Przeglądaj ogłoszenia
        </a>
      </section>
    </div>
  );
}

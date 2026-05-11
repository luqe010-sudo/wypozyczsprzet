import React from 'react';
import { notFound } from 'next/navigation';
import { documents, commonChecklist } from '../../../lib/umowy-data';
import Breadcrumbs from '../../../components/Breadcrumbs';
import FAQSchema from '../../../components/FAQSchema';
import { 
  CheckCircle2, 
  Download, 
  ArrowLeft, 
  Settings, 
  ShieldCheck, 
  HelpCircle,
  FileText,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

export async function generateStaticParams() {
  return documents.map((doc) => ({
    slug: doc.slug,
  }));
}

export async function generateMetadata({ params }) {
  const doc = documents.find((d) => d.slug === params.slug);
  if (!doc) return {};

  return {
    title: `${doc.title} PDF - Pobierz wzór | Wypożycz.online`,
    description: `Pobierz darmowy ${doc.title.toLowerCase()}. Dowiedz się co powinna zawierać umowa i na co zwrócić uwagę przy wynajmie.`,
    alternates: {
      canonical: `/umowy/${doc.slug}`,
    },
  };
}

export default function DocumentDetailPage({ params }) {
  const doc = documents.find((d) => d.slug === params.slug);

  if (!doc) {
    notFound();
  }

  // Related documents (excluding current)
  const relatedDocs = documents
    .filter(d => d.slug !== doc.slug && (d.categoryId === doc.categoryId || d.categoryId === 'universal'))
    .slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <FAQSchema faqs={doc.faqs} />
      <Breadcrumbs items={[{ label: doc.title }]} />

      <Link 
        href="/umowy" 
        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline mb-8"
      >
        <ArrowLeft size={16} />
        Powrót do wszystkich wzorów
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
            {doc.seoH1}
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
            <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
              {doc.description}
            </p>
            
            <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl">
              <h2 className="flex items-center gap-2 text-xl font-bold text-blue-900 dark:text-blue-300 mt-0 mb-4">
                <FileText size={20} />
                Kiedy używać tego dokumentu?
              </h2>
              <p className="text-blue-800 dark:text-blue-400/80 mb-4">
                {doc.whenToUse}
              </p>
              <p className="text-blue-800 dark:text-blue-400/80 font-medium">
                <strong>Dla kogo:</strong> {doc.forWhom}
              </p>
            </div>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <CheckCircle2 className="text-green-500" />
              Co zawiera umowa?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {commonChecklist.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                  <CheckCircle2 size={18} className="text-blue-500 mt-0.5 shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Settings className="text-amber-500" />
              Jakiego sprzętu dotyczy?
            </h2>
            <div className="flex flex-wrap gap-2">
              {doc.equipmentTypes.map((type, index) => (
                <span key={index} className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium border border-gray-200 dark:border-slate-700">
                  {type}
                </span>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
              <HelpCircle className="text-blue-500" />
              Często zadawane pytania (FAQ)
            </h2>
            <div className="space-y-6">
              {doc.faqs.map((faq, index) => (
                <div key={index} className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-gray-100 dark:border-slate-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-start gap-3">
                    <span className="text-blue-600 dark:text-blue-400 font-black">Q:</span>
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed pl-8">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-12 p-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-start gap-4">
            <AlertTriangle className="text-red-500 shrink-0 mt-1" size={24} />
            <p className="text-sm text-red-900 dark:text-red-400">
              <strong>Pamiętaj:</strong> Udostępnione wzory mają charakter informacyjny i nie stanowią porady prawnej. Każdy wynajem jest inny, dlatego warto dopasować dokument do specyficznych wymagań Twojej maszyny lub firmy.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-8">
            {/* Download Box */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-100 dark:border-slate-700 shadow-2xl shadow-gray-200/50 dark:shadow-none text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Download size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Pobierz dokument</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                Format: PDF (A4) <br />
                Rozmiar: ok. 150 KB
              </p>
              <Link 
                href="#"
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
              >
                <Download size={20} />
                Pobierz teraz PDF
              </Link>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-4 uppercase tracking-widest font-bold">
                Darmowy dostęp
              </p>
            </div>

            {/* Marketplace CTA */}
            <div className="bg-gray-900 dark:bg-blue-600 rounded-3xl p-8 text-white text-center">
              <h3 className="text-xl font-bold mb-4">Szukasz sprzętu?</h3>
              <p className="text-gray-400 dark:text-blue-100 text-sm mb-6">
                Sprawdź ogłoszenia w Twojej okolicy. Bezpośredni kontakt, bez prowizji.
              </p>
              <Link 
                href="/"
                className="block w-full py-3 bg-white text-gray-900 dark:text-blue-600 font-bold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Przejdź do ogłoszeń
              </Link>
            </div>

            {/* Related Docs */}
            {relatedDocs.length > 0 && (
              <div className="bg-gray-50 dark:bg-slate-800/30 rounded-3xl p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Zobacz także</h3>
                <div className="space-y-4">
                  {relatedDocs.map((rDoc) => (
                    <Link 
                      key={rDoc.slug}
                      href={`/umowy/${rDoc.slug}`}
                      className="group flex items-start gap-3"
                    >
                      <div className="p-2 bg-white dark:bg-slate-700 rounded-lg text-gray-400 group-hover:text-blue-500 transition-colors shrink-0">
                        <FileText size={16} />
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {rDoc.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

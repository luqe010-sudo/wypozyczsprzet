import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Regulamin Serwisu | Wypożycz Sprzęt',
  description: 'Zasady korzystania z serwisu Wypożycz Sprzęt. Zapoznaj się z naszym regulaminem przed dodaniem ogłoszenia.',
};

export default function RegulaminPage() {
  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Powrót do strony głównej
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="p-8 md:p-12">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8 text-center uppercase tracking-tight">📄 Regulamin Serwisu „Wypożycz Sprzęt”</h1>
            
            <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 space-y-8">
              <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-700 pb-2">§1. Postanowienia ogólne</h2>
                <ol className="list-decimal pl-5 space-y-2 leading-relaxed">
                  <li>Niniejszy regulamin określa zasady korzystania z serwisu internetowego „Wypożycz Sprzęt”, dostępnego pod adresem wypozycz.online.</li>
                  <li>Właścicielem serwisu jest wypozycz.online.</li>
                  <li>Serwis umożliwia użytkownikom publikowanie ogłoszeń dotyczących wynajmu sprzętu oraz przeglądanie dostępnych ofert.</li>
                  <li>Korzystanie z serwisu oznacza akceptację niniejszego regulaminu.</li>
                </ol>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-700 pb-2">§2. Definicje</h2>
                <ul className="list-disc pl-5 space-y-2 leading-relaxed">
                  <li><strong>Serwis</strong> – platforma internetowa umożliwiająca publikację i przeglądanie ogłoszeń.</li>
                  <li><strong>Użytkownik</strong> – osoba korzystająca z serwisu.</li>
                  <li><strong>Ogłoszenie</strong> – treść opublikowana przez użytkownika dotycząca wynajmu sprzętu.</li>
                  <li><strong>Administrator</strong> – właściciel serwisu.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-700 pb-2">§3. Zasady korzystania z serwisu</h2>
                <ol className="list-decimal pl-5 space-y-2 leading-relaxed">
                  <li>Serwis ma charakter ogłoszeniowy i nie jest stroną umów zawieranych między użytkownikami.</li>
                  <li>Administrator nie ponosi odpowiedzialności za:
                    <ul className="list-disc pl-8 mt-2 space-y-1">
                      <li>treść ogłoszeń,</li>
                      <li>jakość, stan techniczny lub dostępność sprzętu,</li>
                      <li>przebieg transakcji między użytkownikami.</li>
                    </ul>
                  </li>
                  <li>Użytkownik zobowiązuje się do korzystania z serwisu zgodnie z prawem oraz dobrymi obyczajami.</li>
                </ol>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-700 pb-2">§4. Dodawanie ogłoszeń</h2>
                <ol className="list-decimal pl-5 space-y-2 leading-relaxed">
                  <li>Dodanie ogłoszenia odbywa się poprzez formularz dostępny w serwisie.</li>
                  <li>Ogłoszenia przed publikacją podlegają moderacji przez administratora.</li>
                  <li>Administrator zastrzega sobie prawo do:
                    <ul className="list-disc pl-8 mt-2 space-y-1">
                      <li>odrzucenia ogłoszenia bez podania przyczyny,</li>
                      <li>edycji ogłoszenia w zakresie poprawy czytelności,</li>
                      <li>usunięcia ogłoszenia naruszającego regulamin.</li>
                    </ul>
                  </li>
                  <li>Zabrania się publikowania treści:
                    <ul className="list-disc pl-8 mt-2 space-y-1">
                      <li>niezgodnych z prawem,</li>
                      <li>wprowadzających w błąd,</li>
                      <li>naruszających prawa osób trzecich,</li>
                      <li>o charakterze spamowym lub reklamowym niezwiązanym z tematyką serwisu.</li>
                    </ul>
                  </li>
                </ol>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-700 pb-2">§5. Odpowiedzialność użytkownika</h2>
                <ol className="list-decimal pl-5 space-y-2 leading-relaxed">
                  <li>Użytkownik ponosi pełną odpowiedzialność za treść dodawanego ogłoszenia.</li>
                  <li>Użytkownik oświadcza, że:
                    <ul className="list-disc pl-8 mt-2 space-y-1">
                      <li>posiada prawo do oferowania danego sprzętu,</li>
                      <li>zamieszczone informacje są prawdziwe,</li>
                      <li>publikowane zdjęcia nie naruszają praw autorskich.</li>
                    </ul>
                  </li>
                </ol>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-700 pb-2">§6. Publikacja i czas trwania ogłoszeń</h2>
                <ol className="list-decimal pl-5 space-y-2 leading-relaxed">
                  <li>Ogłoszenia są publikowane po zatwierdzeniu przez administratora.</li>
                  <li>Administrator może usunąć ogłoszenie w dowolnym momencie, w szczególności w przypadku:
                    <ul className="list-disc pl-8 mt-2 space-y-1">
                      <li>naruszenia regulaminu,</li>
                      <li>zgłoszenia naruszenia przez innych użytkowników,</li>
                      <li>braku aktualności ogłoszenia.</li>
                    </ul>
                  </li>
                </ol>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-700 pb-2">§7. Płatności</h2>
                <ol className="list-decimal pl-5 space-y-2 leading-relaxed">
                  <li>Serwis może w przyszłości wprowadzić płatne opcje, takie jak wyróżnienie ogłoszeń.</li>
                  <li>Informacje o opłatach będą publikowane w serwisie.</li>
                </ol>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-700 pb-2">§8. Dane kontaktowe</h2>
                <ol className="list-decimal pl-5 space-y-2 leading-relaxed">
                  <li>Serwis może umożliwiać bezpośredni kontakt między użytkownikami.</li>
                  <li>Administrator nie odpowiada za sposób wykorzystania danych kontaktowych przez użytkowników.</li>
                </ol>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-700 pb-2">§9. Ochrona danych osobowych</h2>
                <ol className="list-decimal pl-5 space-y-2 leading-relaxed">
                  <li>Dane użytkowników są przetwarzane zgodnie z obowiązującymi przepisami prawa.</li>
                  <li>Szczegółowe informacje znajdują się w Polityce Prywatności.</li>
                </ol>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-700 pb-2">§10. Zmiany regulaminu</h2>
                <ol className="list-decimal pl-5 space-y-2 leading-relaxed">
                  <li>Administrator zastrzega sobie prawo do zmiany regulaminu.</li>
                  <li>Zmiany wchodzą w życie z chwilą publikacji w serwisie.</li>
                </ol>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-700 pb-2">§11. Postanowienia końcowe</h2>
                <ol className="list-decimal pl-5 space-y-2 leading-relaxed">
                  <li>W sprawach nieuregulowanych zastosowanie mają przepisy prawa polskiego.</li>
                  <li>Wszelkie spory będą rozstrzygane przez właściwe sądy powszechne.</li>
                </ol>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

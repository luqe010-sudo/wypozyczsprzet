import Link from 'next/link';
import { CONTACT_EMAIL, INQUIRY_RETENTION_MONTHS } from '../../lib/site';

export const metadata = {
  title: 'Polityka prywatności | WypożyczSprzęt',
  description: 'Jakie dane przetwarza serwis wypozycz.online, w jakim celu i jakie masz prawa.',
  alternates: { canonical: '/polityka-prywatnosci' },
};

const headingClass = 'mb-2 mt-8 text-lg font-semibold text-slate-900 dark:text-white';

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 text-slate-700 dark:text-slate-300 sm:px-6 md:py-12">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">Polityka prywatności</h1>

      <h2 className={headingClass}>1. Administrator</h2>
      <p>Administratorem danych jest podmiot prowadzący serwis wypozycz.online. W sprawach danych osobowych napisz na <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>

      <h2 className={headingClass}>2. Jakie dane przetwarzamy i po co</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li><strong>Formularz zapytania:</strong> imię lub firma, telefon, opcjonalnie e-mail, termin, miejsce pracy i treść wiadomości. Przekazujemy je wynajmującemu, którego dotyczy zapytanie, żeby mógł odpowiedzieć (art. 6 ust. 1 lit. a i b RODO).</li>
        <li><strong>Konto:</strong> adres e-mail i dane firmy podane w panelu, potrzebne do publikacji ogłoszeń (art. 6 ust. 1 lit. b RODO).</li>
        <li><strong>Dane firm z ogłoszeń i katalogu:</strong> nazwa, adres i dane kontaktowe, część z nich ze źródeł publicznych, publikowane w celu umożliwienia kontaktu z firmą (art. 6 ust. 1 lit. f RODO). Możesz w każdej chwili zażądać ich poprawienia lub usunięcia.</li>
        <li><strong>Bezpieczeństwo:</strong> do ochrony formularza przed nadużyciami zapisujemy skrót (hash) adresu IP, a nie sam adres (art. 6 ust. 1 lit. f RODO).</li>
        <li><strong>Analityka:</strong> Google Analytics działa wyłącznie po wyrażeniu zgody w banerze cookies (art. 6 ust. 1 lit. a RODO).</li>
      </ul>

      <h2 className={headingClass}>3. Jak długo przechowujemy dane</h2>
      <p>Dane z zapytań anonimizujemy po {INQUIRY_RETENTION_MONTHS} miesiącach. Dane konta i ogłoszeń przechowujemy do czasu ich usunięcia albo zgłoszenia żądania usunięcia.</p>

      <h2 className={headingClass}>4. Komu przekazujemy dane</h2>
      <p>Wynajmującemu (dane z zapytania) oraz dostawcom usług, z których korzysta serwis: Vercel (hosting), Supabase (baza danych), Cloudinary (zdjęcia), MapTiler (mapy), Resend (wysyłka e-maili), Google (analityka po wyrażeniu zgody i logowanie przez Google). Część z nich może przetwarzać dane poza EOG na podstawie standardowych klauzul umownych.</p>

      <h2 className={headingClass}>5. Twoje prawa</h2>
      <p>Masz prawo dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia, sprzeciwu oraz cofnięcia zgody w dowolnym momencie. Możesz też złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych.</p>

      <h2 className={headingClass}>6. Pliki cookies</h2>
      <p>Niezbędne pliki cookies obsługują logowanie i zapamiętują wybory. Analityczne włączają się tylko za Twoją zgodą, którą możesz zmienić, czyszcząc dane strony w przeglądarce.</p>

      <p className="mt-8 text-sm"><Link href="/regulamin" className="underline">Regulamin serwisu</Link></p>
    </div>
  );
}
